/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import createApp from 'app';
import axios from 'axios';
import MockAxios from 'axios-mock-adapter';
import { expect } from 'chai';
import { Express } from 'express';
import {
  dataToDto,
  SessionData,
  SessionDto,
  ExpectationStatus,
} from 'dialog/session-data';
import OpenTutorResponse from 'dialog/response-data';
import { ResponseType, TextData } from 'dialog/response-data';
import { ClassifierResult, Evaluation } from 'apis/classifier';
import { LessonResponse, LResponseObject, Lesson } from 'apis/lessons';
import { findAll as findAllScenarios } from 'test/fixtures/scenarios';
import { DialogScenario } from 'test/fixtures/types';
import { postDialog, postSession, MOCKING_DISABLED } from './helpers';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import { ScopedRandom } from 'dialog';

describe('dialog', async () => {
  let app: Express;
  let mockAxios: MockAxios;
  const allScenarios: DialogScenario[] = await findAllScenarios();

  beforeEach(async () => {
    if (!MOCKING_DISABLED) {
      app = await createApp();
      mockAxios = new MockAxios(axios);
    }
    sinon.stub(ScopedRandom, 'nextRandom').returns(0);
  });

  afterEach(() => {
    if (mockAxios) {
      mockAxios.reset();
    }
    sinon.restore();
  });

  const currentFlowLesson: Lesson = {
    lessonName: 'Current Flow',
    lessonId: 'q2',
    intro:
      '_user_, this is a warm up question on the behavior of P-N junction diodes.',
    question:
      'With a DC input source, does current flow in the same or the opposite direction of the diode arrow?',
    expectations: [
      {
        expectation: 'Current flows in the same direction as the arrow.',
        hints: [
          {
            text:
              'Why might you allow bad behavior in a group that you normally would not allow yourself to do?',
          },
        ],
      },
    ],
    conclusion: [
      'Summing up, this diode is forward biased. Positive current flows in the same direction of the arrow, from anode to cathode.',
      "Let's try a different problem.",
    ],
    createdAt: 'asdasdffas',
    updatedAt: 'asfasdfasdf',
  };

  const navyIntegrityLesson: Lesson = {
    lessonName: 'Current Flow',
    lessonId: 'q1',
    intro: 'Here is a question about integrity, a key Navy attribute.',
    question: 'What are the challenges to demonstrating integrity in a group?',
    expectations: [
      {
        expectation:
          'Peer pressure can cause you to allow inappropriate behavior.',
        hints: [
          {
            text:
              'Why might you allow bad behavior in a group that you normally would not allow yourself to do?',
          },
        ],
        prompts: [
          {
            prompt: 'What might cause you to lower your standards?',
            answer: 'peer pressure',
          },
        ],
      },
      {
        expectation:
          "If you correct someone's behavior, you may get them in trouble or it may be harder to work with them.",
        hints: [
          {
            text: 'How can it affect someone when you correct their behavior?',
          },
        ],
        prompts: [
          {
            prompt:
              'How can it affect someone emotionally when you correct their behavior?',
            answer: 'it may be harder to work with them',
          },
        ],
      },
      {
        expectation: 'Enforcing the rules can make you unpopular.',
        hints: [
          {
            text: "How can it affect you when you correct someone's behavior?",
          },
        ],
        prompts: [
          {
            prompt:
              'Integrity means doing the right thing even when it is _____ ?',
            answer: 'unpopular',
          },
        ],
      },
    ],
    conclusion: [
      'Peer pressure can push you to allow and participate in inappropriate behavior.',
      "When you correct somone's behavior, you may get them in trouble or negatively impact your relationship with them.",
      'However, integrity means speaking out even when it is unpopular.',
    ],
    createdAt: 'asdasdffas',
    updatedAt: 'asfasdfasdf',
  };

  const currentFlowResponse: LessonResponse = {
    data: {
      lesson: currentFlowLesson,
    },
  };

  allScenarios.forEach(ex => {
    it(`gives expected responses to scenario inputs: ${ex.name}`, async () => {
      if (mockAxios) {
        mockAxios.reset();
        mockAxios.onPost('/graphql').reply(config => {
          const reqBody = JSON.parse(config.data);
          if ((reqBody.query as string).includes('q1')) {
            return [200, { data: { lesson: navyIntegrityLesson } }];
          } else if ((reqBody.query as string).includes('q2')) {
            return [200, { data: { lesson: currentFlowLesson } }];
          } else {
            const errData: LResponseObject = {
              data: {
                lesson: null,
              },
            };
            return [404, errData];
          }
        });
      }
      const responseStartSession = await postDialog(ex.lessonId, app, {
        lessonId: ex.lessonId,
        id: '1',
        user: 'rush',
        UseDB: true,
        ScriptXML: null,
        LSASpaceName: 'English_TASA',
        ScriptURL: null,
      });
      let sessionObj = responseStartSession.body.sessionInfo;
      expect(responseStartSession.status).to.equal(200);
      for (const reqRes of ex.expectedRequestResponses) {
        if (mockAxios) {
          mockAxios.reset();
          mockAxios.onPost('/graphql').reply(config => {
            const reqBody = JSON.parse(config.data);
            if ((reqBody.query as string).includes('q1')) {
              return [200, { data: { lesson: navyIntegrityLesson } }];
            } else if ((reqBody.query as string).includes('q2')) {
              return [200, { data: { lesson: currentFlowLesson } }];
            } else {
              const errData: LResponseObject = {
                data: {
                  lesson: null,
                },
              };
              return [404, errData];
            }
          });
          mockAxios.onPost('/classifier').reply(config => {
            const reqBody = JSON.parse(config.data);
            expect(reqBody).to.have.property('lesson', ex.lessonId);
            expect(reqBody).to.have.property('input', reqRes.userInput);
            expect(reqBody).to.have.property('config');
            return [
              reqRes.mockClassifierResponse.status || 200,
              reqRes.mockClassifierResponse.data,
            ];
          });
          mockAxios.onPost('/grading-api').reply(config => {
            //expect(reqBody).to.have.property('sessionId', sessionObj.sessionId);
            // expect(reqBody).to.have.property('userResponses', ['correct answer']);
            // expect(reqBody).to.have.property('inputSentence', reqRes.userInput);
            return [200, { message: 'success' }];
          });
        }
        const response = await postSession(ex.lessonId, app, {
          message: reqRes.userInput,
          sessionInfo: sessionObj,
          lessonId: ex.lessonId,
        });
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('response');
        expect(response.body.response).to.deep.include.members(
          reqRes.expectedResponse
        );
        expect(response.body).to.have.property('completed');
        sessionObj = response.body.sessionInfo;
      }
    });
  });

  describe('POST', () => {
    const lessonId = 'q1';

    const lessonData: LessonResponse = {
      data: {
        lesson: {
          lessonName: 'navyIntegrity',
          lessonId: 'navyIntegrity',
          intro: 'intro',
          question: 'main',
          expectations: [],
          conclusion: ['a'],
          createdAt: 'affadsas',
          updatedAt: 'fdasasdf',
        },
      },
    };

    const validSessionData: SessionData = {
      dialogState: {
        expectationsCompleted: [false],
        expectationData: [
          {
            ideal: '',
            score: 0,
            satisfied: false,
            status: ExpectationStatus.None,
          },
          {
            ideal: '',
            score: 0,
            satisfied: false,
            status: ExpectationStatus.None,
          },
          {
            ideal: '',
            score: 0,
            satisfied: false,
            status: ExpectationStatus.None,
          },
        ],
        hints: false,
      },
      sessionHistory: {
        classifierGrades: new Array<ClassifierResult>(),
        systemResponses: [
          [
            'Here is a question about integrity, a key Navy attribute. What are the challenges to demonstrating integrity in a group?',
          ],
        ],
        userResponses: new Array<string>(),
        userScores: new Array<number>(),
      },
      sessionId: 'a677e7a8-b09e-4b3b-825d-5073422d42fd',
      previousUserResponse: '',
      previousSystemResponse: [
        'Here is a question about integrity, a key Navy attribute. What are the challenges to demonstrating integrity in a group?',
      ],
    };

    // const promptSessionData: SessionData = {
    //   dialogState: {
    //     expectationsCompleted: [false],
    //     expectationData: [
    //       {
    //         ideal: '',
    //         score: 0,
    //         satisfied: false,
    //         status: ExpectationStatus.None,
    //       },
    //       {
    //         ideal: '',
    //         score: 0,
    //         satisfied: false,
    //         status: ExpectationStatus.None,
    //       },
    //       {
    //         ideal: '',
    //         score: 0,
    //         satisfied: false,
    //         status: ExpectationStatus.None,
    //       },
    //     ],
    //     hints: false,
    //   },
    //   sessionHistory: {
    //     classifierGrades: new Array<ClassifierResult>(),
    //     systemResponses: [
    //       [
    //         'Here is a question about integrity, a key Navy attribute. What are the challenges to demonstrating integrity in a group?',
    //       ],
    //     ],
    //     userResponses: new Array<string>(),
    //     userScores: new Array<number>(),
    //   },
    //   sessionId: 'a677e7a8-b09e-4b3b-825d-5073422d42fd',
    //   previousUserResponse: '',
    //   previousSystemResponse: [
    //     'Here is a question about integrity, a key Navy attribute. What are the challenges to demonstrating integrity in a group?',
    //   ],
    // };

    const completedSessionData: SessionData = {
      dialogState: {
        expectationsCompleted: [true],
        hints: false,
        expectationData: [],
      },
      sessionHistory: {
        classifierGrades: new Array<ClassifierResult>(),
        systemResponses: [
          [
            'Here is a question about integrity, a key Navy attribute. What are the challenges to demonstrating integrity in a group?',
          ],
        ],
        userResponses: new Array<string>(),
        userScores: new Array<number>(),
      },
      sessionId: 'a677e7a8-b09e-4b3b-825d-5073422d42fd',
      previousUserResponse: '',
      previousSystemResponse: [
        'Here is a question about integrity, a key Navy attribute. What are the challenges to demonstrating integrity in a group?',
      ],
    };

    const validSessionDto = dataToDto(validSessionData);

    it('responds with a 404 error if lesson Id passed does not corrospond to a valid lesson', async () => {
      const response = await postDialog('q3', app, {
        lessonId: 'q3',
      });
      expect(response.status).to.equal(404);
    });

    it('responds with a 502 error if 500 error calling classifier', async () => {
      if (mockAxios) {
        mockAxios.reset();
        mockAxios.onPost('/classifier').reply(_ => {
          return [500, {}];
        });
        mockAxios.onPost('/graphql').reply(config => {
          const reqBody = JSON.parse(config.data);
          if ((reqBody.query as string).includes('q1')) {
            return [200, { data: { lesson: navyIntegrityLesson } }];
          } else if ((reqBody.query as string).includes('q2')) {
            return [200, { data: { lesson: currentFlowLesson } }];
          } else {
            const errData: LResponseObject = {
              data: {
                lesson: null,
              },
            };
            return [404, errData];
          }
        });
      }
      const response = await postSession(lessonId, app, {
        message: 'peer pressure',
        sessionInfo: validSessionDto,
      });
      expect(response.status).to.equal(502);
    });

    it('responds with a 404 error if 404 error calling classifier', async () => {
      if (mockAxios) {
        mockAxios.reset();
        mockAxios.onPost('/classifier').reply(_ => {
          return [404, {}];
        });
        mockAxios.onPost('/graphql').reply(config => {
          const reqBody = JSON.parse(config.data);
          if ((reqBody.query as string).includes('q1')) {
            return [200, { data: { lesson: navyIntegrityLesson } }];
          } else if ((reqBody.query as string).includes('q2')) {
            return [200, { data: { lesson: currentFlowLesson } }];
          } else {
            const errData: LResponseObject = {
              data: {
                lesson: null,
              },
            };
            return [404, errData];
          }
        });
      }
      const response = await postSession(lessonId, app, {
        lessonId: lessonId,
        message: 'peer pressure',
        sessionInfo: validSessionDto,
      });
      expect(response.status).to.equal(404);
      expect(response.body).to.have.property(
        'message',
        `classifier cannot find lesson '${lessonId}'`
      );
    });

    it('responds with a 404 error if graphql cannot find lesson', async () => {
      if (mockAxios) {
        mockAxios.reset();
        mockAxios.onPost('/graphql').reply(config => {
          const errData: LResponseObject = {
            data: {
              lesson: null,
            },
          };
          return [200, errData];
        });
      }
      const response = await postSession('q3', app, {
        lessonId: lessonId,
        message: 'peer pressure',
        sessionInfo: validSessionDto,
      });
      expect(response.status).to.equal(404);
      expect(response.body).to.have.property(
        'message',
        `graphql cannot find lesson 'q3'`
      );
    });

    it('returns a score between 0 and 1', async () => {
      if (mockAxios) {
        mockAxios.reset();
        mockAxios.onPost('/classifier').reply(config => {
          return [
            200,
            {
              output: {
                expectationResults: [
                  { evaluation: Evaluation.Good, score: 1.0 },
                  { evaluation: Evaluation.Good, score: 1.0 },
                  { evaluation: Evaluation.Good, score: 1.0 },
                ],
              },
            },
          ];
        });
        mockAxios.onPost('/grading-api').reply(config => {
          return [200, { message: 'success' }];
        });
        mockAxios.onPost('/graphql').reply(config => {
          const reqBody = JSON.parse(config.data);
          if ((reqBody.query as string).includes('q1')) {
            return [200, { data: { lesson: navyIntegrityLesson } }];
          } else if ((reqBody.query as string).includes('q2')) {
            return [200, { data: { lesson: currentFlowLesson } }];
          } else {
            const errData: LResponseObject = {
              data: {
                lesson: null,
              },
            };
            return [404, errData];
          }
        });
      }
      const responseStartSession = await postDialog('q1', app, {
        lessonId: 'q1',
        id: '1',
        user: 'rush',
        UseDB: true,
        ScriptXML: null,
        LSASpaceName: 'English_TASA',
        ScriptURL: null,
      });
      let sessionObj = responseStartSession.body.sessionInfo;
      const response = await postSession(lessonId, app, {
        lessonId: 'q1',
        message: 'peer pressure',
        sessionInfo: sessionObj,
      });

      expect(response.body).to.have.property('score');
      expect(response.body.score).to.be.at.least(0.0);
      expect(response.body.score).to.be.at.most(1.0);
    });

    it('sends the session data to the grader at the end of the dialog', async () => {
      if (mockAxios) {
        mockAxios.reset();
        mockAxios.onPost('/classifier').reply(config => {
          //const reqBody = JSON.parse(config.data);
          return [
            200,
            {
              output: {
                expectationResults: [
                  { evaluation: Evaluation.Good, score: 1.0 },
                  { evaluation: Evaluation.Good, score: 1.0 },
                  { evaluation: Evaluation.Good, score: 1.0 },
                ],
              },
            },
          ];
        });
        mockAxios.onPost('/grading-api').reply(config => {
          return [200, { message: 'success' }];
        });
        mockAxios.onPost('/graphql').reply(config => {
          const reqBody = JSON.parse(config.data);
          if ((reqBody.query as string).includes('q1')) {
            return [200, { data: { lesson: navyIntegrityLesson } }];
          } else if ((reqBody.query as string).includes('q2')) {
            return [200, { data: { lesson: currentFlowLesson } }];
          } else {
            const errData: LResponseObject = {
              data: {
                lesson: null,
              },
            };
            return [404, errData];
          }
        });
      }
      const response = await postSession(lessonId, app, {
        lessonId: 'q1',
        message: 'correct answer',
        sessionInfo: dataToDto(validSessionData),
      });
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('sentToGrader', true);
    });

    it('sends the session information when session is started, along with initial dialog', async () => {
      if (mockAxios) {
        mockAxios.reset();
        mockAxios.onPost('/graphql').reply(config => {
          const reqBody = JSON.parse(config.data);
          if ((reqBody.query as string).includes('q1')) {
            return [200, { data: { lesson: navyIntegrityLesson } }];
          } else if ((reqBody.query as string).includes('q2')) {
            return [200, { data: { lesson: currentFlowLesson } }];
          } else {
            const errData: LResponseObject = {
              data: {
                lesson: null,
              },
            };
            return [404, errData];
          }
        });
      }
      const response = await postDialog(lessonId, app, {
        lessonId: 'q1',
        id: '1',
        user: 'rush',
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
      if (mockAxios) {
        mockAxios.reset();
        mockAxios.onPost('/graphql').reply(config => {
          const reqBody = JSON.parse(config.data);
          if ((reqBody.query as string).includes('q1')) {
            return [200, { data: { lesson: navyIntegrityLesson } }];
          } else if ((reqBody.query as string).includes('q2')) {
            return [200, { data: { lesson: currentFlowLesson } }];
          } else {
            const errData: LResponseObject = {
              data: {
                lesson: null,
              },
            };
            return [404, errData];
          }
        });
      }
      const sessionId = 'some-user-generated-session-id';
      const response = await postDialog(lessonId, app, {
        sessionId: sessionId,
      });
      expect(response.status).to.equal(200);
      expect(response.body).to.have.deep.nested.property(
        'sessionInfo.sessionId',
        sessionId
      );
    });

    it('sends an error if user tries to tamper with the session data', async () => {
      const tampered: SessionDto = dataToDto({
        ...validSessionData,
        sessionHistory: {
          ...validSessionData.sessionHistory,
          userScores: [...validSessionData.sessionHistory.userScores, 10],
        },
      });
      tampered.hash = validSessionDto.hash;
      const response = await postSession(lessonId, app, {
        message: 'peer pressure',
        sessionInfo: tampered,
      });
      expect(response.status).to.equal(403);
    });

    it('sends an error if client sends dialog when the session is complete.', async () => {
      if (mockAxios) {
        mockAxios.reset();
        mockAxios.onPost('/classifier').reply(config => {
          return [
            200,
            {
              output: {
                expectationResults: [
                  { evaluation: Evaluation.Good, score: 1.0 },
                  { evaluation: Evaluation.Good, score: 1.0 },
                  { evaluation: Evaluation.Good, score: 1.0 },
                ],
              },
            },
          ];
        });
        mockAxios.onPost('/grading-api').reply(config => {
          const reqBody = JSON.parse(config.data);
          return [200, { message: 'success' }];
        });
      }
      const completedSession: SessionDto = dataToDto(completedSessionData);
      const response = await postSession(lessonId, app, {
        message: 'another message',
        sessionInfo: completedSession,
      });
      expect(response.status).to.equal(410);
    });

    it('successfully sends a request to the graphql endpoint for data', async () => {
      if (mockAxios) {
        mockAxios.reset();
        mockAxios.onPost('/graphql').reply(config => {
          return [200, lessonData];
        });
      }
      const responseStartSession = await postDialog('navyIntegrity', app, {
        lessonId: 'navyIntegrity',
      });
      expect(responseStartSession.status).to.equal(200);
      expect(responseStartSession.body).to.have.property('response');
      expect(
        (responseStartSession.body.response as OpenTutorResponse[]).map(
          m => m.data
        )
      ).to.eql([{ text: 'intro' }, { text: 'main' }]);
    });

    it('responds with a random positive feedback message from a set of messages', async () => {
      if (mockAxios) {
        mockAxios.reset();
        mockAxios.onPost('/graphql').reply(config => {
          const reqBody = JSON.parse(config.data);
          if ((reqBody.query as string).includes('q1')) {
            return [200, { data: { lesson: navyIntegrityLesson } }];
          } else {
            const errData: LResponseObject = {
              data: {
                lesson: null,
              },
            };
            return [404, errData];
          }
        });
        mockAxios.onPost('/classifier').reply(config => {
          const reqBody = JSON.parse(config.data);
          return [
            200,
            {
              output: {
                expectationResults: [
                  { evaluation: Evaluation.Good, score: 1.0 },
                  { evaluation: Evaluation.Good, score: 0.4 },
                  { evaluation: Evaluation.Good, score: 0.4 },
                ],
              },
            },
          ];
        });
        mockAxios.onPost('/grading-api').reply(config => {
          return [200, { message: 'success' }];
        });
      }
      const response = await postSession(lessonId, app, {
        message: 'peer pressure',
        sessionInfo: validSessionDto,
        lessonId: lessonId,
      });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('response');
      expect(
        (response.body.response as OpenTutorResponse[])
          .filter(m => m.type == ResponseType.FeedbackPositive)
          .map(m => (m.data as TextData).text)[0]
      ).to.be.oneOf(['Great', 'Nicely done!', 'You got it!']);
    });

    it('responds with a random negative feedback message from a set of messages', async () => {
      if (mockAxios) {
        mockAxios.reset();
        mockAxios.onPost('/graphql').reply(config => {
          const reqBody = JSON.parse(config.data);
          if ((reqBody.query as string).includes('q1')) {
            return [200, { data: { lesson: navyIntegrityLesson } }];
          } else {
            const errData: LResponseObject = {
              data: {
                lesson: null,
              },
            };
            return [404, errData];
          }
        });
        mockAxios.onPost('/classifier').reply(config => {
          const reqBody = JSON.parse(config.data);
          return [
            200,
            {
              output: {
                expectationResults: [
                  { evaluation: Evaluation.Bad, score: 1.0 },
                  { evaluation: Evaluation.Good, score: 0.4 },
                  { evaluation: Evaluation.Good, score: 0.4 },
                ],
              },
            },
          ];
        });
        mockAxios.onPost('/grading-api').reply(config => {
          return [200, { message: 'success' }];
        });
      }
      const response = await postSession(lessonId, app, {
        message: 'bad answer',
        sessionInfo: validSessionDto,
        lessonId: lessonId,
      });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('response');
      expect(
        (response.body.response as OpenTutorResponse[])
          .filter(m => m.type == ResponseType.FeedbackNegative)
          .map(m => (m.data as TextData).text)[0]
      ).to.be.oneOf(['Not really.', "That's not right.", "I don't think so."]);
    });

    it('responds with a random neutral feedback message from a set of messages', async () => {
      if (mockAxios) {
        mockAxios.reset();
        mockAxios.onPost('/graphql').reply(config => {
          const reqBody = JSON.parse(config.data);
          if ((reqBody.query as string).includes('q1')) {
            return [200, { data: { lesson: navyIntegrityLesson } }];
          } else {
            const errData: LResponseObject = {
              data: {
                lesson: null,
              },
            };
            return [404, errData];
          }
        });
        mockAxios.onPost('/classifier').reply(config => {
          const reqBody = JSON.parse(config.data);
          return [
            200,
            {
              output: {
                expectationResults: [
                  { evaluation: Evaluation.Good, score: 0.5 },
                  { evaluation: Evaluation.Good, score: 0.4 },
                  { evaluation: Evaluation.Good, score: 0.4 },
                ],
              },
            },
          ];
        });
        mockAxios.onPost('/grading-api').reply(config => {
          return [200, { message: 'success' }];
        });
      }
      const response = await postSession(lessonId, app, {
        message: 'neutral answer',
        sessionInfo: validSessionDto,
        lessonId: lessonId,
      });
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('response');
      expect(
        (response.body.response as OpenTutorResponse[])
          .filter(m => m.type == ResponseType.FeedbackNeutral)
          .map(m => (m.data as TextData).text)[0]
      ).to.be.oneOf(['OK', 'So']);
    });

    it('responds with random hint start message and prompt start message from a set of messages', async () => {
      if (mockAxios) {
        mockAxios.reset();
        mockAxios.onPost('/graphql').reply(config => {
          const reqBody = JSON.parse(config.data);
          if ((reqBody.query as string).includes('q1')) {
            return [200, { data: { lesson: navyIntegrityLesson } }];
          } else {
            const errData: LResponseObject = {
              data: {
                lesson: null,
              },
            };
            return [404, errData];
          }
        });
        mockAxios.onPost('/classifier').reply(config => {
          const reqBody = JSON.parse(config.data);
          return [
            200,
            {
              output: {
                expectationResults: [
                  { evaluation: Evaluation.Good, score: 0.5 },
                  { evaluation: Evaluation.Good, score: 0.4 },
                  { evaluation: Evaluation.Good, score: 0.4 },
                ],
              },
            },
          ];
        });
        mockAxios.onPost('/grading-api').reply(config => {
          return [200, { message: 'success' }];
        });
      }
      const responseHint = await postSession(lessonId, app, {
        message: 'no answer',
        sessionInfo: validSessionDto,
        lessonId: lessonId,
      });

      expect(responseHint.status).to.equal(200);
      expect(responseHint.body).to.have.property('response');
      expect(
        (responseHint.body.response as OpenTutorResponse[])
          .filter(m => m.type == ResponseType.Text)
          .map(m => (m.data as TextData).text)[0]
      ).to.be.oneOf([
        'Consider this.',
        'Let me help you a little.',
        'Think about this.',
        'Lets work through this together.',
      ]);

      const responsePrompt = await postSession(lessonId, app, {
        message: 'no answer',
        sessionInfo: responseHint.body.sessionInfo,
        lessonId: lessonId,
      });
      expect(responsePrompt.status).to.equal(200);
      expect(responsePrompt.body).to.have.property('response');
      expect(
        (responsePrompt.body.response as OpenTutorResponse[])
          .filter(m => m.type == ResponseType.Text)
          .map(m => (m.data as TextData).text)[0]
      ).to.be.oneOf([
        'See if you can get this',
        'Try this.',
        'What about this.',
        'See if you know the answer to this.',
      ]);
    });
  });
});