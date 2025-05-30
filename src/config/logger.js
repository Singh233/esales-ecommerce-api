const winston = require('winston');

const { format } = winston;

const timestampFormat = format.timestamp({
  format: 'DD-MMM-YYYY HH:mm:ss.SSS',
});

const transports = [
  new winston.transports.Console({
    level: 'http',
    format: format.combine(
      format.colorize(),
      timestampFormat,
      format.printf((info) => {
        const { timestamp, level, message, ...args } = info;
        return `${timestamp} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
      }),
    ),
  }),
];

const Logger = winston.createLogger({
  transports,
});

// Helper function to format multiple arguments into a single string
const formatLogArgs = (...args) => {
  return args
    .map((arg) => {
      if (typeof arg === 'object' && arg !== null) {
        try {
          return JSON.stringify(arg);
        } catch (e) {
          e;
          return arg.toString();
        }
      }
      return arg;
    })
    .join(' ');
};

const logger = {
  error: (...args) => Logger.error(formatLogArgs(...args)),
  warning: (...args) => Logger.warn(formatLogArgs(...args)),
  info: (...args) => Logger.info(formatLogArgs(...args)),
  success: (...args) => Logger.log('success', formatLogArgs(...args)),
  http: (...args) => Logger.log('http', formatLogArgs(...args)),
};

module.exports = logger;
