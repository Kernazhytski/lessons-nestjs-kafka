import { registerAs } from '@nestjs/config';

export default registerAs('kafka', () => ({
  broker: process.env.KAFKA_BROKER,
  clientId: process.env.KAFKA_CLIENT_ID,
  groupId: process.env.KAFKA_GROUP_ID,
  requestTopic: process.env.KAFKA_REQUEST_TOPIC,
  responseTopic: process.env.KAFKA_RESPONSE_TOPIC,
}));

