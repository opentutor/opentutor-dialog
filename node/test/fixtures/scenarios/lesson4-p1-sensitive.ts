import { DialogScenario } from 'test/fixtures/types';
import { Evaluation } from 'apis/classifier';
import { ResponseType } from 'dialog/response-data';
import { FEEDBACK_OUT_OF_HINTS_ALTERNATE_EXPECTATION_FULFILLED } from 'dialog/dialog-data';

const expectVariantIndex = 1;
const variantRandom =
  expectVariantIndex /
  FEEDBACK_OUT_OF_HINTS_ALTERNATE_EXPECTATION_FULFILLED.length;

export const scenario: DialogScenario = {
  name: 'lesson4 part 1: sensitive dialog scenario',
  lessonId: 'q4',
  expectedRequestResponses: [
    {
      userInput:
        "losing it doesn't affect anything. you can't stop people who made up their mind",
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [{ evaluation: Evaluation.Bad, score: 1.0 }],
            speechActs: {
              metacognitive: { evaluation: Evaluation.Good, score: 0.5 },
              profanity: { evaluation: Evaluation.Good, score: 0.5 },
            },
          },
        },
      },
      expectedResponse: [
        {
          author: 'them',
          type: ResponseType.FeedbackNegative,
          data: {
            text: 'Not really.',
          },
        },
        {
          author: 'them',
          type: ResponseType.Text,
          data: {
            text: 'Consider this.',
          },
        },
        {
          author: 'them',
          type: ResponseType.Hint,
          data: {
            text:
              'Why might you allow bad behavior in a group that you normally would not allow yourself to do?',
          },
        },
      ],
    },
    {
      userInput: "it doesn't, you wouldn't be affected",
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [{ evaluation: Evaluation.Bad, score: 1.0 }],
            speechActs: {
              metacognitive: { evaluation: Evaluation.Good, score: 0.5 },
              profanity: { evaluation: Evaluation.Good, score: 0.5 },
            },
          },
        },
      },
      nextRandom: variantRandom,
      expectExactMatchResponse: false,
      expectedResponse: [
        {
          author: 'them',
          type: ResponseType.Text,
          data: {
            text:
              FEEDBACK_OUT_OF_HINTS_ALTERNATE_EXPECTATION_FULFILLED[
                expectVariantIndex
              ],
          },
        },
        {
          author: 'them',
          type: ResponseType.Text,
          data: {
            text:
              'Peer pressure can cause you to allow inappropriate behavior.',
          },
        },
      ],
    },
  ],
};

export default scenario;
