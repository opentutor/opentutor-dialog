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
          type: ResponseType.FeedbackNegativeSensitive,
          data: {
            text: 'Think about this.',
          },
        },
        {
          author: 'them',
          type: ResponseType.Hint,
          data: {
            text:
            'Compared to when they knew a clear way to commit suicide, does their long term suicide risk change?',
          },
        },
      ],
    },
    {
      userInput:
        "it doesn't, you wouldn't be affected",
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
          type: ResponseType.FeedbackNegativeSensitive,
          data: {
            text: 'Think about this.',
          },
        },
        {
          author: 'them',
          type: ResponseType.Hint,
          data: {
            text:
            'Are they more likely to just "find another way" or to not attempt suicide later?',
          },
        },
      ],
    },
    {
      userInput:
        "they will",
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
          type: ResponseType.FeedbackNegativeSensitive,
          data: {
            text: 'Think about this.',
          },
        },
        {
          author: 'them',
          type: ResponseType.Hint,
          data: {
            text:
            'Compared to before they lost their means to commit suicide (e.g., a gun), how does their risk change?',
          },
        },
      ],
    },
    {
      userInput:
        "their risk doesn't change",
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
          type: ResponseType.FeedbackNegativeSensitive,
          data: {
            text: 'Think about this.',
          },
        },
        {
          author: 'them',
          type: ResponseType.Hint,
          data: {
            text:
            'Compared to before they lost their means to commit suicide (e.g., a gun), how does their risk change?',
          },
        },
      ],
    },
    {
      userInput: "",
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
            'The person is still at risk compared to other people.',
          },
        },
      ],
    },
  ],
};

export default scenario;
