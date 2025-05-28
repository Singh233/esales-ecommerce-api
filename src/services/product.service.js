const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError.js');
const Product = require('../models/product.model.js');

/**
 * Get product by id
 * @param {ObjectId} id
 * @returns {Promise<Product>}
 */
const getProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  return product;
};

module.exports = {
  getProduct,
};
