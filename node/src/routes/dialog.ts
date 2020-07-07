import express, { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import AutoTutorData, {
  navyIntegrity,
  currentFlow,
} from 'models/autotutor-data';
import 'models/opentutor-response';
import SessionDataPacket, {
  hasHistoryBeenTampered,
  newSessionDataPacket,
  updateHash,
  addTutorDialog,
  addUserDialog,
} from 'models/session-data-packet';
import { processUserResponse, beginDialog, calculateScore } from 'models/dialog-system';
import { sendGraderRequest } from 'models/grader';
import Joi from '@hapi/joi';

const router = express.Router({ mergeParams: true });

router.get('/ping', (req: Request, res: Response) => {
  res.send({ status: 'ok' });
});

const dialogSchema = Joi.object({
  sessionId: Joi.string(),
}).unknown(true);

router.post('/:lessonId', (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = dialogSchema.validate(req.body);
    const { value: body, error } = result;
    const valid = error == null;
    if (!valid) {
      return next(createError(400, error));
    }
    const lessonId = req.params['lessonId'];
    let atd: AutoTutorData;
    switch (lessonId) {
      case 'q1':
        atd = navyIntegrity;
        break;
      case 'q2':
        atd = currentFlow;
        break;
      default:
        break;
    }
    //new sessionDataPacket
    const sdp = newSessionDataPacket(atd, body.sessionId);
    addTutorDialog(sdp, beginDialog(atd));
    updateHash(sdp);
    res.send({
      status: 'ok',
      lessonId: lessonId,
      sessionInfo: sdp,
      response: beginDialog(atd),
    });
  } catch (err) {
    return next(err);
  }
});

router.post(
  '/:lessonId/session',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lessonId = req.params['lessonId'];
      const sessionData: SessionDataPacket = req.body['sessionInfo'];
      let atd: AutoTutorData;
      switch (lessonId) {
        case 'q1':
          atd = navyIntegrity;
          break;
        case 'q2':
          atd = currentFlow;
          break;
        default:
          break;
      }
      if (
        hasHistoryBeenTampered(sessionData.sessionHistory, sessionData.hash)
      ) {
        return res.status(403).send();
      }
      addUserDialog(sessionData, req.body['message']);
      const msg = await processUserResponse(lessonId, atd, sessionData);
      addTutorDialog(sessionData, msg);
      updateHash(sessionData);
      //before sending the response, send the grader the message too.
      const graderResponse = sendGraderRequest(atd, sessionData);
      res.send({
        status: 'ok',
        sessionInfo: sessionData,
        response: msg,
        sentToGrader: graderResponse,
        score: calculateScore(sessionData, atd),
      });
    } catch (err) {
      return next(err);
    }
  }
);

export default router;
