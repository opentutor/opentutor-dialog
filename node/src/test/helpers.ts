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
  app: Express,
  body = {},
  path = ''
): Promise<PostDialogResponse> {
  const endpoint = `${DIALOG_ENDPOINT}/${path}`;
  if (MOCKING_DISABLED) {
    // console.log(`MOCKING_DISABLED and endpoint='${endpoint}'`);
    const response = await axios.post<PostDialogResponse>(endpoint, body);
    // console.log(`axios response=${inspect(response)}`);
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
  app: Express,
  body: any
): Promise<PostDialogResponse> {
  return postDialog(app, body, 'session');
}

export default {
  postDialog,
  postSession,
  MOCKING_DISABLED,
  DIALOG_ENDPOINT,
};
