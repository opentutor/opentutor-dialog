import { SessionData, ExpectationStatus } from 'dialog/session-data';
import { Evaluation } from 'apis/classifier';

const scoreGoodButNotPerfect: SessionData = {
  dialogState: {
    expectationsCompleted: [true, true, false],
    currentExpectation: 2,
    expectationData: [
      {
        ideal: '',
        score: 0,
        numHints: 1,
        numPrompts: 1,
        satisfied: true,
        status: ExpectationStatus.Complete,
      },
      {
        ideal: '',
        score: 0,
        numHints: 1,
        numPrompts: 0,
        satisfied: true,
        status: ExpectationStatus.Complete,
      },
      {
        ideal: '',
        score: 0,
        numHints: 1,
        numPrompts: 0,
        satisfied: false,
        status: ExpectationStatus.Active,
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
          { expectationId: '0', evaluation: Evaluation.Good, score: 0.4 },
          { expectationId: '1', evaluation: Evaluation.Good, score: 0.4 },
          { expectationId: '2', evaluation: Evaluation.Good, score: 0.8 },
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
        'Right. But there are still more answers.',
        'How can it affect someone when you correct their behavior?',
      ],
    ],
    userResponses: [
      { text: 'correct answer for expectation 0', activeExpectation: -1 },
      { text: 'correct answer for expectation 1', activeExpectation: 1 },
    ],
    userScores: [0.7, 0.8],
  },
  sessionId: 'a677e7a8-b09e-4b3b-825d-5073422d42fd',
  previousUserResponse: 'good answer for expectation 2',
  previousSystemResponse: [
    "Good. Now what's another answer?",
    "How can it affect you when you correct someone's behavior?",
  ],
};

export default scoreGoodButNotPerfect;
