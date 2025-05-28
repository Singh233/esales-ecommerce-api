const express = require('express');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const httpStatus = require('http-status');
const morgan = require('./config/morgan.js');
const config = require('./config/config.js');
const routes = require('./routes/index.js');
const { errorConverter, errorHandler } = require('./middlewares/error.js');
const ApiError = require('./utils/ApiError.js');
const app = express();

app.use(morgan);

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(
  cors({
    origin: config.cors.allowedOrigins,
    credentials: true,
  }),
);

app.options('*', cors());

app.use('/v1', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
