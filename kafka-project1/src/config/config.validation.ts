import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  KAFKA_BROKER: Joi.string().required(),
  KAFKA_CLIENT_ID: Joi.string().default('kafka-project1'),
  KAFKA_GROUP_ID: Joi.string().default('matrix-service-group'),
  KAFKA_REQUEST_TOPIC: Joi.string().default('matrix-multiplication-request'),
  KAFKA_RESPONSE_TOPIC: Joi.string().default('matrix-multiplication-response'),
});

