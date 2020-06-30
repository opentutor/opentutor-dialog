import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL_DIALOG
    ? process.env.LOG_LEVEL_DIALOG
    : process.env.LOG_LEVEL
    ? process.env.LOG_LEVEL
    : process.env['NODE_ENV'] === 'test'
    ? 'warning'
    : 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

export default logger;
