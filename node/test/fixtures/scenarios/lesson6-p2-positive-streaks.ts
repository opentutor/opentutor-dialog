/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { DialogScenario } from 'test/fixtures/types';
import { Evaluation } from 'apis/classifier';
import { ResponseType } from 'dialog/response-data';

export const scenario: DialogScenario = {
  name: 'navy integrity training - gives greater affirmation for continued success.',
  lessonId: 'q6',
  expectedRequestResponses: [
    {
      userInput: 'Peer pressure could influence you to allow poor behavior',
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { expectationId: '0', evaluation: Evaluation.Good, score: 1.0 },
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
          type: ResponseType.FeedbackPositive,
          data: {
            text: 'Right.',
          },
        },
        // {
        //     author: 'them',
        //     type: ResponseType.Text,
        //     data: {
        //         text: 'Consider this.',
        //     },
        // },
        {
          author: 'them',
          type: ResponseType.Hint,
          data: {
            text: 'And can you add to that?',
          },
        },
      ],
    },
    {
      userInput: "It could get them in trouble or make it harder to work with them",
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { expectationId: '0', evaluation: Evaluation.Good, score: 0.5 },
              { expectationId: '1', evaluation: Evaluation.Good, score: 1.0 },
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
          type: ResponseType.FeedbackPositive,
          data: {
            text: "Correct, that's 2 in a row!",
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
            text: "How can it affect you when you correct someone's behavior?",
          },
        },
      ],
    },
    {
      userInput: 'It could make me unpopular',
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { expectationId: '0', evaluation: Evaluation.Good, score: 0.5 },
              { expectationId: '1', evaluation: Evaluation.Good, score: 0.5 },
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
            text: "Correct, that's 3 in a row!",
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