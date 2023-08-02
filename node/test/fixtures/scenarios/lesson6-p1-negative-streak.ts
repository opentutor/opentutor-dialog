/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { DialogScenario } from 'test/fixtures/types';
import { Evaluation } from 'apis/classifier';
import { ResponseType } from 'dialog/response-data';

export const scenario: DialogScenario = {
  name: 'navy integrity training - does not give negative feedback if user has recieved negative feedback in past two cycles',
  lessonId: 'q6',
  expectedRequestResponses: [
    {
      userInput: 'Rules apply differently to the group',
      mockClassifierResponse: {
        data: {
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
      },
      expectedResponse: [
        {
          author: 'them',
          type: ResponseType.FeedbackNeutral,
          data: {
            text: 'Ok.',
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
            text: 'Peer pressure can cause you to allow inappropriate behavior.',
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
            // expectation text
            text: 'How can it affect someone when you correct their behavior?',
          },
        },
      ],
    },
    {
      userInput: 'They will not be affected',
      mockClassifierResponse: {
        data: {
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
      },
      expectedResponse: [
        {
          author: 'them',
          type: ResponseType.FeedbackNeutral,
          data: {
            text: 'Ok.',
          },
        },
        {
          author: 'them',
          type: ResponseType.Text,
          data: {
            text: "If you correct someone's behavior, you may get them in trouble or it may be harder to work with them.",
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
      },
      expectedResponse: [
        {
          author: 'them',
          type: ResponseType.FeedbackNeutral,
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
        {
          author: 'them',
          data: {
            text: 'Good job today, it was nice to see you. Bye!',
          },
          type: 'closing',
        },
      ],
    },
  ],
};

export default scenario;
