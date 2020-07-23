import axios from 'axios';
import logger from 'utils/logging';

export interface Hint {
  text: string;
}

export interface LessonExpectation {
  expectation: string;
  hints: Hint[];
}

export interface Lesson {
  lessonName: string;
  lessonId: string;
  intro: string;
  question: string;
  expectations: LessonExpectation[];
  conclusion: string[] | string;
  createdAt: string;
  updatedAt: string;
}

export interface LessonWrapper {
  lesson: Lesson;
}

export interface LessonResponse {
  data: LessonWrapper;
}

const GRAPHQL_ENDPOINT = process.env.GRADER_ENDPOINT || '/graphql';

export async function getLessonData(lessonId: string): Promise<Lesson> {
  // const request: GraderRequest = createGraderObject(atd, sdp);
  // logger.debug(
  //   `grader request to ${GRADER_ENDPOINT}: ${JSON.stringify(request)}`
  // );
  // const response = await axios.post(GRADER_ENDPOINT, request);
  //const userSession = encodeURI(JSON.stringify(request));
  const response = await axios.post(GRAPHQL_ENDPOINT, {
    query: `{
        lesson(lessonId: "${lessonId}") {
          id
          lessonId
          intro
          question
          conclusion
          expectations {
            expectation
            hints {
              text
            }
          }
          createdAt
          updatedAt
        }
      }
      `,
  });
  // logger.info(JSON.stringify(response.data.data.lesson));
  return response.data.data.lesson;
}

export default {
  getLessonData,
};
