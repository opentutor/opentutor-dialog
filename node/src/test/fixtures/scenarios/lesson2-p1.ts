import { DialogScenario } from 'test/fixtures/types';
import { Evaluation } from 'models/classifier';

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
          },
        },
      },
      expectedResponse: [
        {
          author: 'them',
          type: 'text',
          data: {
            text:
              'Summing up, this diode is forward biased. Positive current flows in the same direction of the arrow, from anode to cathode.',
          },
        },
        {
          author: 'them',
          type: 'text',
          data: {
            text: "Let's try a different problem.",
          },
        },
      ],
    },
  ],
};

export default scenario;
