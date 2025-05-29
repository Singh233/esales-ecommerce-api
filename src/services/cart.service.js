const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError.js');
const Cart = require('../models/cart.model.js');
const Product = require('../models/product.model.js');

/**
 * Get or create cart by userEmail
 * @param {string} userEmail
 * @returns {Promise<Cart>}
 */
const getOrCreateCart = async (userEmail) => {
  let cart;

  if (userEmail) {
    cart = await Cart.findOne({ userEmail, status: 'active' }).populate('items.product');
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Either userEmail must be provided');
  }

  if (!cart) {
    cart = await Cart.create({
      userEmail,
      items: [],
      status: 'active',
    });
  }

  return cart;
};

/**
 * Get cart by id
 * @param {ObjectId} id
 * @returns {Promise<Cart>}
 */
const getCartById = async (id) => {
  const cart = await Cart.findById(id).populate('items.product');
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart not found');
  }
  return cart;
};

/**
 * Add item to cart
 * @param {string} userEmail
 * @param {Object} itemData
 * @returns {Promise<Cart>}
 */
const addItemToCart = async (userEmail, itemData) => {
  const { product: productId, quantity, color, size } = itemData;

  // Validate product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  // Check if enough quantity is available
  if (product.quantity < quantity) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Insufficient quantity. Available: ${product.quantity}`);
  }

  const cart = await getOrCreateCart(userEmail);

  // Check if item already exists in cart (same product, color, size)
  const existingItemIndex = cart.items.findIndex(
    (item) => item.product._id.toString() === productId && item.color === color && item.size === size,
  );

  if (existingItemIndex > -1) {
    // Update existing item quantity
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;

    if (product.quantity < newQuantity) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Insufficient quantity. Available: ${product.quantity}`);
    }

    cart.items[existingItemIndex].quantity = newQuantity;
  } else {
    // Add new item to cart
    cart.items.push({
      product: productId,
      quantity,
      price: product.price,
      color,
      size,
    });
  }

  await cart.save();
  return cart.populate('items.product');
};

/**
 * Update item quantity in cart
 * @param {string} userEmail
 * @param {string} itemId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 */
const updateCartItem = async (userEmail, itemId, quantity) => {
  const cart = await getOrCreateCart(userEmail);

  const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId);
  if (itemIndex === -1) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Item not found in cart');
  }

  if (quantity <= 0) {
    // Remove item if quantity is 0 or negative
    cart.items.splice(itemIndex, 1);
  } else {
    // Validate product quantity
    const product = await Product.findById(cart.items[itemIndex].product);
    if (product.quantity < quantity) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Insufficient quantity. Available: ${product.quantity}`);
    }

    cart.items[itemIndex].quantity = quantity;
  }

  await cart.save();
  return cart.populate('items.product');
};

/**
 * Remove item from cart
 * @param {string} userEmail
 * @param {string} itemId
 * @returns {Promise<Cart>}
 */
const removeCartItem = async (userEmail, itemId) => {
  const cart = await getOrCreateCart(userEmail);

  const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId);
  if (itemIndex === -1) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Item not found in cart');
  }

  cart.items.splice(itemIndex, 1);
  await cart.save();

  return cart.populate('items.product');
};

/**
 * Clear cart
 * @param {string} userEmail
 * @returns {Promise<Cart>}
 */
const clearCart = async (userEmail) => {
  const cart = await getOrCreateCart(userEmail);
  cart.items = [];
  await cart.save();

  return cart;
};

/**
 * Get cart summary
 * @param {string} userEmail
 * @returns {Promise<Object>}
 */
const getCartSummary = async (userEmail) => {
  const cart = await getOrCreateCart(userEmail);

  return {
    totalItems: cart.totalItems,
    totalAmount: cart.totalAmount,
    itemsCount: cart.items.length,
  };
};

module.exports = {
  getOrCreateCart,
  getCartById,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  getCartSummary,
};
