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
              { evaluation: Evaluation.Good, score: 0.5 },
              { evaluation: Evaluation.Good, score: 0.5 },
              { evaluation: Evaluation.Good, score: 0.5 },
            ],
            speechActs: {
              metacognitive: { evaluation: Evaluation.Good, score: 1.0 },
              profanity: { evaluation: Evaluation.Good, score: 0.5 },
            },
          },
        },
      },
      expectedResponse: [
        {
          author: 'them',
          type: ResponseType.Encouragement,
          data: {
            text: 'this is another placeholder',
          },
        },
        {
          author: 'them',
          type: ResponseType.FeedbackNeutral,
          data: {
            text: 'Okay.',
          },
        },
        {
          author: 'them',
          type: ResponseType.Text,
          data: {
            text: "Let's work through this together.",
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
