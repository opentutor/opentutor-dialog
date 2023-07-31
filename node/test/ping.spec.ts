/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import createApp from 'app';
import { Express } from 'express';
import { expect } from 'chai';
import request from 'supertest';
import { DIALOG_ENDPOINT } from './helpers';
import { DialogScenario } from 'test/fixtures/types';
import { findAll as findAllScenarios } from 'test/fixtures/scenarios';
import { findAll as findAllLessons } from 'test/fixtures/lessons';
import { Lesson } from 'apis/lessons';

describe('ping', () => {
  let app: Express;

  beforeEach(async () => {
    app = await createApp();
  });

  it('responds with a 200 status', async () => {
    const response = await request(app).get(`${DIALOG_ENDPOINT}/ping`).send();
    expect(response.status).to.equal(200);
  });

  it('loads lessons and sessions', async () => {
    const allScenarios: DialogScenario[] = await findAllScenarios();
    const allLessons: Lesson[] = await findAllLessons();
    expect(allScenarios).to.not.be.empty;
    expect(allLessons).to.not.be.empty;
  });
});
