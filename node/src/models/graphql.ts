import axios from 'axios';
import logger from 'utils/logging';

export interface Hint {
  text: string;
}

export interface LessonExpectation {
  expectation: string;
  hints: Hint[];
  prompts?: LessonPrompt[];
}

export interface LessonPrompt {
  prompt: string;
  answer: string;
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

export interface LResponseObject {
  data: {
    lesson: LessonResponse;
  };
}

const GRAPHQL_ENDPOINT = process.env.GRADER_ENDPOINT || '/graphql';

export async function getLessonData(lessonId: string): Promise<Lesson> {
  // const request: GraderRequest = createGraderObject(atd, sdp);
  // logger.debug(
  //   `grader request to ${GRADER_ENDPOINT}: ${JSON.stringify(request)}`
  // );
  // const response = await axios.post(GRADER_ENDPOINT, request);
  //const userSession = encodeURI(JSON.stringify(request));
  try {
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
    // console.log('logging response');
    // console.log(response);
    if (response.data.data.lesson === null) {
      console.log('throwing 404');
      throw {
        response: {
          status: 404,
          message: `graphql cannot find lesson '${lessonId}'`,
        },
      };
    }
    console.log(response.data.data.lesson);
    return response.data.data.lesson;
  } catch (err) {
    console.log('logging error');
    console.log(err);
    const status =
      `${err.response && err.response.status}` === '404' ? 404 : 502;
    const message =
      status === 404 ? `graphql cannot find lesson '${lessonId}'` : err.message;
    throw Object.assign(err, { status, message });
  }
}

export default {
  getLessonData,
};
