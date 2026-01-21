import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Injectable()
export class MatrixService {
  private readonly logger = new Logger(MatrixService.name);

  constructor(@InjectQueue('matrix-queue') private matrixQueue: Queue) { }

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

