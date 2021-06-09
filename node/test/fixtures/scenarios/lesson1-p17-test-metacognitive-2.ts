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
