import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
    DATABASE_HOST: Joi.string().required(),
    DATABASE_USERNAME: Joi.string().required(),
    DATABASE_PASSWORD: Joi.string().required(),
    DATABASE_NAME: Joi.string().required(),
    DATABASE_PORT: Joi.number().default(5432),

    SWAGGER_ENABLED: Joi.boolean().default(false),
});