import { DialogScenario } from 'test/fixtures/types';
import { Evaluation } from 'apis/classifier';
import { ResponseType } from 'dialog/response-data';
import { FEEDBACK_NEGATIVE } from 'dialog/dialog-data';

const expectVariantIndex = 1;
const variantRandom = expectVariantIndex / FEEDBACK_NEGATIVE.length;

export const scenario: DialogScenario = {
  name:
    'lesson1 part 14: if the user says the same thing twice in a row, then the system should say something.',
  lessonId: 'q1',
  expectedRequestResponses: [
    {
      userInput: 'a',
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { evaluation: Evaluation.Bad, score: 1.0 },
              { evaluation: Evaluation.Bad, score: 1.0 },
              { evaluation: Evaluation.Bad, score: 1.0 },
            ],
            speechActs: {
              metacognitive: { evaluation: Evaluation.Bad, score: 0.5 },
              profanity: { evaluation: Evaluation.Good, score: 0.5 },
            },
          },
        },
      },
      expectedResponse: [],
    },
    {
      userInput: 'a',
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { evaluation: Evaluation.Bad, score: 1.0 },
              { evaluation: Evaluation.Bad, score: 1.0 },
              { evaluation: Evaluation.Bad, score: 1.0 },
            ],
            speechActs: {
              metacognitive: { evaluation: Evaluation.Bad, score: 0.5 },
              profanity: { evaluation: Evaluation.Good, score: 0.5 },
            },
          },
        },
      },
      nextRandom: variantRandom,
      expectedResponse: [
        {
          author: 'them',
          type: ResponseType.FeedbackNegative,
          data: {
            text: FEEDBACK_NEGATIVE[expectVariantIndex],
          },
        },
      ],
    },
  ],
};

export default scenario;
