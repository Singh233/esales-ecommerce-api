const Joi = require('joi');
const { objectId } = require('./custom.validation.js');

const paymentSuccess = {
  body: Joi.object().keys({
    orderId: Joi.string().custom(objectId).required(),
    paymentId: Joi.string().required(),
    amount: Joi.number().min(0).required(),
    currency: Joi.string().length(3).optional(),
    paymentMethod: Joi.string().optional(),
    transactionId: Joi.string().optional(),
  }),
};

const paymentFailure = {
  body: Joi.object().keys({
    orderId: Joi.string().custom(objectId).required(),
    paymentId: Joi.string().required(),
    reason: Joi.string().required(),
    errorCode: Joi.string().optional(),
    errorMessage: Joi.string().optional(),
  }),
};

const paymentPending = {
  body: Joi.object().keys({
    orderId: Joi.string().custom(objectId).required(),
    paymentId: Joi.string().required(),
    estimatedProcessingTime: Joi.string().optional(),
  }),
};

const testEmail = {
  body: Joi.object().keys({
    orderId: Joi.string().custom(objectId).required(),
    emailType: Joi.string().valid('approved', 'failed').required(),
  }),
};

module.exports = {
  paymentSuccess,
  paymentFailure,
  paymentPending,
  testEmail,
};
