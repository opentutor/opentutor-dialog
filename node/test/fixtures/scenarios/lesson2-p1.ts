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
  name: 'lesson2 part 1',
  lessonId: 'q2',
  expectedRequestResponses: [
    {
      userInput: 'Current flows in the same direction as the arrow.',
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { expectationId: '1', evaluation: Evaluation.Good, score: 1.0 },
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
          type: ResponseType.Closing,
          data: {
            text: 'Summing up, this diode is forward biased. Positive current flows in the same direction of the arrow, from anode to cathode.',
          },
        },
        {
          author: 'them',
          type: ResponseType.Closing,
          data: {
            text: "Let's try a different problem.",
          },
        },
      ],
    },
  ],
};

export default scenario;
