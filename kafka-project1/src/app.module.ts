import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { MatrixModule } from './core/matrix/matrix.module';
import { KafkaModule } from './core/kafka/kafka.module';

@Module({
  imports: [ConfigModule, KafkaModule, MatrixModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
