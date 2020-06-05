import createApp from 'app';
import { expect } from 'chai';
import { Express } from 'express';
import request from 'supertest';
import { ATSessionPacket } from '../models/SessionDataPacket';
import logger from 'utils/logging';

describe('session', () => {
  let app: Express;

  beforeEach(async () => {
    app = await createApp();
  });

  let sessionObj: ATSessionPacket;
  describe('POST', () => {
    it('responds with a 400 error when no session info passed', async () => {
      const response = await request(app)
        .post('/session')
        .send();
      expect(response.status).to.equal(400);
    });

    it('sends the session information when session is started, along with initial dialog', async () => {
      const response = await request(app)
        .post('/session')
        .send({
          Id: '1',
          User: 'rush',
          UseDB: true,
          ScriptXML: null,
          LSASpaceName: 'English_TASA',
          ScriptURL: null,
        });
      expect(response.status).to.equal(200);
      // console.log(response);
      const data = JSON.parse(response.body.data);
      expect(data).to.have.property('questionText');
      expect(response.body).to.have.property('sessionInfo');
      sessionObj = JSON.parse(response.body.sessionInfo);
      // console.log('OpenTutor says:  ' + response.body.dialog);
    });

    it('goes through the Navy Integrity Script', async () => {
      [
        {
          inputAnswer: 'Peer pressure',
          turn: 1,
          expectedResponse:
            "How can it affect you when you correct someone's behavior?",
        },
        {
          inputAnswer: 'Enforcing the rules can make you unpopular.',
          turn: 2,
          expectedResponse:
            'How can it affect someone when you correct their behavior?',
        },
        {
          inputAnswer:
            "If you correct someone's behavior, you may get them in trouble or it may be harder to work with them.",
          turn: 3,
          expectedResponse:
            "Peer pressure can push you to allow and participate in inappropriate behavior.\nWhen you correct somone's behavior, you may get them in trouble or negatively impact your relationship with them.\nHowever, integrity means speaking out even when it is unpopular.\n AutoTutor has terminated the session. Re-open the chat window to start a new test.",
        },
      ].forEach(ex => {
        it('upon accepting the users response to the question, it should respond appropriately', async () => {
          const response2 = await request(app)
            .post('/session/dialog')
            .send({
              message: ex.inputAnswer,
              sessionInfo: JSON.stringify(sessionObj),
            });

          sessionObj = response2.body.sessionInfo;
          // console.log(response2);
          expect(response2.body).to.have.property('dialog');
          expect(response2.body.dialog).to.have.string(ex.expectedResponse);
          // console.log('OpenTutor says:  ' + response2.body.dialog);
        });
      });
    });

    it('sends an error if user tries to tinker with the session data', async () => {
      //pass a different session history object
      sessionObj.sessionHistory.userScores.push(10);
      const response3 = await request(app)
        .post('/session/dialog')
        .send({
          message: 'peer pressure',
          sessionInfo: JSON.stringify(sessionObj),
        });
      // console.log(response3);
      expect(response3.status).to.equal(403);
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
