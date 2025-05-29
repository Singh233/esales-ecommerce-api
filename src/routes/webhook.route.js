const express = require('express');
const validate = require('../middlewares/validate.js');
const { webhookValidation } = require('../validations/index.js');
const { webhookController } = require('../controllers/index.js');

const router = express.Router();

// Payment webhook endpoints
router.post('/payment/success', validate(webhookValidation.paymentSuccess), webhookController.handlePaymentSuccess);
router.post('/payment/failure', validate(webhookValidation.paymentFailure), webhookController.handlePaymentFailure);
router.post('/payment/pending', validate(webhookValidation.paymentPending), webhookController.handlePaymentPending);

// Test endpoint for development
router.post('/test/email', validate(webhookValidation.testEmail), webhookController.testEmailSending);

module.exports = router;
