import createApp from 'app';
import axios, { AxiosRequestConfig } from 'axios';
import MockAxios from 'axios-mock-adapter';
import { expect } from 'chai';
import { Express, response } from 'express';
import {
  dataToDto,
  SessionData,
  SessionDto,
  ExpectationStatus,
  UserResponse,
} from 'dialog/session-data';
import OpenTutorResponse from 'dialog/response-data';
import { ResponseType, TextData } from 'dialog/response-data';
import { ClassifierResult, Evaluation } from 'apis/classifier';
import { LessonResponse, LResponseObject, Lesson } from 'apis/lessons';
import { findAll as findAllScenarios } from 'test/fixtures/scenarios';
import { findAll as findAllLessons } from 'test/fixtures/lessons';
import { DialogScenario } from 'test/fixtures/types';
import { postDialog, postSession, MOCKING_DISABLED } from './helpers';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import { randomFunctionSet, randomFunctionRestore } from 'dialog/random';
import * as standardSpeechCans from 'dialog/handler/standard/config';

import finalScoreNotGood from './fixtures/sessionData/finalScoreNotGood';
import scoreGoodButNotPerfect from './fixtures/sessionData/scoreGoodButNotPerfect';
import answerWrongNoHintsLeft from './fixtures/sessionData/answerWrongNoHIntsLeft';
import surveySaysStyle from './fixtures/sessionData/surveySaysStyleLesson';
import negativeFeedbackValidSessionData from './fixtures/sessionData/negativeFeedbackValidSessionData';
import streaksOfNegativeAnswers from './fixtures/sessionData/streaksOfNegativeAnswers';
import updatedValidSessionDataRedundantCase from './fixtures/sessionData/updatedValidSessionDataRedundantCase';
import sensitiveLessonData from './fixtures/sessionData/sensitiveLessonData';
import noRedundantTransitionWhenGivingFeedbackForConfusionWithHint from './fixtures/sessionData/noRedundantTransitionWhenGivingFeedbackForConfusionWithHint';
import {
  basicSessionData,
  completedSessionData,
} from './fixtures/sessionData/basicSessionData';
import {
  expectationResult1,
  expectationResult10,
  expectationResult11,
  expectationResult12,
  expectationResult13,
  expectationResult14,
  expectationResult15,
  expectationResult16,
  expectationResult2,
  expectationResult3,
  expectationResult4,
  expectationResult5,
  expectationResult6,
  expectationResult7,
  expectationResult8,
  expectationResult9,
} from './fixtures/expectationResults/expectationResults';
import { json } from 'body-parser';


const sandbox = sinon.createSandbox();

describe('sensitive dialog', async () => {
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
      mockAxios = new MockAxios(axios);
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

describe('Sensitive Lesson', () => {
    const lessonIdq4 = 'q4';
    const validSessionDto = dataToDto(sensitiveLessonData);

    it('responds with a random sensitive positive feedback message when lesson is sensitive', async () => {
      mockAxios.reset();
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q4')) {
          return [200, { data: { me: { lesson: lessonById.q4 } } }];
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
      const response = await postSession(lessonIdq4, app, {
        message: 'good answer',
        username: 'testuser',
        sessionInfo: validSessionDto,
        lessonId: lessonIdq4,
      });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('response');
      expect(
        (response.body.response as OpenTutorResponse[])
          .filter((m) => m.type == ResponseType.FeedbackPositive)
          .map((m) => (m.data as TextData).text)[0]
      ).to.be.oneOf([
        'Right.',
        "Yeah, that's right.",
        'Correct.',
        "That's correct.",
      ]);
    });

    it('responds with a random sensitive positive feedback message when lesson is sensitive', async () => {
      mockAxios.reset();
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q4')) {
          return [200, { data: { me: { lesson: lessonById.q4 } } }];
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
      const response = await postSession(lessonIdq4, app, {
        message: 'good answer',
        username: 'testuser',
        sessionInfo: validSessionDto,
        lessonId: lessonIdq4,
      });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('response');
      expect(
        (response.body.response as OpenTutorResponse[])
          .filter((m) => m.type == ResponseType.FeedbackPositive)
          .map((m) => (m.data as TextData).text)[0]
      ).to.be.oneOf([
        'Right.',
        "Yeah, that's right.",
        'Correct.',
        "That's correct.",
      ]);
    });

    it('responds with a random neutral feedback message when the confidence is below 90% for bad responses', async () => {
      mockAxios.reset();
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q4')) {
          return [200, { data: { me: { lesson: lessonById.q4 } } }];
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
                { evaluation: Evaluation.Bad, score: 0.7 },
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
      const response = await postSession(lessonIdq4, app, {
        message: 'bad answer',
        username: 'testuser',
        sessionInfo: validSessionDto,
        lessonId: lessonIdq4,
      });
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('response');
      expect(
        (response.body.response as OpenTutorResponse[])
          .filter((m) => m.type == ResponseType.FeedbackNeutral)
          .map((m) => (m.data as TextData).text)[0]
      ).to.be.oneOf(['Ok.', 'So.', 'Well.', 'I see.', 'Okay.']);
    });

    it('responds with a random sensitive message indicating there answer was not fully correct when other expectations got poor score.', async () => {
      mockAxios.reset();
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q4')) {
          return [200, { data: { me: { lesson: lessonById.q4 } } }];
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
        return [200, expectationResult10];
      });
      const response = await postSession(lessonIdq4, app, {
        message: 'good answer',
        username: 'testuser',
        sessionInfo: validSessionDto,
        lessonId: lessonIdq4,
      });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('response');
      expect(
        (response.body.response as OpenTutorResponse[])
          .filter((m) => m.type == ResponseType.FeedbackNeutral)
          .map((m) => (m.data as TextData).text)[0]
      ).to.be.oneOf(standardSpeechCans.SENSITIVE_SOME_WRONG_FEEDBACK);
    });

    it('responds with a random neutral feedback message when the confidence is below 90% for bad responses', async () => {
      mockAxios.reset();
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q4')) {
          return [200, { data: { me: { lesson: lessonById.q4 } } }];
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
        return [200, expectationResult11];
      });
      const response = await postSession(lessonIdq4, app, {
        message: 'bad answer',
        username: 'testuser',
        sessionInfo: validSessionDto,
        lessonId: lessonIdq4,
      });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('response');
      expect(
        (response.body.response as OpenTutorResponse[])
          .filter((m) => m.type == ResponseType.FeedbackNeutral)
          .map((m) => (m.data as TextData).text)[0]
      ).to.be.oneOf(['Ok.', 'So.', 'Well.', 'I see.', 'Okay.']);
    });

    it('responds with neutral feedback (not a pump) when no expectations were met in the main question', async () => {
      mockNextRandom = sandbox.stub().returns(0.7);
      randomFunctionSet(mockNextRandom);
      mockAxios.reset();
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q4')) {
          return [200, { data: { me: { lesson: lessonById.q4 } } }];
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
      const response = await postSession(lessonIdq4, app, {
        message: 'bad answer',
        username: 'testuser',
        sessionInfo: validSessionDto,
        lessonId: lessonIdq4,
      });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('response');
      expect(
        (response.body.response as OpenTutorResponse[])
          .filter((m) => m.type == ResponseType.FeedbackNeutral)
          .map((m) => (m.data as TextData).text)[0]
      ).to.be.oneOf(['Ok.', 'So.', 'Well.', 'I see.', 'Okay.']);
    });

    const lessonIdq5 = 'q5';

    const updatedValidSessionDtoRedundantCase = dataToDto(
      updatedValidSessionDataRedundantCase
    );

    it('does not give redundant transition messages when giving feedback for hint where another expectation was satisfied instead of current', async () => {
      mockAxios.reset();
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q5')) {
          return [200, { data: { me: { lesson: lessonById.q5 } } }];
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
        return [200, expectationResult12];
      });
      const response = await postSession(lessonIdq5, app, {
        message: 'Wrong for current exp, but got a different one.',
        username: 'testuser',
        sessionInfo: updatedValidSessionDtoRedundantCase,
        lessonId: lessonIdq5,
      });
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('response');
      expect(
        (response.body.response as OpenTutorResponse[])
          .filter((m) => m.type == ResponseType.FeedbackNeutral)
          .map((m) => (m.data as TextData).text)[0]
      ).to.be.oneOf(
        standardSpeechCans.FEEDBACK_OUT_OF_HINTS_ALTERNATE_EXPECTATION_FULFILLED
      );
    });

    // Update the session data to test negative feedback, since it cannot be given on first answer
    const negativeFeedbackValidSessionDto = dataToDto(
      negativeFeedbackValidSessionData
    );

    it('responds with a random sensitive negative feedback message when lesson is sensitive', async () => {
      mockAxios.reset();
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q4')) {
          return [200, { data: { me: { lesson: lessonById.q4 } } }];
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
      const response = await postSession(lessonIdq4, app, {
        message: 'bad answer',
        username: 'testuser',
        sessionInfo: negativeFeedbackValidSessionDto,
        lessonId: lessonIdq4,
      });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('response');
      expect(
        (response.body.response as OpenTutorResponse[])
          .filter((m) => m.type == ResponseType.FeedbackNegative)
          .map((m) => (m.data as TextData).text)[0]
      ).to.be.oneOf(standardSpeechCans.SENSITIVE_NEGATIVE_FEEDBACK);
    });

    // it('asks user if they are comfortable proceeding with sensitive lesson before main question', async () => {
    //   if (mockAxios) {
    //     mockAxios.reset();
    //     mockAxios.onGet('/config').reply(() => {
    //       return [200, { API_SECRET: 'api_secret' }];
    //     });
    //     mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
    //       const reqBody = JSON.parse(config.data);
    //       const lessonData = findLessonForGqlQuery(reqBody.query);
    //       if (lessonData) {
    //         return [
    //           200,
    //           {
    //             data: { me: { lesson: findLessonForGqlQuery(reqBody.query) } },
    //           },
    //         ];
    //       } else {
    //         const errData: LResponseObject = {
    //           data: {
    //             me: {
    //               lesson: null,
    //             },
    //           },
    //         };
    //         return [404, errData];
    //       }
    //     });
    //   }
    //   const responseStartSession = await postDialog(lessonIdq4, app, {
    //     lessonId: lessonIdq4,
    //     id: '1',
    //     user: 'rush',
    //     UseDB: true,
    //     ScriptXML: null,
    //     LSASpaceName: 'English_TASA',
    //     ScriptURL: null,
    //   });
    //   let sessionObj = responseStartSession.body.sessionInfo;
    //   expect(responseStartSession.status).to.equal(200);
    //   console.log(responseStartSession.body.response);
    //   expect(
    //     (responseStartSession.body.response as OpenTutorResponse[])
    //       .filter((m) => m.type === ResponseType.Opening)
    //       .map((m) => (m.data as TextData).text)
    //     ).to.include.oneOf(["Would you like to proceed?", "Are you comfortable continuing with this lesson?"])
    //   expect(
    //     (responseStartSession.body.response as OpenTutorResponse[])
    //       .filter((m) => m.type === ResponseType.MainQuestion)
    //     ).to.be.empty;
    // });

    // Update the session data for testing dialog behavior with streaks of negative answers
    let lessonIdq6 = 'q6';
    const updatedValidSessionDto = dataToDto(streaksOfNegativeAnswers);
    mockNextRandom = sandbox.stub().returns(0.7);
    randomFunctionSet(mockNextRandom);

    it('does not use a pump when the response will also reveal the expectation', async () => {
      mockAxios.reset();
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q6')) {
          return [200, { data: { me: { lesson: lessonById.q6 } } }];
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
      const response = await postSession(lessonIdq6, app, {
        message: 'bad answer',
        username: 'testuser',
        sessionInfo: updatedValidSessionDto,
        lessonId: lessonIdq6,
      });
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('response');
      expect(
        (response.body.response as OpenTutorResponse[])
          .filter((m) => m.type == ResponseType.FeedbackNeutral)
          .map((m) => (m.data as TextData).text)[0]
      ).to.be.oneOf(['Ok.', 'So.', 'Well.', 'I see.', 'Okay.']);
    });

    it('responds with a random pump the other 50% of the time when the confidence is above 90% and negative feedback is not allowed', async () => {
      mockNextRandom = sandbox.stub().returns(0.7);
      randomFunctionSet(mockNextRandom);
      mockAxios.reset();
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q4')) {
          return [200, { data: { me: { lesson: lessonById.q4 } } }];
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
      const response = await postSession(lessonIdq4, app, {
        message: 'bad answer',
        username: 'testuser',
        sessionInfo: updatedValidSessionDto,
        lessonId: lessonIdq4,
      });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('response');
      expect(
        (response.body.response as OpenTutorResponse[])
          .filter((m) => m.type == ResponseType.Hint)
          .map((m) => (m.data as TextData).text)[0]
      ).to.be.oneOf([
        "Let's work through this together.",
        'And can you add to that?',
        'What else?',
        'Anything else?',
        'Could you elaborate on that a little?',
        'Can you add anything to that?',
      ]);
    });
  });
});