import {
  SessionData,
  ExpectationStatus,
  UserResponse,
} from 'dialog/session-data';
import { Evaluation, ClassifierResult } from 'apis/classifier';

export const basicSessionData: SessionData = {
  dialogState: {
    expectationsCompleted: [false],
    currentExpectation: -1,
    expectationData: [
      {
        ideal: '',
        score: 0,
        numHints: 0,
        numPrompts: 0,
        satisfied: false,
        status: ExpectationStatus.None,
      },
      {
        ideal: '',
        score: 0,
        numHints: 0,
        numPrompts: 0,
        satisfied: false,
        status: ExpectationStatus.None,
      },
      {
        ideal: '',
        score: 0,
        numHints: 0,
        numPrompts: 0,
        satisfied: false,
        status: ExpectationStatus.None,
      },
    ],
    hints: false,
    limitHintsMode: false,
    numCorrectStreak: 0,
  },
  sessionHistory: {
    classifierGrades: new Array<ClassifierResult>(),
    systemResponses: [
      [
        'Here is a question about integrity, a key Navy attribute. What are the challenges to demonstrating integrity in a group?',
      ],
    ],
    userResponses: new Array<UserResponse>(),
    userScores: new Array<number>(),
  },
  sessionId: 'a677e7a8-b09e-4b3b-825d-5073422d42fd',
  previousUserResponse: '',
  previousSystemResponse: [
    'Here is a question about integrity, a key Navy attribute. What are the challenges to demonstrating integrity in a group?',
  ],
};

export const completedSessionData: SessionData = {
  dialogState: {
    expectationsCompleted: [true],
    currentExpectation: -1,
    hints: false,
    expectationData: [],
    limitHintsMode: false,
    numCorrectStreak: 0,
  },
  sessionHistory: {
    classifierGrades: new Array<ClassifierResult>(),
    systemResponses: [
      [
        'Here is a question about integrity, a key Navy attribute. What are the challenges to demonstrating integrity in a group?',
      ],
    ],
    userResponses: new Array<UserResponse>(),
    userScores: new Array<number>(),
  },
  sessionId: 'a677e7a8-b09e-4b3b-825d-5073422d42fd',
  previousUserResponse: '',
  previousSystemResponse: [
    'Here is a question about integrity, a key Navy attribute. What are the challenges to demonstrating integrity in a group?',
  ],
};
