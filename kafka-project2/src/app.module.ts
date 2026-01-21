import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { ConfigModule as AppConfigModule } from './config/config.module';
import { MatrixModule } from './core/matrix/matrix.module';
import { KafkaModule } from './core/kafka/kafka.module';

@Module({
  imports: [
    AppConfigModule,
    BullModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redis = configService.get('redis');
        return {
          redis: {
            host: redis.host,
            port: redis.port,
          },
        };
      },
      inject: [ConfigService],
    }),
    KafkaModule,
    MatrixModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
