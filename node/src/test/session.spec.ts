// import createApp from 'app';
// import { expect } from 'chai';
// import { Express } from 'express';
// import request from 'supertest';
// import OpenTutorResponse, {
//   createTextResponse,
// } from 'models/opentutor-response';
// import SessionDataPacket from 'models/session-data-packet';

// // var _ = require('lodash');

// const newsessionstate: SessionDataPacket = {
//   sessionHistory: {
//     userResponses: ['Peer pressure'],
//     systemResponses: [
//       [
//         'Here is a question about integrity, a key Navy attribute.',
//         'What are the challenges to demonstrating integrity in a group?',
//       ],
//       [
//         'So.',
//         'Look at it this way.',
//         "How can it affect you when you correct someone's behavior?",
//       ],
//     ],
//     userScores: [],
//   },
//   sessionId: 'dee7c0b4-8383-41ba-bfe8-0767d56afdb0',
//   previousUserResponse: 'Peer pressure',
//   previousSystemResponse: [
//     'So.',
//     'Look at it this way.',
//     "How can it affect you when you correct someone's behavior?",
//   ],
//   hash: 'a1fab68d2ca67b56e4f32a311a7e184762f30400e095528027e7c43b1106be9b',
// };

// describe('SESSION', () => {
//   let app: Express;

//   beforeEach(async () => {
//     app = await createApp();
//   });

//   it('returns positive feedback if the user gives an answer that satisfies match the active expectation', async () => {
//     const response = await request(app)
//       .post('/dialog/session')
//       .send({
//         message:
//           "If you correct someone's behavior, you may get them in trouble or it may be harder to work with them.",
//         sessionInfo: newsessionstate,
//       });

//     //find intersection between possibleresponses and response.body.response

//     const resultresponses: OpenTutorResponse[] = response.body.response;
//     const possibleresponses: OpenTutorResponse[] = createTextResponse([
//       "Yeah, that's right.",
//       'Good',
//       'Great',
//     ]);

//     const result: OpenTutorResponse[] = [];
//     possibleresponses.forEach(i => {
//       resultresponses.forEach(j => {
//         if (JSON.stringify(i) === JSON.stringify(j)) {
//           result.push(i);
//         }
//       });
//     });

//     expect(result).to.not.be.empty;
//     // The below approaches have failed.
//     // expect(_.intersection([1, 2], [2, 3])).not.to.be.empty;
//     //expect(_.intersection([possibleresponses[0]],response.body.response)).to.not.be.empty;
//     // expect([possibleresponses[0]].filter(value => response.body.response.includes(value))).to.not.be.empty;
//     // expect(response.body.response).to.deep.include.any.members([possibleresponses[0]]);
//     // console.log();
//     // console.log(_.intersection(response.body.response));
//     // expect().not.to.be.empty;
//   });

//   it(
//     "returns a prompt if the user gives an answer that doesn't satisfies the active expectation"
//   );

//   it(
//     'returns negative response, followed by assertion, if user gives an incorrect answer'
//   );
//   it('returns a set of expectation scores for each user answer');
// });
