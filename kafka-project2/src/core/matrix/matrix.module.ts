import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MatrixService } from './matrix.service';
import { MatrixCalculatorService } from './matrix-calculator.service';
import { MatrixProcessor } from './matrix-processor.processor';
import { KafkaModule } from '../kafka/kafka.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'matrix-queue',
    }),
    KafkaModule,
  ],
  providers: [MatrixService, MatrixCalculatorService, MatrixProcessor],
  exports: [MatrixService],
})
export class MatrixModule { }

