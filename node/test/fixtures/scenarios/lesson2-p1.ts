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
            expectationResults: [{ evaluation: Evaluation.Good, score: 1.0 }],
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
          type: ResponseType.Closing,
          data: {
            text:
              'Summing up, this diode is forward biased. Positive current flows in the same direction of the arrow, from anode to cathode.',
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
