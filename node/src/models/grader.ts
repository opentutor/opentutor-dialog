/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import axios from 'axios';
import { logger } from 'utils/logging';
import OpenTutorData from './opentutor-data';
import SessionData from './session-data';

export interface GraderRequest {
  sessionId: string;
  lessonId: string;
  username: string;
  question: Question;
  userResponses: Response[];
}

export interface Response {
  text: string;
  expectationScores: ExpectationScore[];
}

interface ExpectationScore {
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

const GRADER_ENDPOINT = process.env.GRADER_ENDPOINT || '/grading-api';

export function createGraderObject(
  atd: OpenTutorData,
  sdp: SessionData
): GraderRequest {
  const expectationScores: ExpectationScores[] = sdp.sessionHistory.classifierGrades.map(
    r => {
      return {
        expectationScore: r.expectationResults.map(e => {
          return {
            classifierGrade: e.evaluation.toString(),
            graderGrade: '',
          };
        }),
      };
    }
  );

  const userResponses: Response[] = sdp.sessionHistory.userResponses.map(
    (r, index) => {
      return {
        text: r,
        expectationScores: expectationScores[index].expectationScore,
      };
    }
  );

  return {
    sessionId: sdp.sessionId,
    username: '',
    lessonId: atd.lessonId,
    question: {
      text: atd.questionText,
      expectations: atd.expectations.map(e => {
        return { text: e.expectation } as Expectation;
      }),
    },
    userResponses: userResponses,
  };
}
export async function sendGraderRequest(
  atd: OpenTutorData,
  sdp: SessionData
): Promise<string> {
  const request: GraderRequest = createGraderObject(atd, sdp);
  logger.debug(
    `grader request to ${GRADER_ENDPOINT}: ${JSON.stringify(request)}`
  );
  const userSession = encodeURI(JSON.stringify(request));
  const response = await axios.post(GRADER_ENDPOINT, {
    query: `mutation {
      updateSession(sessionId: "${request.sessionId}", userSession: "${userSession}") {
          sessionId
        }
      }
    `,
  });
  return response.data;
}

export default {
  sendGraderRequest,
};
