import { DialogScenario } from 'test/fixtures/types';

//navy integrity perfect answer
export const scenario: DialogScenario = {
  name: 'lesson1 part 1',
  lessonId: 'l1',
  expectedRequestResponses: [
    {
      userInput:
        "Peer pressure can cause you to allow inappropriate behavior. If you correct someone's behavior, you may get them in trouble or it may be harder to work with them. Enforcing the rules can make you unpopular.",
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { evaluation: 'Good', score: 1.0 },
              { evaluation: 'Good', score: 1.0 },
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
