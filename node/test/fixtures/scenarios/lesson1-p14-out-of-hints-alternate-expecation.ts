import { DialogScenario } from 'test/fixtures/types';
import { Evaluation } from 'apis/classifier';
import { ResponseType } from 'dialog/response-data';
import {
  POSITIVE_FEEDBACK,
  FEEDBACK_OUT_OF_HINTS_ALTERNATE_EXPECTATION_FULFILLED,
} from 'dialog/handler/standard/config';

const expectVariantIndex = 1;
const variantRandom =
  expectVariantIndex /
  FEEDBACK_OUT_OF_HINTS_ALTERNATE_EXPECTATION_FULFILLED.length;

export const scenario: DialogScenario = {
  name: 'lesson1 part 14: when no hints or prompts are remaining and the user fulfills an unrelated expectation.  acknowledge it',
  lessonId: 'q3',
  expectedRequestResponses: [
    {
      userInput: 'Rules apply differently to the group',
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { expectationId: '5', evaluation: Evaluation.Bad, score: 1.0 },
              { expectationId: '6', evaluation: Evaluation.Bad, score: 1.0 },
              { expectationId: '7', evaluation: Evaluation.Bad, score: 1.0 },
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
              { expectationId: '5', evaluation: Evaluation.Bad, score: 1.0 },
              { expectationId: '6', evaluation: Evaluation.Bad, score: 1.0 },
              { expectationId: '7', evaluation: Evaluation.Good, score: 1.0 },
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
        },
      },
      nextRandom: variantRandom,
      expectExactMatchResponse: false,
      expectedResponse: [
        {
          author: 'them',
          type: ResponseType.Text,
          data: {
            text: FEEDBACK_OUT_OF_HINTS_ALTERNATE_EXPECTATION_FULFILLED[
              expectVariantIndex
            ],
          },
        },
        {
          author: 'them',
          type: ResponseType.Text,
          data: {
            text: 'Peer pressure can cause you to allow inappropriate behavior.',
          },
        },
      ],
    },
  ],
};

export default scenario;
