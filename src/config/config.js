const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');
dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(8000),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    REDIS_URL: Joi.string().required().description('Redis url'),
    REDIS_PASSWORD: Joi.string().description('Redis password'),
    FRONTEND_URL: Joi.string().required().description('Frontend url'),
    CORS_ALLOWED: Joi.string().required().description('CORS allowed origins'),
    EMAIL_HOST: Joi.string().description('Email SMTP host'),
    EMAIL_PORT: Joi.number().default(587).description('Email SMTP port'),
    EMAIL_USER: Joi.string().description('Email SMTP username'),
    EMAIL_PASSWORD: Joi.string().description('Email SMTP password'),
    EMAIL_FROM: Joi.string().email().description('Email from address'),
    EMAIL_FROM_NAME: Joi.string().description('Email from name'),
    BETTER_AUTH_URL: Joi.string().uri().description('BetterAuth URL for authentication'),
    BETTER_AUTH_SECRET: Joi.string().description('BetterAuth secret for authentication'),
    EMAIL_DOMAIN: Joi.string().description('Email domain for sending emails'),
    MAILGUN_API_KEY: Joi.string().description('Mailgun API key for sending emails'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  frontend_url: envVars.FRONTEND_URL,
  mongoose: {
    url: envVars.MONGODB_URL,
    options: {},
  },
  redis: {
    url: envVars.REDIS_URL,
    password: envVars.REDIS_PASSWORD,
  },
  cors: {
    allowedOrigins: envVars.CORS_ALLOWED.split(',').map((origin) => origin.trim()),
  },
  email: {
    host: envVars.EMAIL_HOST,
    port: envVars.EMAIL_PORT,
    user: envVars.EMAIL_USER,
    pass: envVars.EMAIL_PASSWORD,
    from: envVars.EMAIL_FROM,
    fromName: envVars.EMAIL_FROM_NAME,
    domain: envVars.EMAIL_DOMAIN,
    mailgunApiKey: envVars.MAILGUN_API_KEY,
  },
  betterAuth: {
    url: envVars.BETTER_AUTH_URL,
    secret: envVars.BETTER_AUTH_SECRET,
  },
};
