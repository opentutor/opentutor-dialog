import express, { Request, Response } from 'express';
const router = express.Router({ mergeParams: true });
import dialog from './api/dialog';

router.get('/ping', (req: Request, res: Response) => {
  res.send({ status: 'ok' });
});

router.use('/', dialog);

export default router;

