import express, { Request, Response } from 'express';
const router = express.Router({ mergeParams: true });
import dialog from './dialog';

router.get('/ping', (req: Request, res: Response) => {
  res.send({ status: 'ok' });
});

router.use('/dialog', dialog);

export default router;
