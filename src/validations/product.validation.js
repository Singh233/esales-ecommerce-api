const Joi = require('joi');
const { objectId } = require('./custom.validation.js');

const getProduct = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
};

module.exports = {
  getProduct,
};
