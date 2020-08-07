/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import express, { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import OpenTutorData, {
  convertLessonDataToATData,
} from 'models/opentutor-data';
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
  ExpectationStatus,
} from 'models/session-data';
import { sendGraderRequest } from 'apis/grader';
import Joi from '@hapi/joi';
import logger from 'utils/logging';
import { getLessonData } from 'apis/lessons';
import { ResponseType } from 'models/opentutor-response';

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
      if (Boolean(error)) {
        return next(createError(400, error));
      }
      const lessonId = req.params['lessonId'];
      const atd: OpenTutorData = convertLessonDataToATData(
        await getLessonData(lessonId)
      );
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

      const atd: OpenTutorData = convertLessonDataToATData(
        await getLessonData(lessonId)
      );
      if (!atd) return res.status(404).send();
      addUserDialog(sessionData, req.body['message']);
      const msg = await processUserResponse(lessonId, atd, sessionData);
      addTutorDialog(sessionData, msg);
      const graderResponse = sendGraderRequest(atd, sessionData) ? true : false;
      const currentExpectation = sessionData.dialogState.expectationData.findIndex(
        e => e.status === ExpectationStatus.Active
      );

      res.send({
        status: 200,
        sessionInfo: dataToDto(sessionData),
        response: msg,
        sentToGrader: graderResponse,
        completed: msg.find(m => m.type === ResponseType.Closing)
          ? true
          : false,
        score: calculateScore(sessionData, atd),
        expectationActive: currentExpectation,
      });
    } catch (err) {
      logger.error(err);
      return next(err);
    }
  }
);

export default router;
