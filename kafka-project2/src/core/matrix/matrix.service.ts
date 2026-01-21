import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { KafkaConsumerService } from '../kafka/kafka-consumer.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MatrixService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MatrixService.name);

  constructor(
    @InjectQueue('matrix-queue') private matrixQueue: Queue,
    private readonly kafkaConsumer: KafkaConsumerService,
    private readonly configService: ConfigService,
  ) { }

  async onApplicationBootstrap(): Promise<void> {
    const requestTopic =
      this.configService.get<string>('kafka.requestTopic') ||
      'matrix-multiplication-request';

    try {
      await this.kafkaConsumer.subscribe(requestTopic, async (message) => {
        const { id, matrixA, matrixB } = message;
        await this.processMatrixMultiplication(id, matrixA.data, matrixB.data);
      });

      this.logger.log(`Subscribed to topic: ${requestTopic}`);
    } catch (error) {
      this.logger.error(
        `Failed to subscribe to topic ${requestTopic}:`,
        error,
      );
    }
  }

  async processMatrixMultiplication(
    id: string,
    matrixA: number[][],
    matrixB: number[][],
  ): Promise<void> {
    this.logger.log(`Adding matrix multiplication job ${id} to queue`);

    await this.matrixQueue.add('multiply', {
      id,
      matrixA,
      matrixB,
    });
  }
}

