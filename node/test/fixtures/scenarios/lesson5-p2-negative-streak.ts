import { DialogScenario } from 'test/fixtures/types';
import { Evaluation } from 'apis/classifier';
import { ResponseType } from 'dialog/response-data';

export const scenario: DialogScenario = {
  name:
    'navy integrity training - does not give negative feedback more than two times in a row',
  lessonId: 'q6',
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
      expectedResponse: [
        {
          author: 'them',
          type: ResponseType.FeedbackNegative,
          data: {
            text: "I'm not sure about that.",
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
      userInput: "I wouldn't",
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
      expectedResponse: [
        {
          author: 'them',
          type: ResponseType.FeedbackNegative,
          data: {
            text: "I'm not sure about that.",
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
        {
          author: 'them',
          type: ResponseType.Hint,
          data: {
            // expectation text
            text: "How can it affect you when you correct someone's behavior?",
          },
        },
      ],
    },
    {
      userInput: 'I will not be affected',
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { evaluation: Evaluation.Good, score: 0.5 },
              { evaluation: Evaluation.Bad, score: 1.0 },
              { evaluation: Evaluation.Good, score: 0.5 },
            ],
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
          type: ResponseType.FeedbackNeutral, // or pump instead (50% of the time)
          data: {
            text: 'Ok.',
          },
        },
        {
          author: 'them',
          type: ResponseType.Text,
          data: {
            text:
              "If you correct someone's behavior, you may get them in trouble or it may be harder to work with them.",
          },
        },
        {
          author: 'them',
          type: ResponseType.Hint,
          data: {
            text:
              "How might others percieve you when you correct someone's behavior?",
          },
        },
      ],
    },
    {
      userInput: "they won't view me any differently",
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { evaluation: Evaluation.Good, score: 0.5 },
              { evaluation: Evaluation.Bad, score: 0.5 },
              { evaluation: Evaluation.Good, score: 1.0 },
            ],
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
          type: ResponseType.FeedbackNeutral, // or pump
          data: {
            text: 'Ok.',
          },
        },
        {
          author: 'them',
          type: ResponseType.Text,
          data: {
            text: 'Enforcing the rules can make you unpopular.',
          },
        },
        {
          author: 'them',
          data: {
            text:
              'Peer pressure can push you to allow and participate in inappropriate behavior.',
          },
          type: 'closing',
        },
        {
          author: 'them',
          data: {
            text:
              "When you correct somone's behavior, you may get them in trouble or negatively impact your relationship with them.",
          },
          type: 'closing',
        },
        {
          author: 'them',
          data: {
            text:
              'However, integrity means speaking out even when it is unpopular.',
          },
          type: 'closing',
        },
      ],
    },
  ],
};

export default scenario;
