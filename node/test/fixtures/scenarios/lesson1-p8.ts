import { DialogScenario } from 'test/fixtures/types';
import { Evaluation } from 'apis/classifier';
import { ResponseType } from 'dialog/response-data';

export const scenario: DialogScenario = {
  name:
    'lesson1 part 8: this does hints, prompts and assert for every expectation.',
  lessonId: 'q1',
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
              metaCognitive: 
              { evaluation: Evaluation.Good, score: 0.5 },
              profanity: 
              { evaluation: Evaluation.Good, score: 0.5 },
            }
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
      userInput: "I don't know",
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { evaluation: Evaluation.Good, score: 0.5 },
              { evaluation: Evaluation.Good, score: 0.5 },
              { evaluation: Evaluation.Good, score: 0.5 },
            ],
            speechActs: {
              metaCognitive: 
              { evaluation: Evaluation.Good, score: 0.5 },
              profanity: 
              { evaluation: Evaluation.Good, score: 0.5 },
            }
          },
        },
      },
      expectedResponse: [
        {
          author: 'them',
          type: ResponseType.Text,
          data: {
            text: 'See if you can get this',
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
      userInput: 'hurt me?',
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { evaluation: Evaluation.Good, score: 0.5 },
              { evaluation: Evaluation.Good, score: 0.5 },
              { evaluation: Evaluation.Good, score: 0.5 },
            ],
            speechActs: {
              metaCognitive: 
              { evaluation: Evaluation.Good, score: 0.5 },
              profanity: 
              { evaluation: Evaluation.Good, score: 0.5 },
            }
          },
        },
      },
      expectedResponse: [
        {
          author: 'them',
          type: ResponseType.Text,
          data: {
            text: 'peer pressure',
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
      userInput: "I don't know",
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { evaluation: Evaluation.Good, score: 0.5 },
              { evaluation: Evaluation.Good, score: 0.5 },
              { evaluation: Evaluation.Good, score: 0.5 },
            ],
            speechActs: {
              metaCognitive: 
              { evaluation: Evaluation.Good, score: 0.5 },
              profanity: 
              { evaluation: Evaluation.Good, score: 0.5 },
            }
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
            text: 'See if you can get this',
          },
        },
        {
          author: 'them',
          type: ResponseType.Prompt,
          data: {
            text:
              'How can it affect someone emotionally when you correct their behavior?',
          },
        },
      ],
    },
    {
      userInput: 'idk',
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { evaluation: Evaluation.Good, score: 0.5 },
              { evaluation: Evaluation.Good, score: 0.5 },
              { evaluation: Evaluation.Good, score: 0.5 },
            ],
            speechActs: {
              metaCognitive: 
              { evaluation: Evaluation.Good, score: 0.5 },
              profanity: 
              { evaluation: Evaluation.Good, score: 0.5 },
            }
          },
        },
      },
      expectedResponse: [
        {
          author: 'them',
          type: ResponseType.Text,
          data: {
            text: 'it may be harder to work with them',
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
            text: "How can it affect you when you correct someone's behavior?",
          },
        },
      ],
    },
    {
      userInput: 'idk',
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { evaluation: Evaluation.Good, score: 0.5 },
              { evaluation: Evaluation.Good, score: 0.5 },
              { evaluation: Evaluation.Good, score: 0.5 },
            ],
            speechActs: {
              metaCognitive: 
              { evaluation: Evaluation.Good, score: 0.5 },
              profanity: 
              { evaluation: Evaluation.Good, score: 0.5 },
            }
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
            text: 'See if you can get this',
          },
        },
        {
          author: 'them',
          type: ResponseType.Prompt,
          data: {
            text:
              'Integrity means doing the right thing even when it is _____ ?',
          },
        },
      ],
    },
    {
      userInput: 'idk',
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { evaluation: Evaluation.Good, score: 0.5 },
              { evaluation: Evaluation.Good, score: 0.5 },
              { evaluation: Evaluation.Good, score: 0.5 },
            ],
            speechActs: {
              metaCognitive: 
              { evaluation: Evaluation.Good, score: 0.5 },
              profanity: 
              { evaluation: Evaluation.Good, score: 0.5 },
            }
          },
        },
      },
      expectedResponse: [
        {
          author: 'them',
          type: ResponseType.Text,
          data: {
            text: 'unpopular',
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
        ,
      ],
    },
  ],
};

export default scenario;
