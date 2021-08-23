import { SessionData, ExpectationStatus } from 'dialog/session-data';
import { Evaluation, ClassifierResult } from 'apis/classifier';

const negativeFeedbackValidSessionData: SessionData = {
  dialogState: {
    expectationsCompleted: [false],
    currentExpectation: 0,
    expectationData: [
      {
        ideal: '',
        score: 0,
        numHints: 1,
        numPrompts: 1,
        satisfied: true,
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
          { expectationId: '2', evaluation: Evaluation.Good, score: 0.4 },
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
        'Here is a question about integrity, a key Navy attribute. What are the challenges to demonstrating integrity in a group?',
      ],
      [
        'Ok.',
        'Why might you allow bad behavior in a group that you normally would not allow yourself to do?',
      ],
    ],
    userResponses: [{ text: 'This answer was wrong', activeExpectation: 0 }],
    userScores: new Array<number>(),
  },
  sessionId: 'a677e7a8-b09e-4b3b-825d-5073422d42fd',
  previousUserResponse: '',
  previousSystemResponse: [
    'How can it affect someone when you correct their behavior?',
  ],
};

export default negativeFeedbackValidSessionData;
