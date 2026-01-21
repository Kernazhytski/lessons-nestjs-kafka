import { Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { MatrixCalculatorService } from './matrix-calculator.service';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { ConfigService } from '@nestjs/config';
import type { MatrixJobData } from './dto/matrix-job-data.dto';

@Processor('matrix-queue')
export class MatrixProcessor extends WorkerHost {
  private readonly logger = new Logger(MatrixProcessor.name);

  constructor(
    private readonly matrixCalculator: MatrixCalculatorService,
    private readonly kafkaProducer: KafkaProducerService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async process(job: Job<MatrixJobData>) {
    if (job.name !== 'multiply') {
      this.logger.warn(
        `Unknown job name "${job.name}" for job ${job.id ?? '(no id)'}`,
      );
      return;
    }

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

