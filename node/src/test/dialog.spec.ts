import createApp from 'app';
import axios from 'axios';
import MockAxios from 'axios-mock-adapter';
import { expect } from 'chai';
import { Express } from 'express';
import { dataToDto, SessionData, SessionDto } from 'models/session-data';
import { ClassifierResult, Evaluation } from 'models/classifier';
import { all as allScenarios } from 'test/fixtures/scenarios';
import { postDialog, postSession, MOCKING_DISABLED } from './helpers';
import { describe, it } from 'mocha';

describe('dialog', () => {
  let app: Express;
  let mockAxios: MockAxios;

  beforeEach(async () => {
    if (!MOCKING_DISABLED) {
      app = await createApp();
      mockAxios = new MockAxios(axios);
    }
  });

  afterEach(() => {
    if (mockAxios) {
      mockAxios.reset();
    }
  });

  describe('POST', () => {
    // it('responds with a 400 error when no session info passed', async () => {
    //   const response = await postDialog(app);
    //   expect(response.status).to.equal(400);
    //   expect(response.body)
    //     .to.have.property('message')
    //     .eql('"lessonId" is required');
    // });
    const lessonId = 'q1';

    const validSessionData: SessionData = {
      dialogState: {
        expectationsCompleted: [false],
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

    const completedSessionData: SessionData = {
      dialogState: {
        expectationsCompleted: [true],
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
    }

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
        const response = await postSession(lessonId, app, {
          message: 'peer pressure',
          sessionInfo: validSessionDto,
        });
        expect(response.status).to.equal(502);
      }
    });

    it('responds with a 404 error if 404 error calling classifier', async () => {
      mockAxios.reset();
      mockAxios.onPost('/classifier').reply(_ => {
        return [404, {}];
      });
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
          const reqBody = JSON.parse(config.data);
          //expect(reqBody).to.have.property('sessionId', sessionObj.sessionId);
          // expect(reqBody).to.have.property('userResponses', ['correct answer']);
          // expect(reqBody).to.have.property('inputSentence', reqRes.userInput);
          return [200, { message: 'success' }];
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
      console.log(responseStartSession.body);
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

    // it('sends the session data to the grader at the end of the dialog', async () => {
    //   if (mockAxios) {
    //     mockAxios.reset();
    //     mockAxios.onPost('/classifier').reply(config => {
    //       const reqBody = JSON.parse(config.data);
    //       console.log('req is ' + JSON.stringify(reqBody, null, 2));
    //       return [
    //         200,
    //         {
    //           output: {
    //             expectationResults: [
    //               { evaluation: Evaluation.Good, score: 1.0 },
    //               { evaluation: Evaluation.Good, score: 1.0 },
    //               { evaluation: Evaluation.Good, score: 1.0 },
    //             ],
    //           },
    //         },
    //       ];
    //     });
    //     mockAxios.onPost('/grading-api').reply(config => {
    //       //const reqBody = JSON.parse(config.data);
    //       // expect(reqBody).to.have.property(
    //       //   'sessionId',
    //       //   validSessionObj.sessionId
    //       // );
    //       // expect(reqBody).to.have.property('userResponses', ['correct answer']);
    //       // expect(reqBody).to.have.property('inputSentence', reqRes.userInput);
    //       return [200, { message: 'success' }];
    //     });
    //   }
    //   const response = await postSession(lessonId, app, {
    //     lessonId: 'q1',
    //     message: 'correct answer',
    //     sessionInfo: validSessionObj,
    //   });
    //   expect(response.status).to.equal(200);
    //   expect(response.body).to.have.property('sentToGrader');
    // });
    // it('responds with 405 if method for dialog or dialog session not POST', async () => {
    //   expect(1).to.eql(2);
    // });

    it('sends the session information when session is started, along with initial dialog', async () => {
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
          //expect(reqBody).to.have.property('sessionId', sessionObj.sessionId);
          // expect(reqBody).to.have.property('userResponses', ['correct answer']);
          // expect(reqBody).to.have.property('inputSentence', reqRes.userInput);
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
  });

  

  allScenarios.forEach(ex => {
    it(`gives expected responses to scenario inputs: ${ex.name}`, async () => {
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
          mockAxios.onPost('/classifier').reply(config => {
            const reqBody = JSON.parse(config.data);
            expect(reqBody).to.have.property('question', ex.lessonId);
            expect(reqBody).to.have.property('inputSentence', reqRes.userInput);
            return [
              reqRes.mockClassifierResponse.status || 200,
              reqRes.mockClassifierResponse.data,
            ];
          });
          mockAxios.onPost('/grading-api').reply(config => {
            const reqBody = JSON.parse(config.data);
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
        sessionObj = response.body.sessionInfo;
      }
    });
  });
});
