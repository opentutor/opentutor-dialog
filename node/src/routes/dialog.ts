import express, { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import AutoTutorData, {
  navyIntegrity,
  currentFlow,
  convertLessonDataToATData,
} from 'models/autotutor-data';
import 'models/opentutor-response';
import {
  beginDialog,
  calculateScore,
  processUserResponse,
} from 'models/dialog-system';
import {
  addTutorDialog,
  addUserDialog,
  dtoToData,
  dataToDto,
  hasHistoryBeenTampered,
  newSession,
  SessionData,
  ExpectationData,
} from 'models/session-data';
import { sendGraderRequest } from 'models/grader';
import Joi from '@hapi/joi';
import logger from 'utils/logging';
import { getLessonData } from 'models/graphql';

const router = express.Router({ mergeParams: true });

router.get('/ping', (req: Request, res: Response) => {
  res.send({ status: 'ok' });
});

const dialogSchema = Joi.object({
  lessonId: Joi.string(),
}).unknown(true);

router.post(
  '/:lessonId',
  async (req: Request, res: Response, next: NextFunction) => {
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
          //request graphQL for data.
          try {
            atd = convertLessonDataToATData(await getLessonData(lessonId));
          } catch (err) {
            const status =
              `${err.response && err.response.status}` === '404' ? 404 : 502;
            const message =
              status === 404
                ? `classifier cannot find lesson '${lessonId}'`
                : err.message;
            throw Object.assign(err, { status, message });
            return res.status(404).send();
          }
          break;
      }
      //new sessionDataPacket
      const sdp = newSession(atd, body.sessionId);
      addTutorDialog(sdp, beginDialog(atd));
      res.send({
        status: 200,
        lessonId: lessonId,
        sessionInfo: dataToDto(sdp),
        response: beginDialog(atd),
      });
    } catch (err) {
      console.error(err);
      return next(err);
    }
  }
);

router.post(
  '/:lessonId/session',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lessonId = req.params['lessonId'];
      const sessionDto = req.body['sessionInfo'];
      if (hasHistoryBeenTampered(sessionDto.sessionHistory, sessionDto.hash)) {
        return res.status(403).send();
      }

      const sessionData: SessionData = dtoToData(sessionDto);
      //if last system message was a closing, send error
      if (sessionData.dialogState.expectationsCompleted.every(v => v == true)) {
        return res.status(410).send();
      }

      let atd: AutoTutorData;
      switch (lessonId) {
        case 'q1':
          atd = navyIntegrity;
          break;
        case 'q2':
          atd = currentFlow;
          break;
        default:
          try {
            atd = convertLessonDataToATData(await getLessonData(lessonId));
          } catch (err) {
            const status =
              `${err.response && err.response.status}` === '404' ? 404 : 502;
            const message =
              status === 404
                ? `classifier cannot find lesson '${lessonId}'`
                : err.message;
            throw Object.assign(err, { status, message });
            return res.status(404).send();
          }
          break;
      }
      addUserDialog(sessionData, req.body['message']);
      const msg = await processUserResponse(lessonId, atd, sessionData);
      addTutorDialog(sessionData, msg);
      const graderResponse = sendGraderRequest(atd, sessionData) ? true : false;
      const currentExpectation = sessionData.dialogState.expectationData.findIndex(
        e => e.status === 'active'
      );

      console.log(sessionData);
      logger.info(sessionData);
      res.send({
        status: 200,
        sessionInfo: dataToDto(sessionData),
        response: msg,
        sentToGrader: graderResponse,
        completed: msg.find(m => m.type === 'closing') ? true : false,
        score: calculateScore(sessionData, atd),
        expectationActive: currentExpectation,
      });
    } catch (err) {
      console.log(err);
      logger.error(err);
      return next(err);
    }
  }
);

export default router;
