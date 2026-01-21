import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MatrixCalculatorService {
  private readonly logger = new Logger(MatrixCalculatorService.name);

  multiplyMatrices(matrixA: number[][], matrixB: number[][]): number[][] {
    this.logger.log('Starting matrix multiplication calculation');

    const rowsA = matrixA.length;
    const colsA = matrixA[0].length;
    const rowsB = matrixB.length;
    const colsB = matrixB[0].length;

    // Проверка возможности умножения
    if (colsA !== rowsB) {
      throw new Error(
        `Cannot multiply matrices: columns of A (${colsA}) must equal rows of B (${rowsB})`,
      );
    }

    // Инициализация результирующей матрицы
    const result: number[][] = [];
    for (let i = 0; i < rowsA; i++) {
      result[i] = [];
      for (let j = 0; j < colsB; j++) {
        result[i][j] = 0;
      }
    }

    // Умножение матриц
    for (let i = 0; i < rowsA; i++) {
      for (let j = 0; j < colsB; j++) {
        for (let k = 0; k < colsA; k++) {
          result[i][j] += matrixA[i][k] * matrixB[k][j];
        }
      }
    }

    this.logger.log('Matrix multiplication completed');
    return result;
  }
}

