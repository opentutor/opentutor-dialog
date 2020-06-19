import { DialogScenario } from 'test/fixtures/types';

export const scenario: DialogScenario = {
  name: 'lesson1 part 1',
  lessonId: 'l1',
  expectedRequestResponses: [
    {
      userInput: 'hello',
      expectedResponse: {
        author: 'me',
        type: 'text',
        data: {
          text: 'something',
        },
      },
    },
  ],
};

export default scenario;
