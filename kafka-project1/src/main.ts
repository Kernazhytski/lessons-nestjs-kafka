import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { MatrixService } from './core/matrix/matrix.service';
import { KafkaConsumerService } from './core/kafka/kafka-consumer.service';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Отключаем встроенный bodyParser
  });

  // Настраиваем bodyParser с увеличенным лимитом
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  const configService = app.get(ConfigService);

  // Валидация
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Matrix Service API')
    .setDescription('API для умножения матриц через Kafka')
    .setVersion('1.0')
    .addTag('Matrix')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Подписка на ответы от второго сервиса
  const kafkaConsumer = app.get(KafkaConsumerService);
  const matrixService = app.get(MatrixService);
  const responseTopic = configService.get<string>('kafka.responseTopic') || 'matrix-multiplication-response';

  // Ждем немного, чтобы Kafka полностью инициализировалась
  await new Promise(resolve => setTimeout(resolve, 3000));

  try {
    await kafkaConsumer.subscribe(responseTopic, (message) => {
      matrixService.handleResponse(message);
    });
    console.log(`Subscribed to topic: ${responseTopic}`);
  } catch (error) {
    console.error(`Failed to subscribe to topic ${responseTopic}:`, error);
  }

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api`);
}
bootstrap();
