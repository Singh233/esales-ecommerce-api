const httpStatus = require('http-status');
const express = require('express');
const productRoute = require('./product.route.js');
const orderRoute = require('./order.route.js');
const webhookRoute = require('./webhook.route.js');
const cartRoute = require('./cart.route.js');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(httpStatus.OK).json({ status: 'OK' });
});

router.use('/products', productRoute);
router.use('/orders', orderRoute);
router.use('/webhooks', webhookRoute);
router.use('/cart', cartRoute);

module.exports = router;
