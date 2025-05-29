const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError.js');
const Order = require('../models/order.model.js');
const Product = require('../models/product.model.js');

/**
 * Create an order
 * @param {Object} orderBody
 * @returns {Promise<Order>}
 */
const createOrder = async (orderBody) => {
  // Validate products exist and calculate total
  let totalAmount = 0;
  const validatedItems = [];

  for (const item of orderBody.items) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new ApiError(httpStatus.NOT_FOUND, `Product with id ${item.product} not found`);
    }

    // Check if enough quantity is available
    if (product.quantity < item.quantity) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Insufficient quantity for product ${product.title}`);
    }

    // Use current product price if not provided in item
    const itemPrice = item.price || product.price;
    totalAmount += itemPrice * item.quantity;

    validatedItems.push({
      ...item,
      price: itemPrice,
    });
  }

  const order = await Order.create({
    ...orderBody,
    items: validatedItems,
    totalAmount,
  });

  // Reduce product quantities
  for (const item of validatedItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { quantity: -item.quantity },
    });
  }

  return order.populate('items.product');
};

/**
 * Get order by id
 * @param {ObjectId} id
 * @returns {Promise<Order>}
 */
const getOrder = async (id) => {
  const order = await Order.findById(id).populate('items.product');
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  return order;
};

module.exports = {
  createOrder,
  getOrder,
};
