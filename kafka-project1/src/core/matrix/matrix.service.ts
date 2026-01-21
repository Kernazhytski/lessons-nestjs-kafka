import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { MatrixMultiplicationRequestDto } from './dto/matrix-multiplication.dto';
import { v4 as uuidv4 } from 'uuid';

interface MatrixResult {
  id: string;
  result?: number[][];
  status: 'pending' | 'completed' | 'error';
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

@Injectable()
export class MatrixService {
  private readonly logger = new Logger(MatrixService.name);
  private results: Map<string, MatrixResult> = new Map();

  constructor(
    private readonly kafkaProducer: KafkaProducerService,
    private readonly configService: ConfigService,
  ) {}

  async multiplyMatrices(
    matrixA: number[][],
    matrixB: number[][],
  ): Promise<{ id: string }> {
    const id = uuidv4();
    const requestTopic = this.configService.get<string>('kafka.requestTopic') || 'matrix-multiplication-request';

    // Сохраняем запрос со статусом pending
    this.results.set(id, {
      id,
      status: 'pending',
      createdAt: new Date(),
    });

    // Отправляем запрос в Kafka
    const request: MatrixMultiplicationRequestDto = {
      matrixA: { data: matrixA },
      matrixB: { data: matrixB },
    };

    try {
      await this.kafkaProducer.sendMessage(requestTopic || 'matrix-multiplication-request', { id, ...request });
      this.logger.log(`Matrix multiplication request sent with ID: ${id}`);
    } catch (error) {
      this.logger.error(`Error sending message to Kafka: ${error.message}`);
      // Обновляем статус на error
      this.results.set(id, {
        id,
        status: 'error',
        error: error.message,
        createdAt: new Date(),
        completedAt: new Date(),
      });
      throw error;
    }

    return { id };
  }

  handleResponse(response: { id: string; result: number[][]; status: string; error?: string }): void {
    const { id, result, status, error } = response;
    const existingResult = this.results.get(id);

    if (existingResult) {
      // Обновляем результат
      this.results.set(id, {
        ...existingResult,
        result: status === 'completed' ? result : undefined,
        status: status === 'completed' ? 'completed' : 'error',
        error: status === 'completed' ? undefined : (error || 'Matrix multiplication failed'),
        completedAt: new Date(),
      });
      this.logger.log(`Result updated for request ID: ${id}, status: ${status}`);
    } else {
      // Сохраняем результат, даже если запрос был отправлен до перезапуска сервера
      this.results.set(id, {
        id,
        result: status === 'completed' ? result : undefined,
        status: status === 'completed' ? 'completed' : 'error',
        error: status === 'completed' ? undefined : (error || 'Matrix multiplication failed'),
        createdAt: new Date(),
        completedAt: new Date(),
      });
      this.logger.log(`New result saved for request ID: ${id}, status: ${status}`);
    }
  }

  getAllResults(): MatrixResult[] {
    return Array.from(this.results.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  getResultById(id: string): MatrixResult | undefined {
    return this.results.get(id);
  }
}

