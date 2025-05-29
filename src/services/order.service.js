const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError.js');
const Order = require('../models/order.model.js');
const Product = require('../models/product.model.js');
const emailService = require('./email.service.js');
const logger = require('../config/logger.js');

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

  const count = await Order.countDocuments();
  const orderNumber = `order-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;

  const order = await Order.create({
    ...orderBody,
    items: validatedItems,
    totalAmount,
    orderNumber,
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

/**
 * Update order payment status and send appropriate email
 * @param {ObjectId} id - Order ID
 * @param {string} paymentStatus - New payment status ('paid', 'failed', 'pending', 'refunded')
 * @returns {Promise<Order>}
 */
const updateOrderPaymentStatus = async (id, paymentStatus) => {
  const order = await getOrder(id);

  // Update payment status
  order.paymentStatus = paymentStatus;

  // Update order status based on payment status
  if (paymentStatus === 'paid') {
    order.status = 'confirmed';
  } else if (paymentStatus === 'failed') {
    order.status = 'cancelled';
  }

  await order.save();

  // Send appropriate email based on payment status
  try {
    if (paymentStatus === 'paid' || paymentStatus === 'failed') {
      await emailService.sendTransactionStatusEmail(
        order,
        order.items.map((item) => item.product),
      );
    }
  } catch (emailError) {
    logger.error(`Failed to send transaction email for order ${order.orderNumber}:`, emailError);
  }

  return order;
};

/**
 * Send transaction email for existing order
 * @param {ObjectId} id - Order ID
 * @param {string} emailType - Type of email ('approved' or 'failed')
 * @returns {Promise<Object>}
 */
const sendTransactionEmail = async (id, emailType) => {
  const order = await getOrder(id);

  let result;
  if (emailType === 'approved') {
    result = await emailService.sendApprovedTransactionEmail(
      order,
      order.items.map((item) => item.product),
    );
  } else if (emailType === 'failed') {
    result = await emailService.sendFailedTransactionEmail(order);
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid email type. Must be "approved" or "failed"');
  }

  return result;
};

module.exports = {
  createOrder,
  getOrder,
  updateOrderPaymentStatus,
  sendTransactionEmail,
};
