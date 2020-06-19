import createApp from 'app';
import { expect } from 'chai';
import { Express } from 'express';
import request from 'supertest';
import { all as allScenarios } from 'test/fixtures/scenarios';

describe('dialog', () => {
  let app: Express;

  beforeEach(async () => {
    app = await createApp();
  });

  allScenarios.forEach(ex => {
    it.only(`gives expected responses to scenario inputs: ${ex.name}`, async () => {
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
        const response = await request(app)
          .post('/dialog/session')
          .send({
            message: reqRes.userInput,
            sessionInfo: sessionObj,
          });
        console.log(response.body);
        expect(response.body).to.have.property('response');
        expect(response.body.response).to.deep.equal(reqRes.expectedResponse);
        sessionObj = response.body.sessionInfo;
      }
    });
  });
});
