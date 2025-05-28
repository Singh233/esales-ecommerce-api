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
    allowedOrigins: envVars.CORS_ALLOWED,
  },
};
