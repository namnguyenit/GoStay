import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  PORT: Joi.number().default(8086),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),

  CATALOG_DB_HOST: Joi.string().required(),
  CATALOG_DB_PORT: Joi.number().default(5432),
  CATALOG_DB_NAME: Joi.string().required(),
  CATALOG_DB_USER: Joi.string().required(),
  CATALOG_DB_PASSWORD: Joi.string().required(),

  RECOMMENDATION_DB_HOST: Joi.string().required(),
  RECOMMENDATION_DB_PORT: Joi.number().default(5432),
  RECOMMENDATION_DB_NAME: Joi.string().required(),
  RECOMMENDATION_DB_USER: Joi.string().required(),
  RECOMMENDATION_DB_PASSWORD: Joi.string().required(),

  REDIS_URL: Joi.string().required(),

  INVENTORY_SERVICE_URL: Joi.string().uri().required(),
  INTERNAL_SERVICE_TOKEN: Joi.string().required(),
});
