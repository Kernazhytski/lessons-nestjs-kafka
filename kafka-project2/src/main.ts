import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { MatrixService } from './core/matrix/matrix.service';
import { KafkaConsumerService } from './core/kafka/kafka-consumer.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Валидация
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Подписка на запросы от первого сервиса
  const kafkaConsumer = app.get(KafkaConsumerService);
  const matrixService = app.get(MatrixService);
  const requestTopic = configService.get<string>('kafka.requestTopic') || 'matrix-multiplication-request';

  // Ждем немного, чтобы Kafka полностью инициализировалась
  await new Promise(resolve => setTimeout(resolve, 3000));

  try {
    await kafkaConsumer.subscribe(requestTopic, async (message) => {
      const { id, matrixA, matrixB } = message;
      await matrixService.processMatrixMultiplication(
        id,
        matrixA.data,
        matrixB.data,
      );
    });
    console.log(`Subscribed to topic: ${requestTopic}`);
  } catch (error) {
    console.error(`Failed to subscribe to topic ${requestTopic}:`, error);
  }

  const port = configService.get<number>('PORT') || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
