const config = require('../config/config.js');
const logger = require('../config/logger.js');
const { sendEmail } = require('../services/email.service.js');

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    logger.error('Error message:', err.message, '\n');
    logger.error('Stack trace:', err.stack, '\n');

    if (config.env === 'production') {
      try {
        // Extract controller name from the route path
        const controllerName = req.route && req.route.path ? req.baseUrl + req.route.path : fn.name || 'unknown';

        // Create error report email content
        const errorDetails = {
          error: err.message,
          stack: err.stack,
          path: req.originalUrl || req.url,
          method: req.method,
          params: req.params,
          query: req.query,
          body: req.body,
          source: controllerName,
          user: req.user,
          headers: req.headers,
          ip: req.ip || req.connection?.remoteAddress,
          statusCode: err.statusCode || err.status || 500,
          timestamp: new Date().toISOString(),
        };

        // Generate HTML email content for error report
        const htmlContent = `
      <h2>Error Report - ${controllerName}</h2>
      <h3>Error Details:</h3>
      <p><strong>Message:</strong> ${err.message}</p>
      <p><strong>Status Code:</strong> ${errorDetails.statusCode}</p>
      <p><strong>Timestamp:</strong> ${errorDetails.timestamp}</p>
      
      <h3>Request Information:</h3>
      <p><strong>Method:</strong> ${errorDetails.method}</p>
      <p><strong>Path:</strong> ${errorDetails.path}</p>
      <p><strong>IP:</strong> ${errorDetails.ip}</p>
      
      <h3>Parameters:</h3>
      <pre>${JSON.stringify(errorDetails.params, null, 2)}</pre>
      
      <h3>Query:</h3>
      <pre>${JSON.stringify(errorDetails.query, null, 2)}</pre>
      
      <h3>Body:</h3>
      <pre>${JSON.stringify(errorDetails.body, null, 2)}</pre>
      
      <h3>Stack Trace:</h3>
      <pre>${err.stack}</pre>
      `;

        sendEmail('sanambir123@gmail.com', `Error Report: ${err.message} - ${controllerName}`, htmlContent).catch(
          (emailErr) => {
            logger.error('Failed to send error report email:', emailErr);
          },
        );
      } catch (emailProcessingError) {
        logger.error('Error while processing error report email:', emailProcessingError);
      }
    }

    next(err);
  });
};

module.exports = catchAsync;
