/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { expect } from 'chai';
import { OpentutorDialogueModel } from '../src/OpentutorDialogueModel';
import { OpentutorClassifier } from '../src/OpentutorClassifier';

describe('opentutor dialogue model', () => {
  describe('lesson navy integrity', () => {
    it('initializes', async () => {
      const classifier = new OpentutorClassifier(
        require('./fixtures/navy_integrity/words_w2v'),
        require('./fixtures/navy_integrity/model_features')
      );
      const model = new OpentutorDialogueModel(
        require('./fixtures/navy_integrity/lesson'),
        classifier
      );
      const init = await model.init({ sessionId: 'test-session-id' });
      expect(init).to.eql({
        lessonId: 'navy_integrity',
        sessionInfo: {
          sessionHistory: {
            userResponses: [],
            systemResponses: [
              [
                'Here is a question about integrity, a key Navy attribute.',
                'What are the challenges to demonstrating integrity in a group?',
              ],
            ],
            userScores: [],
            classifierGrades: [],
          },
          sessionId: 'test-session-id',
          previousUserResponse: '',
          previousSystemResponse: [
            'Here is a question about integrity, a key Navy attribute.',
            'What are the challenges to demonstrating integrity in a group?',
          ],
          dialogState: {
            expectationsCompleted: [false, false, false],
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
              {
                ideal: '',
                score: 0,
                dialogScore: 0,
                numPrompts: 0,
                numHints: 0,
                satisfied: false,
                status: 'none',
              },
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
              text: 'Here is a question about integrity, a key Navy attribute.',
            },
          },
          {
            author: 'them',
            type: 'mainQuestion',
            data: {
              text: 'What are the challenges to demonstrating integrity in a group?',
            },
          },
        ],
      });
    });

    describe('w2v model', () => {
      it('responds to bad answers with hints', async () => {
        const classifier = new OpentutorClassifier(
          require('./fixtures/navy_integrity/words_w2v'),
          require('./fixtures/navy_integrity/model_features')
        );
        const model = new OpentutorDialogueModel(
          require('./fixtures/navy_integrity/lesson'),
          classifier
        );
        await model.init({ sessionId: 'test-session-id' });
        // get hint for first expectation
        let response = await model.respond({
          message: 'aasdfjklsdafsdf',
          username: 'test-user-name',
        });
        response.response[0].data = { text: '' };
        response.response[1].data = { text: '' };
        expect(response.response).to.eql([
          {
            author: 'them',
            type: 'feedbackNegative',
            data: { text: '' },
          },
          {
            author: 'them',
            type: 'text',
            data: { text: '' },
          },
          {
            author: 'them',
            type: 'hint',
            data: {
              text: 'Whose influence might cause you to overlook bad behavior?',
            },
          },
        ]);
        expect(
          response.sessionInfo.sessionHistory.classifierGrades[0]
            .expectationResults
        ).to.eql([
          {
            expectationId: '0',
            evaluation: 'Bad',
            score: 0.6133668706399765,
          },
          {
            expectationId: '1',
            evaluation: 'Bad',
            score: 0.663895633676956,
          },
          {
            expectationId: '2',
            evaluation: 'Bad',
            score: 0.6272114772684214,
          },
        ]);
        expect(response.sessionInfo.dialogState).to.eql({
          expectationsCompleted: [false, false, false],
          expectationData: [
            {
              ideal: '',
              score: 0,
              dialogScore: 0,
              numPrompts: 0,
              numHints: 0,
              satisfied: false,
              status: 'active',
            },
            {
              ideal: '',
              score: 0,
              dialogScore: 0,
              numPrompts: 0,
              numHints: 0,
              satisfied: false,
              status: 'none',
            },
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
          currentExpectation: 0,
          hints: true,
          limitHintsMode: false,
          numCorrectStreak: 0,
        });
        expect(response.expectationActive).to.eql(0);
        expect(response.completed).to.eql(false);
        expect(response.score).to.eql(0.18258766973577434);
        // get another hint for first expectation
        response = await model.respond({
          message: 'aasdfjklsdafsdf',
          username: 'test-user-name',
        });
        response.response[0].data = { text: '' };
        response.response[1].data = { text: '' };
        expect(response.response).to.eql([
          {
            author: 'them',
            type: 'feedbackNeutral',
            data: { text: '' },
          },
          {
            author: 'them',
            type: 'text',
            data: { text: '' },
          },
          {
            author: 'them',
            type: 'hint',
            data: {
              text: 'What type of pressure might cause you to lower your standards?',
            },
          },
        ]);
        expect(response.sessionInfo.dialogState).to.eql({
          expectationsCompleted: [false, false, false],
          expectationData: [
            {
              ideal: '',
              score: 0,
              dialogScore: 0,
              numPrompts: 0,
              numHints: 1,
              satisfied: false,
              status: 'active',
            },
            {
              ideal: '',
              score: 0,
              dialogScore: 0,
              numPrompts: 0,
              numHints: 0,
              satisfied: false,
              status: 'none',
            },
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
          currentExpectation: 0,
          hints: true,
          limitHintsMode: false,
          numCorrectStreak: 0,
        });
        expect(response.expectationActive).to.eql(0);
        expect(response.completed).to.eql(false);
        expect(response.score).to.eql(0.18258766973577434);
        // get answer for first expectation and hint for second expectation
        response = await model.respond({
          message: 'aasdfjklsdafsdf',
          username: 'test-user-name',
        });
        console.log(JSON.stringify(response));
        response.response[0].data = { text: '' };
        response.response[2].data = { text: '' };
        expect(response.response).to.eql([
          {
            author: 'them',
            type: 'feedbackNegative',
            data: { text: '' },
          },
          {
            author: 'them',
            type: 'text',
            data: {
              text: 'Peer pressure can cause you to allow inappropriate behavior.',
            },
          },
          {
            author: 'them',
            type: 'text',
            data: { text: '' },
          },
          {
            author: 'them',
            type: 'hint',
            data: {
              text: 'How can it affect someone when you correct their behavior?',
            },
          },
        ]);
        expect(response.sessionInfo.dialogState).to.eql({
          expectationsCompleted: [true, false, false],
          expectationData: [
            {
              ideal:
                'Peer pressure can cause you to allow inappropriate behavior.',
              score: 0.3866331293600235,
              dialogScore: 0,
              numPrompts: 0,
              numHints: 2,
              satisfied: false,
              status: 'complete',
            },
            {
              ideal: '',
              score: 0,
              dialogScore: 0,
              numPrompts: 0,
              numHints: 0,
              satisfied: false,
              status: 'active',
            },
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
          currentExpectation: 1,
          hints: true,
          limitHintsMode: false,
          numCorrectStreak: 0,
        });
        expect(response.expectationActive).to.eql(1);
        expect(response.completed).to.eql(false);
        expect(response.score).to.eql(0.18258766973577434);
      });

      it('responds to ideal answer for expectation with hint for next expectation', async () => {
        const classifier = new OpentutorClassifier(
          require('./fixtures/navy_integrity/words_w2v'),
          require('./fixtures/navy_integrity/model_features')
        );
        const model = new OpentutorDialogueModel(
          require('./fixtures/navy_integrity/lesson'),
          classifier
        );
        await model.init({ sessionId: 'test-session-id' });
        // get hint for first expectation
        let response = await model.respond({
          message:
            'Peer pressure can cause you to allow inappropriate behavior.',
          username: 'test-user-name',
        });
        response.response[0].data = { text: '' };
        response.response[1].data = { text: '' };
        expect(response.response).to.eql([
          {
            author: 'them',
            type: 'feedbackPositive',
            data: { text: '' },
          },
          {
            author: 'them',
            type: 'text',
            data: { text: '' },
          },
          {
            author: 'them',
            type: 'hint',
            data: {
              text: 'How can it affect someone when you correct their behavior?',
            },
          },
        ]);
        expect(
          response.sessionInfo.sessionHistory.classifierGrades[0]
            .expectationResults
        ).to.eql([
          {
            expectationId: '0',
            evaluation: 'Good',
            score: 0.8253439296905862,
          },
          {
            expectationId: '1',
            evaluation: 'Good',
            score: 0.5334600138117138,
          },
          {
            expectationId: '2',
            evaluation: 'Bad',
            score: 0.5635210840952418,
          },
        ]);
        expect(response.sessionInfo.dialogState).to.eql({
          expectationsCompleted: [true, false, false],
          expectationData: [
            {
              ideal:
                'Peer pressure can cause you to allow inappropriate behavior.',
              score: 0.8253439296905862,
              dialogScore: 0,
              numPrompts: 0,
              numHints: 0,
              satisfied: true,
              status: 'complete',
            },
            {
              ideal: '',
              score: 0,
              dialogScore: 0,
              numPrompts: 0,
              numHints: 0,
              satisfied: false,
              status: 'active',
            },
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
          currentExpectation: 1,
          hints: true,
          limitHintsMode: false,
          numCorrectStreak: 1,
        });
        expect(response.expectationActive).to.eql(1);
        expect(response.completed).to.eql(false);
        expect(response.score).to.eql(0.6616564882860786);
      });

      it.skip('responds to ideal answer for all expectations', async () => {
        const classifier = new OpentutorClassifier(
          require('./fixtures/navy_integrity/words_w2v'),
          require('./fixtures/navy_integrity/model_features')
        );
        const model = new OpentutorDialogueModel(
          require('./fixtures/navy_integrity/lesson'),
          classifier
        );
        await model.init({ sessionId: 'test-session-id' });
        // get hint for first expectation
        let response = await model.respond({
          message:
            "Peer pressure can cause you to allow inappropriate behavior. If you correct someone's behavior, you may get them in trouble or it may be harder to work with them. Enforcing the rules can make you unpopular.",
          username: 'test-user-name',
        });
      });
    });
  });
});
