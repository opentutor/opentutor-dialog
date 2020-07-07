import sha256 from 'crypto-js/sha256';
import 'models/opentutor-response';
import { v4 as uuidv4 } from 'uuid';
import AutoTutorData from './autotutor-data';
import { ClassifierResult } from './classifier';
import OpenTutorResponse, { TextData } from 'models/opentutor-response';

const SESSION_SECURITY_KEY =
  process.env.SESSION_SECURITY_KEY || 'qLUMYtBWTVtn3vVGtGZ5';

export default interface SessionDataPacket {
  sessionId: string;
  sessionHistory: SessionHistory;
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

export function addUserDialog(sdp: SessionDataPacket, message: string) {
  sdp.previousUserResponse = message;
  sdp.sessionHistory.userResponses.push(message);
}

export function addTutorDialog(
  sdp: SessionDataPacket,
  messages: OpenTutorResponse[]
) {
  sdp.previousSystemResponse = messages.map(m => (m.data as TextData).text);
  sdp.sessionHistory.systemResponses.push(sdp.previousSystemResponse);
}

export function addClassifierGrades(
  sdp: SessionDataPacket,
  result: ClassifierResult
) {
  //console.log('adding to session history');
  // console.log(result);
  sdp.sessionHistory.classifierGrades.push(result);
  // console.log('done');
}

//updates the hash for the object
export function updateHash(sdp: SessionDataPacket) {
  sdp.hash = getHash(sdp.sessionHistory);
}

function getHash(sh: SessionHistory): string {
  return sha256(JSON.stringify(sh), SESSION_SECURITY_KEY).toString();
}

export function newSessionDataPacket(
  atd: AutoTutorData,
  sessionId = ''
): SessionDataPacket {
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
    hash: getHash(sh),
  };
}

export function hasHistoryBeenTampered(hist: SessionHistory, hash: string) {
  const newhash = sha256(JSON.stringify(hist), SESSION_SECURITY_KEY).toString();
  return !(newhash == hash);
}
