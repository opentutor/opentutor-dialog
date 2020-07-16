import axios from 'axios';
import { logger } from 'utils/logging';
import AutoTutorData from './autotutor-data';
import SessionData from './session-data';

export interface GraderRequest {
  sessionId: string;
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
  atd: AutoTutorData,
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
  atd: AutoTutorData,
  sdp: SessionData
): Promise<string> {
  const request: GraderRequest = createGraderObject(atd, sdp);
  logger.debug(
    `grader request to ${GRADER_ENDPOINT}: ${JSON.stringify(request)}`
  );
  // const response = await axios.post(GRADER_ENDPOINT, request);
  const userSession = encodeURI(JSON.stringify(request));
  const response = await axios.post(GRADER_ENDPOINT, {
    query: `mutation {
      updateSession(sessionId: "${request.sessionId}", userSession: "${userSession}") {
          sessionId
        }
      }
    `,
  });

  //   logger.debug(`grader result: ${JSON.stringify(response.data)}`);
  //   const result = response.data;
  //   if (
  //     !result.output.expectationResults &&
  //     (result.output as any).expectation_results
  //   ) {
  //     logger.warn(
  //       `fix the snake case in classifer response!: ${JSON.stringify(result)}`
  //     );
  //     result.output.expectationResults = (result.output as any).expectation_results;
  //   }
  return response.data;
}

export default {
  sendGraderRequest,
};
