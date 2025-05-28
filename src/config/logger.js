const winston = require("winston");

const { format } = winston;

const timestampFormat = format.timestamp({
  format: "DD-MMM-YYYY HH:mm:ss.SSS",
});

const transports = [
  new winston.transports.Console({
    level: "http",
    format: format.combine(
      format.colorize(),
      timestampFormat,
      format.printf((info) => {
        const { timestamp, level, message, ...args } = info;
        return `${timestamp} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ""}`;
      })
    ),
  }),
];

const Logger = winston.createLogger({
  transports,
});

const logger = {
  error: (message) => Logger.error(message),
  warning: (message) => Logger.warn(message),
  info: (message) => Logger.info(message),
  success: (message) => Logger.log("success", message),
  http: (message) => Logger.log("http", message),
};

module.exports = logger;
