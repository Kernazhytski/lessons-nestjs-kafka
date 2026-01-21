import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer, Partitioners } from 'kafkajs';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private kafka: Kafka;
  private consumer: Consumer;

  constructor(private readonly configService: ConfigService) {
    const broker = this.configService.get<string>('kafka.broker') || 'localhost:9092';
    const clientId = this.configService.get<string>('kafka.clientId') || 'kafka-project2';
    const groupId = this.configService.get<string>('kafka.groupId') || 'matrix-calculator-group';

    this.kafka = new Kafka({
      clientId,
      brokers: [broker],
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });

    this.consumer = this.kafka.consumer({
      groupId,
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });
  }

  async onModuleInit() {
    await this.connectWithRetry();
    this.logger.log('Kafka Consumer connected');
  }

  private async connectWithRetry(maxRetries = 10, delay = 2000): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.consumer.connect();
        return;
      } catch (error) {
        this.logger.warn(`Failed to connect to Kafka (attempt ${i + 1}/${maxRetries}): ${error.message}`);
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
    this.logger.log('Kafka Consumer disconnected');
  }

  async subscribe(topic: string, callback: (message: any) => void): Promise<void> {
    await this.consumer.subscribe({ topic, fromBeginning: true });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          if (!message.value) {
            this.logger.warn(`Message from topic ${topic} has no value`);
            return;
          }
          const value = JSON.parse(message.value.toString());
          this.logger.log(`Message received from topic ${topic}: ${JSON.stringify(value)}`);
          callback(value);
        } catch (error) {
          this.logger.error(`Error processing message from topic ${topic}:`, error);
        }
      },
    });
  }
}

