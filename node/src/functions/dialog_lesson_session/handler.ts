/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import Joi from '@hapi/joi';
import { formatJSONResponse } from "../../libs/api-gw-response";
import { middyfy } from "../../libs/lambda-middleware";
import { getLessonData } from "../../apis/lessons";
import { handlerFor } from "../../dialog/handler";
import SessionData, { ExpectationStatus, SessionDto, addTutorDialog, addUserDialog, dataToDto, dtoToData, hasHistoryBeenTampered, newSession } from "../../dialog/session-data";
import { updateSession } from "../../apis/graphql";
import { ResponseType } from "../../dialog/response-data";
import { calculateScore } from "../../dialog";


export const dialogLesson: Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async (event) => {
  const body =
    typeof event.body === "string" ? JSON.parse(event.body) : event.body;

  const lessonId = event.pathParameters['lessonId'];
  const message = `${body['message'] || ''}`.trim();
  const username = `${body['username'] || ''}`.trim();
  const sessionDto = body['sessionInfo'] as SessionDto;
  if (!lessonId) {
    return formatJSONResponse("Lesson not provided", 400)
  }
  if (!message) {
    return formatJSONResponse("Message not provided", 400)

  }
  if (!username) {
    return formatJSONResponse("Username not provided", 400)

  }
  let sessionData: SessionData;
  try {
    sessionData = dtoToData(sessionDto);
  } catch (err) {
    return formatJSONResponse("Session data invalid", 400)
  }
  if (hasHistoryBeenTampered(sessionData.sessionHistory, sessionDto.hash)) {
    return formatJSONResponse("", 403)
  }
  //if last system message was a closing, send error
  if (
    sessionData.dialogState.expectationsCompleted.every((v) => v == true)
  ) {
    return formatJSONResponse("", 410)

  }
  const lesson = await getLessonData(lessonId);
  if (!lesson) {
    return formatJSONResponse(`No lesson found for id ${lessonId}`, 404)
  }
  const handler = await handlerFor(lesson);
  addUserDialog(sessionData, message);
  const msg = await handler.process(sessionData);
  addTutorDialog(sessionData, msg);
  const graphQLResponse = updateSession(lesson, sessionData, username)
    ? true
    : false;
  const currentExpectation =
    sessionData.dialogState.expectationData.findIndex(
      (e) => e.status === ExpectationStatus.Active
    );

  return formatJSONResponse({    sessionInfo: dataToDto(sessionData),
    response: msg,
    sentToGrader: graphQLResponse,
    completed: msg.find((m) => m.type === ResponseType.Closing)
      ? true
      : false,
    score: calculateScore(sessionData),
    expectationActive: currentExpectation,},200)
};

export const main = middyfy(dialogLesson);
