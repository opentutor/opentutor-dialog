/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { DialogScenario } from 'test/fixtures/types';
import { Evaluation } from 'apis/classifier';
import { ResponseType } from 'dialog/response-data';

export const scenario: DialogScenario = {
  name: 'lesson1 part 16: test scoring when the user gets the right answer for an expectation after getting one hint.',
  lessonId: 'q1',
  expectedScore: 2.23 / 3,
  expectedRequestResponses: [
    {
      userInput: 'Rules apply differently to the group',
      mockClassifierResponse: {
        data: {
          data: {
            output: {
              expectationResults: [
                { expectationId: '2', evaluation: Evaluation.Bad, score: 1.0 },
                { expectationId: '3', evaluation: Evaluation.Good, score: 0.5 },
                { expectationId: '4', evaluation: Evaluation.Good, score: 0.5 },
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
            text: 'Why might you allow bad behavior in a group that you normally would not allow yourself to do?',
          },
        },
      ],
    },
    {
      userInput: "I don't know",
      mockClassifierResponse: {
        data: {
          data: {
            output: {
              expectationResults: [
                { expectationId: '2', evaluation: Evaluation.Good, score: 0.5 },
                { expectationId: '3', evaluation: Evaluation.Good, score: 0.5 },
                { expectationId: '4', evaluation: Evaluation.Good, score: 0.5 },
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
          data: {
            output: {
              expectationResults: [
                { expectationId: '2', evaluation: Evaluation.Good, score: 0.5 },
                { expectationId: '3', evaluation: Evaluation.Good, score: 0.5 },
                { expectationId: '4', evaluation: Evaluation.Good, score: 0.5 },
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
          data: {
            output: {
              expectationResults: [
                { expectationId: '2', evaluation: Evaluation.Good, score: 0.5 },
                { expectationId: '3', evaluation: Evaluation.Good, score: 0.5 },
                { expectationId: '4', evaluation: Evaluation.Good, score: 0.5 },
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
            text: 'How can it affect someone emotionally when you correct their behavior?',
          },
        },
      ],
    },
    {
      userInput: 'idk',
      mockClassifierResponse: {
        data: {
          data: {
            output: {
              expectationResults: [
                { expectationId: '2', evaluation: Evaluation.Good, score: 0.5 },
                { expectationId: '3', evaluation: Evaluation.Good, score: 0.5 },
                { expectationId: '4', evaluation: Evaluation.Good, score: 0.5 },
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
          data: {
            output: {
              expectationResults: [
                { expectationId: '2', evaluation: Evaluation.Good, score: 0.5 },
                { expectationId: '3', evaluation: Evaluation.Good, score: 0.5 },
                { expectationId: '4', evaluation: Evaluation.Good, score: 1.0 },
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
            text: 'Peer pressure can push you to allow and participate in inappropriate behavior.',
          },
        },
        {
          author: 'them',
          type: ResponseType.Closing,
          data: {
            text: "When you correct somone's behavior, you may get them in trouble or negatively impact your relationship with them.",
          },
        },
        {
          author: 'them',
          type: ResponseType.Closing,
          data: {
            text: 'However, integrity means speaking out even when it is unpopular.',
          },
        },
        ,
      ],
    },
  ],
};

export default scenario;
