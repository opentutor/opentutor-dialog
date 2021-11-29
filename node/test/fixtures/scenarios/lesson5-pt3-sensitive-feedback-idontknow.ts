/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { DialogScenario } from 'test/fixtures/types';
import { Evaluation } from 'apis/classifier';
import { ResponseType } from 'dialog/response-data';

export const scenario: DialogScenario = {
  name: 'suicide prevention bystander training - does not have redundant transitions',
  lessonId: 'q5',
  expectedRequestResponses: [
    {
      userInput: "I don't know",
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { expectationId: '0', evaluation: Evaluation.Bad, score: 0.8 },
              { expectationId: '1', evaluation: Evaluation.Bad, score: 0.6 },
            ],
            speechActs: {
              metacognitive: {
                expectationId: '',
                evaluation: Evaluation.Good,
                score: 1.0,
              },
              profanity: {
                expectationId: '',
                evaluation: Evaluation.Bad,
                score: 0.0,
              },
            },
          },
        },
      },
      expectExactMatchResponse: true,
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
            text: 'Consider this.',
          },
        },
        {
          author: 'them',
          type: ResponseType.Hint,
          data: {
            text: 'Compared to when they knew a clear way to commit suicide, does their long term suicide risk change?',
          },
        },
      ],
    },
  ],
};

export default scenario;
