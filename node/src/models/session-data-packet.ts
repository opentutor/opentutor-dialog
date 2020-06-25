import sha256 from 'crypto-js/sha256';
import 'models/opentutor-response';
import { v4 as uuidv4 } from 'uuid';
import AutoTutorData from './autotutor-data';

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
  userScores: number[];
  systemResponses: string[][];
}

export function addUserDialog(sdp: SessionDataPacket, message: string) {
  sdp.previousUserResponse = message;
  sdp.sessionHistory.userResponses.push(message);
  // console.log('added user response');
}

export function addTutorDialog(sdp: SessionDataPacket, message: string[]) {
  sdp.previousSystemResponse = message;
  sdp.sessionHistory.systemResponses.push(message);
}

//updates the hash for the object
export function updateHash(sdp: SessionDataPacket) {
  // console.log('message is ',JSON.stringify(this.sessionHistory));
  sdp.hash = getHash(sdp.sessionHistory);
}

function getHash(sh: SessionHistory): string {
  return sha256(JSON.stringify(sh), SESSION_SECURITY_KEY).toString();
}

export function newSessionDataPacket(atd: AutoTutorData): SessionDataPacket {
  const sh = {
    userResponses: new Array<string>(),
    systemResponses: new Array<string[]>(),
    userScores: new Array<number>(),
  };
  return {
    sessionHistory: sh,
    sessionId: uuidv4(),
    previousUserResponse: '',
    previousSystemResponse: [],
    dialogState: {
      expectationsCompleted: atd.expectations.map(x => false),
      hints: false,
    },
    hash: getHash(sh),
    // dialogState: 'MQ',
  };
}

//returns true if history has been tampered
export function hasHistoryBeenTampered(hist: SessionHistory, hash: string) {
  // console.log('provided hash is ' + hash);
  // console.log(hist);

  const newhash = sha256(JSON.stringify(hist), SESSION_SECURITY_KEY).toString();
  // console.log('new hash is ' + newhash);
  return !(newhash == hash);
}