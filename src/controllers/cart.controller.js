const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync.js');
const { cartService } = require('../services/index.js');

const getCart = catchAsync(async (req, res) => {
  const { email } = req;

  const cart = await cartService.getOrCreateCart(email);
  res.status(httpStatus.OK).json({
    message: 'Cart retrieved successfully',
    cart,
  });
});

const addItemToCart = catchAsync(async (req, res) => {
  const { email } = req;

  const cart = await cartService.addItemToCart(email, req.body);
  res.status(httpStatus.OK).json({
    message: 'Item added to cart successfully',
    cart,
  });
});

const updateCartItem = catchAsync(async (req, res) => {
  const { email } = req;
  const { itemId } = req.params;
  const { quantity } = req.body;

  const cart = await cartService.updateCartItem(email, itemId, quantity);
  res.status(httpStatus.OK).json({
    message: 'Cart item updated successfully',
    cart,
  });
});

const removeCartItem = catchAsync(async (req, res) => {
  const { email } = req;
  const { itemId } = req.params;

  const cart = await cartService.removeCartItem(email, itemId);
  res.status(httpStatus.OK).json({
    message: 'Item removed from cart successfully',
    cart,
  });
});

const clearCart = catchAsync(async (req, res) => {
  const { email } = req;

  const cart = await cartService.clearCart(email);
  res.status(httpStatus.OK).json({
    message: 'Cart cleared successfully',
    cart,
  });
});

module.exports = {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
