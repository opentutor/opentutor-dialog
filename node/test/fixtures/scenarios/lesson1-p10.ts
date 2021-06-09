import { DialogScenario } from 'test/fixtures/types';
import { Evaluation } from 'apis/classifier';
import { ResponseType } from 'dialog/response-data';

//navy integrity perfect answer
export const scenario: DialogScenario = {
  name: 'lesson1 part 10: profanity test',
  lessonId: 'q1',
  expectedRequestResponses: [
    {
      userInput: 'Fuck you.',
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
                score: 0.5,
              },
              profanity: {
                expectationId: '',
                evaluation: Evaluation.Good,
                score: 1.0,
              },
            },
          },
        },
      },
      expectedResponse: [
        {
          author: 'them',
          type: ResponseType.Profanity,
          data: {
            text: "Okay, let's calm down.",
          },
        },
      ],
    },
  ],
};

export default scenario;
