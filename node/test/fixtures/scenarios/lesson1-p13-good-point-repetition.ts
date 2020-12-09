import { DialogScenario } from 'test/fixtures/types';
import { Evaluation } from 'apis/classifier';
import { ResponseType } from 'dialog/response-data';
import { FEEDBACK_GOOD_POINT_BUT } from 'dialog/dialog-data';

const expectVariantIndex = 1;
const variantRandom = expectVariantIndex / FEEDBACK_GOOD_POINT_BUT.length;

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
          type: ResponseType.FeedbackNeutral,
          data: {
            // this whole scenario is about
            // testing we get this "variant" good-point-but response
            text: FEEDBACK_GOOD_POINT_BUT[expectVariantIndex],
          },
        },
        {
          author: 'them',
          type: ResponseType.FeedbackNeutral,
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
