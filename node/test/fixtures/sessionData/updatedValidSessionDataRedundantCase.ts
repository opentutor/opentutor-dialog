import { SessionData, ExpectationStatus } from 'dialog/session-data';
import { Evaluation, ClassifierResult } from 'apis/classifier';

const updatedValidSessionDataRedundantCase: SessionData = {
  dialogState: {
    expectationsCompleted: [false, false],
    currentExpectation: 0,
    expectationData: [
      {
        ideal: '',
        score: 0,
        numHints: 3,
        numPrompts: 0,
        satisfied: false,
        status: ExpectationStatus.Active,
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
    hints: true,
    limitHintsMode: false,
    numCorrectStreak: 0,
  },
  sessionHistory: {
    classifierGrades: [
      {
        expectationResults: [
          { expectationId: '0', evaluation: Evaluation.Bad, score: 1.0 },
          { expectationId: '1', evaluation: Evaluation.Good, score: 0.4 },
        ],
        speechActs: {
          metacognitive: {
            expectationId: '',
            evaluation: Evaluation.Good,
            score: 0.5,
          },
          profanity: {
            expectationId: '',
            evaluation: Evaluation.Good,
            score: 0.5,
          },
        },
      },
    ],
    systemResponses: [
      [
        'People considering suicide often have a plan.',
        'If a person loses the means to commit suicide, such as not having their gun, how does this affect their suicide risk?',
      ],
      [
        'Ok.',
        'Compared to when they knew a clear way to commit suicide, does their long term suicide risk change?',
      ],
    ],
    userResponses: [{ text: 'This answer was wrong', activeExpectation: 0 }],
    userScores: new Array<number>(),
  },
  sessionId: 'a677e7a8-b09e-4b3b-825d-5073422d42fd',
  previousUserResponse: 'This answer was wrong',
  previousSystemResponse: [
    'Ok',
    'Compared to when they knew a clear way to commit suicide, does their long term suicide risk change?',
  ],
};

export default updatedValidSessionDataRedundantCase;
