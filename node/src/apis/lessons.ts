/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
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
  createdBy: string;
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
          createdBy
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
