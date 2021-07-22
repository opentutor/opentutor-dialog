/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import sha256 from 'crypto-js/sha256';
import hmacSHA512 from 'crypto-js/hmac-sha512';
import Base64 from 'crypto-js/enc-base64';
import 'dialog/response-data';
import { v4 as uuidv4 } from 'uuid';
import { Lesson } from 'apis/lessons';
import { ClassifierResult } from 'apis/classifier';
import OpenTutorResponse, { TextData } from 'dialog/response-data';

const SESSION_SECURITY_KEY =
  process.env.SESSION_SECURITY_KEY || 'qLUMYtBWTVtn3vVGtGZ5';

export interface SessionData {
  sessionId: string;
  sessionHistory: SessionHistory;
  previousUserResponse: string;
  previousSystemResponse: string[];
  dialogState: DialogState;
}

export interface SessionDto {
  sessionId: string;
  sessionHistory: string;
  previousUserResponse: string;
  previousSystemResponse: string[];
  dialogState: DialogState;
  hash: string;
}

export interface DialogState {
  expectationsCompleted: boolean[];
  expectationData: ExpectationData[];
  currentExpectation: number;
  hints: boolean;
  limitHintsMode: boolean;
}

export enum ExpectationStatus {
  Active = 'active',
  Complete = 'complete',
  None = 'none',
}

export interface ExpectationData {
  ideal: string;
  score: number;
  numHints: number;
  numPrompts: number;
  satisfied: boolean;
  status: ExpectationStatus;
}

export interface UserResponse {
  text: string;
  activeExpectation: number;
}

export interface SessionHistory {
  userResponses: UserResponse[];
  classifierGrades: ClassifierResult[];
  userScores: number[];
  systemResponses: string[][];
}

export function dtoToData(d: SessionDto): SessionData {
  return {
    sessionId: d.sessionId,
    sessionHistory: JSON.parse(d.sessionHistory) as SessionHistory,
    previousUserResponse: d.previousUserResponse,
    previousSystemResponse: d.previousSystemResponse,
    dialogState: d.dialogState,
  };
}

export function dataToDto(d: SessionData): SessionDto {
  const sh = JSON.stringify(d.sessionHistory);
  return {
    sessionId: d.sessionId,
    sessionHistory: sh,
    previousUserResponse: d.previousUserResponse,
    previousSystemResponse: d.previousSystemResponse,
    dialogState: d.dialogState,
    hash: getHash(sh),
  };
}

export function addUserDialog(sdp: SessionData, message: string): void {
  sdp.previousUserResponse = message;
  sdp.sessionHistory.userResponses.push({
    text: message,
    activeExpectation: sdp.dialogState.currentExpectation,
  });
}

export function addTutorDialog(
  sdp: SessionData,
  messages: OpenTutorResponse[]
): void {
  sdp.previousSystemResponse = messages.map((m) => (m.data as TextData).text);
  sdp.sessionHistory.systemResponses.push(sdp.previousSystemResponse);
}

export function addClassifierGrades(
  sdp: SessionData,
  result: ClassifierResult
): void {
  sdp.sessionHistory.classifierGrades.push(result);
}

function getHash(sh: string): string {
  return Base64.stringify(hmacSHA512(sha256(sh), SESSION_SECURITY_KEY));
}

export function newSession(lesson: Lesson, sessionId = ''): SessionData {
  const sh = {
    userResponses: new Array<UserResponse>(),
    systemResponses: new Array<string[]>(),
    userScores: new Array<number>(),
    classifierGrades: new Array<ClassifierResult>(),
  };
  return {
    sessionHistory: sh,
    sessionId: sessionId || uuidv4(),
    previousUserResponse: '',
    previousSystemResponse: [],
    dialogState: {
      expectationsCompleted: lesson.expectations.map(() => false),
      expectationData: newExpectationData(lesson),
      currentExpectation: -1,
      hints: false,
      limitHintsMode: false,
    },
  };
}

export function newExpectationData(lesson: Lesson): ExpectationData[] {
  return lesson.expectations.map(() => {
    return {
      ideal: '',
      score: 0,
      dialogScore: 0,
      numPrompts: 0,
      numHints: 0,
      satisfied: false,
      status: ExpectationStatus.None,
    };
  });
}

export function hasHistoryBeenTampered(
  hist: SessionHistory,
  hash: string
): boolean {
  return hash !== getHash(JSON.stringify(hist));
}

export default SessionData;
