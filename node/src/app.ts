import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express } from 'express';
import morgan from 'morgan';

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
  return app;
}
