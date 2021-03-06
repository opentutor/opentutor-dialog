import { DialogScenario } from 'test/fixtures/types';
import { Evaluation } from 'apis/classifier';
import { ResponseType } from 'dialog/response-data';

export const scenario: DialogScenario = {
  name: 'suicide prevention bystander training - uses sensitive negative responses for lesson marked as sensistive',
  lessonId: 'q5',
  expectedRequestResponses: [
    {
      userInput:
        "losing it doesn't affect anything. you can't stop people who made up their mind",
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { evaluation: Evaluation.Bad, score: 0.8 },
              { evaluation: Evaluation.Good, score: 0.5 },
            ],
            speechActs: {
              metacognitive: { evaluation: Evaluation.Good, score: 0.5 },
              profanity: { evaluation: Evaluation.Good, score: 0.5 },
            },
          },
        },
      },
      expectedResponse: [
        {
          author: 'them',
          type: ResponseType.FeedbackNeutral,
          data: {
            text: 'Ok.',
          },
        },
        {
          author: 'them',
          type: ResponseType.Text,
          data: {
            text: 'Consider this.',
          },
        },
        {
          author: 'them',
          type: ResponseType.Hint,
          data: {
            text: 'Compared to when they knew a clear way to commit suicide, does their long term suicide risk change?',
          },
        },
      ],
    },
    {
      userInput: "it doesn't, you wouldn't be affected",
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { evaluation: Evaluation.Bad, score: 0.7 },
              { evaluation: Evaluation.Good, score: 0.5 },
            ],
            speechActs: {
              metacognitive: { evaluation: Evaluation.Good, score: 0.5 },
              profanity: { evaluation: Evaluation.Good, score: 0.5 },
            },
          },
        },
      },
      expectedResponse: [
        {
          author: 'them',
          type: ResponseType.FeedbackNeutral,
          data: {
            text: 'Ok.',
          },
        },
        {
          author: 'them',
          type: ResponseType.Hint,
          data: {
            text: 'Are they more likely to just "find another way" or to not attempt suicide later?',
          },
        },
      ],
    },
    {
      userInput: 'they will',
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { evaluation: Evaluation.Bad, score: 0.7 },
              { evaluation: Evaluation.Good, score: 0.5 },
            ],
            speechActs: {
              metacognitive: { evaluation: Evaluation.Good, score: 0.5 },
              profanity: { evaluation: Evaluation.Good, score: 0.5 },
            },
          },
        },
      },
      expectedResponse: [
        {
          author: 'them',
          type: ResponseType.FeedbackNeutral,
          data: {
            text: 'Ok.',
          },
        },
        {
          author: 'them',
          type: ResponseType.Hint,
          data: {
            text: 'Compared to before they lost their means to commit suicide (e.g., a gun), how does their risk change?',
          },
        },
      ],
    },
    {
      userInput: "their risk doesn't change",
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { evaluation: Evaluation.Bad, score: 0.7 },
              { evaluation: Evaluation.Good, score: 0.5 },
            ],
            speechActs: {
              metacognitive: { evaluation: Evaluation.Good, score: 0.5 },
              profanity: { evaluation: Evaluation.Good, score: 0.5 },
            },
          },
        },
      },
      expectedResponse: [
        {
          author: 'them',
          type: ResponseType.FeedbackNegative,
          data: {
            text: "I'm not sure about that.",
          },
        },
        {
          author: 'them',
          type: ResponseType.Text,
          data: {
            text: 'They will be much less likely to commit suicide and will probably not attempt suicide later.',
          },
        },
        {
          author: 'them',
          type: ResponseType.Hint,
          data: {
            text: 'Compared to other people, how likely is this person to commit suicide?',
          },
        },
      ],
    },
    {
      userInput: "They aren't as likely",
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { evaluation: Evaluation.Bad, score: 0.5 },
              { evaluation: Evaluation.Bad, score: 0.8 },
            ],
            speechActs: {
              metacognitive: { evaluation: Evaluation.Good, score: 0.5 },
              profanity: { evaluation: Evaluation.Good, score: 0.5 },
            },
          },
        },
      },
      expectedResponse: [
        {
          author: 'them',
          type: ResponseType.FeedbackNeutral,
          data: {
            text: 'Ok.',
          },
        },
        {
          author: 'them',
          type: ResponseType.Hint,
          data: {
            text: 'After removing the means for suicide, how likely are they to commit suicide versus other people?',
          },
        },
      ],
    },
    {
      userInput: 'they are the same likely',
      mockClassifierResponse: {
        data: {
          output: {
            expectationResults: [
              { evaluation: Evaluation.Bad, score: 0.5 },
              { evaluation: Evaluation.Bad, score: 0.7 },
            ],
            speechActs: {
              metacognitive: { evaluation: Evaluation.Good, score: 0.5 },
              profanity: { evaluation: Evaluation.Good, score: 0.5 },
            },
          },
        },
      },
      expectedResponse: [
        {
          author: 'them',
          type: ResponseType.FeedbackNeutral,
          data: {
            text: 'Ok.',
          },
        },
        {
          author: 'them',
          type: ResponseType.Text,
          data: {
            text: 'The person is still at risk compared to other people.',
          },
        },
        {
          author: 'them',
          data: {
            text: 'Most people do not attempt suicide again if their plan is interrupted or if they survive a suicide attempt. This means that removing guns, pills, or other ways to commit suicide are very important.',
          },
          type: 'closing',
        },
        {
          author: 'them',
          data: {
            text: 'However, a person with suicidal thoughts is still at-risk and they should receive professional help to decrease their risk and improve their quality of life.',
          },
          type: 'closing',
        },
      ],
    },
  ],
};

export default scenario;
