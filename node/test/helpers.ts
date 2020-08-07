/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import yn from 'yn';
import axios from 'axios';
import { Express } from 'express';
import request from 'supertest';
import { inspect } from 'util';

export const MOCKING_DISABLED = yn(process.env.MOCKING_DISABLED || 0);
export const DIALOG_ENDPOINT = process.env.DIALOG_ENDPOINT || '/dialog';

interface PostDialogResponse {
  status: number;
  body: any;
}

export async function postDialog(
  questionId: string,
  app: Express,
  body = {},
  path = ''
): Promise<PostDialogResponse> {
  const endpoint = `${DIALOG_ENDPOINT}/${questionId}/${path}`;
  if (MOCKING_DISABLED) {
    const response = await axios.post<PostDialogResponse>(endpoint, body);
    return {
      status: response.status,
      body: response.data,
    };
  }
  return await request(app)
    .post(endpoint)
    .send(body);
}

export async function postSession(
  questionId: string,
  app: Express,
  body: any
): Promise<PostDialogResponse> {
  return postDialog(questionId, app, body, 'session');
}

export default {
  postDialog,
  postSession,
  MOCKING_DISABLED,
  DIALOG_ENDPOINT,
};
