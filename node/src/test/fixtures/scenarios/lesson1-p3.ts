import { DialogScenario } from 'test/fixtures/types';

export const scenario: DialogScenario = {
  name: 'lesson1 part 2',
  lessonId: 'l1',
  expectedRequestResponses: [
    {
      userInput: 'Rules apply differently to the group',
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { evaluation: 'Bad', score: 1.0 },
              { evaluation: 'Neutral', score: 0.0 },
              { evaluation: 'Neutral', score: 0.0 },
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
            text: 'How can it affect you when you correct their behavior?',
          },
        },
      ],
    },
    {
      userInput: 'Enforcing the rules can make you unpopular.',
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { evaluation: 'Neutral', score: 0.0 },
              { evaluation: 'Good', score: 1.0 },
              { evaluation: 'Neutral', score: 0.0 },
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
    {
      userInput:
        "If you correct someone's behavior, you may get them in trouble or it may be harder to work with them.",
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { evaluation: 'Neutral', score: 0.0 },
              { evaluation: 'Neutral', score: 0.0 },
              { evaluation: 'Good', score: 1.0 },
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
            text:
              'Peer pressure can push you to allow and participate in inappropriate behavior.',
          },
        },
        {
          author: 'them',
          type: 'text',
          data: {
            text:
              "When you correct somone's behavior, you may get them in trouble or negatively impact your relationship with them.",
          },
        },
        {
          author: 'them',
          type: 'text',
          data: {
            text:
              'However, integrity means speaking out even when it is unpopular.',
          },
        },
      ],
    },
  ],
};

export default scenario;
