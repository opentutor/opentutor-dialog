/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from 'aws-lambda';
import { formatJSONResponse } from '../../libs/api-gw-response';
import { middyfy } from '../../libs/lambda-middleware';
import { getLessonData } from '../../apis/lessons';
import { handlerFor } from '../../dialog/handler';
import {
  addTutorDialog,
  dataToDto,
  newSession,
} from '../../dialog/session-data';
import { SessionStatus, updateSession } from 'apis/graphql';

export const dialogLesson: Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async (event) => {
  console.log(JSON.stringify(event));

  const pathParams = event.pathParameters;
  const lessonId = pathParams['lessonId'];
  if (!lessonId) {
    return formatJSONResponse('Lesson not provided', 400);
  }

  if (!event.body) {
    return formatJSONResponse('body not provided', 400);
  }

  const body =
    typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

  const username = `${body['username'] || ''}`.trim();

  if (!username) {
    return formatJSONResponse('Username not provided', 400);
  }

  const lesson = await getLessonData(lessonId);
  const handler = await handlerFor(lesson);
  const sdp = newSession(lesson, body.sessionId);
  const messages = await handler.beginDialog();
  addTutorDialog(sdp, messages);
  await updateSession(lesson, sdp, username, SessionStatus.LAUNCHED);
  return formatJSONResponse(
    {
      lessonId: lessonId,
      sessionInfo: dataToDto(sdp),
      response: messages,
    },
    200
  );
};

export const main = middyfy(dialogLesson);
