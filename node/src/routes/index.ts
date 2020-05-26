import express, { Request, Response } from 'express';
const router = express.Router({ mergeParams: true });

router.get('/ping', (req: Request, res: Response) => {
  res.send({ status: 'ok' });
});

router.post('/session', (req: Request, res: Response) => {
  res.send({
      status: 'ok',
      "data": {
        "promptMessage" : 'What are the challenges to demonstrating integrity in a group?'
      }
  });
});
export default router;
