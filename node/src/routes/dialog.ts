import express, { Request, Response, NextFunction } from 'express';
import AutoTutorData, {
  navyIntegrity,
  currentFlow,
} from 'models/autotutor-data';
import createError from 'http-errors';
import Joi from '@hapi/joi';
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

const dialogSchema = Joi.object({
  lessonId: Joi.string().required(),
}).unknown(true);

router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = dialogSchema.validate(req.body);
    const { value: body, error } = result;
    const valid = error == null;
    if (!valid) {
      return next(createError(400, error));
    }
    let atd: AutoTutorData;
    switch (body['lessonId']) {
      case 'q1':
        atd = navyIntegrity;
        break;
      case 'q2':
        atd = currentFlow;
        console.log('switched to current flow');
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
      lessonId: req.body['lessonId'],
      sessionInfo: sdp,
      response: createTextResponse(beginDialog(atd)),
    });
  } catch (err) {
    return next(err);
  }
});

// TODO: session history needs to be implemented

router.post(
  '/session',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lessonId = req.body['lessonId'];
      //load up session data
      const sessionData: SessionDataPacket = req.body['sessionInfo'];
      let atd: AutoTutorData;
      switch (lessonId) {
        case 'q1':
          atd = navyIntegrity;
          break;
        case 'q2':
          atd = currentFlow;
          console.log('switched to current flow');
          break;
        default:
          break;
      }

      //check for tampering of history
      if (
        hasHistoryBeenTampered(sessionData.sessionHistory, sessionData.hash)
      ) {
        // console.log('history was tampered');
        return res.status(403).send();
      }

      //read user dialog
      // console.log('User says:  ' + req.body['message']);
      addUserDialog(sessionData, req.body['message']);

      //load next system message
      //   console.log('loading next message');
      // const msg = dialogs[sessionData.sessionHistory.systemResponses.length];
      const msg = await processUserResponse(lessonId, atd, sessionData);
      // console.log('system response was ');
      console.log(msg);
      addTutorDialog(sessionData, msg);

      // console.log('updating hash');
      //update hash
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
