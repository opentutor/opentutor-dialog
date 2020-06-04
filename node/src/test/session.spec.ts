// import createApp from 'app';
// import { expect } from 'chai';
// import { Express } from 'express';
// import request from 'supertest';

// describe('session', () => {
//   let app: Express;

//   beforeEach(async () => {
//     app = await createApp();
//   });

//   describe('POST', () => {
//     it('responds with a 400 error when user does not pass answer', async () => {
//       const response = await request(app)
//         .post('/session')
//         .send();
//       expect(response.status).to.equal(400);
//     });

//     [
//       {
//         inputAnswer: 'it catches fire',
//         expectedResponseCategory: 'good',
//         expectedResponseScore: 1.0,
//       },
//       {
//         inputAnswer: 'it turns red',
//         expectedResponseCategory: 'bad',
//         expectedResponseScore: 0.0,
//       },
//     ].forEach(ex => {
//       it(`responds with good|bad + score when user passes answer: ${ex.inputAnswer}`, async () => {
//         const response = await request(app)
//           .post('/session')
//           .send({ sessionId: 'nonExistanceSessionId' });
//         expect(response.status).to.equal(400);
//         expect(response.body).to.have.property(
//           'category',
//           ex.expectedResponseCategory
//         );
//         expect(response.body).to.have.property(
//           'score',
//           ex.expectedResponseScore
//         );
//       });
//     });
//   });
// });
