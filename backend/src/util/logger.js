// src/util/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.DEBUG ? 'debug' : 'info',
  transports: [
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

module.exports = logger;
