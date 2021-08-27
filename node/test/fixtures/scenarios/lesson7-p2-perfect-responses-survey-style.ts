import { DialogScenario } from 'test/fixtures/types';
import { Evaluation } from 'apis/classifier';
import { ResponseType } from 'dialog/response-data';

export const scenario: DialogScenario = {
  name: 'navy integrity training - survey says style with perfect response',
  lessonId: 'q7',
  expectedRequestResponses: [
    {
      userInput:
        'Because of peer pressure, you might allow inappropriate behavior.',
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { expectationId: '0', evaluation: Evaluation.Good, score: 1.0 },
              { expectationId: '1', evaluation: Evaluation.Good, score: 1.0 },
              { expectationId: '2', evaluation: Evaluation.Good, score: 1.0 },
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
      expectedResponse: [
        {
          author: 'them',
          type: ResponseType.FeedbackPositive,
          data: {
            text: "Amazing! You got them all. Maybe you're the expert around here.",
          },
        },
        {
          author: 'them',
          data: {
            text: 'Peer pressure can push you to allow and participate in inappropriate behavior.',
          },
          type: 'closing',
        },
        {
          author: 'them',
          data: {
            text: "When you correct someone's behavior, you may get them in trouble or negatively impact your relationship with them.",
          },
          type: 'closing',
        },
        {
          author: 'them',
          data: {
            text: 'However, integrity means speaking out even when it is unpopular.',
          },
          type: 'closing',
        },
      ],
    },
  ],
};

export default scenario;
