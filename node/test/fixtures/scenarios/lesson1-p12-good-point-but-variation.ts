import { DialogScenario } from 'test/fixtures/types';
import { Evaluation } from 'apis/classifier';
import { ResponseType } from 'dialog/response-data';
import { FEEDBACK_GOOD_POINT_BUT } from 'dialog/handler/standard/config';

const expectVariantIndex = 1;
const variantRandom = expectVariantIndex / FEEDBACK_GOOD_POINT_BUT.length;

export const scenario: DialogScenario = {
  name:
    'lesson1 part 12: there is more than one variation of the "good point but" server message',
  lessonId: 'q1',
  expectedRequestResponses: [
    {
      userInput: 'Rules apply differently to the group',
      mockClassifierResponse: {
        data: {
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
              { evaluation: Evaluation.Good, score: 0.5 },
              { evaluation: Evaluation.Good, score: 1.0 },
              { evaluation: Evaluation.Good, score: 0.5 },
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
          type: ResponseType.FeedbackNeutral,
          data: {
            // this whole scenario is about
            // testing we get this "variant" good-point-but response
            text: FEEDBACK_GOOD_POINT_BUT[expectVariantIndex],
          },
        },
      ],
    },
  ],
};

export default scenario;
