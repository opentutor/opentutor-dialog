import { SessionData, ExpectationStatus } from 'dialog/session-data';
import { Evaluation } from 'apis/classifier';

const answerWrongNoHintsLeft: SessionData = {
  dialogState: {
    expectationsCompleted: [false, false, false],
    currentExpectation: 0,
    expectationData: [
      {
        ideal: '',
        score: 0,
        numHints: 1,
        numPrompts: 1,
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
        "Sorry, it looks like that wasn't on the board.",
        'Why might you allow bad behavior in a group that you normally would not allow yourself to do?',
      ],
    ],
    userResponses: [{ text: 'This answer was wrong', activeExpectation: 0 }],
    userScores: new Array<number>(),
  },
  sessionId: 'a677e7a8-b09e-4b3b-825d-5073422d42fd',
  previousUserResponse: 'bad answer',
  previousSystemResponse: ['What might cause you to lower your standards?'],
};

export default answerWrongNoHintsLeft;
