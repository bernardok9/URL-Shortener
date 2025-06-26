import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
    DATABASE_HOST: Joi.string().hostname().required(),
    DATABASE_USERNAME: Joi.string().required(),
    DATABASE_PASSWORD: Joi.string().required(),
    DATABASE_NAME: Joi.string().required(),
    DATABASE_PORT: Joi.number().port().default(5432),

    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRES_IN: Joi.string().default('60m'),

    PROMETHEUS_ENABLED: Joi.boolean().default(false),

    SWAGGER_ENABLED: Joi.boolean().default(false),
});