import { DialogScenario } from 'test/fixtures/types';
import { Evaluation } from 'apis/classifier';
import { ResponseType } from 'dialog/response-data';

export const scenario: DialogScenario = {
  name: 'lesson1 part 7: user can answer two expectations at the same time.',
  lessonId: 'q1',
  expectedRequestResponses: [
    {
      userInput:
        "Peer pressure. If you correct someone's behavior, you may get them in trouble or it may be harder to work with them.",
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { expectationId: "2", evaluation: Evaluation.Good, score: 1.0 },
              { expectationId: "3", evaluation: Evaluation.Good, score: 1.0 },
              { expectationId: "4", evaluation: Evaluation.Good, score: 0.5 },
            ],
            speechActs: {
              metacognitive: { expectationId: "metacognitive", evaluation: Evaluation.Good, score: 0.5 },
              profanity: { expectationId: "profanity", evaluation: Evaluation.Good, score: 0.5 },
            },
          },
        },
      },
      expectedResponse: [
        {
          author: 'them',
          type: ResponseType.FeedbackPositive,
          data: {
            text: 'Great.',
          },
        },
        {
          author: 'them',
          type: ResponseType.Hint,
          data: {
            text: "How can it affect you when you correct someone's behavior?",
          },
        },
      ],
    },
    {
      userInput: 'Enforcing the rules can make you unpopular.',
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { expectationId: "2", evaluation: Evaluation.Good, score: 0.5 },
              { expectationId: "3", evaluation: Evaluation.Good, score: 0.5 },
              { expectationId: "4", evaluation: Evaluation.Good, score: 1.0 },
            ],
            speechActs: {
              metacognitive: { expectationId: "metacognitive", evaluation: Evaluation.Good, score: 0.5 },
              profanity: { expectationId: "profanity", evaluation: Evaluation.Good, score: 0.5 },
            },
          },
        },
      },
      expectedResponse: [
        {
          author: 'them',
          type: ResponseType.FeedbackPositive,
          data: {
            text: 'Great.',
          },
        },
        {
          author: 'them',
          type: ResponseType.Closing,
          data: {
            text:
              'Peer pressure can push you to allow and participate in inappropriate behavior.',
          },
        },
        {
          author: 'them',
          type: ResponseType.Closing,
          data: {
            text:
              "When you correct somone's behavior, you may get them in trouble or negatively impact your relationship with them.",
          },
        },
        {
          author: 'them',
          type: ResponseType.Closing,
          data: {
            text:
              'However, integrity means speaking out even when it is unpopular.',
          },
        },
      ],
    },
  ],
};

export default scenario;
