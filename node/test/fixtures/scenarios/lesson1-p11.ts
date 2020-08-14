import { DialogScenario } from 'test/fixtures/types';
import { Evaluation } from 'apis/classifier';
import { ResponseType } from 'dialog/response-data';

//navy integrity perfect answer
export const scenario: DialogScenario = {
    name: 'lesson1 part 11: metacognitive response test',
    lessonId: 'q1',
    expectedRequestResponses: [
        {
            userInput:
                "I dont know",
            mockClassifierResponse: {
                data: {
                    output: {
                        expectationResults: [
                            { evaluation: Evaluation.Good, score: 0.5 },
                            { evaluation: Evaluation.Good, score: 0.5 },
                            { evaluation: Evaluation.Good, score: 0.5 },
                        ],
                        speechActs: {
                            metaCognitive:
                                { evaluation: Evaluation.Good, score: 1.0 },
                            profanity:
                                { evaluation: Evaluation.Good, score: 0.5 },
                        }
                    },
                },
            },
            expectedResponse: [
                {
                    author: 'them',
                    type: ResponseType.Encouragement,
                    data: {
                        text: 'Some people get confused at this point. Try typing whatever you are thinking and we will go from there.',
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
                        text:
                            'Why might you allow bad behavior in a group that you normally would not allow yourself to do?',
                    },
                }
            ],
        },
    ],
};

export default scenario;
