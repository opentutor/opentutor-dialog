/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { expect } from 'chai';
import currentFlowLesson from './fixtures/lessons/current-flow-lesson';
import { OpentutorDialogueModel } from '../src/OpentutorDialogueModel';

describe('opentutor dialogue model', () => {
  describe('default classifier, current flow lesson', () => {
    it('init', async () => {
      const model = new OpentutorDialogueModel(currentFlowLesson);
      const response = await model.init({ sessionId: 'test-session-id' });
      expect(response).to.eql({
        lessonId: 'q2',
        sessionInfo: {
          sessionHistory: {
            userResponses: [],
            systemResponses: [
              [
                '_user_, this is a warm up question on the behavior of P-N junction diodes.',
                'With a DC input source, does current flow in the same or the opposite direction of the diode arrow?',
              ],
            ],
            userScores: [],
            classifierGrades: [],
          },
          sessionId: 'test-session-id',
          previousUserResponse: '',
          previousSystemResponse: [
            '_user_, this is a warm up question on the behavior of P-N junction diodes.',
            'With a DC input source, does current flow in the same or the opposite direction of the diode arrow?',
          ],
          dialogState: {
            expectationsCompleted: [false],
            expectationData: [
              {
                ideal: '',
                score: 0,
                dialogScore: 0,
                numPrompts: 0,
                numHints: 0,
                satisfied: false,
                status: 'none',
              },
            ],
            currentExpectation: -1,
            hints: false,
            limitHintsMode: false,
            numCorrectStreak: 0,
          },
        },
        response: [
          {
            author: 'them',
            type: 'opening',
            data: {
              text: '_user_, this is a warm up question on the behavior of P-N junction diodes.',
            },
          },
          {
            author: 'them',
            type: 'mainQuestion',
            data: {
              text: 'With a DC input source, does current flow in the same or the opposite direction of the diode arrow?',
            },
          },
        ],
      });
    });

    it.skip('respond with ideal answer for expectation', async () => {
      const model = new OpentutorDialogueModel(currentFlowLesson);
      await model.init({ sessionId: 'test-session-id' });
      const response = await model.respond({
        message: 'current flows in the same direction as the arrow',
        username: 'test-user-name',
      });
      expect(response).to.eql({
        sessionInfo: {
          sessionHistory: {
            userResponses: [
              {
                text: 'current flows in the same direction as the arrow',
                activeExpectation: -1,
              },
            ],
            systemResponses: [
              [
                '_user_, this is a warm up question on the behavior of P-N junction diodes.',
                'With a DC input source, does current flow in the same or the opposite direction of the diode arrow?',
              ],
              [
                'Correct.',
                'Summing up, this diode is forward biased. Positive current flows in the same direction of the arrow, from anode to cathode.',
                "Let's try a different problem.",
              ],
            ],
            userScores: [],
            classifierGrades: [
              {
                expectationResults: [
                  {
                    expectationId: '0',
                    evaluation: 'Good',
                    score: 1,
                  },
                ],
                speechActs: {
                  metacognitive: {
                    expectationId: '0',
                    evaluation: 'Good',
                    score: 0,
                  },
                  profanity: {
                    expectationId: '0',
                    evaluation: 'Good',
                    score: 0,
                  },
                },
              },
            ],
          },
          sessionId: 'test-session-id',
          previousUserResponse:
            'current flows in the same direction as the arrow',
          previousSystemResponse: [
            'Correct.',
            'Summing up, this diode is forward biased. Positive current flows in the same direction of the arrow, from anode to cathode.',
            "Let's try a different problem.",
          ],
          dialogState: {
            expectationsCompleted: [true],
            expectationData: [
              {
                ideal: 'Current flows in the same direction as the arrow.',
                score: 1,
                dialogScore: 0,
                numPrompts: 0,
                numHints: 0,
                satisfied: true,
                status: 'complete',
              },
            ],
            currentExpectation: -1,
            hints: false,
            limitHintsMode: false,
            numCorrectStreak: 1,
          },
        },
        response: [
          {
            author: 'them',
            type: 'feedbackPositive',
            data: {
              text: 'Correct.',
            },
          },
          {
            author: 'them',
            type: 'closing',
            data: {
              text: 'Summing up, this diode is forward biased. Positive current flows in the same direction of the arrow, from anode to cathode.',
            },
          },
          {
            author: 'them',
            type: 'closing',
            data: {
              text: "Let's try a different problem.",
            },
          },
        ],
        sentToGrader: false,
        completed: true,
        score: 1,
        expectationActive: -1,
      });
    });

    it.skip('respond with bad answer for expectation', async () => {
      const model = new OpentutorDialogueModel(currentFlowLesson);
      await model.init({ sessionId: 'test-session-id' });
      const response = await model.respond({
        message: 'blah',
        username: 'test-user-name',
      });
      expect(response).to.eql({
        completed: false,
        expectationActive: 0,
        response: [
          { author: 'them', data: { text: 'I see.' }, type: 'feedbackNeutral' },
          { author: 'them', data: { text: 'Think about this.' }, type: 'text' },
          {
            author: 'them',
            data: {
              text: 'Why might you allow bad behavior in a group that you normally would not allow yourself to do?',
            },
            type: 'hint',
          },
        ],
        score: 0.5,
        sentToGrader: false,
        sessionInfo: {
          dialogState: {
            currentExpectation: 0,
            expectationData: [
              {
                dialogScore: 0,
                ideal: '',
                numHints: 0,
                numPrompts: 0,
                satisfied: false,
                score: 0,
                status: 'active',
              },
            ],
            expectationsCompleted: [false],
            hints: true,
            limitHintsMode: false,
            numCorrectStreak: 0,
          },
          previousSystemResponse: [
            'I see.',
            'Think about this.',
            'Why might you allow bad behavior in a group that you normally would not allow yourself to do?',
          ],
          previousUserResponse: 'blah',
          sessionHistory: {
            classifierGrades: [
              {
                expectationResults: [
                  { evaluation: 'Bad', expectationId: '0', score: 0 },
                ],
                speechActs: {
                  metacognitive: {
                    evaluation: 'Good',
                    expectationId: '0',
                    score: 0,
                  },
                  profanity: {
                    evaluation: 'Good',
                    expectationId: '0',
                    score: 0,
                  },
                },
              },
            ],
            systemResponses: [
              [
                '_user_, this is a warm up question on the behavior of P-N junction diodes.',
                'With a DC input source, does current flow in the same or the opposite direction of the diode arrow?',
              ],
              [
                'I see.',
                'Think about this.',
                'Why might you allow bad behavior in a group that you normally would not allow yourself to do?',
              ],
            ],
            userResponses: [{ activeExpectation: -1, text: 'blah' }],
            userScores: [],
          },
          sessionId: 'test-session-id',
        },
      });
    });
  });
});
