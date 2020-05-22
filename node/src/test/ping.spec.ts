import createApp from 'app';
import { Express } from 'express';
import { expect } from 'chai';
import request from 'supertest';

describe('ping', () => {
  let app: Express;

  beforeEach(async () => {
    app = await createApp();
  });

  it('responds with a 200 status', async () => {
    const response = await request(app)
      .get('/ping')
      .send();
    expect(response.status).to.equal(200);
  });
});
