import { DialogScenario } from 'test/fixtures/types';
import { Evaluation } from 'apis/classifier';
import { ResponseType } from 'dialog/response-data';

export const scenario: DialogScenario = {
  name: 'navy integrity training - survey says style with many bad responses',
  lessonId: 'q7',
  expectedRequestResponses: [
    {
      userInput: 'Rules apply differently to the group',
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { expectationId: '0', evaluation: Evaluation.Bad, score: 1.0 },
              { expectationId: '1', evaluation: Evaluation.Good, score: 0.5 },
              { expectationId: '2', evaluation: Evaluation.Good, score: 0.5 },
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
          type: ResponseType.FeedbackNegative,
          data: {
            text: "Sorry, it looks like that wasn't on the board.",
          },
        },
        {
          author: 'them',
          type: ResponseType.Hint,
          data: {
            text: 'Why might you allow bad behavior in a group that you normally would not allow yourself to do?',
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
              { expectationId: '0', evaluation: Evaluation.Bad, score: 1.0 },
              { expectationId: '1', evaluation: Evaluation.Good, score: 0.5 },
              { expectationId: '2', evaluation: Evaluation.Good, score: 0.5 },
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
          type: ResponseType.FeedbackNegative,
          data: {
            text: "Sorry, it looks like that wasn't on the board.",
          },
        },
        {
          author: 'them',
          type: ResponseType.Prompt,
          data: {
            text: 'What might cause you to lower your standards?',
          },
        },
      ],
    },
    {
      userInput: 'There is nothing that would cause me to lower my standards.',
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { expectationId: '0', evaluation: Evaluation.Bad, score: 1.0 },
              { expectationId: '1', evaluation: Evaluation.Good, score: 0.5 },
              { expectationId: '2', evaluation: Evaluation.Good, score: 0.5 },
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
          type: ResponseType.Text,
          data: {
            text: "We'll give you this one on the board.",
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
            text: 'How can it affect someone when you correct their behavior?',
          },
        },
      ],
    },
    {
      userInput: 'There is no affect',
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { expectationId: '0', evaluation: Evaluation.Good, score: 0.5 },
              { expectationId: '1', evaluation: Evaluation.Bad, score: 1.0 },
              { expectationId: '2', evaluation: Evaluation.Good, score: 0.5 },
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
          type: ResponseType.FeedbackNegative,
          data: {
            text: "Sorry, it looks like that wasn't on the board.",
          },
        },
        {
          author: 'them',
          type: ResponseType.Prompt,
          data: {
            text: 'How can it affect someone emotionally when you correct their behavior?',
          },
        },
      ],
    },
    {
      userInput: 'They will not be affected at all',
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { expectationId: '0', evaluation: Evaluation.Good, score: 0.5 },
              { expectationId: '1', evaluation: Evaluation.Bad, score: 1.0 },
              { expectationId: '2', evaluation: Evaluation.Good, score: 0.5 },
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
          type: ResponseType.Text,
          data: {
            text: "We'll give you this one on the board.",
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
      userInput: "they won't view me any differently",
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { expectationId: '0', evaluation: Evaluation.Good, score: 0.5 },
              { expectationId: '1', evaluation: Evaluation.Bad, score: 0.5 },
              { expectationId: '2', evaluation: Evaluation.Bad, score: 1.0 },
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
          type: ResponseType.FeedbackNegative,
          data: {
            text: "Sorry, it looks like that wasn't on the board.",
          },
        },
        {
          author: 'them',
          type: ResponseType.Prompt,
          data: {
            text: 'Integrity means doing the right thing even when it is _____ ?',
          },
        },
      ],
    },
    {
      userInput: "You don't have to do the right thing",
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { expectationId: '0', evaluation: Evaluation.Good, score: 0.5 },
              { expectationId: '1', evaluation: Evaluation.Bad, score: 0.5 },
              { expectationId: '2', evaluation: Evaluation.Bad, score: 1.0 },
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
          type: ResponseType.Text,
          data: {
            text: "We'll give you this one on the board.",
          },
        },
        {
          author: 'them',
          type: ResponseType.FeedbackNegative,
          data: {
            text: 'Try again next time and see if you can get all the answers.',
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
            text: "When you correct somone's behavior, you may get them in trouble or negatively impact your relationship with them.",
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
