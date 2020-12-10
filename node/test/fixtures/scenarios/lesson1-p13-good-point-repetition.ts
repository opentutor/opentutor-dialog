import { DialogScenario } from 'test/fixtures/types';
import { Evaluation } from 'apis/classifier';
import { ResponseType } from 'dialog/response-data';
import { POSITIVE_FEEDBACK } from 'dialog/dialog-data';

const expectVariantIndex = 1;
const variantRandom = expectVariantIndex / POSITIVE_FEEDBACK.length;

export const scenario: DialogScenario = {
  name:
    'lesson1 part 13: if more than one unexpected expectation is fulfilled in a single utterrance only one good point utterance should play',
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
              { evaluation: Evaluation.Bad, score: 1.0 },
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
              { evaluation: Evaluation.Good, score: 1.0 },
              { evaluation: Evaluation.Good, score: 1.0 },
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
            // this whole scenario is about
            // testing we get this "variant" good-point-but response
            text: POSITIVE_FEEDBACK[expectVariantIndex],
          },
        },
        {
          author: 'them',
          type: ResponseType.Closing,
          data: {
            // this whole scenario is about
            // testing we get this "variant" good-point-but response
            text: 'Peer pressure can push you to allow and participate in inappropriate behavior.'
          },
        },
      ],
    },
  ],
};

export default scenario;
