import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  PORT: Joi.number().default(3001),
  KAFKA_BROKER: Joi.string().required(),
  KAFKA_CLIENT_ID: Joi.string().default('kafka-project2'),
  KAFKA_GROUP_ID: Joi.string().default('matrix-calculator-group'),
  KAFKA_REQUEST_TOPIC: Joi.string().default('matrix-multiplication-request'),
  KAFKA_RESPONSE_TOPIC: Joi.string().default('matrix-multiplication-response'),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
});

