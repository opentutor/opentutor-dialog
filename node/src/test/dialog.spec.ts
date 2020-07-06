import createApp from 'app';
import axios from 'axios';
import MockAxios from 'axios-mock-adapter';
import { expect } from 'chai';
import { Express } from 'express';
import { all as allScenarios } from 'test/fixtures/scenarios';
import { postDialog, postSession, MOCKING_DISABLED } from './helpers';
import { Evaluation } from 'models/classifier';

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

    const validSessionObj = {
      sessionHistory: {
        userResponses: new Array<string>(),
        systemResponses: [
          'Here is a question about integrity, a key Navy attribute. What are the challenges to demonstrating integrity in a group?',
        ],
        userScores: new Array<number>(),
      },
      sessionId: 'a677e7a8-b09e-4b3b-825d-5073422d42fd',
      previousUserResponse: '',
      previousSystemResponse:
        'Here is a question about integrity, a key Navy attribute. What are the challenges to demonstrating integrity in a group?',
      hash: '14ba63452d31b62cfadb0f4a869ee17a065d05d15bad01d698d4d1141bfbf01f',
    };

    it('responds with a 502 error if 500 error calling classifier', async () => {
      if (mockAxios) {
        mockAxios.reset();
        mockAxios.onPost('/classifier').reply(_ => {
          return [500, {}];
        });
        const response = await postSession(lessonId, app, {
          message: 'peer pressure',
          sessionInfo: validSessionObj,
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
        sessionInfo: validSessionObj,
      });
      expect(response.status).to.equal(404);
      expect(response.body).to.have.property(
        'message',
        `classifier cannot find lesson '${lessonId}'`
      );
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

    it('sends an error if user tries to tinker with the session data', async () => {
      const response = await postSession(lessonId, app, {
        message: 'peer pressure',
        sessionInfo: {
          ...validSessionObj,
          hash: 'something-wrong',
          sessionHistory: {
            ...validSessionObj.sessionHistory,
            userScores: [...validSessionObj.sessionHistory.userScores, 10],
          },
        },
      });
      expect(response.status).to.equal(403);
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
