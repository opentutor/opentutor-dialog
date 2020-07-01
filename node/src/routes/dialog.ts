import express, { Request, Response, NextFunction } from 'express';
import AutoTutorData, {
  navyIntegrity,
  currentFlow,
} from 'models/autotutor-data';
// import createError from 'http-errors';
// import Joi from '@hapi/joi';
import 'models/opentutor-response';
import SessionDataPacket, {
  hasHistoryBeenTampered,
  newSessionDataPacket,
  updateHash,
  addTutorDialog,
  addUserDialog,
} from 'models/session-data-packet';
import { createTextResponse } from 'models/opentutor-response';
import { processUserResponse, beginDialog } from 'models/dialog-system';

const router = express.Router({ mergeParams: true });

router.get('/ping', (req: Request, res: Response) => {
  res.send({ status: 'ok' });
});

// const dialogSchema = Joi.object({
//   lessonId: Joi.string().required(),
// }).unknown(true);

router.post('/:lessonId', (req: Request, res: Response, next: NextFunction) => {
  try {
    // const result = dialogSchema.validate(req.body);
    // const { value: body, error } = result;
    // const valid = error == null;
    // if (!valid) {
    //   return next(createError(400, error));
    // }
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
    const sdp = newSessionDataPacket(atd);
    addTutorDialog(sdp, beginDialog(atd));
    updateHash(sdp);
    res.send({
      status: 'ok',
      lessonId: lessonId,
      sessionInfo: sdp,
      response: createTextResponse(beginDialog(atd)),
    });
  } catch (err) {
    return next(err);
  }
});

// TODO: session history needs to be implemented

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
      res.send({
        status: 'ok',
        sessionInfo: sessionData,
        response: createTextResponse(msg),
      });
    } catch (err) {
      return next(err);
    }
  }
);

export default router;
