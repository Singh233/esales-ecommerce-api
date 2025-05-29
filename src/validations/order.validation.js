const Joi = require('joi');
const { objectId } = require('./custom.validation.js');

const createOrder = {
  body: Joi.object().keys({
    items: Joi.array()
      .items(
        Joi.object().keys({
          product: Joi.string().custom(objectId).required(),
          quantity: Joi.number().integer().min(1).required(),
          price: Joi.number().min(0),
          color: Joi.string().trim(),
          size: Joi.string().trim(),
        }),
      )
      .min(1)
      .required(),
    contact: Joi.object()
      .keys({
        name: Joi.string().required().trim(),
        email: Joi.string().email().required().trim(),
        phone: Joi.string()
          .pattern(/^\+?[1-9]\d{1,14}$/)
          .required()
          .trim(),
      })
      .required(),
    shippingAddress: Joi.object()
      .keys({
        street: Joi.string().required().trim(),
        city: Joi.string().required().trim(),
        state: Joi.string().required().trim(),
        zipCode: Joi.string().required().trim(),
        country: Joi.string().required().trim(),
      })
      .required(),
    paymentMethod: Joi.string().valid('credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery').required(),
    paymentStatus: Joi.string().valid('pending', 'paid', 'failed', 'refunded').default('pending'),
    notes: Joi.string().trim().optional(),
  }),
};

const getOrder = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
};

const updatePaymentStatus = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    paymentStatus: Joi.string().valid('pending', 'paid', 'failed', 'refunded').required(),
  }),
};

const sendTransactionEmail = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    emailType: Joi.string().valid('approved', 'failed').required(),
  }),
};

const getUserOrders = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string(),
    status: Joi.string().valid('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'),
    paymentStatus: Joi.string().valid('pending', 'paid', 'failed', 'refunded'),
  }),
};

module.exports = {
  createOrder,
  getOrder,
  updatePaymentStatus,
  sendTransactionEmail,
  getUserOrders,
};
