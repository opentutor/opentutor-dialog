/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import createApp from 'app';
import { AxiosRequestConfig } from 'axios';
import MockAxios from 'axios-mock-adapter';
import { expect } from 'chai';
import { Express } from 'express';
import {
  dataToDto,
  SessionData,
  ExpectationStatus,
  UserResponse,
} from 'dialog/session-data';
import OpenTutorResponse from 'dialog/response-data';
import { ResponseType, TextData } from 'dialog/response-data';
import { ClassifierResult, Evaluation } from 'apis/classifier';
import { LResponseObject, Lesson } from 'apis/lessons';
import { findAll as findAllScenarios } from 'test/fixtures/scenarios';
import { findAll as findAllLessons } from 'test/fixtures/lessons';
import { DialogScenario } from 'test/fixtures/types';
import { postSession, MOCKING_DISABLED, MOCK_AXIOS } from './helpers';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import { randomFunctionSet, randomFunctionRestore } from 'dialog/random';
import * as standardSpeechCans from 'dialog/handler/standard/config';

import answerWrongNoHintsLeft from './fixtures/sessionData/answerWrongNoHIntsLeft';
import surveySaysStyle from './fixtures/sessionData/surveySaysStyleLesson';
import {
  expectationResult13,
  expectationResult14,
  expectationResult2,
  expectationResult4,
  expectationResult9,
} from './fixtures/expectationResults/expectationResults';

const sandbox = sinon.createSandbox();

describe('dialog', async () => {
  let app: Express;
  let mockAxios: MockAxios;
  let mockNextRandom: sinon.SinonStub<number[]>;
  let allScenarios: DialogScenario[] = await findAllScenarios();
  const allLessons: Lesson[] = await findAllLessons();

  const lessonById: Record<string, Lesson> = {};
  allLessons.forEach((lesson) => {
    lessonById[lesson.lessonId] = lesson;
  });

  beforeEach(async () => {
    if (!MOCKING_DISABLED) {
      app = await createApp();
      mockAxios = MOCK_AXIOS;
    }
    mockNextRandom = sandbox.stub().returns(0);
    randomFunctionSet(mockNextRandom);
  });

  afterEach(() => {
    mockAxios.reset();
    // NO version of sinon sandboxing seems to work without error, so hacked below
    // if (mockNextRandom) {
    //   (SCOPED_RANDOM.nextRandom as any).restore();
    //   mockNextRandom.restore();
    // }
    randomFunctionRestore();
  });

  function findLessonForGqlQuery(query: string): Lesson {
    let lessonId = query.includes('q1')
      ? 'q1'
      : query.includes('q2')
      ? 'q2'
      : query.includes('q3')
      ? 'q3'
      : query.includes('q4')
      ? 'q4'
      : query.includes('q5')
      ? 'q5'
      : query.includes('q6')
      ? 'q6'
      : query.includes('q7')
      ? 'q7'
      : 'ok fix this properly with a regex already';
    return lessonById[lessonId];
  }

  describe('Survey Says Style Lesson', () => {
    const lessonIdq7 = 'q7';

    const validSessionDto = dataToDto(surveySaysStyle);

    it('responds with a random apologetic negative feedback message for survey says style lesson', async () => {
      mockAxios.reset();
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q7')) {
          return [200, { data: { me: { lesson: lessonById.q7 } } }];
        } else {
          const errData: LResponseObject = {
            data: {
              me: {
                lesson: null,
              },
            },
          };
          return [404, errData];
        }
      });
      mockAxios.onPost('/classifier').reply((config: AxiosRequestConfig) => {
        return [200, expectationResult9];
      });
      const response = await postSession(lessonIdq7, app, {
        message: 'bad answer',
        username: 'testuser',
        sessionInfo: validSessionDto,
        lessonId: lessonIdq7,
      });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('response');
      expect(
        (response.body.response as OpenTutorResponse[])
          .filter((m) => m.type == ResponseType.FeedbackNegative)
          .map((m) => (m.data as TextData).text)[0]
      ).to.be.oneOf(standardSpeechCans.SURVEY_STYLE_NEGATIVE_FEEDBACK);
    });

    it('responds with a random message indicating there answer was not fully correct when other expectations got poor score.', async () => {
      mockAxios.reset();
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q7')) {
          return [200, { data: { me: { lesson: lessonById.q7 } } }];
        } else {
          const errData: LResponseObject = {
            data: {
              me: {
                lesson: null,
              },
            },
          };
          return [404, errData];
        }
      });
      mockAxios.onPost('/classifier').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        return [
          200,
          {
            output: {
              expectationResults: [
                { evaluation: Evaluation.Good, score: 1.0 },
                { evaluation: Evaluation.Bad, score: 1.0 },
                { evaluation: Evaluation.Bad, score: 1.0 },
              ],
              speechActs: {
                metacognitive: { evaluation: Evaluation.Good, score: 0.5 },
                profanity: { evaluation: Evaluation.Good, score: 0.5 },
              },
            },
          },
        ];
      });
      const response = await postSession(lessonIdq7, app, {
        message: 'peer pressure',
        username: 'testuser',
        sessionInfo: validSessionDto,
        lessonId: lessonIdq7,
      });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('response');
      expect(
        (response.body.response as OpenTutorResponse[])
          .filter((m) => m.type == ResponseType.FeedbackNeutral)
          .map((m) => (m.data as TextData).text)[0]
      ).to.be.oneOf(standardSpeechCans.SOME_WRONG_FEEDBACK);
    });

    it('responds with a random apologetic neutral feedback message for survey says style lesson', async () => {
      mockAxios.reset();
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q7')) {
          return [200, { data: { me: { lesson: lessonById.q7 } } }];
        } else {
          const errData: LResponseObject = {
            data: {
              me: {
                lesson: null,
              },
            },
          };
          return [404, errData];
        }
      });
      mockAxios.onPost('/classifier').reply((config: AxiosRequestConfig) => {
        return [200, expectationResult13];
      });
      const response = await postSession(lessonIdq7, app, {
        message: 'bad answer',
        username: 'testuser',
        sessionInfo: validSessionDto,
        lessonId: lessonIdq7,
      });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('response');
      expect(
        (response.body.response as OpenTutorResponse[])
          .filter((m) => m.type == ResponseType.FeedbackNeutral)
          .map((m) => (m.data as TextData).text)[0]
      ).to.be.oneOf(standardSpeechCans.SURVEY_STYLE_NEGATIVE_FEEDBACK);
    });

    it('responds with a random positive feedback message that indicates there are expectations left for survey says style lesson and does not give redundant transition messages', async () => {
      mockAxios.reset();
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q7')) {
          return [200, { data: { me: { lesson: lessonById.q7 } } }];
        } else {
          const errData: LResponseObject = {
            data: {
              me: {
                lesson: null,
              },
            },
          };
          return [404, errData];
        }
      });
      mockAxios.onPost('/classifier').reply((config: AxiosRequestConfig) => {
        return [200, expectationResult4];
      });
      const response = await postSession(lessonIdq7, app, {
        message: 'good answer',
        username: 'testuser',
        sessionInfo: validSessionDto,
        lessonId: lessonIdq7,
      });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('response');
      let feedback = (response.body.response as OpenTutorResponse[])
        .filter((m) => m.type == ResponseType.FeedbackPositive)
        .map((m) => (m.data as TextData).text)[0]
        .split(/([!,?,.]) /);
      expect(feedback[0].concat(feedback[1])).to.be.oneOf([
        'Great.',
        'Good.',
        'Right.',
        "Yeah, that's right.",
        'Excellent.',
        'Correct.',
      ]);
      expect(feedback[2]).to.be.oneOf(
        standardSpeechCans.FEEDBACK_EXPECTATIONS_LEFT
      );
      expect(
        (response.body.response as OpenTutorResponse[])
          .filter((m) => m.type == ResponseType.Text)
          .map((m) => (m.data as TextData).text)
      ).to.be.empty;
    });

    it('responds with a random highly positive feedback message for perfect answer in survey style lesson', async () => {
      mockAxios.reset();
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q7')) {
          return [200, { data: { me: { lesson: lessonById.q7 } } }];
        } else {
          const errData: LResponseObject = {
            data: {
              me: {
                lesson: null,
              },
            },
          };
          return [404, errData];
        }
      });
      mockAxios.onPost('/classifier').reply((config: AxiosRequestConfig) => {
        return [200, expectationResult2];
      });
      const response = await postSession(lessonIdq7, app, {
        message: 'perfect answer',
        username: 'testuser',
        sessionInfo: validSessionDto,
        lessonId: lessonIdq7,
      });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('response');
      expect(
        (response.body.response as OpenTutorResponse[])
          .filter((m) => m.type == ResponseType.FeedbackPositive)
          .map((m) => (m.data as TextData).text)[0]
      ).to.be.oneOf(standardSpeechCans.PERFECT_FEEDBACK_SURVEY_STYLE);
    });

    it('does not give redundant transition messages when giving feedback for confusion with a hint', async () => {
      mockNextRandom = sandbox.stub().returns(0.7);
      randomFunctionSet(mockNextRandom);
      mockAxios.reset();
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q7')) {
          return [200, { data: { me: { lesson: lessonById.q7 } } }];
        } else {
          const errData: LResponseObject = {
            data: {
              me: {
                lesson: null,
              },
            },
          };
          return [404, errData];
        }
      });
      mockAxios.onPost('/classifier').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        return [
          200,
          {
            output: {
              expectationResults: [
                { evaluation: Evaluation.Good, score: 0.4 },
                { evaluation: Evaluation.Good, score: 0.4 },
                { evaluation: Evaluation.Good, score: 0.4 },
              ],
              speechActs: {
                metacognitive: { evaluation: Evaluation.Good, score: 1.0 },
                profanity: { evaluation: Evaluation.Good, score: 0.5 },
              },
            },
          },
        ];
      });
      const response = await postSession(lessonIdq7, app, {
        message: 'Answer that is not good and is metacognitive.',
        username: 'testuser',
        sessionInfo: validSessionDto,
        lessonId: lessonIdq7,
      });
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('response');
      expect(
        (response.body.response as OpenTutorResponse[])
          .filter((m) => m.type == ResponseType.Encouragement)
          .map((m) => (m.data as TextData).text)[0]
      ).to.be.oneOf([
        "That's okay. Let's focus on one part of the problem.",
        "Don't worry if you aren't sure. We'll work on one piece at a time.",
        "That's an okay place to start. Let's try this part together.",
      ]);
      expect(
        (response.body.response as OpenTutorResponse[])
          .filter((m) => m.type == ResponseType.Text)
          .map((m) => (m.data as TextData).text)
      ).to.be.empty;
    });

    const updatedValidSessionData: SessionData = {
      dialogState: {
        expectationsCompleted: [false, false, false],
        currentExpectation: 0,
        expectationData: [
          {
            ideal: '',
            score: 0,
            numHints: 1,
            numPrompts: 1,
            satisfied: false,
            status: ExpectationStatus.Active,
          },
          {
            ideal: '',
            score: 0,
            numHints: 0,
            numPrompts: 0,
            satisfied: false,
            status: ExpectationStatus.None,
          },
          {
            ideal: '',
            score: 0,
            numHints: 0,
            numPrompts: 0,
            satisfied: false,
            status: ExpectationStatus.None,
          },
        ],
        hints: true,
        limitHintsMode: false,
        numCorrectStreak: 0,
      },
      sessionHistory: {
        classifierGrades: [
          {
            expectationResults: [
              { expectationId: '0', evaluation: Evaluation.Bad, score: 1.0 },
              { expectationId: '1', evaluation: Evaluation.Good, score: 0.4 },
              { expectationId: '2', evaluation: Evaluation.Good, score: 0.4 },
            ],
            speechActs: {
              metacognitive: {
                expectationId: '',
                evaluation: Evaluation.Good,
                score: 0.5,
              },
              profanity: {
                expectationId: '',
                evaluation: Evaluation.Good,
                score: 0.5,
              },
            },
          },
        ],
        systemResponses: [
          [
            'Here is a question about integrity, a key Navy attribute. What are the challenges to demonstrating integrity in a group?',
          ],
          [
            'Ok.',
            'Why might you allow bad behavior in a group that you normally would not allow yourself to do?',
          ],
        ],
        userResponses: [
          { text: 'This answer was wrong', activeExpectation: 0 },
        ],
        userScores: new Array<number>(),
      },
      sessionId: 'a677e7a8-b09e-4b3b-825d-5073422d42fd',
      previousUserResponse: 'This answer was wrong',
      previousSystemResponse: [
        'Ok',
        'Why might you allow bad behavior in a group that you normally would not allow yourself to do?',
      ],
    };

    const updatedValidSessionDto = dataToDto(updatedValidSessionData);

    it('gives away the expectation when the answer was wrong and no more hints are left', async () => {
      const updatedValidSessionDto = dataToDto(answerWrongNoHintsLeft);
      mockAxios.reset();
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q7')) {
          return [200, { data: { me: { lesson: lessonById.q7 } } }];
        } else {
          const errData: LResponseObject = {
            data: {
              me: {
                lesson: null,
              },
            },
          };
          return [404, errData];
        }
      });
      mockAxios.onPost('/classifier').reply((config: AxiosRequestConfig) => {
        return [200, expectationResult14];
      });
      const response = await postSession(lessonIdq7, app, {
        message: 'bad answer',
        username: 'testuser',
        sessionInfo: updatedValidSessionDto,
        lessonId: lessonIdq7,
      });
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('response');
      expect(
        (response.body.response as OpenTutorResponse[])
          .filter((m) => m.type == ResponseType.Text)
          .map((m) => (m.data as TextData).text)
      ).to.include.oneOf([
        "We'll give you this one on the board.",
        "Okay, we'll put this one on the board.",
        'The answer for this one is on the board',
      ]);
    });

    it('does not give redundant transition messages when giving feedback for hint where another expectation was satisfied instead of current', async () => {
      mockAxios.reset();
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q7')) {
          return [200, { data: { me: { lesson: lessonById.q7 } } }];
        } else {
          const errData: LResponseObject = {
            data: {
              me: {
                lesson: null,
              },
            },
          };
          return [404, errData];
        }
      });
      mockAxios.onPost('/classifier').reply((config: AxiosRequestConfig) => {
        return [200, expectationResult14];
      });
      const response = await postSession(lessonIdq7, app, {
        message: 'bad answer',
        username: 'testuser',
        sessionInfo: updatedValidSessionDto,
        lessonId: lessonIdq7,
      });
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('response');
      expect(
        (response.body.response as OpenTutorResponse[])
          .filter((m) => m.type == ResponseType.Text)
          .map((m) => (m.data as TextData).text)
      ).to.include.oneOf(standardSpeechCans.PROMPT_START);
    });
  });

  describe('Survey Says Style Lesson', () => {
    const lessonIdq7 = 'q7';

    const validSessionData: SessionData = {
      dialogState: {
        expectationsCompleted: [false, false, false],
        currentExpectation: -1,
        expectationData: [
          {
            ideal: '',
            score: 0,
            numHints: 0,
            numPrompts: 0,
            satisfied: false,
            status: ExpectationStatus.None,
          },
          {
            ideal: '',
            score: 0,
            numHints: 0,
            numPrompts: 0,
            satisfied: false,
            status: ExpectationStatus.None,
          },
          {
            ideal: '',
            score: 0,
            numHints: 0,
            numPrompts: 0,
            satisfied: false,
            status: ExpectationStatus.None,
          },
        ],
        hints: false,
        limitHintsMode: false,
        numCorrectStreak: 0,
      },
      sessionHistory: {
        classifierGrades: new Array<ClassifierResult>(),
        systemResponses: [
          [
            'Here is a question about integrity, a key Navy attribute. What are the challenges to demonstrating integrity in a group?',
          ],
        ],
        userResponses: new Array<UserResponse>(),
        userScores: new Array<number>(),
      },
      sessionId: 'a677e7a8-b09e-4b3b-825d-5073422d42fd',
      previousUserResponse: '',
      previousSystemResponse: [
        'Here is a question about integrity, a key Navy attribute. What are the challenges to demonstrating integrity in a group?',
      ],
    };

    const validSessionDto = dataToDto(validSessionData);

    it('responds with a random apologetic negative feedback message for survey says style lesson', async () => {
      mockAxios.reset();
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q7')) {
          return [200, { data: { me: { lesson: lessonById.q7 } } }];
        } else {
          const errData: LResponseObject = {
            data: {
              me: {
                lesson: null,
              },
            },
          };
          return [404, errData];
        }
      });
      mockAxios.onPost('/classifier').reply((config: AxiosRequestConfig) => {
        return [
          200,
          {
            output: {
              expectationResults: [
                { evaluation: Evaluation.Bad, score: 1.0 },
                { evaluation: Evaluation.Good, score: 0.4 },
                { evaluation: Evaluation.Good, score: 0.4 },
              ],
              speechActs: {
                metacognitive: { evaluation: Evaluation.Good, score: 0.5 },
                profanity: { evaluation: Evaluation.Good, score: 0.5 },
              },
            },
          },
        ];
      });
      const response = await postSession(lessonIdq7, app, {
        message: 'bad answer',
        username: 'testuser',
        sessionInfo: validSessionDto,
        lessonId: lessonIdq7,
      });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('response');
      expect(
        (response.body.response as OpenTutorResponse[])
          .filter((m) => m.type == ResponseType.FeedbackNegative)
          .map((m) => (m.data as TextData).text)[0]
      ).to.be.oneOf([
        "Sorry, it looks like that wasn't on the board.",
        "Sorry, we didn't match that in the list.",
        "I'm sorry, that wasn't one of the answers on the board.",
        "I'm sorry, we didn't find that answer in our list.",
      ]);
    });

    it('responds with a random apologetic neutral feedback message for survey says style lesson', async () => {
      mockAxios.reset();
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q7')) {
          return [200, { data: { me: { lesson: lessonById.q7 } } }];
        } else {
          const errData: LResponseObject = {
            data: {
              me: {
                lesson: null,
              },
            },
          };
          return [404, errData];
        }
      });
      mockAxios.onPost('/classifier').reply((config: AxiosRequestConfig) => {
        return [
          200,
          {
            output: {
              expectationResults: [
                { evaluation: Evaluation.Bad, score: 0.5 },
                { evaluation: Evaluation.Good, score: 0.5 },
                { evaluation: Evaluation.Good, score: 0.5 },
              ],
              speechActs: {
                metacognitive: { evaluation: Evaluation.Good, score: 0.5 },
                profanity: { evaluation: Evaluation.Good, score: 0.5 },
              },
            },
          },
        ];
      });
      const response = await postSession(lessonIdq7, app, {
        message: 'bad answer',
        username: 'testuser',
        sessionInfo: validSessionDto,
        lessonId: lessonIdq7,
      });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('response');
      expect(
        (response.body.response as OpenTutorResponse[])
          .filter((m) => m.type == ResponseType.FeedbackNeutral)
          .map((m) => (m.data as TextData).text)[0]
      ).to.be.oneOf([
        "Sorry, it looks like that wasn't on the board.",
        "Sorry, we didn't match that in the list.",
        "I'm sorry, that wasn't one of the answers on the board.",
        "I'm sorry, we didn't find that answer in our list.",
      ]);
    });

    it('responds with a random positive feedback message that indicates there are expectations left for survey says style lesson and does not give redundant transition messages', async () => {
      mockAxios.reset();
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q7')) {
          return [200, { data: { me: { lesson: lessonById.q7 } } }];
        } else {
          const errData: LResponseObject = {
            data: {
              me: {
                lesson: null,
              },
            },
          };
          return [404, errData];
        }
      });
      mockAxios.onPost('/classifier').reply((config: AxiosRequestConfig) => {
        return [
          200,
          {
            output: {
              expectationResults: [
                { evaluation: Evaluation.Good, score: 1.0 },
                { evaluation: Evaluation.Good, score: 0.4 },
                { evaluation: Evaluation.Good, score: 0.4 },
              ],
              speechActs: {
                metacognitive: { evaluation: Evaluation.Good, score: 0.5 },
                profanity: { evaluation: Evaluation.Good, score: 0.5 },
              },
            },
          },
        ];
      });
      const response = await postSession(lessonIdq7, app, {
        message: 'good answer',
        username: 'testuser',
        sessionInfo: validSessionDto,
        lessonId: lessonIdq7,
      });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('response');
      let feedback = (response.body.response as OpenTutorResponse[])
        .filter((m) => m.type == ResponseType.FeedbackPositive)
        .map((m) => (m.data as TextData).text)[0]
        .split(/([!,?,.]) /);
      expect(feedback[0].concat(feedback[1])).to.be.oneOf([
        'Great.',
        'Good.',
        'Right.',
        "Yeah, that's right.",
        'Excellent.',
        'Correct.',
      ]);
      expect(feedback[2]).to.be.oneOf([
        "But there's more.",
        "Now what's another answer?",
        `Now let's move on to another answer...`,
        'But there are more answers left.',
        'But there are still more answers.',
      ]);
      expect(
        (response.body.response as OpenTutorResponse[])
          .filter((m) => m.type == ResponseType.Text)
          .map((m) => (m.data as TextData).text)
      ).to.be.empty;
    });

    it('responds with a random highly positive feedback message for perfect answer in survey style lesson', async () => {
      mockAxios.reset();
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q7')) {
          return [200, { data: { me: { lesson: lessonById.q7 } } }];
        } else {
          const errData: LResponseObject = {
            data: {
              me: {
                lesson: null,
              },
            },
          };
          return [404, errData];
        }
      });
      mockAxios.onPost('/classifier').reply((config: AxiosRequestConfig) => {
        return [
          200,
          {
            output: {
              expectationResults: [
                { evaluation: Evaluation.Good, score: 1.0 },
                { evaluation: Evaluation.Good, score: 1.0 },
                { evaluation: Evaluation.Good, score: 1.0 },
              ],
              speechActs: {
                metacognitive: { evaluation: Evaluation.Good, score: 0.5 },
                profanity: { evaluation: Evaluation.Good, score: 0.5 },
              },
            },
          },
        ];
      });
      const response = await postSession(lessonIdq7, app, {
        message: 'perfect answer',
        username: 'testuser',
        sessionInfo: validSessionDto,
        lessonId: lessonIdq7,
      });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('response');
      expect(
        (response.body.response as OpenTutorResponse[])
          .filter((m) => m.type == ResponseType.FeedbackPositive)
          .map((m) => (m.data as TextData).text)[0]
      ).to.be.oneOf([
        "Amazing! You got them all. Maybe you're the expert around here.",
        'Wow! You got them all, that was perfect.',
        "Great job! You really knew theses answers, you're a pro!",
      ]);
    });

    it('gives overall positive feedback when score was good (but not perfect)', async () => {
      const updatedValidSessionData: SessionData = {
        dialogState: {
          expectationsCompleted: [true, true, false],
          currentExpectation: 2,
          expectationData: [
            {
              ideal: '',
              score: 0,
              numHints: 1,
              numPrompts: 1,
              satisfied: true,
              status: ExpectationStatus.Complete,
            },
            {
              ideal: '',
              score: 0,
              numHints: 1,
              numPrompts: 0,
              satisfied: true,
              status: ExpectationStatus.Complete,
            },
            {
              ideal: '',
              score: 0,
              numHints: 1,
              numPrompts: 0,
              satisfied: false,
              status: ExpectationStatus.Active,
            },
          ],
          hints: true,
          limitHintsMode: false,
          numCorrectStreak: 1,
        },
        sessionHistory: {
          classifierGrades: [
            {
              expectationResults: [
                { expectationId: '0', evaluation: Evaluation.Good, score: 0.4 },
                { expectationId: '1', evaluation: Evaluation.Good, score: 0.4 },
                { expectationId: '2', evaluation: Evaluation.Good, score: 0.8 },
              ],
              speechActs: {
                metacognitive: {
                  expectationId: '',
                  evaluation: Evaluation.Good,
                  score: 0.5,
                },
                profanity: {
                  expectationId: '',
                  evaluation: Evaluation.Good,
                  score: 0.5,
                },
              },
            },
          ],
          systemResponses: [
            [
              'Here is a question about integrity, a key Navy attribute. What are the challenges to demonstrating integrity in a group?',
            ],
            [
              'Right. But there are still more answers.',
              'How can it affect someone when you correct their behavior?',
            ],
          ],
          userResponses: [
            { text: 'correct answer for expectation 0', activeExpectation: -1 },
            { text: 'correct answer for expectation 1', activeExpectation: 1 },
          ],
          userScores: [0.7, 0.8],
        },
        sessionId: 'a677e7a8-b09e-4b3b-825d-5073422d42fd',
        previousUserResponse: 'good answer for expectation 2',
        previousSystemResponse: [
          "Good. Now what's another answer?",
          "How can it affect you when you correct someone's behavior?",
        ],
      };

      const updatedValidSessionDto = dataToDto(updatedValidSessionData);

      mockAxios.reset();
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q7')) {
          return [200, { data: { me: { lesson: lessonById.q7 } } }];
        } else {
          const errData: LResponseObject = {
            data: {
              me: {
                lesson: null,
              },
            },
          };
          return [404, errData];
        }
      });
      mockAxios.onPost('/classifier').reply((config: AxiosRequestConfig) => {
        return [
          200,
          {
            output: {
              expectationResults: [
                { evaluation: Evaluation.Good, score: 0.5 },
                { evaluation: Evaluation.Good, score: 0.5 },
                { evaluation: Evaluation.Good, score: 0.9 },
              ],
              speechActs: {
                metacognitive: { evaluation: Evaluation.Good, score: 0.5 },
                profanity: { evaluation: Evaluation.Good, score: 0.5 },
              },
            },
          },
        ];
      });
      const response = await postSession(lessonIdq7, app, {
        message: 'good answer',
        username: 'testuser',
        sessionInfo: updatedValidSessionDto,
        lessonId: lessonIdq7,
      });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('response');
      expect(
        (response.body.response as OpenTutorResponse[])
          .filter((m) => m.type == ResponseType.FeedbackPositive)
          .map((m) => (m.data as TextData).text)
      ).to.include.oneOf([
        'Nice job, you did great!',
        'You did pretty well on this lesson!',
        'Good job, it looks like you understood this lesson',
      ]);
    });

    it('gives overall negative feedback when final score was not good', async () => {
      const updatedValidSessionData: SessionData = {
        dialogState: {
          expectationsCompleted: [true, true, false],
          currentExpectation: 2,
          expectationData: [
            {
              ideal: '',
              score: 0,
              numHints: 2,
              numPrompts: 1,
              satisfied: false,
              status: ExpectationStatus.Complete,
            },
            {
              ideal: '',
              score: 0,
              numHints: 2,
              numPrompts: 0,
              satisfied: false,
              status: ExpectationStatus.Complete,
            },
            {
              ideal: '',
              score: 0,
              numHints: 1,
              numPrompts: 0,
              satisfied: false,
              status: ExpectationStatus.Active,
            },
          ],
          hints: true,
          limitHintsMode: false,
          numCorrectStreak: 0,
        },
        sessionHistory: {
          classifierGrades: [
            {
              expectationResults: [
                { expectationId: '0', evaluation: Evaluation.Good, score: 0.4 },
                { expectationId: '1', evaluation: Evaluation.Good, score: 0.4 },
                { expectationId: '2', evaluation: Evaluation.Good, score: 0.6 },
              ],
              speechActs: {
                metacognitive: {
                  expectationId: '',
                  evaluation: Evaluation.Good,
                  score: 0.5,
                },
                profanity: {
                  expectationId: '',
                  evaluation: Evaluation.Good,
                  score: 0.5,
                },
              },
            },
          ],
          systemResponses: [
            [
              'Here is a question about integrity, a key Navy attribute. What are the challenges to demonstrating integrity in a group?',
            ],
            [
              'Right. But there are still more answers.',
              'How can it affect someone when you correct their behavior?',
            ],
          ],
          userResponses: [
            { text: 'wrong answer for expectation 0', activeExpectation: -1 },
            { text: 'wrong answer for expectation 1', activeExpectation: 1 },
          ],
          userScores: [0.5, 0.5],
        },
        sessionId: 'a677e7a8-b09e-4b3b-825d-5073422d42fd',
        previousUserResponse: 'good answer for expectation 2',
        previousSystemResponse: [
          "Good. Now what's another answer?",
          "How can it affect you when you correct someone's behavior?",
        ],
      };

      const updatedValidSessionDto = dataToDto(updatedValidSessionData);

      mockAxios.reset();
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q7')) {
          return [200, { data: { me: { lesson: lessonById.q7 } } }];
        } else {
          const errData: LResponseObject = {
            data: {
              me: {
                lesson: null,
              },
            },
          };
          return [404, errData];
        }
      });
      mockAxios.onPost('/classifier').reply((config: AxiosRequestConfig) => {
        return [
          200,
          {
            output: {
              expectationResults: [
                { evaluation: Evaluation.Good, score: 0.5 },
                { evaluation: Evaluation.Good, score: 0.5 },
                { evaluation: Evaluation.Good, score: 0.7 },
              ],
              speechActs: {
                metacognitive: { evaluation: Evaluation.Good, score: 0.5 },
                profanity: { evaluation: Evaluation.Good, score: 0.5 },
              },
            },
          },
        ];
      });
      const response = await postSession(lessonIdq7, app, {
        message: 'good answer',
        username: 'testuser',
        sessionInfo: updatedValidSessionDto,
        lessonId: lessonIdq7,
      });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('response');
      expect(
        (response.body.response as OpenTutorResponse[])
          .filter((m) => m.type == ResponseType.FeedbackNegative)
          .map((m) => (m.data as TextData).text)
      ).to.include.oneOf([
        'Try again next time and see if you can get all the answers.',
        "It looks like you didn't get all the answers, try again next time.",
        "Sorry, it looks like you missed a few answers. We'll get them next time.",
      ]);
    });
  });
});
