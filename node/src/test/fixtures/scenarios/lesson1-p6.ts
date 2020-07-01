import { DialogScenario } from 'test/fixtures/types';
import { Evaluation } from 'models/classifier';

export const scenario: DialogScenario = {
  name:
    'lesson1 part 6: this simply tests hints, prompts and assert but not for the first expectation',
  lessonId: 'q1',
  expectedRequestResponses: [
    {
      userInput: 'Peer pressure can push you to allow inappropriate behavior.',
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { evaluation: Evaluation.Good, score: 1.0 },
              { evaluation: Evaluation.Good, score: 0.0 },
              { evaluation: Evaluation.Good, score: 0.0 },
            ],
          },
        },
      },
      expectedResponse: [
        {
          author: 'them',
          type: 'text',
          data: {
            text: 'Great',
          },
        },
        {
          author: 'them',
          type: 'text',
          data: {
            text: 'Consider this.',
          },
        },
        {
          author: 'them',
          type: 'text',
          data: {
            text: 'How can it affect someone when you correct their behavior?',
          },
        },
      ],
    },
    {
      userInput: "I don't know",
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { evaluation: Evaluation.Good, score: 0.0 },
              { evaluation: Evaluation.Good, score: 0.0 },
              { evaluation: Evaluation.Good, score: 0.0 },
            ],
          },
        },
      },
      expectedResponse: [
        {
          author: 'them',
          type: 'text',
          data: {
            text:
              'Some people get confused at this point. Try typing whatever you are thinking and we will go from there.',
          },
        },
        {
          author: 'them',
          type: 'text',
          data: {
            text: 'See if you can get this',
          },
        },
        {
          author: 'them',
          type: 'text',
          data: {
            text:
              'How can it affect someone emotionally when you correct their behavior?',
          },
        },
      ],
    },
    {
      userInput: 'it may be harder to work with them',
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { evaluation: Evaluation.Good, score: 0.0 },
              { evaluation: Evaluation.Good, score: 1.0 },
              { evaluation: Evaluation.Good, score: 0.0 },
            ],
          },
        },
      },
      expectedResponse: [
        {
          author: 'them',
          type: 'text',
          data: {
            text: 'Great',
          },
        },
        {
          author: 'them',
          type: 'text',
          data: {
            text: 'Consider this.',
          },
        },
        {
          author: 'them',
          type: 'text',
          data: {
            text: "How can it affect you when you correct someone's behavior?",
          },
        },
      ],
    },
  ],
};

export default scenario;
