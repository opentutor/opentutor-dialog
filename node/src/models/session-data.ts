import sha256 from 'crypto-js/sha256';
import 'models/opentutor-response';
import { v4 as uuidv4 } from 'uuid';
import AutoTutorData from './autotutor-data';
import { ClassifierResult } from './classifier';
import OpenTutorResponse, { TextData } from 'models/opentutor-response';

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
  hints: boolean;
}

export interface SessionHistory {
  userResponses: string[];
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

export function addUserDialog(sdp: SessionData, message: string) {
  sdp.previousUserResponse = message;
  sdp.sessionHistory.userResponses.push(message);
}

export function addTutorDialog(
  sdp: SessionData,
  messages: OpenTutorResponse[]
) {
  sdp.previousSystemResponse = messages.map(m => (m.data as TextData).text);
  sdp.sessionHistory.systemResponses.push(sdp.previousSystemResponse);
}

export function addClassifierGrades(
  sdp: SessionData,
  result: ClassifierResult
) {
  sdp.sessionHistory.classifierGrades.push(result);
}

function getHash(sh: string): string {
  return sha256(JSON.stringify(sh), SESSION_SECURITY_KEY).toString();
}

export function newSession(atd: AutoTutorData, sessionId = ''): SessionData {
  const sh = {
    userResponses: new Array<string>(),
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
      expectationsCompleted: atd.expectations.map(() => false),
      hints: false,
    },
  };
}

export function hasHistoryBeenTampered(hist: SessionHistory, hash: string) {
  const newhash = sha256(JSON.stringify(hist), SESSION_SECURITY_KEY).toString();
  return !(newhash == hash);
}

export default SessionData;
