import createApp from 'app';
import { expect } from 'chai';
import { Express } from 'express';
import request from 'supertest';

describe('dialog', () => {
  let app: Express;

  beforeEach(async () => {
    app = await createApp();
  });

  describe('POST', () => {
    it('responds with a 400 error when no session info passed', async () => {
      const response = await request(app)
        .post('/dialog')
        .send();
      expect(response.status).to.equal(400);
    });

    it('sends the session information when session is started, along with initial dialog', async () => {
      const response = await request(app)
        .post('/dialog')
        .send({
          Id: '1',
          User: 'rush',
          UseDB: true,
          ScriptXML: null,
          LSASpaceName: 'English_TASA',
          ScriptURL: null,
        });
      expect(response.status).to.equal(200);
      // console.log(response.body.sessionInfo);
      const data = response.body.data;
      expect(data).to.have.property('questionText');
      expect(response.body).to.have.property('sessionInfo');
      // console.log('OpenTutor says:  ' + response.body.dialog);
    });

    [
      {
        inputAnswer: 'Peer pressure',
        turn: 1,
        expectedResponse:
          "How can it affect you when you correct someone's behavior?",
        sessionObj: {
          sessionHistory: {
            userResponses: [],
            systemResponses: [
              'Here is a question about integrity, a key Navy attribute. What are the challenges to demonstrating integrity in a group?',
            ],
            userScores: [],
          },
          sessionID: 'a677e7a8-b09e-4b3b-825d-5073422d42fd',
          previousUserResponse: '',
          previousSystemResponse:
            'Here is a question about integrity, a key Navy attribute. What are the challenges to demonstrating integrity in a group?',
          hash:
            '14ba63452d31b62cfadb0f4a869ee17a065d05d15bad01d698d4d1141bfbf01f',
        },
      },
      {
        inputAnswer: 'Enforcing the rules can make you unpopular.',
        turn: 2,
        expectedResponse:
          'How can it affect someone when you correct their behavior?',
        sessionObj: {
          sessionHistory: {
            userResponses: ['Peer pressure'],
            systemResponses: [
              'Here is a question about integrity, a key Navy attribute. What are the challenges to demonstrating integrity in a group?',
              "So. Look at it this way. How can it affect you when you correct someone's behavior?",
            ],
            userScores: [],
          },
          sessionID: 'a677e7a8-b09e-4b3b-825d-5073422d42fd',
          previousUserResponse: 'Peer pressure',
          previousSystemResponse:
            "So. Look at it this way. How can it affect you when you correct someone's behavior?",
          hash:
            '06dbd1f6eddcaa54fe4c18249231e2c0c4888d90e9af6e99fd87836687c69e72',
        },
      },
      {
        inputAnswer:
          "If you correct someone's behavior, you may get them in trouble or it may be harder to work with them.",
        turn: 3,
        expectedResponse:
          "Peer pressure can push you to allow and participate in inappropriate behavior.\nWhen you correct somone's behavior, you may get them in trouble or negatively impact your relationship with them.\nHowever, integrity means speaking out even when it is unpopular.\n AutoTutor has terminated the session. Re-open the chat window to start a new test.",
        sessionObj: {
          sessionHistory: {
            userResponses: [
              'Peer pressure',
              'Enforcing the rules can make you unpopular.',
            ],
            systemResponses: [
              'Here is a question about integrity, a key Navy attribute. What are the challenges to demonstrating integrity in a group?',
              "So. Look at it this way. How can it affect you when you correct someone's behavior?",
              "Yeah, that's right. Let's try this together. How can it affect someone when you correct their behavior?",
            ],
            userScores: [],
          },
          sessionID: 'a677e7a8-b09e-4b3b-825d-5073422d42fd',
          previousUserResponse: 'Enforcing the rules can make you unpopular.',
          previousSystemResponse:
            "Yeah, that's right. Let's try this together. How can it affect someone when you correct their behavior?",
          hash:
            'a5e005a1fd52139495375575c6acf7844c0277880032c9d318cb14d15f113c75',
        },
      },
    ].forEach(ex => {
      it('upon accepting the users response to the question, it should respond appropriately', async () => {
        const response2 = await request(app)
          .post('/dialog/session')
          .send({
            message: ex.inputAnswer,
            sessionInfo: ex.sessionObj,
          });

        const sessionObj = response2.body.sessionInfo;
        // console.log(sessionObj);
        expect(response2.body).to.have.property('dialog');
        expect(response2.body.dialog).to.have.string(ex.expectedResponse);
        // console.log('OpenTutor says:  ' + response2.body.dialog);
      });
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
        sessionID: 'a677e7a8-b09e-4b3b-825d-5073422d42fd',
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
