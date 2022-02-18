/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
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
  app.use(
    (
      err: any, // eslint-disable-line @typescript-eslint/no-explicit-any
      req: Request,
      res: Response,
      next: NextFunction // eslint-disable-line @typescript-eslint/no-unused-vars
    ) => {
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
    }
  );
  return app;
}
