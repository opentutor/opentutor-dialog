import { DialogScenario } from 'test/fixtures/types';
import { Evaluation } from 'apis/classifier';
import { ResponseType } from 'dialog/response-data';
import { POSITIVE_FEEDBACK } from 'dialog/dialog-data';

const expectVariantIndex = 1;
const variantRandom = expectVariantIndex / POSITIVE_FEEDBACK.length;

export const scenario: DialogScenario = {
  name:
    'lesson1 part 14: if the user fulfills an expecation the system should recognize that and reply accordingly',
  lessonId: 'q1',
  expectedRequestResponses: [
    {
      userInput: 'Rules apply differently to the group',
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { evaluation: Evaluation.Bad, score: 1.0 },
              { evaluation: Evaluation.Bad, score: 1.0 },
              { evaluation: Evaluation.Good, score: 1.0 },
            ],
            speechActs: {
              metacognitive: { evaluation: Evaluation.Good, score: 0.5 },
              profanity: { evaluation: Evaluation.Good, score: 0.5 },
            },
          },
        },
      },
      expectedResponse: [],
    },
    {
      userInput: 'It may be harder to work with them.',
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { evaluation: Evaluation.Bad score: 1.0 },
              { evaluation: Evaluation.Bad, score: 1.0 },
              { evaluation: Evaluation.Good, score: 1.0 },
            ],
            speechActs: {
              metacognitive: { evaluation: Evaluation.Good, score: 0.5 },
              profanity: { evaluation: Evaluation.Good, score: 0.5 },
            },
          },
        },
      },
      nextRandom: variantRandom,
      expectedResponse: [
        {
          author: 'them',
          type: ResponseType.FeedbackPositive,
          data: {
            text: POSITIVE_FEEDBACK[expectVariantIndex],
          },
        },
      ],
    },
  ],
};

export default scenario;
