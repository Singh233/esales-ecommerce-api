const { fromNodeHeaders } = require('better-auth/node');
const { auth } = require('../config/auth.mjs');
const catchAsync = require('../utils/catchAsync.js'); // Adjust the import path as needed
const ApiError = require('../utils/ApiError.js');

const authMiddlewareHandler = async function (req, res, next) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) {
    throw new ApiError(401, 'Unauthorized');
  }
  req.user = session.user;
  req.email = session.user.email;
  next();
};

module.exports = catchAsync(authMiddlewareHandler, 'authMiddleware');
