import express from 'express';
const router = express.Router({ mergeParams: true });
import dialog from './dialog';

router.use('/dialog', dialog);

export default router;
