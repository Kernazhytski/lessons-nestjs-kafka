import { registerAs } from '@nestjs/config';

export default registerAs('kafka', () => ({
  broker: process.env.KAFKA_BROKER || 'localhost:9092',
  clientId: process.env.KAFKA_CLIENT_ID || 'kafka-project2',
  groupId: process.env.KAFKA_GROUP_ID || 'matrix-calculator-group',
  requestTopic: process.env.KAFKA_REQUEST_TOPIC || 'matrix-multiplication-request',
  responseTopic: process.env.KAFKA_RESPONSE_TOPIC || 'matrix-multiplication-response',
}));

