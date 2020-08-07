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
    if (!response.data.data.lesson) {
      throw {
        response: {
          status: 404,
          message: `graphql cannot find lesson '${lessonId}'`,
        },
      };
    }
    return response.data.data.lesson;
  } catch (err) {
    logger.error(err);
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
