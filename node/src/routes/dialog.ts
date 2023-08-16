/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import express, { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import { calculateScore } from 'dialog';
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
import { SessionStatus, updateSession } from 'apis/graphql';
import logger from 'utils/logging';
import { getLessonData } from 'apis/lessons';
import { ResponseType } from 'dialog/response-data';
import { handlerFor } from 'dialog/handler';

const router = express.Router({ mergeParams: true });

router.get('/ping', (req: Request, res: Response) => {
  res.send({ status: 'ok' });
});

router.post(
  '/:lessonId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lessonId = req.params['lessonId'];
      const sessionId = `${req.body['sessionId'] || ''}`.trim();
      const username = `${req.body['username'] || ''}`.trim();
      if (!lessonId) {
        return next(createError(400, 'Lesson not provided'));
      }
      if (!username) {
        return next(createError(400, 'username not provided'));
      }
      const lesson = await getLessonData(lessonId);
      const handler = await handlerFor(lesson);
      const sdp = newSession(lesson, sessionId);
      const messages = await handler.beginDialog();
      addTutorDialog(sdp, messages);
      updateSession(lesson, sdp, username, SessionStatus.LAUNCHED);
      res.send({
        status: 200,
        lessonId: lessonId,
        sessionInfo: dataToDto(sdp),
        response: messages,
      });
    } catch (err) {
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
      addUserDialog(sessionData, message);
      const msg = await handler.process(sessionData);
      addTutorDialog(sessionData, msg);

      const completed = msg.find((m) => m.type === ResponseType.Closing)
        ? true
        : false;

      const sessionStatus: SessionStatus = completed
        ? SessionStatus.COMPLETED
        : SessionStatus.LAUNCHED;

      const graphQLResponse = updateSession(
        lesson,
        sessionData,
        username,
        sessionStatus
      )
        ? true
        : false;
      const currentExpectation =
        sessionData.dialogState.expectationData.findIndex(
          (e) => e.status === ExpectationStatus.Active
        );

      res.send({
        status: 200,
        sessionInfo: dataToDto(sessionData),
        response: msg,
        sentToGrader: graphQLResponse,
        completed: completed,
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
