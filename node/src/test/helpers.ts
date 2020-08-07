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
