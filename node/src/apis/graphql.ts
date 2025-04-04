/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import axios from 'axios';
import { logger } from 'utils/logging';
import SessionData from 'dialog/session-data';
import { Lesson } from './lessons';
import { getBypassHeaders } from 'utils/helpers';

export interface GraphQLRequest {
  sessionId: string;
  lessonId: string;
  username: string;
  question: Question;
  userResponses: Response[];
  sessionStatus: SessionStatus;
}

export enum SessionStatus {
  LAUNCHED = 'LAUNCHED',
  STARTED = 'STARTED',
  COMPLETED = 'COMPLETED',
}

export interface Response {
  text: string;
  expectationScores: ExpectationScore[];
}

interface ExpectationScore {
  expectationId: string;
  classifierGrade: string;
  graderGrade: string;
}

interface ExpectationScores {
  expectationScore: ExpectationScore[];
}

export interface Question {
  text: string;
  expectations: Expectation[];
}

interface Expectation {
  text: string;
}

const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || '/graphql';

function toGqlRequest(
  lesson: Lesson,
  sdp: SessionData,
  username: string,
  sessionStatus: SessionStatus
): GraphQLRequest {
  const expectationScores: ExpectationScores[] =
    sdp.sessionHistory.classifierGrades.map((r) => {
      return {
        expectationScore: r.expectationResults.map((e) => {
          return {
            expectationId: e.expectationId,
            classifierGrade: e.evaluation.toString(),
            graderGrade: '',
          };
        }),
      };
    });

  const userResponses: Response[] = sdp.sessionHistory.userResponses.map(
    (r, index) => {
      return {
        text: r.text,
        expectationScores: expectationScores[index].expectationScore,
      };
    }
  );

  return {
    sessionId: sdp.sessionId,
    username: username,
    lessonId: lesson.lessonId,
    question: {
      text: lesson.question,
      expectations: lesson.expectations.map((e) => {
        return {
          expectationId: e.expectationId,
          text: e.expectation,
        } as Expectation;
      }),
    },
    sessionStatus: sessionStatus,
    userResponses: userResponses,
  };
}
export async function updateSession(
  lesson: Lesson,
  sdp: SessionData,
  username: string,
  sessionStatus: SessionStatus
): Promise<string> {
  const request: GraphQLRequest = toGqlRequest(
    lesson,
    sdp,
    username,
    sessionStatus
  );
  logger.debug(
    `graphql request to ${GRAPHQL_ENDPOINT}: ${JSON.stringify(request)}`
  );
  const session = encodeURI(JSON.stringify(request));
  const headers = getBypassHeaders();
  const response = await axios.post(
    GRAPHQL_ENDPOINT,
    {
      query: `mutation {
        me {
          updateSession(sessionId: "${request.sessionId}", session: "${session}") {
            sessionId
          }  
        }
      }
    `,
    },
    { headers: headers }
  );
  return response.data;
}

export default {
  updateSession,
};
