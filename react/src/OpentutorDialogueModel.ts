/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  Classifier,
  DialogConfig,
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

export class OpentutorDialogueModel implements DialogueModel {
  lesson: Lesson;
  classifier: Classifier;
  config: DialogConfig;
  sdp: SessionData;

  constructor(lesson: Lesson, classifier: Classifier) {
    this.lesson = lesson;
    this.classifier = classifier;
    this.config = toConfig(lesson);
  }

  async init(props: InitRequest): Promise<InitResponse> {
    const handler = await handlerFor(this.lesson);
    this.sdp = newSession(this.lesson, props.sessionId);
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
