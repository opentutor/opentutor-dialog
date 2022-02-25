/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  ClassfierRequest,
  Classifier,
  ClassifierResponse,
  DialogConfig,
  Evaluation,
  ExpectationResult,
  ExpectationStatus,
  Lesson,
  OpenTutorResponse,
  ResponseType,
  SessionData,
} from './types';
import { toConfig } from './config';
import { handlerFor } from './handler';
import { calculateScore } from './dialog';
import { addTutorDialog, addUserDialog, newSession } from './session-data';
import { LessonExpectation } from '.';

export interface DialogueModel {
  init: (props: InitRequest) => Promise<InitResponse>;
  respond: (props: RespondRequest) => Promise<RespondResponse>;
}

interface InitRequest {
  sessionId: string;
}
interface InitResponse {
  lessonId: string;
  sessionInfo: SessionData;
  response: OpenTutorResponse[];
}
interface RespondRequest {
  message: string;
  username: string;
}
interface RespondResponse {
  sessionInfo: SessionData;
  response: OpenTutorResponse[];
  sentToGrader: boolean;
  completed: boolean;
  score: number;
  expectationActive: number;
}

function normalizeInput(str: string): string {
  return str.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, '');
}

export class OpentutorDefaultClassifier implements Classifier {
  lesson: Lesson;
  expectationResults: ExpectationResult[];

  constructor(lesson: Lesson) {
    this.lesson = lesson;
    this.expectationResults = [];
  }

  async evaluate(props: ClassfierRequest): Promise<ClassifierResponse> {
    console.log(props);
    let expectation: LessonExpectation;
    const input = normalizeInput(props.input);
    if (props.expectation) {
      expectation = this.lesson.expectations[props.expectation];
    } else {
      expectation =
        this.lesson.expectations.find(
          (e) => input === normalizeInput(e.expectation)
        ) ||
        this.lesson.expectations.find((e) =>
          this.expectationResults.find(
            (er) =>
              er.expectationId === e.expectationId &&
              er.evaluation === Evaluation.Bad
          )
        ) ||
        this.lesson.expectations.find(
          (e) =>
            !this.expectationResults
              .map((er) => er.expectationId)
              .includes(e.expectationId)
        );
    }
    const score =
      input ===
      expectation.expectation.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, '')
        ? 1
        : 0;
    const idx = this.expectationResults.findIndex(
      (er) => er.expectationId === expectation.expectationId
    );
    if (idx === -1) {
      this.expectationResults.push({
        expectationId: expectation.expectationId,
        evaluation: score > 0.5 ? Evaluation.Good : Evaluation.Bad,
        score: score,
      });
    } else {
      this.expectationResults[idx] = {
        expectationId: expectation.expectationId,
        evaluation: score > 0.5 ? Evaluation.Good : Evaluation.Bad,
        score: score,
      };
    }
    return {
      output: {
        expectationResults: this.expectationResults,
        speechActs: {
          metacognitive: {
            expectationId: expectation.expectationId,
            evaluation: Evaluation.Good,
            score: 0,
          },
          profanity: {
            expectationId: expectation.expectationId,
            evaluation: Evaluation.Good,
            score: 0,
          },
        },
      },
    };
  }
}

export class OpentutorDialogueModel implements DialogueModel {
  lesson: Lesson;
  classifier: Classifier;
  config: DialogConfig;
  sdp: SessionData;

  constructor(lesson: Lesson, classifier?: Classifier) {
    this.lesson = lesson;
    this.config = toConfig(lesson);
    if (classifier) {
      this.classifier = classifier;
    } else {
      this.classifier = new OpentutorDefaultClassifier(lesson);
    }
  }

  async init(props: InitRequest): Promise<InitResponse> {
    this.sdp = newSession(this.lesson, props.sessionId);
    const handler = await handlerFor(this.lesson);
    const messages = await handler.beginDialog();
    addTutorDialog(this.sdp, messages);
    return {
      lessonId: this.lesson.lessonId,
      sessionInfo: this.sdp,
      response: messages,
    };
  }

  async respond(props: RespondRequest): Promise<RespondResponse> {
    if (!this.sdp) {
      throw new Error('No session data');
    }
    //if last system message was a closing, send error
    if (this.sdp.dialogState.expectationsCompleted.every((v) => v == true)) {
      throw new Error('Session is already terminated');
    }
    const handler = await handlerFor(this.lesson);
    addUserDialog(this.sdp, props.message);
    const msg = await handler.process(this.sdp, this.classifier);
    addTutorDialog(this.sdp, msg);
    const currentExpectation = this.sdp.dialogState.expectationData.findIndex(
      (e) => e.status === ExpectationStatus.Active
    );
    return {
      sessionInfo: this.sdp,
      response: msg,
      sentToGrader: false,
      completed: msg.find((m) => m.type === ResponseType.Closing)
        ? true
        : false,
      score: calculateScore(this.sdp),
      expectationActive: currentExpectation,
    };
  }
}
