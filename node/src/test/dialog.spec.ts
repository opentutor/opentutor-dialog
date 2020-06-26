import createApp from 'app';
import axios from 'axios';
import MockAxios from 'axios-mock-adapter';
import { expect } from 'chai';
import { Express } from 'express';

import request from 'supertest';
import { all as allScenarios } from 'test/fixtures/scenarios';
// import OpenTutorResponse from 'models/opentutor-response';

describe('dialog', () => {
  let app: Express;
  let mockAxios: MockAxios;

  beforeEach(async () => {
    app = await createApp();
    mockAxios = new MockAxios(axios);
  });

  afterEach(() => {
    mockAxios.reset();
  });

  describe('POST', () => {
    // it('responds with a 400 error when no session info passed', async () => {
    //   const response = await request(app)
    //     .post('/dialog')
    //     .send();
    //   expect(response.status).to.equal(400);
    // });

    it('sends the session information when session is started, along with initial dialog', async () => {
      const response = await request(app)
        .post('/dialog')
        .send({
          id: '1',
          user: 'rush',
          UseDB: true,
          ScriptXML: null,
          LSASpaceName: 'English_TASA',
          ScriptURL: null,
        });
      expect(response.status).to.equal(200);
      // console.log(response.body.sessionInfo);
      expect(response.body).to.have.property('response');
      expect(response.body).to.have.property('sessionInfo');
      // console.log(response.body.sessionInfo);
    });

    it('sends an error if user tries to tinker with the session data', async () => {
      const sessionObj = {
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
        hash:
          '14ba63452d31b62cfadb0f4a869ee17a065d05d15bad01d698d4d1141bfbf01f',
      };
      //tinker with the scores
      sessionObj.sessionHistory.userScores.push(10);
      const response3 = await request(app)
        .post('/dialog/session')
        .send({
          message: 'peer pressure',
          sessionInfo: sessionObj,
        });
      // console.log(response3);
      expect(response3.status).to.equal(403);
    });
  });

  allScenarios.forEach(ex => {
    it(`gives expected responses to scenario inputs: ${ex.name}`, async () => {
      const responseStartSession = await request(app)
        .post('/dialog')
        .send({
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
        mockAxios.reset();
        mockAxios.onPost('/classifier').reply(config => {
          return [
            reqRes.mockClassifierResponse.status || 200,
            reqRes.mockClassifierResponse.data,
          ];
        });
        const response = await request(app)
          .post('/dialog/session')
          .send({
            message: reqRes.userInput,
            sessionInfo: sessionObj,
          });
        console.log(response.body);
        expect(response.body).to.have.property('response');
        expect(response.body.response).to.deep.include.members(
          reqRes.expectedResponse
        );
        sessionObj = response.body.sessionInfo;
      }
    });
  });
});
