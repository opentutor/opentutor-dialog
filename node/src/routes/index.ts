import express, { Request, Response } from 'express';
const router = express.Router({ mergeParams: true });
import dialog from './api/session';

router.get('/ping', (req: Request, res: Response) => {
  res.send({ status: 'ok' });
});

router.use('/session', dialog);

export default router;
