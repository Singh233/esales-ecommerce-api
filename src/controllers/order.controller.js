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

module.exports = {
  createOrder,
  getOrder,
};
