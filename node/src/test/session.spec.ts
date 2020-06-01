import createApp from 'app';
import { expect } from 'chai';
import { Express } from 'express';
import request from 'supertest';

describe('session', () => {
  let app: Express;

  beforeEach(async () => {
    app = await createApp();
  });

  describe('POST', () => {

    it('responds with a 400 error when no session info passed', async () => {
      const response = await request(app)
        .post('/session')
        .send();
      expect(response.status).to.equal(400);
    });

    it("should send a question to the user to initiate dialog when session is started", async () => {
          const response = await request(app)
              .post('/session')
              .send({
                  Id: '1',
                  User: 'rush',
                  UseDB: true,
                  ScriptXML: null,
                  LSASpaceName: "English_TASA",
                  ScriptURL: null
              });
          expect(response.status).to.equal(200);
          console.log(response.body.data);
          var data = JSON.parse(response.body.data);
          expect(data).to.have.property('questionText');
    });

    it('upon accepting the users response to the question, it should respond appropriately' , async () => {
        const response = await request(app)
            .post('/session')
            .send({
                Id: '1',
                User: 'rush',
                UseDB: true,
                ScriptXML: null,
                LSASpaceName: "English_TASA",
                ScriptURL: null
            });
        const response2 = await request(app)
            .post('/session/dialog')
            .send({
                message: 'Some message',
                turn: 1
            });

        expect(response2.body).to.have.property('dialog');
        console.log('response from API is ' + response2.body.dialog);
    });

    // it('should read the user\'s initial response and respond appropriately', async () => {
    //   const response = await request(app)
    //       .post('/session')
    //       .send({
    //           Id: '1',
    //           User: 'rush',
    //           UseDB: true,
    //           ScriptXML: null,
    //           LSASpaceName: "English_TASA",
    //           ScriptURL: null
    //       });
    //   expect(response.body.data).to.have.property('promptMessage');
    // });


    //   //reference text given by Larry on fixtures
    //   [
    //   {
    //     inputAnswer: 'it catches fire',
    //     expectedResponseCategory: 'good',
    //     expectedResponseScore: 1.0,
    //   },
    //   {
    //     inputAnswer: 'it turns red',
    //     expectedResponseCategory: 'bad',
    //     expectedResponseScore: 0.0,
    //   },
    // ].forEach(ex => {
    //   it(`responds with good|bad + score when user passes answer: ${ex.inputAnswer}`, async () => {
    //     const response = await request(app)
    //       .post('/session')
    //       .send({ sessionId: 'nonExistanceSessionId' });
    //     console.log(response.body);
    //
    //     expect(response.status).to.equal(400);
    //     expect(response.body).to.have.property(
    //       'category',
    //       ex.expectedResponseCategory
    //     );
    //     expect(response.body).to.have.property(
    //       'score',
    //       ex.expectedResponseScore
    //     );
    //   });
    // });



  });
});
