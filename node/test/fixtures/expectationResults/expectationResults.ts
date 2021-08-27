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

export const expectationResult2 = {
  output: {
    expectationResults: [
      { evaluation: Evaluation.Good, score: 1.0 },
      { evaluation: Evaluation.Good, score: 1.0 },
      { evaluation: Evaluation.Good, score: 1.0 },
    ],
    speechActs: {
      metacognitive: { evaluation: Evaluation.Good, score: 0.5 },
      profanity: { evaluation: Evaluation.Good, score: 0.5 },
    },
  },
};

export const expectationResult3 = expectationResult2;

export const expectationResult4 = {
  output: {
    expectationResults: [
      { evaluation: Evaluation.Good, score: 1.0 },
      { evaluation: Evaluation.Good, score: 0.4 },
      { evaluation: Evaluation.Good, score: 0.4 },
    ],
    speechActs: {
      metacognitive: { evaluation: Evaluation.Good, score: 0.5 },
      profanity: { evaluation: Evaluation.Good, score: 0.5 },
    },
  },
};

export const expectationResult5 = {
  output: {
    expectationResults: [
      { evaluation: Evaluation.Good, score: 0.5 },
      { evaluation: Evaluation.Good, score: 0.4 },
      { evaluation: Evaluation.Good, score: 0.4 },
    ],
    speechActs: {
      metacognitive: { evaluation: Evaluation.Good, score: 0.5 },
      profanity: { evaluation: Evaluation.Good, score: 0.5 },
    },
  },
};

export const expectationResult6 = {
  output: {
    expectationResults: [
      { evaluation: Evaluation.Good, score: 0.4 },
      { evaluation: Evaluation.Good, score: 0.4 },
      { evaluation: Evaluation.Good, score: 0.4 },
    ],
    speechActs: {
      metacognitive: { evaluation: Evaluation.Good, score: 1.0 },
      profanity: { evaluation: Evaluation.Good, score: 0.5 },
    },
  },
};

export const expectationResult7 = {
  output: {
    expectationResults: [
      { evaluation: Evaluation.Good, score: 0.5 },
      { evaluation: Evaluation.Good, score: 0.4 },
      { evaluation: Evaluation.Good, score: 1.0 },
    ],
    speechActs: {
      metacognitive: { evaluation: Evaluation.Good, score: 0.5 },
      profanity: { evaluation: Evaluation.Good, score: 0.5 },
    },
  },
};

export const expectationResult8 = {
  output: {
    expectationResults: [
      { evaluation: Evaluation.Good, score: 1.0 },
      { evaluation: Evaluation.Bad, score: 1.0 },
      { evaluation: Evaluation.Bad, score: 1.0 },
    ],
    speechActs: {
      metacognitive: { evaluation: Evaluation.Good, score: 0.5 },
      profanity: { evaluation: Evaluation.Good, score: 0.5 },
    },
  },
};

export const expectationResult9 = {
  output: {
    expectationResults: [
      { evaluation: Evaluation.Bad, score: 1.0 },
      { evaluation: Evaluation.Good, score: 0.4 },
      { evaluation: Evaluation.Good, score: 0.4 },
    ],
    speechActs: {
      metacognitive: { evaluation: Evaluation.Good, score: 0.5 },
      profanity: { evaluation: Evaluation.Good, score: 0.5 },
    },
  },
};

export const expectationResult10 = {
  output: {
    expectationResults: [
      { evaluation: Evaluation.Good, score: 1.0 },
      { evaluation: Evaluation.Bad, score: 1.0 },
      { evaluation: Evaluation.Bad, score: 1.0 },
    ],
    speechActs: {
      metacognitive: { evaluation: Evaluation.Good, score: 0.5 },
      profanity: { evaluation: Evaluation.Good, score: 0.5 },
    },
  },
};

export const expectationResult11 = {
  output: {
    expectationResults: [
      { evaluation: Evaluation.Bad, score: 0.7 },
      { evaluation: Evaluation.Good, score: 0.4 },
      { evaluation: Evaluation.Good, score: 0.4 },
    ],
    speechActs: {
      metacognitive: { evaluation: Evaluation.Good, score: 0.5 },
      profanity: { evaluation: Evaluation.Good, score: 0.5 },
    },
  },
};

export const expectationResult12 = {
  output: {
    expectationResults: [
      { evaluation: Evaluation.Good, score: 0.5 },
      { evaluation: Evaluation.Good, score: 1.0 },
    ],
    speechActs: {
      metacognitive: { evaluation: Evaluation.Good, score: 0.5 },
      profanity: { evaluation: Evaluation.Good, score: 0.5 },
    },
  },
};

export const expectationResult13 = {
  output: {
    expectationResults: [
      { evaluation: Evaluation.Bad, score: 0.5 },
      { evaluation: Evaluation.Good, score: 0.5 },
      { evaluation: Evaluation.Good, score: 0.5 },
    ],
    speechActs: {
      metacognitive: { evaluation: Evaluation.Good, score: 0.5 },
      profanity: { evaluation: Evaluation.Good, score: 0.5 },
    },
  },
};

export const expectationResult14 = {
  output: {
    expectationResults: [
      { evaluation: Evaluation.Bad, score: 1.0 },
      { evaluation: Evaluation.Good, score: 0.5 },
      { evaluation: Evaluation.Good, score: 0.5 },
    ],
    speechActs: {
      metacognitive: { evaluation: Evaluation.Good, score: 0.5 },
      profanity: { evaluation: Evaluation.Good, score: 0.5 },
    },
  },
};

export const expectationResult15 = {
  output: {
    expectationResults: [
      { evaluation: Evaluation.Good, score: 0.5 },
      { evaluation: Evaluation.Good, score: 0.5 },
      { evaluation: Evaluation.Good, score: 0.9 },
    ],
    speechActs: {
      metacognitive: { evaluation: Evaluation.Good, score: 0.5 },
      profanity: { evaluation: Evaluation.Good, score: 0.5 },
    },
  },
};

export const expectationResult16 = {
  output: {
    expectationResults: [
      { evaluation: Evaluation.Good, score: 0.5 },
      { evaluation: Evaluation.Good, score: 1.0 },
      { evaluation: Evaluation.Good, score: 0.5 },
    ],
    speechActs: {
      metacognitive: { evaluation: Evaluation.Good, score: 0.5 },
      profanity: { evaluation: Evaluation.Good, score: 0.5 },
    },
  },
};
