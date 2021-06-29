import { DialogScenario } from 'test/fixtures/types';
import { Evaluation } from 'apis/classifier';
import { ResponseType } from 'dialog/response-data';
import { POSITIVE_FEEDBACK } from 'dialog/handler/standard/config';

const expectVariantIndex = 1;
const variantRandom = expectVariantIndex / POSITIVE_FEEDBACK.length;

export const scenario: DialogScenario = {
  name: 'lesson1 part 13: if more than one unexpected expectation is fulfilled along with the expected expectation, only the positive feedback should be given.',
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
      expectExactMatchResponse: true,
      expectedResponse: [
        {
          author: 'them',
          type: ResponseType.FeedbackPositive,
          data: {
            text: POSITIVE_FEEDBACK[expectVariantIndex],
          },
        },
        {
          author: 'them',
          type: ResponseType.Closing,
          data: {
            text: 'Peer pressure can push you to allow and participate in inappropriate behavior.',
          },
        },
        {
          author: 'them',
          type: ResponseType.Closing,
          data: {
            text: `When you correct somone's behavior, you may get them in trouble or negatively impact your relationship with them.`,
          },
        },
        {
          author: 'them',
          type: ResponseType.Closing,
          data: {
            text: 'However, integrity means speaking out even when it is unpopular.',
          },
        },
      ],
    },
  ],
};

export default scenario;
