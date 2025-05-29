const express = require('express');
const validate = require('../middlewares/validate.js');
const { cartValidation } = require('../validations/index.js');
const { cartController } = require('../controllers/index.js');
const authMiddleware = require('../middlewares/auth.middleware.js');

const router = express.Router();

router.get('/', authMiddleware, validate(cartValidation.getCart), cartController.getCart);

// Add item to cart
router.post('/items', authMiddleware, validate(cartValidation.addItemToCart), cartController.addItemToCart);

// Update cart item quantity
router.patch('/items/:itemId', authMiddleware, validate(cartValidation.updateCartItem), cartController.updateCartItem);

// Remove item from cart
router.delete('/items/:itemId', authMiddleware, validate(cartValidation.removeCartItem), cartController.removeCartItem);

// Clear cart
router.delete('/', authMiddleware, validate(cartValidation.clearCart), cartController.clearCart);

module.exports = router;
