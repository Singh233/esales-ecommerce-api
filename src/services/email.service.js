const nodemailer = require('nodemailer');
const config = require('../config/config.js');
const logger = require('../config/logger.js');

/**
 * Create email transporter using nodemailer
 */
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: config.email.host,
    port: config.email.port,
    secure: false, // true for 465, false for other ports
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });
};

/**
 * Generate HTML template for approved transaction email
 * @param {Object} order - Order object
 * @param {Array} products - Array of product details
 * @returns {string} HTML template
 */
const generateApprovedTransactionTemplate = (order, products) => {
  const itemsHtml = order.items
    .map((item) => {
      const product = products.find((p) => p._id.toString() === item.product.toString());
      return `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 15px 10px;">
            <div style="display: flex; align-items: center;">
              <img src="${product?.image || ''}" alt="${product?.title || 'Product'}" 
                   style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 15px;">
              <div>
                <h4 style="margin: 0 0 5px 0; color: #333; font-size: 16px;">${product?.title || 'Product'}</h4>
                <p style="margin: 0; color: #666; font-size: 14px;">
                  ${item.color ? `Color: ${item.color}` : ''} 
                  ${item.size ? `Size: ${item.size}` : ''}
                </p>
              </div>
            </div>
          </td>
          <td style="padding: 15px 10px; text-align: center; color: #333;">
            ${item.quantity}
          </td>
          <td style="padding: 15px 10px; text-align: right; color: #333; font-weight: 600;">
            $${item.price.toFixed(2)}
          </td>
        </tr>
      `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - ${order.orderNumber}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Order Confirmed! 🎉</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Thank you for your purchase</p>
        </div>

        <!-- Order Details -->
        <div style="padding: 30px;">
          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h2 style="margin: 0 0 15px 0; color: #333; font-size: 20px;">Order Information</h2>
            <p style="margin: 5px 0; color: #666;"><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Payment Method:</strong> ${order.paymentMethod.replace('_', ' ').toUpperCase()}</p>
          </div>

          <!-- Customer Information -->
          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h2 style="margin: 0 0 15px 0; color: #333; font-size: 20px;">Customer Information</h2>
            <p style="margin: 5px 0; color: #666;"><strong>Name:</strong> ${order.contact.name}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Email:</strong> ${order.contact.email}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Phone:</strong> ${order.contact.phone}</p>
          </div>

          <!-- Shipping Address -->
          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h2 style="margin: 0 0 15px 0; color: #333; font-size: 20px;">Shipping Address</h2>
            <p style="margin: 5px 0; color: #666;">
              ${order.shippingAddress.street}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
              ${order.shippingAddress.country}
            </p>
          </div>

          <!-- Order Items -->
          <div style="margin-bottom: 25px;">
            <h2 style="margin: 0 0 20px 0; color: #333; font-size: 20px;">Order Items</h2>
            <table style="width: 100%; border-collapse: collapse; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 15px 10px; text-align: left; color: #333; font-weight: 600;">Product</th>
                  <th style="padding: 15px 10px; text-align: center; color: #333; font-weight: 600;">Quantity</th>
                  <th style="padding: 15px 10px; text-align: right; color: #333; font-weight: 600;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <!-- Total -->
          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; text-align: right;">
            <h3 style="margin: 0; color: #333; font-size: 24px;">
              Total: <span style="color: #667eea;">$${order.totalAmount.toFixed(2)}</span>
            </h3>
          </div>

          <!-- Confirmation Message -->
          <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #e8f5e8; border-radius: 8px; border-left: 4px solid #28a745;">
            <h3 style="margin: 0 0 10px 0; color: #28a745;">Your order has been confirmed!</h3>
            <p style="margin: 0; color: #666;">
              We'll send you shipping updates as your order makes its way to you. 
              You can track your order status in your account dashboard.
            </p>
          </div>

          ${
            order.notes
              ? `
          <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
            <h4 style="margin: 0 0 10px 0; color: #856404;">Order Notes:</h4>
            <p style="margin: 0; color: #856404;">${order.notes}</p>
          </div>
          `
              : ''
          }
        </div>

        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            Questions? Contact our support team at support@example.com
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate HTML template for declined/failed transaction email
 * @param {Object} order - Order object
 * @returns {string} HTML template
 */
const generateFailedTransactionTemplate = (order) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Failed - ${order.orderNumber}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Payment Failed</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">There was an issue processing your payment</p>
        </div>

        <!-- Content -->
        <div style="padding: 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background-color: #fee; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px;">❌</span>
            </div>
            <h2 style="margin: 0 0 10px 0; color: #333;">Payment Could Not Be Processed</h2>
            <p style="margin: 0; color: #666; font-size: 16px;">
              We were unable to process your payment for order ${order.orderNumber}.
            </p>
          </div>

          <!-- Order Details -->
          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="margin: 0 0 15px 0; color: #333;">Order Details</h3>
            <p style="margin: 5px 0; color: #666;"><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Total Amount:</strong> $${order.totalAmount.toFixed(2)}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Payment Method:</strong> ${order.paymentMethod.replace('_', ' ').toUpperCase()}</p>
          </div>

          <!-- Customer Information -->
          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="margin: 0 0 15px 0; color: #333;">Customer Information</h3>
            <p style="margin: 5px 0; color: #666;"><strong>Name:</strong> ${order.contact.name}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Email:</strong> ${order.contact.email}</p>
          </div>

          <!-- What Happened -->
          <div style="background-color: #fff3cd; border-radius: 8px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #ffc107;">
            <h3 style="margin: 0 0 15px 0; color: #856404;">What Happened?</h3>
            <p style="margin: 0; color: #856404;">
              Your payment could not be processed due to one of the following reasons:
            </p>
            <ul style="color: #856404; margin: 10px 0 0 20px;">
              <li>Insufficient funds in your account</li>
              <li>Incorrect payment information</li>
              <li>Bank or card issuer declined the transaction</li>
              <li>Network connectivity issues</li>
            </ul>
          </div>

          <!-- Next Steps -->
          <div style="background-color: #e8f4fd; border-radius: 8px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #007bff;">
            <h3 style="margin: 0 0 15px 0; color: #004085;">What Can You Do?</h3>
            <ul style="color: #004085; margin: 0 0 0 20px;">
              <li>Verify your payment information and try again</li>
              <li>Contact your bank or card issuer for more information</li>
              <li>Try using a different payment method</li>
              <li>Contact our support team for assistance</li>
            </ul>
          </div>

          <!-- Action Buttons -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${config.frontend_url}/retry-payment/${order._id}" 
               style="display: inline-block; background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px;">
              Retry Payment
            </a>
            <a href="${config.frontend_url}/contact-support" 
               style="display: inline-block; background-color: #6c757d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px;">
              Contact Support
            </a>
          </div>

          <!-- Support Information -->
          <div style="text-align: center; background-color: #f8f9fa; border-radius: 8px; padding: 20px;">
            <h4 style="margin: 0 0 10px 0; color: #333;">Need Help?</h4>
            <p style="margin: 0; color: #666;">
              Our support team is here to help you complete your purchase.<br>
              Email: support@example.com | Phone: 1-800-555-0123
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            This email was sent because your payment for order ${order.orderNumber} could not be processed.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Send email using nodemailer
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {string} text - Plain text content (optional)
 * @returns {Promise<Object>} - Email send result
 */
const sendEmail = async (to, subject, html, text = null) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `${config.email.fromName} <${config.email.from}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML tags for text version
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${to}: ${result.messageId}`);
    return result;
  } catch (error) {
    logger.error(`Failed to send email to ${to}:`, error);
    throw error;
  }
};

/**
 * Send approved transaction email
 * @param {Object} order - Order object
 * @param {Array} products - Array of product details
 * @returns {Promise<Object>} - Email send result
 */
const sendApprovedTransactionEmail = async (order, products = []) => {
  try {
    const subject = `Order Confirmed - ${order.orderNumber} | Thank you for your purchase!`;
    const html = generateApprovedTransactionTemplate(order, products);

    return await sendEmail(order.contact.email, subject, html);
  } catch (error) {
    logger.error(`Failed to send approved transaction email for order ${order.orderNumber}:`, error);
    throw error;
  }
};

/**
 * Send failed/declined transaction email
 * @param {Object} order - Order object
 * @returns {Promise<Object>} - Email send result
 */
const sendFailedTransactionEmail = async (order) => {
  try {
    const subject = `Payment Failed - ${order.orderNumber} | Action Required`;
    const html = generateFailedTransactionTemplate(order);

    return await sendEmail(order.contact.email, subject, html);
  } catch (error) {
    logger.error(`Failed to send failed transaction email for order ${order.orderNumber}:`, error);
    throw error;
  }
};

/**
 * Send transaction status email based on payment status
 * @param {Object} order - Order object
 * @param {Array} products - Array of product details (for approved transactions)
 * @returns {Promise<Object>} - Email send result
 */
const sendTransactionStatusEmail = async (order, products = []) => {
  try {
    if (order.paymentStatus === 'paid') {
      return await sendApprovedTransactionEmail(order, products);
    } else if (order.paymentStatus === 'failed') {
      return await sendFailedTransactionEmail(order);
    } else {
      logger.warn(`No email template for payment status: ${order.paymentStatus}`);
      return null;
    }
  } catch (error) {
    logger.error(`Failed to send transaction status email for order ${order.orderNumber}:`, error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendApprovedTransactionEmail,
  sendFailedTransactionEmail,
  sendTransactionStatusEmail,
  generateApprovedTransactionTemplate,
  generateFailedTransactionTemplate,
};
