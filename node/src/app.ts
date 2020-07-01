import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express, Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { logger } from 'utils/logging';

export default async function createApp(): Promise<Express> {
  if (process.env.NODE_ENV !== 'production') {
    require('longjohn'); // full stack traces when testing
  }
  const configureEnv = (await import('utils/configure-env')).default;
  configureEnv();
  const app = express();
  if (process.env['NODE_ENV'] !== 'test') {
    app.use(morgan('dev'));
  }
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use('/', (await import('routes')).default);
  app.use(function(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction // eslint-disable-line @typescript-eslint/no-unused-vars
  ) {
    let errorStatus = 500;
    let errorMessage = '';
    if (!isNaN(Number(err))) {
      errorStatus = err as number;
    }
    if (err instanceof Object) {
      errorStatus =
        (!isNaN(err.status) && Number(err.status) > 0) ||
        Number(err.status) < 600
          ? Number(err.status)
          : 500;
      errorMessage = err.message || '';
    }
    if (
      err instanceof Error &&
      // process.env['NODE_ENV'] !== 'test' &&
      errorStatus >= 500
    ) {
      logger.error(err.stack);
    }
    res.status(errorStatus);
    res.send({
      message: errorMessage,
      status: errorStatus,
    });
  });
  return app;
}
