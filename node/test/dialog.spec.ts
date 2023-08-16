/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import createApp from 'app';
import axios, { AxiosRequestConfig } from 'axios';
import MockAxios from 'axios-mock-adapter';
import { expect } from 'chai';
import { Express } from 'express';
import { dataToDto, SessionDto } from 'dialog/session-data';
import OpenTutorResponse from 'dialog/response-data';
import { ResponseType, TextData } from 'dialog/response-data';
import { Evaluation } from 'apis/classifier';
import { LessonResponse, LResponseObject, Lesson } from 'apis/lessons';
import { findAll as findAllScenarios } from 'test/fixtures/scenarios';
import { findAll as findAllLessons } from 'test/fixtures/lessons';
import { DialogScenario } from 'test/fixtures/types';
import {
  postDialog,
  postSession,
  MOCK_AXIOS,
  CLASSIFIER_ENDPOINT,
} from './helpers';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import { randomFunctionSet, randomFunctionRestore } from 'dialog/random';
import * as standardSpeechCans from 'dialog/handler/standard/config';

import noRedundantTransitionWhenGivingFeedbackForConfusionWithHint from './fixtures/sessionData/noRedundantTransitionWhenGivingFeedbackForConfusionWithHint';
import {
  basicSessionData,
  completedSessionData,
} from './fixtures/sessionData/basicSessionData';
import {
  expectationResult1,
  expectationResult2,
  expectationResult3,
  expectationResult4,
  expectationResult5,
  expectationResult6,
  expectationResult7,
  expectationResult8,
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
    app = await createApp();
    mockAxios = MOCK_AXIOS;
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

  allScenarios.forEach((ex) => {
    // allScenarios.filter((x) => x.lessonId === 'q5').forEach((ex) => {
    it(`gives expected responses to scenario inputs: ${ex.name}`, async () => {
      mockAxios.reset();
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        const lessonData = findLessonForGqlQuery(reqBody.query);
        if (lessonData) {
          return [
            200,
            {
              data: { me: { lesson: findLessonForGqlQuery(reqBody.query) } },
            },
          ];
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
      const responseStartSession = await postDialog(ex.lessonId, app, {
        lessonId: ex.lessonId,
        id: '1',
        username: 'rush',
        UseDB: true,
        ScriptXML: null,
        LSASpaceName: 'English_TASA',
        ScriptURL: null,
      });
      let sessionObj = responseStartSession.body.sessionInfo;
      expect(responseStartSession.status).to.equal(200);
      for (const reqRes of ex.expectedRequestResponses) {
        mockAxios.reset();
        mockAxios.onGet('/config').reply(() => {
          return [200, { API_SECRET: 'api_secret' }];
        });
        mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
          const reqBody = JSON.parse(config.data);
          const lessonData = findLessonForGqlQuery(reqBody.query);
          if (lessonData) {
            return [
              200,
              {
                data: {
                  me: { lesson: findLessonForGqlQuery(reqBody.query) },
                },
              },
            ];
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
        mockAxios
          .onPost(CLASSIFIER_ENDPOINT)
          .reply((config: AxiosRequestConfig) => {
            const reqBody = JSON.parse(config.data);
            expect(reqBody).to.have.property('lesson', ex.lessonId);
            expect(reqBody).to.have.property('input', reqRes.userInput);
            expect(reqBody).to.have.property('config');
            return [
              reqRes.mockClassifierResponse.status || 200,
              reqRes.mockClassifierResponse.data,
            ];
          });

        mockNextRandom.returns(reqRes.nextRandom || 0);
        randomFunctionSet(mockNextRandom);
        const response = await postSession(ex.lessonId, app, {
          message: reqRes.userInput,
          username: 'testuser',
          sessionInfo: sessionObj,
          lessonId: ex.lessonId,
        });

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('response');
        if (reqRes.expectExactMatchResponse) {
          expect(response.body.response).to.deep.equal(reqRes.expectedResponse);
        } else {
          expect(response.body.response).to.deep.include.members(
            reqRes.expectedResponse
          );
        }
        expect(response.body).to.have.property('completed');
        if (response.body.completed) {
          if (typeof ex.expectedScore !== 'undefined') {
            expect(response.body).to.have.property('score', ex.expectedScore);
          }
        }
        sessionObj = response.body.sessionInfo;
      }
    });
  });

  describe('POST', () => {
    const lessonId = 'q1';

    const lessonData: LessonResponse = {
      data: {
        me: {
          lesson: {
            name: 'navyIntegrity',
            arch: '',
            lessonId: 'navyIntegrity',
            intro: 'intro',
            question: 'main',
            expectations: [],
            conclusion: ['a'],
            dialogCategory: 'default',
            learningFormat: 'standard',
          },
        },
      },
    };

    const validSessionDto = dataToDto(basicSessionData);

    it('responds with a 404 error if lesson id passed does not correspond to a valid lesson', async () => {
      const response = await postDialog('q3', app, {
        lessonId: 'q3',
        username: 'user',
      });
      expect(response.status).to.equal(404);
    });

    it('responds with a 400 error if no message passed to session', async () => {
      mockAxios.reset();
      mockAxios.onPost(CLASSIFIER_ENDPOINT).reply(() => {
        return [200, {}];
      });
      mockAxios.onPost('/graphql').reply(() => {
        return [200, { data: { me: { lesson: lessonById.q1 } } }];
      });
      const responseStartSession = await postDialog('q1', app, {
        lessonId: 'q1',
        id: '1',
        username: 'rush',
        UseDB: true,
        ScriptXML: null,
        LSASpaceName: 'English_TASA',
        ScriptURL: null,
      });
      let sessionObj = responseStartSession.body.sessionInfo;
      const response = await postSession(lessonId, app, {
        username: 'testuser',
        sessionInfo: sessionObj,
      });
      expect(response.status).to.equal(400);
    });

    it('responds with a 400 error if no username passed to session', async () => {
      mockAxios.reset();
      mockAxios.onPost(CLASSIFIER_ENDPOINT).reply(() => {
        return [200, {}];
      });
      mockAxios.onPost('/graphql').reply(() => {
        return [200, { data: { me: { lesson: lessonById.q1 } } }];
      });
      const responseStartSession = await postDialog('q1', app, {
        lessonId: 'q1',
        id: '1',
        username: 'rush',
        UseDB: true,
        ScriptXML: null,
        LSASpaceName: 'English_TASA',
        ScriptURL: null,
      });
      let sessionObj = responseStartSession.body.sessionInfo;
      const response = await postSession(lessonId, app, {
        message: 'message',
        sessionInfo: sessionObj,
      });
      expect(response.status).to.equal(400);
    });

    it('responds with a 502 error if 500 error calling classifier', async () => {
      mockAxios.reset();
      mockAxios.onPost(CLASSIFIER_ENDPOINT).reply((_) => {
        return [500, {}];
      });
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q1')) {
          return [200, { data: { me: { lesson: lessonById.q1 } } }];
        } else if ((reqBody.query as string).includes('q2')) {
          return [200, { data: { me: { lesson: lessonById.q2 } } }];
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
      const response = await postSession(lessonId, app, {
        message: 'peer pressure',
        username: 'testuser',
        sessionInfo: validSessionDto,
      });
      expect(response.status).to.equal(502);
    });

    it('responds with a 404 error if 404 error calling classifier', async () => {
      mockAxios.reset();
      mockAxios.onPost(CLASSIFIER_ENDPOINT).reply((_) => {
        return [404, {}];
      });
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q1')) {
          return [200, { data: { me: { lesson: lessonById.q1 } } }];
        } else if ((reqBody.query as string).includes('q2')) {
          return [200, { data: { me: { lesson: lessonById.q2 } } }];
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
      const response = await postSession(lessonId, app, {
        lessonId: lessonId,
        message: 'peer pressure',
        username: 'testuser',
        sessionInfo: validSessionDto,
      });
      expect(response.status).to.equal(404);
      expect(response.body).to.have.property(
        'message',
        `classifier cannot find lesson '${lessonId}'`
      );
    });

    it('responds with a 404 error if graphql cannot find lesson', async () => {
      mockAxios.reset();
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const errData: LResponseObject = {
          data: {
            me: {
              lesson: null,
            },
          },
        };
        return [200, errData];
      });
      const response = await postSession('q3', app, {
        lessonId: lessonId,
        message: 'peer pressure',
        username: 'testuser',
        sessionInfo: validSessionDto,
      });
      expect(response.status).to.equal(404);
      expect(response.body).to.have.property(
        'message',
        `graphql cannot find lesson 'q3'`
      );
    });

    it('returns a score between 0 and 1', async () => {
      mockAxios.reset();
      mockAxios
        .onPost(CLASSIFIER_ENDPOINT)
        .reply((config: AxiosRequestConfig) => {
          return [
            200,
            {
              data: {
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
            },
          ];
        });
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q1')) {
          return [200, { data: { me: { lesson: lessonById.q1 } } }];
        } else if ((reqBody.query as string).includes('q2')) {
          return [200, { data: { me: { lesson: lessonById.q2 } } }];
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
      const responseStartSession = await postDialog('q1', app, {
        lessonId: 'q1',
        id: '1',
        username: 'rush',
        UseDB: true,
        ScriptXML: null,
        LSASpaceName: 'English_TASA',
        ScriptURL: null,
      });
      let sessionObj = responseStartSession.body.sessionInfo;
      const response = await postSession(lessonId, app, {
        lessonId: 'q1',
        message: 'peer pressure',
        username: 'testuser',
        sessionInfo: sessionObj,
      });
      expect(response.body).to.have.property('score');
      expect(response.body.score).to.be.at.least(0.0);
      expect(response.body.score).to.be.at.most(1.0);
    });

    it('sends the session data to the grader at the end of the dialog', async () => {
      mockAxios.reset();
      mockAxios
        .onPost(CLASSIFIER_ENDPOINT)
        .reply((config: AxiosRequestConfig) => {
          return [200, expectationResult2];
        });
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q1')) {
          return [200, { data: { me: { lesson: lessonById.q1 } } }];
        } else if ((reqBody.query as string).includes('q2')) {
          return [200, { data: { me: { lesson: lessonById.q2 } } }];
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
      const response = await postSession(lessonId, app, {
        lessonId: 'q1',
        message: 'correct answer',
        username: 'testuser',
        sessionInfo: dataToDto(basicSessionData),
      });
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('sentToGrader', true);
    });

    it('sends the session information when session is started, along with initial dialog', async () => {
      mockAxios.reset();
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q1')) {
          return [200, { data: { me: { lesson: lessonById.q1 } } }];
        } else if ((reqBody.query as string).includes('q2')) {
          return [200, { data: { me: { lesson: lessonById.q2 } } }];
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
      const response = await postDialog(lessonId, app, {
        lessonId: 'q1',
        id: '1',
        username: 'rush',
        UseDB: true,
        ScriptXML: null,
        LSASpaceName: 'English_TASA',
        ScriptURL: null,
      });
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('response');
      expect(response.body).to.have.property('sessionInfo');
    });

    it('accepts and uses a session id passed by user', async () => {
      mockAxios.reset();
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q1')) {
          return [200, { data: { me: { lesson: lessonById.q1 } } }];
        } else if ((reqBody.query as string).includes('q2')) {
          return [200, { data: { me: { lesson: lessonById.q2 } } }];
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
      const sessionId = 'some-user-generated-session-id';
      const response = await postDialog(lessonId, app, {
        sessionId: sessionId,
        username: 'user',
      });
      expect(response.status).to.equal(200);
      expect(response.body).to.have.deep.nested.property(
        'sessionInfo.sessionId',
        sessionId
      );
    });

    it('sends an error if user tries to tamper with the session data', async () => {
      const tampered: SessionDto = dataToDto({
        ...basicSessionData,
        sessionHistory: {
          ...basicSessionData.sessionHistory,
          userScores: [...basicSessionData.sessionHistory.userScores, 10],
        },
      });
      tampered.hash = validSessionDto.hash;
      const response = await postSession(lessonId, app, {
        message: 'peer pressure',
        username: 'testuser',
        sessionInfo: tampered,
      });
      expect(response.status).to.equal(403);
    });

    it('sends an error if client sends dialog when the session is complete.', async () => {
      mockAxios.reset();
      mockAxios
        .onPost(CLASSIFIER_ENDPOINT)
        .reply((config: AxiosRequestConfig) => {
          return [200, expectationResult3];
        });
      const completedSession: SessionDto = dataToDto(completedSessionData);
      const response = await postSession(lessonId, app, {
        message: 'another message',
        username: 'testuser',
        sessionInfo: completedSession,
      });
      expect(response.status).to.equal(410);
    });

    it('successfully sends a request to the graphql endpoint for data', async () => {
      mockAxios.reset();
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        return [200, lessonData];
      });
      const responseStartSession = await postDialog('navyIntegrity', app, {
        lessonId: 'navyIntegrity',
        username: 'user',
      });
      expect(responseStartSession.status).to.equal(200);
      expect(responseStartSession.body).to.have.property('response');
      expect(
        (responseStartSession.body.response as OpenTutorResponse[]).map(
          (m) => m.data
        )
      ).to.eql([{ text: 'intro' }, { text: 'main' }]);
    });

    it('responds with a random positive feedback message from a set of messages', async () => {
      mockAxios.reset();
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q1')) {
          return [200, { data: { me: { lesson: lessonById.q1 } } }];
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
      mockAxios
        .onPost(CLASSIFIER_ENDPOINT)
        .reply((config: AxiosRequestConfig) => {
          const reqBody = JSON.parse(config.data);
          return [200, expectationResult4];
        });
      const response = await postSession(lessonId, app, {
        message: 'peer pressure',
        username: 'testuser',
        sessionInfo: validSessionDto,
        lessonId: lessonId,
      });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('response');
      expect(
        (response.body.response as OpenTutorResponse[])
          .filter((m) => m.type == ResponseType.FeedbackPositive)
          .map((m) => (m.data as TextData).text)[0]
      ).to.be.oneOf(['Great.', 'Nicely done!', 'You got it!']);
    });

    it('responds with a random message indicating there answer was not fully correct when other expectations got poor score.', async () => {
      mockAxios.reset();
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q1')) {
          return [200, { data: { me: { lesson: lessonById.q1 } } }];
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
      mockAxios
        .onPost(CLASSIFIER_ENDPOINT)
        .reply((config: AxiosRequestConfig) => {
          const reqBody = JSON.parse(config.data);
          return [200, expectationResult8];
        });
      const response = await postSession(lessonId, app, {
        message: 'peer pressure',
        username: 'testuser',
        sessionInfo: validSessionDto,
        lessonId: lessonId,
      });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('response');
      expect(
        (response.body.response as OpenTutorResponse[])
          .filter((m) => m.type == ResponseType.FeedbackNeutral)
          .map((m) => (m.data as TextData).text)[0]
      ).to.be.oneOf(standardSpeechCans.SOME_WRONG_FEEDBACK);
    });

    it('responds with a random negative feedback message from a set of messages', async () => {
      mockAxios.reset();
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q1')) {
          return [200, { data: { me: { lesson: lessonById.q1 } } }];
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
      mockAxios
        .onPost(CLASSIFIER_ENDPOINT)
        .reply((config: AxiosRequestConfig) => {
          const reqBody = JSON.parse(config.data);
          return [200, expectationResult9];
        });
      const response = await postSession(lessonId, app, {
        message: 'bad answer',
        username: 'testuser',
        sessionInfo: validSessionDto,
        lessonId: lessonId,
      });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('response');
      expect(
        (response.body.response as OpenTutorResponse[])
          .filter((m) => m.type == ResponseType.FeedbackNegative)
          .map((m) => (m.data as TextData).text)[0]
      ).to.be.oneOf(['Not really.', "That's not right.", "I don't think so."]);
    });

    it('responds with a random neutral feedback message from a set of messages', async () => {
      mockAxios.reset();
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q1')) {
          return [200, { data: { me: { lesson: lessonById.q1 } } }];
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
      mockAxios
        .onPost(CLASSIFIER_ENDPOINT)
        .reply((config: AxiosRequestConfig) => {
          const reqBody = JSON.parse(config.data);
          return [200, expectationResult5];
        });
      const response = await postSession(lessonId, app, {
        message: 'neutral answer',
        username: 'testuser',
        sessionInfo: validSessionDto,
        lessonId: lessonId,
      });
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('response');
      expect(
        (response.body.response as OpenTutorResponse[])
          .filter((m) => m.type == ResponseType.FeedbackNeutral)
          .map((m) => (m.data as TextData).text)[0]
      ).to.be.oneOf(['Ok.', 'So']);
    });

    it('responds with random hint start message and prompt start message from a set of messages', async () => {
      mockAxios.reset();
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q1')) {
          return [200, { data: { me: { lesson: lessonById.q1 } } }];
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
      mockAxios
        .onPost(CLASSIFIER_ENDPOINT)
        .reply((config: AxiosRequestConfig) => {
          const reqBody = JSON.parse(config.data);
          return [200, expectationResult1];
        });
      const responseHint = await postSession(lessonId, app, {
        message: 'no answer',
        username: 'testuser',
        sessionInfo: validSessionDto,
        lessonId: lessonId,
      });

      expect(responseHint.status).to.equal(200);
      expect(responseHint.body).to.have.property('response');
      expect(
        (responseHint.body.response as OpenTutorResponse[])
          .filter((m) => m.type == ResponseType.Text)
          .map((m) => (m.data as TextData).text)[0]
      ).to.be.oneOf([
        'Consider this.',
        'Let me help you a little.',
        'Think about this.',
        'Lets work through this together.',
      ]);

      const responsePrompt = await postSession(lessonId, app, {
        message: 'no answer',
        username: 'testuser',
        sessionInfo: responseHint.body.sessionInfo,
        lessonId: lessonId,
      });
      expect(responsePrompt.status).to.equal(200);
      expect(responsePrompt.body).to.have.property('response');
      expect(
        (responsePrompt.body.response as OpenTutorResponse[])
          .filter((m) => m.type == ResponseType.Text)
          .map((m) => (m.data as TextData).text)[0]
      ).to.be.oneOf([
        'See if you can get this',
        'Try this.',
        'What about this.',
        'See if you know the answer to this.',
      ]);
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
        if ((reqBody.query as string).includes('q1')) {
          return [200, { data: { me: { lesson: lessonById.q1 } } }];
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
      mockAxios
        .onPost(CLASSIFIER_ENDPOINT)
        .reply((config: AxiosRequestConfig) => {
          const reqBody = JSON.parse(config.data);
          return [200, expectationResult6];
        });
      const lessonIdq4 = 'q4';
      const response = await postSession(lessonId, app, {
        message: 'Answer that is not good and is metacognitive.',
        username: 'testuser',
        sessionInfo: validSessionDto,
        lessonId: lessonIdq4,
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

    it('responds with a random neutral feedback on first bad answer when sensitive', async () => {
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
      mockAxios
        .onPost(CLASSIFIER_ENDPOINT)
        .reply((config: AxiosRequestConfig) => {
          return [
            200,
            {
              data: {
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
            },
          ];
        });
      const lessonIdq4 = 'q4';
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

    const updatedValidSessionDto = dataToDto(
      noRedundantTransitionWhenGivingFeedbackForConfusionWithHint
    );

    it('does not give redundant transition messages when giving feedback for hint where another expectation was satisfied instead of current', async () => {
      mockAxios.reset();
      mockAxios.onGet('/config').reply(() => {
        return [200, { API_SECRET: 'api_secret' }];
      });
      mockAxios.onPost('/graphql').reply((config: AxiosRequestConfig) => {
        const reqBody = JSON.parse(config.data);
        if ((reqBody.query as string).includes('q1')) {
          return [200, { data: { me: { lesson: lessonById.q1 } } }];
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
      mockAxios
        .onPost(CLASSIFIER_ENDPOINT)
        .reply((config: AxiosRequestConfig) => {
          const reqBody = JSON.parse(config.data);
          return [200, expectationResult7];
        });
      const response = await postSession(lessonId, app, {
        message: 'Wrong for current exp, but got a different one.',
        username: 'testuser',
        sessionInfo: updatedValidSessionDto,
        lessonId: lessonId,
      });
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('response');
      expect(
        (response.body.response as OpenTutorResponse[])
          .filter((m) => m.type == ResponseType.FeedbackNeutral)
          .map((m) => (m.data as TextData).text)[0]
      ).to.be.oneOf(standardSpeechCans.FEEDBACK_GOOD_POINT_BUT);
      expect(
        (response.body.response as OpenTutorResponse[])
          .filter((m) => m.type == ResponseType.Text)
          .map((m) => (m.data as TextData).text)
      ).to.be.empty;
    });
  });
});
