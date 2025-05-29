const express = require('express');
const validate = require('../middlewares/validate.js');
const { orderValidation } = require('../validations/index.js');
const { orderController } = require('../controllers/index.js');

const router = express.Router();

// Create a new order
router.post('/', validate(orderValidation.createOrder), orderController.createOrder);

// Get a specific order by ID
router.get('/:id', validate(orderValidation.getOrder), orderController.getOrder);

module.exports = router;
