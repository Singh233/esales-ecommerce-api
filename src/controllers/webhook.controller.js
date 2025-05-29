const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync.js');
const { orderService } = require('../services/index.js');
const logger = require('../config/logger.js');

/**
 * Webhook handler for payment success
 * This endpoint would typically be called by payment processors like Stripe, PayPal, etc.
 */
const handlePaymentSuccess = catchAsync(async (req, res) => {
  const { orderId, paymentId } = req.body;

  logger.info(`Payment success webhook received for order: ${orderId}`);

  try {
    // Update order payment status and send confirmation email
    const order = await orderService.updateOrderPaymentStatus(orderId, 'paid');

    logger.info(`Order ${orderId} payment confirmed, email sent to ${order.contact.email}`);

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Payment processed successfully',
      orderId,
      paymentId,
    });
  } catch (error) {
    logger.error(`Failed to process payment success for order ${orderId}:`, error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to process payment',
      orderId,
    });
  }
});

/**
 * Webhook handler for payment failure
 * This endpoint would typically be called by payment processors when payment fails
 */
const handlePaymentFailure = catchAsync(async (req, res) => {
  const { orderId, paymentId, reason } = req.body;

  logger.info(`Payment failure webhook received for order: ${orderId}, reason: ${reason}`);

  try {
    // Update order payment status and send failure notification email
    const order = await orderService.updateOrderPaymentStatus(orderId, 'failed');

    logger.info(`Order ${orderId} payment failed, notification sent to ${order.contact.email}`);

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Payment failure processed',
      orderId,
      paymentId,
      reason,
    });
  } catch (error) {
    logger.error(`Failed to process payment failure for order ${orderId}:`, error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to process payment failure',
      orderId,
    });
  }
});

/**
 * Webhook handler for payment pending (optional)
 * For cases where payment is being processed but not yet confirmed
 */
const handlePaymentPending = catchAsync(async (req, res) => {
  const { orderId, paymentId } = req.body;

  logger.info(`Payment pending webhook received for order: ${orderId}`);

  try {
    await orderService.updateOrderPaymentStatus(orderId, 'pending');

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Payment pending status updated',
      orderId,
      paymentId,
    });
  } catch (error) {
    logger.error(`Failed to process payment pending for order ${orderId}:`, error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to update payment pending status',
      orderId,
    });
  }
});

/**
 * Test endpoint to manually trigger email sending (development only)
 */
const testEmailSending = catchAsync(async (req, res) => {
  const { orderId, emailType } = req.body;

  if (process.env.NODE_ENV === 'production') {
    return res.status(httpStatus.FORBIDDEN).json({
      message: 'Test endpoint not available in production',
    });
  }

  try {
    const result = await orderService.sendTransactionEmail(orderId, emailType);

    res.status(httpStatus.OK).json({
      success: true,
      message: `${emailType} email sent successfully`,
      result: result.messageId,
    });
  } catch (error) {
    logger.error(`Failed to send test email:`, error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message,
    });
  }
});

module.exports = {
  handlePaymentSuccess,
  handlePaymentFailure,
  handlePaymentPending,
  testEmailSending,
};
