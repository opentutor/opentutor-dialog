import { DialogScenario } from '../types';
import { Evaluation } from '../../../src/apis/classifier';
import { ResponseType } from '../../../src/dialog/response-data';

export const scenario: DialogScenario = {
  name: 'lesson7-double-feedback-t3',
  lessonId: 'q7',
  expectedRequestResponses: [
    {
      userInput: 'Rules apply differently to the group',   //represents what user is putting into system
      mockClassifierResponse: {
        data: {
          data: {
            output: {
              expectationResults: [
                { expectationId: '0', evaluation: Evaluation.Good, score: 0.6187730549533078 },
                { expectationId: '1', evaluation: Evaluation.Bad, score: 0.0 },
                { expectationId: '2', evaluation: Evaluation.Bad, score: 0.0 },
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
                  score: 0.5,
                },
              },
            },
          },
        },
      },
      expectedResponse: [
        {
          author: 'them',
          type: ResponseType.FeedbackPositive,
          data: {
            text: "Correct.",
          },
        },
        {
          author: 'them',
          type: ResponseType.Hint,
          data: {
            text: 'Anything else?',
          },
        },
      ],
    },
    
  ],
};

export default scenario;
