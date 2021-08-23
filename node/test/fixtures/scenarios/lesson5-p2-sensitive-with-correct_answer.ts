/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { DialogScenario } from 'test/fixtures/types';
import { Evaluation } from 'apis/classifier';
import { ResponseType } from 'dialog/response-data';

export const scenario: DialogScenario = {
  name: 'suicide prevention bystander training - uses sensitive negative responses for lesson marked as sensistive',
  lessonId: 'q5',
  expectedRequestResponses: [
    {
      userInput: 'their long term suicide risk will decrease',
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { expectationId: '0', evaluation: Evaluation.Good, score: 0.8 },
              { expectationId: '1', evaluation: Evaluation.Good, score: 0.5 },
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
      userInput: 'they are still at a higher risk than other people',
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { expectationId: '0', evaluation: Evaluation.Good, score: 0.5 },
              { expectationId: '1', evaluation: Evaluation.Good, score: 0.9 },
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
          data: {
            text: 'Most people do not attempt suicide again if their plan is interrupted or if they survive a suicide attempt. This means that removing guns, pills, or other ways to commit suicide are very important.',
          },
          type: 'closing',
        },
        {
          author: 'them',
          data: {
            text: 'However, a person with suicidal thoughts is still at-risk and they should receive professional help to decrease their risk and improve their quality of life.',
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
