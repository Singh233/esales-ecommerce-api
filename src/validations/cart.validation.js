const Joi = require('joi');
const { objectId } = require('./custom.validation.js');

const getCart = {};

const addItemToCart = {
  body: Joi.object().keys({
    product: Joi.string().custom(objectId).required(),
    quantity: Joi.number().integer().min(1).required(),
    color: Joi.string().trim(),
    size: Joi.string().trim(),
  }),
};

const updateCartItem = {
  params: Joi.object().keys({
    itemId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    quantity: Joi.number().integer().min(0).required(),
  }),
};

const removeCartItem = {
  params: Joi.object().keys({
    itemId: Joi.string().custom(objectId).required(),
  }),
};

const clearCart = {};

module.exports = {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
