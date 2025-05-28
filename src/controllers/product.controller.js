const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync.js');
const { productService } = require('../services/index.js');

const getProduct = catchAsync(async (req, res) => {
  const product = await productService.getProduct(req.params.id);
  res.status(httpStatus.OK).json({ message: 'Product retrieved successfully', product });
});

module.exports = { getProduct };
