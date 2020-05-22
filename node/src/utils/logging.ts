import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env['NODE_ENV'] === 'test' ? 'warning' : 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

export default logger;
