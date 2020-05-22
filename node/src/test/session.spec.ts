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
    it('responds with a 400 error when no session specified', async () => {
      const response = await request(app)
        .post('/session')
        .send();
      expect(response.status).to.equal(400);
    });

    it('responds with a 404 error when no session not found', async () => {
      const response = await request(app)
        .post('/session')
        .send({ sessionId: 'nonExistanceSessionId' });
      expect(response.status).to.equal(400);
    });
  });
});
