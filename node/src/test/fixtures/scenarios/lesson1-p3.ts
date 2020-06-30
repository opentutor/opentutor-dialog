import { DialogScenario } from 'test/fixtures/types';

export const scenario: DialogScenario = {
  name:
    'lesson1 part 3: wrong answer to expectation 1 and then system uses a hint',
  lessonId: 'l1',
  expectedRequestResponses: [
    {
      userInput: 'Rules apply differently to the group',
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { evaluation: 'Bad', score: 1.0 },
              { evaluation: 'Good', score: 0.0 },
              { evaluation: 'Good', score: 0.0 },
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
            text: 'Consider this.',
          },
        },
        {
          author: 'them',
          type: 'text',
          data: {
            text:
              'Why might you allow bad behavior in a group that you normally would not allow yourself to do?',
          },
        },
      ],
    },
    {
      userInput: 'Peer pressure',
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { evaluation: 'Good', score: 1.0 },
              { evaluation: 'Good', score: 0.0 },
              { evaluation: 'Good', score: 0.0 },
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
            text: 'How can it affect someone when you correct their behavior?',
          },
        },
      ],
    },
  ],
};

export default scenario;
