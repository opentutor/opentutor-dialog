/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { expect } from 'chai';
import { OpentutorDialogueModel } from '../src/OpentutorDialogueModel';
import {
  OpentutorClassifier,
  OpentutorDefaultClassifier,
} from '../src/OpentutorClassifier';

describe('opentutor dialogue model', () => {
  describe('lesson: navy integrity', () => {
    describe('custom w2v model', () => {
      it('initializes', async () => {
        const classifier = new OpentutorClassifier(
          require('./fixtures/navy-integrity/words_w2v'),
          require('./fixtures/navy-integrity/model_features')
        );
        const model = new OpentutorDialogueModel(
          require('./fixtures/navy-integrity/lesson'),
          classifier
        );
        const init = await model.init({ sessionId: 'test-session-id' });
        expect(init).to.eql({
          lessonId: 'navy-integrity',
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

      it('responds to bad answers with hints', async () => {
        const classifier = new OpentutorClassifier(
          require('./fixtures/navy-integrity/words_w2v'),
          require('./fixtures/navy-integrity/model_features')
        );
        const model = new OpentutorDialogueModel(
          require('./fixtures/navy-integrity/lesson'),
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
          require('./fixtures/navy-integrity/words_w2v'),
          require('./fixtures/navy-integrity/model_features')
        );
        const model = new OpentutorDialogueModel(
          require('./fixtures/navy-integrity/lesson'),
          classifier
        );
        await model.init({ sessionId: 'test-session-id' });
        // answer first expectation and get hint for second
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
        // answer second expectation and get hint for third
        response = await model.respond({
          message:
            "If you correct someone's behavior, you may get them in trouble or it may be harder to work with them.",
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
              text: "How can it affect you when you correct someone's behavior?",
            },
          },
        ]);
        expect(response.sessionInfo.dialogState).to.eql({
          expectationsCompleted: [true, true, false],
          expectationData: [
            {
              ideal:
                'Peer pressure can cause you to allow inappropriate behavior.',
              score: 0.6306547892971618,
              dialogScore: 0,
              numPrompts: 0,
              numHints: 0,
              satisfied: true,
              status: 'complete',
            },
            {
              ideal:
                "If you correct someone's behavior, you may get them in trouble or it may be harder to work with them.",
              score: 0.7491795340041529,
              dialogScore: 0,
              numPrompts: 0,
              numHints: 1,
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
          ],
          currentExpectation: 2,
          hints: true,
          limitHintsMode: false,
          numCorrectStreak: 2,
        });
        expect(response.expectationActive).to.eql(2);
        expect(response.completed).to.eql(false);
        expect(response.score).to.eql(0.7327464859841264);
      });
    });

    describe('default model', () => {
      it('initializes', async () => {
        const classifier = new OpentutorDefaultClassifier(
          require('./fixtures/default/words_w2v'),
          require('./fixtures/default/model_features'),
          require('./fixtures/navy-integrity/lesson')
        );
        const model = new OpentutorDialogueModel(
          require('./fixtures/navy-integrity/lesson'),
          classifier
        );
        const init = await model.init({ sessionId: 'test-session-id' });
        expect(init).to.eql({
          lessonId: 'navy-integrity',
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

      it('responds to bad answers with hints', async () => {
        const classifier = new OpentutorDefaultClassifier(
          require('./fixtures/default/words_w2v'),
          require('./fixtures/default/model_features'),
          require('./fixtures/navy-integrity/lesson')
        );
        const model = new OpentutorDialogueModel(
          require('./fixtures/navy-integrity/lesson'),
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
        const classifier = new OpentutorDefaultClassifier(
          require('./fixtures/default/words_w2v'),
          require('./fixtures/default/model_features'),
          require('./fixtures/navy-integrity/lesson')
        );
        const model = new OpentutorDialogueModel(
          require('./fixtures/navy-integrity/lesson'),
          classifier
        );
        await model.init({ sessionId: 'test-session-id' });
        // answer first expectation and get hint for second
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
            score: 0.6762118905176867,
          },
          {
            expectationId: '1',
            evaluation: 'Good',
            score: 0.5561589934993448,
          },
          {
            expectationId: '2',
            evaluation: 'Bad',
            score: 0.5324870946319362,
          },
        ]);
        expect(response.sessionInfo.dialogState).to.eql({
          expectationsCompleted: [true, false, false],
          expectationData: [
            {
              ideal:
                'Peer pressure can cause you to allow inappropriate behavior.',
              score: 0.6762118905176867,
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
        expect(response.score).to.eql(0.6706119831445682);
        // answer second expectation and get hint for third
        response = await model.respond({
          message:
            "If you correct someone's behavior, you may get them in trouble or it may be harder to work with them.",
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
              text: "How can it affect you when you correct someone's behavior?",
            },
          },
        ]);
        expect(response.sessionInfo.dialogState).to.eql({
          expectationsCompleted: [true, true, false],
          expectationData: [
            {
              ideal:
                'Peer pressure can cause you to allow inappropriate behavior.',
              score: 0.6810426765679989,
              dialogScore: 0,
              numPrompts: 0,
              numHints: 0,
              satisfied: true,
              status: 'complete',
            },
            {
              ideal:
                "If you correct someone's behavior, you may get them in trouble or it may be harder to work with them.",
              score: 0.620810194345846,
              dialogScore: 0,
              numPrompts: 0,
              numHints: 1,
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
          ],
          currentExpectation: 2,
          hints: true,
          limitHintsMode: false,
          numCorrectStreak: 2,
        });
        expect(response.expectationActive).to.eql(2);
        expect(response.completed).to.eql(false);
        expect(response.score).to.eql(0.7379188175613439);
      });
    });
  });

  describe('lesson: current flow', () => {
    describe('default model', () => {
      it('initializes', async () => {
        const classifier = new OpentutorDefaultClassifier(
          require('./fixtures/default/words_w2v'),
          require('./fixtures/default/model_features'),
          require('./fixtures/current-flow/lesson')
        );
        const model = new OpentutorDialogueModel(
          require('./fixtures/current-flow/lesson'),
          classifier
        );
        const init = await model.init({ sessionId: 'test-session-id' });
        expect(init).to.eql({
          lessonId: 'current-flow',
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

      it('responds to bad answers with hints', async () => {
        const classifier = new OpentutorDefaultClassifier(
          require('./fixtures/default/words_w2v'),
          require('./fixtures/default/model_features'),
          require('./fixtures/current-flow/lesson')
        );
        const model = new OpentutorDialogueModel(
          require('./fixtures/current-flow/lesson'),
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
              text: 'Why might you allow bad behavior in a group that you normally would not allow yourself to do?',
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
        ]);
        expect(response.sessionInfo.dialogState).to.eql({
          expectationsCompleted: [false],
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
          ],
          currentExpectation: 0,
          hints: true,
          limitHintsMode: false,
          numCorrectStreak: 0,
        });
        expect(response.expectationActive).to.eql(0);
        expect(response.completed).to.eql(false);
        expect(response.score).to.eql(0.19331656468001174);
        // get another hint for first expectation
        response = await model.respond({
          message: 'aasdfjklsdafsdf',
          username: 'test-user-name',
        });
        response.response[0].data = { text: '' };
        expect(response.response).to.eql([
          {
            author: 'them',
            type: 'feedbackNegative',
            data: { text: '' },
          },
          {
            author: 'them',
            type: 'text',
            data: { text: 'Current flows in the same direction as the arrow.' },
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
        ]);
        expect(response.sessionInfo.dialogState).to.eql({
          expectationsCompleted: [true],
          expectationData: [
            {
              ideal: 'Current flows in the same direction as the arrow.',
              score: 0.3866331293600235,
              dialogScore: 0,
              numPrompts: 0,
              numHints: 1,
              satisfied: false,
              status: 'complete',
            },
          ],
          currentExpectation: 0,
          hints: true,
          limitHintsMode: false,
          numCorrectStreak: 0,
        });
        expect(response.expectationActive).to.eql(-1);
        expect(response.completed).to.eql(true);
        expect(response.score).to.eql(0.19331656468001174);
      });

      it('responds to ideal answer for expectation', async () => {
        const classifier = new OpentutorDefaultClassifier(
          require('./fixtures/default/words_w2v'),
          require('./fixtures/default/model_features'),
          require('./fixtures/current-flow/lesson')
        );
        const model = new OpentutorDialogueModel(
          require('./fixtures/current-flow/lesson'),
          classifier
        );
        await model.init({ sessionId: 'test-session-id' });
        // answer first expectation and get hint for second
        let response = await model.respond({
          message: 'Current flows in the same direction as the arrow.',
          username: 'test-user-name',
        });
        response.response[0].data = { text: '' };
        expect(response.response).to.eql([
          {
            author: 'them',
            type: 'feedbackPositive',
            data: { text: '' },
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
        ]);
        expect(
          response.sessionInfo.sessionHistory.classifierGrades[0]
            .expectationResults
        ).to.eql([
          {
            expectationId: '0',
            evaluation: 'Good',
            score: 0.6606879460268478,
          },
        ]);
        expect(response.sessionInfo.dialogState).to.eql({
          expectationsCompleted: [true],
          expectationData: [
            {
              ideal: 'Current flows in the same direction as the arrow.',
              score: 0.6606879460268478,
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
        });
        expect(response.expectationActive).to.eql(-1);
        expect(response.completed).to.eql(true);
        expect(response.score).to.eql(1);
      });
    });
  });
});
