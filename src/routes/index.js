const httpStatus = require('http-status');
const express = require('express');
const productRoute = require('./product.route.js');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(httpStatus.OK).json({ status: 'OK' });
});

router.use('/products', productRoute);

module.exports = router;
