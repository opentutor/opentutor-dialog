import { Evaluation } from 'apis/classifier';

export const expectationResult1 = {
  output: {
    expectationResults: [
      {
        expectationId: '2',
        evaluation: Evaluation.Good,
        score: 0.5,
      },
      {
        expectationId: '3',
        evaluation: Evaluation.Good,
        score: 0.4,
      },
      {
        expectationId: '4',
        evaluation: Evaluation.Good,
        score: 0.4,
      },
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
};
