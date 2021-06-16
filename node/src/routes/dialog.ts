/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import express, { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import { beginDialog, calculateScore, processUserResponse } from 'dialog';
import OpenTutorData, { convertLessonDataToATData } from 'dialog/dialog-data';
import 'dialog/response-data';
import {
  addTutorDialog,
  addUserDialog,
  dtoToData,
  dataToDto,
  hasHistoryBeenTampered,
  newSession,
  SessionData,
  ExpectationStatus,
  SessionDto,
} from 'dialog/session-data';
import { updateSession } from 'apis/graphql';
import Joi from '@hapi/joi';
import logger from 'utils/logging';
import { getLessonData } from 'apis/lessons';
import { ResponseType } from 'dialog/response-data';
import { handlerFor } from 'dialog/handler';

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
      const lessonId = req.params['lessonId'];
      if (!lessonId) {
        return next(createError(400, 'Lesson not provided'));
      }
      const result = dialogSchema.validate(req.body);
      const { value: body, error } = result;
      if (Boolean(error)) {
        return next(createError(400, error));
      }
      const lesson = await getLessonData(lessonId);
      const handler = await handlerFor(lesson);
      const sdp = newSession(lesson, body.sessionId);
      const messages = await handler.beginDialog();
      // const atd: OpenTutorData = convertLessonDataToATData();
      //new sessionDataPacket
      addTutorDialog(sdp, messages);
      res.send({
        status: 200,
        lessonId: lessonId,
        sessionInfo: dataToDto(sdp),
        response: messages,
      });
    } catch (err) {
      console.error(err);
      logger.error(err);
      return next(err);
    }
  }
);

router.post(
  '/:lessonId/session',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lessonId = req.params['lessonId'];
      const message = `${req.body['message'] || ''}`.trim();
      const username = `${req.body['username'] || ''}`.trim();
      const sessionDto = req.body['sessionInfo'] as SessionDto;
      if (!lessonId) {
        return next(createError(400, 'Lesson not provided'));
      }
      if (!message) {
        return next(createError(400, 'Message not provided'));
      }
      if (!username) {
        return next(createError(400, 'Username not provided'));
      }
      let sessionData: SessionData;
      try {
        sessionData = dtoToData(sessionDto);
      } catch (err) {
        return next(createError(400, 'Session data invalid'));
      }
      if (hasHistoryBeenTampered(sessionData.sessionHistory, sessionDto.hash)) {
        return res.status(403).send();
      }
      //if last system message was a closing, send error
      if (
        sessionData.dialogState.expectationsCompleted.every((v) => v == true)
      ) {
        return res.status(410).send();
      }
      const lesson = await getLessonData(lessonId);
      if (!lesson) return res.status(404).send();
      const handler = await handlerFor(lesson);
      // const atd: OpenTutorData = convertLessonDataToATData();
      // if (!atd) return res.status(404).send();
      addUserDialog(sessionData, message);
      const msg = await handler.process(sessionData);
      // const msg = await processUserResponse(lessonId, atd, sessionData);
      addTutorDialog(sessionData, msg);
      const graphQLResponse = updateSession(lesson, sessionData, username)
        ? true
        : false;
      const currentExpectation = sessionData.dialogState.expectationData.findIndex(
        (e) => e.status === ExpectationStatus.Active
      );

      res.send({
        status: 200,
        sessionInfo: dataToDto(sessionData),
        response: msg,
        sentToGrader: graphQLResponse,
        completed: msg.find((m) => m.type === ResponseType.Closing)
          ? true
          : false,
        score: calculateScore(sessionData),
        expectationActive: currentExpectation,
      });
    } catch (err) {
      logger.error(err);
      return next(err);
    }
  }
);

export default router;
