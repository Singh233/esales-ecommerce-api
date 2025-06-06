const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError.js');
const Order = require('../models/order.model.js');
const Product = require('../models/product.model.js');
const Cart = require('../models/cart.model.js');
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

  const count = await Order.countDocuments();
  const orderNumber = `order-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;

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
  const data = {
    ...orderBody,
    items: validatedItems,
    totalAmount,
    orderNumber,
  };

  if (orderBody.paymentStatus === 'failed') {
    // Production ready approach would be using queue to handle email sending
    await emailService.sendFailedTransactionEmail(data);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Payment status "declined" for a new order');
  }

  const order = await Order.create(data);
  const products = [];

  // Reduce product quantities
  for (const item of validatedItems) {
    const product = await Product.findByIdAndUpdate(item.product, {
      $inc: { quantity: -item.quantity },
    });
    products.push(product);
  }

  emailService.sendApprovedTransactionEmail(data, products);

  return order.populate('items.product');
};

/**
 * Create an order from cart
 * @param {ObjectId} cartId
 * @param {Object} orderData - Contact, shipping, and payment information
 * @returns {Promise<Order>}
 */
const createOrderFromCart = async (cartId, orderData) => {
  const cart = await Cart.findById(cartId).populate('items.product');
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart not found');
  }

  if (cart.items.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cart is empty');
  }

  // Validate products exist and have sufficient quantity
  const validatedItems = [];
  for (const item of cart.items) {
    const product = await Product.findById(item.product._id);
    if (!product) {
      throw new ApiError(httpStatus.NOT_FOUND, `Product ${item.product.title} no longer exists`);
    }

    if (product.quantity < item.quantity) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Insufficient quantity for ${product.title}. Available: ${product.quantity}`,
      );
    }

    validatedItems.push({
      product: item.product._id,
      quantity: item.quantity,
      price: item.price,
      color: item.color,
      size: item.size,
    });
  }

  const order = await Order.create({
    ...orderData,
    items: validatedItems,
    totalAmount: cart.totalAmount,
  });

  // Reduce product quantities
  for (const item of validatedItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { quantity: -item.quantity },
    });
  }

  // Mark cart as converted
  cart.status = 'converted';
  await cart.save();

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

/**
 * Get orders by email with pagination
 * @param {string} email - Customer email
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>}
 */
const getUserOrders = async (email, options) => {
  const filter = { 'contact.email': email.toLowerCase() };

  // Add optional filters
  if (options.status) {
    filter.status = options.status;
  }
  if (options.paymentStatus) {
    filter.paymentStatus = options.paymentStatus;
  }

  // Set default pagination options
  const paginationOptions = {
    page: options.page || 1,
    limit: options.limit || 10,
    sortBy: options.sortBy || 'createdAt:desc',
    populate: 'items.product',
  };

  const result = await Order.paginate(filter, paginationOptions);
  return result;
};

module.exports = {
  createOrder,
  createOrderFromCart,
  getOrder,
  updateOrderPaymentStatus,
  sendTransactionEmail,
  getUserOrders,
};
