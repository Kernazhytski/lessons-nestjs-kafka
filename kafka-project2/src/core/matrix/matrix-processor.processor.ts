import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { MatrixCalculatorService } from './matrix-calculator.service';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { ConfigService } from '@nestjs/config';

export interface MatrixJobData {
  id: string;
  matrixA: number[][];
  matrixB: number[][];
}

@Processor('matrix-queue')
export class MatrixProcessor {
  private readonly logger = new Logger(MatrixProcessor.name);

  constructor(
    private readonly matrixCalculator: MatrixCalculatorService,
    private readonly kafkaProducer: KafkaProducerService,
    private readonly configService: ConfigService,
  ) {}

  @Process('multiply')
  async handleMatrixMultiplication(job: Job<MatrixJobData>) {
    const { id, matrixA, matrixB } = job.data;
    this.logger.log(`Processing matrix multiplication job ${id}`);

    try {
      const result = this.matrixCalculator.multiplyMatrices(matrixA, matrixB);
      const responseTopic = this.configService.get<string>('kafka.responseTopic') || 'matrix-multiplication-response';

      await this.kafkaProducer.sendMessage(responseTopic, {
        id,
        result,
        status: 'completed',
      });

      this.logger.log(`Matrix multiplication job ${id} completed successfully`);
    } catch (error) {
      this.logger.error(`Error processing matrix multiplication job ${id}:`, error);
      const responseTopic = this.configService.get<string>('kafka.responseTopic') || 'matrix-multiplication-response';

      await this.kafkaProducer.sendMessage(responseTopic, {
        id,
        result: null,
        status: 'error',
        error: error.message,
      });
    }
  }
}

