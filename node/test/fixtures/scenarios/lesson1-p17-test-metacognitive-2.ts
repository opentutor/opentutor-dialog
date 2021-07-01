/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { DialogScenario } from 'test/fixtures/types';
import { Evaluation } from 'apis/classifier';
import { ResponseType } from 'dialog/response-data';

//navy integrity perfect answer
export const scenario: DialogScenario = {
  name:
    'lesson1 part 17: metacognitive response test 2. other half of the random response.',
  lessonId: 'q1',
  expectedRequestResponses: [
    {
      userInput: 'I dont know',
      nextRandom: 0.99,
      mockClassifierResponse: {
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
                score: 1.0,
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
          type: ResponseType.Encouragement,
          data: {
            text:
              "That's an okay place to start. Let's try this part together.",
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
  ],
};

export default scenario;
