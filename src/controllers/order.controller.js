const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync.js');
const { orderService } = require('../services/index.js');

const createOrder = catchAsync(async (req, res) => {
  const order = await orderService.createOrder(req.body);
  res.status(httpStatus.CREATED).json({ message: 'Order created successfully', order });
});

const getOrder = catchAsync(async (req, res) => {
  const order = await orderService.getOrder(req.params.id);
  res.status(httpStatus.OK).json({ message: 'Order retrieved successfully', order });
});

const updateOrderPaymentStatus = catchAsync(async (req, res) => {
  const order = await orderService.updateOrderPaymentStatus(req.params.id, req.body.paymentStatus);
  res.status(httpStatus.OK).json({
    message: 'Order payment status updated successfully',
    order,
  });
});

const sendTransactionEmail = catchAsync(async (req, res) => {
  const result = await orderService.sendTransactionEmail(req.params.id, req.body.emailType);
  res.status(httpStatus.OK).json({
    message: 'Transaction email sent successfully',
    result,
  });
});

const getUserOrders = catchAsync(async (req, res) => {
  const { ...options } = req.query;
  const { email } = req;
  const result = await orderService.getUserOrders(email, options);
  res.status(httpStatus.OK).json({
    message: 'Orders retrieved successfully',
    ...result,
  });
});

module.exports = {
  createOrder,
  getOrder,
  updateOrderPaymentStatus,
  sendTransactionEmail,
  getUserOrders,
};
