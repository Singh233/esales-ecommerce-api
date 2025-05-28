const express = require('express');
const validate = require('../middlewares/validate.js');
const { productValidation } = require('../validations/index.js');
const { productController } = require('../controllers/index.js');

const router = express.Router();

// Get a specific product by ID
router.get('/:id', validate(productValidation.getProduct), productController.getProduct);

module.exports = router;
