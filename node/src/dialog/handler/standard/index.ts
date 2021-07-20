/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import Dialog, { Prompt, Expectation } from './types';
import SessionData, {
  addClassifierGrades,
  ExpectationStatus,
  SessionHistory,
} from 'dialog/session-data';
import {
  evaluate,
  ClassifierResponse,
  Evaluation,
  ExpectationResult,
  Expectation as CExpectation,
} from 'apis/classifier';
import OpenTutorResponse, {
  createTextResponse,
  ResponseType,
} from 'dialog/response-data';
import { pickRandom, nextRandom } from 'dialog/random';

import { DialogHandler } from '../types';
import { Lesson } from 'apis/lessons';
import DialogConfig from './types';
import { toConfig, allowNegativeFeedback } from './config';

function setActiveExpecation(sdp: SessionData) {
  //find the current active expecation and log it.
  sdp.dialogState.currentExpectation =
    sdp.dialogState.expectationData.findIndex(
      (e) => e.status === ExpectationStatus.Active
    );
}

export async function processUserResponse(
  lessonId: string,
  atd: Dialog,
  sdp: SessionData
): Promise<OpenTutorResponse[]> {
  let classifierResult: ClassifierResponse;
  try {
    atd.expectations.map((exp) => {
      return {
        ideal: exp.expectation,
      } as CExpectation;
    });
    classifierResult = await evaluate({
      input: sdp.previousUserResponse,
      lesson: lessonId,
      config: {
        question: '', //atd.questionText,
        expectations: [], //expectations,
      },
    });
  } catch (err) {
    throw Object.assign(
      err,
      `${err.response && err.response.status}` === '404'
        ? {
            status: 404,
            message: `classifier cannot find lesson '${lessonId}'`,
          }
        : {
            status: 502,
            message: err.message,
          }
    );
  }

  const expectationResults = classifierResult.output.expectationResults;
  const speechActs = classifierResult.output.speechActs;
  //add results to the session history
  addClassifierGrades(sdp, {
    expectationResults: classifierResult.output.expectationResults,
    speechActs: classifierResult.output.speechActs,
  });
  const responses: OpenTutorResponse[] = [];

  //check if user used profanity or metacog response
  if (
    speechActs?.profanity?.score > atd.goodThreshold &&
    speechActs?.profanity?.evaluation === Evaluation.Good
  ) {
    responses.push(
      createTextResponse(
        pickRandom(atd.profanityFeedback),
        ResponseType.Profanity
      )
    );
    return responses;
  } else if (
    speechActs?.metacognitive?.score > atd.goodMetacognitiveThreshold &&
    speechActs?.metacognitive?.evaluation === Evaluation.Good &&
    expectationResults.every(
      (x) => x.evaluation === Evaluation.Good && x.score <= atd.goodThreshold
    )
  ) {
    //50 percent of the time it will use encouragement. Else, it will go on.
    if (nextRandom() < 0.5) {
      responses.push(
        createTextResponse(
          pickRandom(atd.confusionFeedback),
          ResponseType.Encouragement
        )
      );
      return responses;
    } else {
      responses.push(
        createTextResponse(
          pickRandom(atd.confusionFeedbackWithHint),
          ResponseType.Encouragement
        )
      );
      return responses.concat(toNextExpectation(atd, sdp));
    }
  }

  //check if response was for a prompt
  let p: Prompt;
  let e: Expectation = atd.expectations.find((e) => {
    p = e.prompts.find((p) => sdp.previousSystemResponse.includes(p.prompt));
    return Boolean(p);
  });
  if (e && p) {
    //response was to a prompt.
    return responses.concat(
      handlePrompt(lessonId, atd, sdp, expectationResults, e, p)
    );
  }

  //check if response was to a hint
  let h: string;
  e = atd.expectations.find((e) => {
    h = e.hints.find((n) => sdp.previousSystemResponse.includes(n));
    return Boolean(h);
  });
  if (e && h) {
    //response is to a hint
    return responses.concat(
      handleHints(lessonId, atd, sdp, expectationResults, e, h)
    );
  }

  if (
    expectationResults.every(
      (x) => x.evaluation === Evaluation.Good && x.score > atd.goodThreshold
    )
  ) {
    //perfect answer
    updateCompletedExpectations(expectationResults, sdp, atd);
    return responses.concat(giveClosingRemarks(atd, sdp));
  } else if (
    expectationResults.every(
      (x) =>
        (x.score < atd.goodThreshold && x.evaluation === Evaluation.Good) ||
        (x.score < atd.badThreshold && x.evaluation === Evaluation.Bad)
    )
  ) {
    //answer did not match any expectation, guide user through expectations
    responses.push(
      createTextResponse(
        pickRandom(atd.neutralFeedback),
        ResponseType.FeedbackNeutral
      )
    );
    return responses.concat(toNextExpectation(atd, sdp));
  } else if (
    expectationResults.find(
      (x) => x.evaluation === Evaluation.Good && x.score > atd.goodThreshold
    ) &&
    expectationResults.find(
      (x) => x.evaluation === Evaluation.Bad && x.score > atd.badThreshold
    )
  ) {
    //satisfied one expectation but gave very wrong answer(s) for others
    updateCompletedExpectations(expectationResults, sdp, atd);
    responses.push(
      createTextResponse(
        pickRandom(atd.expectationMetButOthersWrongFeedback),
        ResponseType.FeedbackNeutral
      )
    );
    return responses.concat(toNextExpectation(atd, sdp));
  } else if (
    expectationResults.find(
      (x) => x.evaluation === Evaluation.Good && x.score > atd.goodThreshold
    )
  ) {
    //matched atleast one specific expectation
    updateCompletedExpectations(expectationResults, sdp, atd);
    responses.push(givePositiveFeedback(atd, sdp));
    return responses.concat(toNextExpectation(atd, sdp));
  } else if (
    expectationResults.find(
      (x) => x.evaluation === Evaluation.Bad && x.score > atd.badThreshold
    )
  ) {
    //bad answer. use hint
    const expectationId = expectationResults.indexOf(
      expectationResults.find(
        (x) => x.evaluation === Evaluation.Bad && x.score > atd.badThreshold
      )
    );
    sdp.dialogState.hints = true;
    sdp.dialogState.expectationData[expectationId].status =
      ExpectationStatus.Active;
    setActiveExpecation(sdp);

    responses.push(giveNegativeFeedback(false, atd, sdp));
    // check that a pump was not just added to responses, if not use hint
    if (responses[responses.length - 1].type !== ResponseType.Hint) {
      responses.push(
        createTextResponse(pickRandom(atd.hintStart)),
        createTextResponse(
          atd.expectations[expectationId].hints[0],
          ResponseType.Hint
        )
      );
    }
    return responses;
  }
  return responses.concat([
    createTextResponse('this path has not been implemented yet.'),
  ]);
}

function updateCompletedExpectations(
  expectationResults: ExpectationResult[],
  sdp: SessionData,
  atd: Dialog
) {
  //this function basically updates the dialog state to denote whichever expectations are met.
  const expectationIds: number[] = [];
  let i;
  for (i = 0; i < expectationResults.length; i++) {
    if (
      expectationResults[i].evaluation === Evaluation.Good &&
      expectationResults[i].score > atd.goodThreshold
    ) {
      expectationIds.push(i);
    }
  }
  expectationIds.forEach((expectationId) => {
    sdp.dialogState.expectationsCompleted[expectationId] = true;
    sdp.dialogState.expectationData[expectationId].ideal =
      atd.expectations[expectationId].expectation;
    sdp.dialogState.expectationData[expectationId].status =
      ExpectationStatus.Complete;
    sdp.dialogState.expectationData[expectationId].score = normalizeScores(
      expectationResults[expectationId]
    );
    sdp.dialogState.expectationData[expectationId].satisfied = true;
  });
}
export function toNextExpectation(
  atd: Dialog,
  sdp: SessionData
): OpenTutorResponse[] {
  //give positive feedback, and ask next expectation question
  let answer: OpenTutorResponse[] = [];
  if (sdp.dialogState.expectationsCompleted.indexOf(false) != -1) {
    sdp.dialogState.hints = true;
    sdp.dialogState.expectationData[
      sdp.dialogState.expectationsCompleted.indexOf(false)
    ].status = ExpectationStatus.Active;
    setActiveExpecation(sdp);
    answer.push(createTextResponse(pickRandom(atd.hintStart)));
    if (
      atd.expectations[sdp.dialogState.expectationsCompleted.indexOf(false)]
        .hints[0]
    ) {
      answer.push(
        createTextResponse(
          atd.expectations[sdp.dialogState.expectationsCompleted.indexOf(false)]
            .hints[0],
          ResponseType.Hint
        )
      );
    } else
      answer.push(
        createTextResponse('Think about the answer!', ResponseType.Hint)
      );
  } else {
    answer = answer.concat(giveClosingRemarks(atd, sdp));
  }
  return answer;
}

function giveClosingRemarks(atd: Dialog, sdp: SessionData) {
  // Give feedback based on score and hints used for survey style
  let answer: OpenTutorResponse[] = [];
  if (atd.hasSummaryFeedback) {
    if (!sdp.dialogState.expectationData.find((e) => e.numHints > 0)) {
      // give highly positive feedback if all expectations were met with no hints in survey says style
      answer = answer.concat(
        createTextResponse(
          pickRandom(atd.perfectFeedback),
          ResponseType.FeedbackPositive
        )
      );
    } else if (calculateScore(sdp) > 0.8) {
      answer = answer.concat(
        createTextResponse(
          pickRandom(atd.closingPositiveFeedback),
          ResponseType.FeedbackPositive
        )
      );
    } else {
      answer = answer.concat(
        createTextResponse(
          pickRandom(atd.closingNegativeFeedback),
          ResponseType.FeedbackNegative
        )
      );
    }
  } else if (!sdp.dialogState.expectationData.find((e) => e.numHints > 0)) {
    answer = answer.concat(givePositiveFeedback(atd, sdp));
  }
  answer = answer.concat(
    atd.recapText.map((rt) => createTextResponse(rt, ResponseType.Closing))
  );
  // Give goodbye greeting for sensitive lesson
  if (atd.farewell.length !== 0) {
    answer = answer.concat(
      createTextResponse(pickRandom(atd.farewell), ResponseType.Closing)
    );
  }
  return answer;
}

function givePositiveFeedback(atd: Dialog, sdp: SessionData) {
  if (
    atd.expectationsLeftFeedback.length !== 0 &&
    sdp.dialogState.expectationsCompleted.indexOf(false) !== -1
  ) {
    return createTextResponse(
      [
        pickRandom(atd.positiveFeedback),
        pickRandom(atd.expectationsLeftFeedback),
      ].join(' '),
      ResponseType.FeedbackPositive
    );
  } else {
    return createTextResponse(
      pickRandom(atd.positiveFeedback),
      ResponseType.FeedbackPositive
    );
  }
}

function giveNegativeFeedback(
  expectationEnded: boolean,
  atd: Dialog,
  sdp: SessionData
) {
  if (allowNegativeFeedback(atd, sdp)) {
    return createTextResponse(
      pickRandom(atd.negativeFeedback),
      ResponseType.FeedbackNegative
    );
  } else {
    if (
      nextRandom() < 0.5 ||
      expectationEnded ||
      sdp.sessionHistory.userResponses.length === 1
    ) {
      return createTextResponse(
        pickRandom(atd.neutralFeedback),
        ResponseType.FeedbackNeutral
      );
    } else {
      return createTextResponse(pickRandom(atd.pump), ResponseType.Hint);
    }
  }
}

function handlePrompt(
  lessonId: string,
  atd: Dialog,
  sdp: SessionData,
  expectationResults: ExpectationResult[],
  e: Expectation,
  p: Prompt
) {
  if (
    expectationResults[sdp.dialogState.expectationsCompleted.indexOf(false)]
      .evaluation === Evaluation.Good &&
    expectationResults[sdp.dialogState.expectationsCompleted.indexOf(false)]
      .score > atd.goodThreshold
  ) {
    //prompt completed successfully
    const index = sdp.dialogState.expectationsCompleted.indexOf(false);
    sdp.dialogState.expectationsCompleted[index] = true;
    sdp.dialogState.expectationData[index].ideal =
      atd.expectations[index].expectation;
    sdp.dialogState.expectationData[index].satisfied = true;
    sdp.dialogState.expectationData[index].score = normalizeScores(
      expectationResults[index]
    );
    sdp.dialogState.expectationData[index].status = ExpectationStatus.Complete;
    sdp.dialogState.expectationData[index].numPrompts += 1;

    return [givePositiveFeedback(atd, sdp)].concat(toNextExpectation(atd, sdp));
  } else {
    //prompt not answered correctly. Assert.
    const index = sdp.dialogState.expectationsCompleted.indexOf(false);
    sdp.dialogState.expectationsCompleted[index] = true;
    sdp.dialogState.expectationData[index].ideal =
      atd.expectations[index].expectation;
    sdp.dialogState.expectationData[index].satisfied = false;
    sdp.dialogState.expectationData[index].score = normalizeScores(
      expectationResults[index]
    );
    sdp.dialogState.expectationData[index].status = ExpectationStatus.Complete;
    sdp.dialogState.expectationData[index].numPrompts += 1;
    return revealExpectation(p.answer, atd, sdp);
  }
}

function handleHints(
  lessonId: string,
  atd: Dialog,
  sdp: SessionData,
  expectationResults: ExpectationResult[],
  e: Expectation,
  h: string
) {
  const expectationId: number = atd.expectations.indexOf(e);
  const finalResponses: Array<OpenTutorResponse> = [];
  let alternateExpectationMet = false;
  let expectedExpectationMet = false;

  sdp.dialogState.expectationData[expectationId].numHints += 1;

  //check if any other expectations were met
  expectationResults.forEach((e, id) => {
    if (e.evaluation === Evaluation.Good && e.score > atd.goodThreshold) {
      if (id !== expectationId) {
        //meets ANOTHER expectation
        //add some neutral response
        alternateExpectationMet = true;
        updateCompletedExpectations(expectationResults, sdp, atd);
      } else {
        expectedExpectationMet = true;
      }
    }
  });
  if (expectedExpectationMet) {
    //hint answered successfully
    updateCompletedExpectations(expectationResults, sdp, atd);
    sdp.dialogState.expectationsCompleted[expectationId] = true;
    sdp.dialogState.expectationData[expectationId].ideal =
      atd.expectations[expectationId].expectation;
    sdp.dialogState.expectationData[expectationId].satisfied = true;
    sdp.dialogState.expectationData[expectationId].score = normalizeScores(
      expectationResults[expectationId]
    );
    sdp.dialogState.expectationData[expectationId].status =
      ExpectationStatus.Complete;
    finalResponses.push(givePositiveFeedback(atd, sdp));
    return finalResponses.concat(toNextExpectation(atd, sdp));
  } else {
    //hint not answered correctly, send other hint if exists
    // or send prompt if exists

    if (e.hints.indexOf(h) < e.hints.length - 1 && atd.pump.indexOf(h) === -1) {
      //another hint exists, use that.
      if (alternateExpectationMet && !expectedExpectationMet) {
        finalResponses.push(
          createTextResponse(
            pickRandom(atd.goodPointButFeedback),
            ResponseType.FeedbackNeutral
          )
        );
      } else {
        finalResponses.push(
          createTextResponse(
            pickRandom(atd.neutralFeedback),
            ResponseType.FeedbackNeutral
          )
        );
        finalResponses.push(createTextResponse(pickRandom(atd.hintStart)));
      }
      finalResponses.push(
        createTextResponse(e.hints[e.hints.indexOf(h) + 1], ResponseType.Hint)
      );
      return finalResponses;
    } else if (
      atd.pump.indexOf(h) !== -1 &&
      !sdp.sessionHistory.systemResponses.some((prevRespones) =>
        prevRespones.includes(e.hints[0])
      )
    ) {
      // hint was actually a pump and the hints for this expectation have not been used yet
      if (alternateExpectationMet && !expectedExpectationMet) {
        finalResponses.push(
          createTextResponse(
            pickRandom(atd.goodPointButFeedback),
            ResponseType.FeedbackNeutral
          )
        );
      } else {
        finalResponses.push(
          createTextResponse(
            pickRandom(atd.neutralFeedback),
            ResponseType.FeedbackNeutral
          )
        );
        finalResponses.push(createTextResponse(pickRandom(atd.hintStart)));
      }
      finalResponses.push(
        createTextResponse(
          atd.expectations[expectationId].hints[0],
          ResponseType.Hint
        )
      );
    } else if (e.prompts[0]) {
      if (alternateExpectationMet && !expectedExpectationMet) {
        finalResponses.push(
          createTextResponse(
            pickRandom(atd.goodPointButFeedback),
            ResponseType.FeedbackNeutral
          )
        );
        finalResponses.push(
          createTextResponse(pickRandom(e.prompts).prompt, ResponseType.Prompt)
        );
      } else {
        finalResponses.push(giveNegativeFeedback(false, atd, sdp));
        // check that a pump was not just added to responses, if not use prompt
        if (
          finalResponses[finalResponses.length - 1].type !== ResponseType.Hint
        ) {
          finalResponses.push(createTextResponse(pickRandom(atd.promptStart)));
          finalResponses.push(
            createTextResponse(
              pickRandom(e.prompts).prompt,
              ResponseType.Prompt
            )
          );
        }
      }
      return finalResponses;
    } else {
      //if no prompt, assert
      const index = sdp.dialogState.expectationsCompleted.indexOf(false);
      sdp.dialogState.expectationsCompleted[index] = true;
      sdp.dialogState.expectationData[index].ideal =
        atd.expectations[index].expectation;
      sdp.dialogState.expectationData[index].satisfied = false;
      sdp.dialogState.expectationData[index].score = normalizeScores(
        expectationResults[index]
      );
      sdp.dialogState.expectationData[index].status =
        ExpectationStatus.Complete;

      if (alternateExpectationMet && !expectedExpectationMet) {
        finalResponses.push(
          createTextResponse(
            pickRandom(atd.goodPointButOutOfHintsFeedback),
            ResponseType.FeedbackNeutral
          )
        );
      } else {
        finalResponses.push(giveNegativeFeedback(true, atd, sdp));
      }
      return finalResponses.concat(revealExpectation(e.expectation, atd, sdp));
    }
  }
}

function revealExpectation(answer: string, atd: Dialog, sdp: SessionData) {
  const response: OpenTutorResponse[] = [];
  if (atd.expectationOnTheBoard.length === 0) {
    response.push(createTextResponse(answer, ResponseType.Text));
  } else {
    response.push(
      createTextResponse(
        pickRandom(atd.expectationOnTheBoard),
        ResponseType.Text
      )
    );
  }
  return response.concat(toNextExpectation(atd, sdp));
}

function calculateQuality(
  sessionHistory: SessionHistory,
  expectationIndex: number
) {
  const qualityOfUtterancesForExpecation: number[] = [];

  const baseQuality = 0.5;

  sessionHistory.userResponses.forEach((value, index) => {
    if (
      value.activeExpectation === expectationIndex ||
      value.activeExpectation === -1
    ) {
      let classifierScore =
        sessionHistory.classifierGrades[index].expectationResults[
          expectationIndex
        ].score;
      if (
        sessionHistory.classifierGrades[index].expectationResults[
          expectationIndex
        ].evaluation === Evaluation.Bad
      ) {
        classifierScore = classifierScore * -1;
      }
      qualityOfUtterancesForExpecation.push(baseQuality + classifierScore / 2);
    }
  });
  return (
    qualityOfUtterancesForExpecation.reduce((a, b) => a + b, 0) /
    qualityOfUtterancesForExpecation.length
  );
}

export function calculateScore(sdp: SessionData): number {
  const expectationScores: number[] = [];
  const c = 0.02;

  sdp.dialogState.expectationData.forEach((value, index) => {
    if (value.satisfied) {
      expectationScores.push(1 - c * value.numHints);
    } else {
      expectationScores.push(calculateQuality(sdp.sessionHistory, index));
    }
  });
  return (
    expectationScores.reduce((a, b) => a + b, 0) / expectationScores.length
  );
}

function normalizeScores(er: ExpectationResult) {
  if (er.evaluation === Evaluation.Bad) return 1 - er.score;
  else return er.score;
}

export class StandardDialogHandler implements DialogHandler {
  config: DialogConfig;
  lesson: Lesson;

  constructor(lesson: Lesson) {
    this.lesson = lesson;
    this.config = toConfig(lesson);
  }

  async beginDialog(): Promise<OpenTutorResponse[]> {
    if (!this.config) {
      throw new Error('config not loaded');
    }
    return [
      createTextResponse(this.config.questionIntro, ResponseType.Opening),
      createTextResponse(this.config.questionText, ResponseType.MainQuestion),
    ];
  }

  async process(sdp: SessionData): Promise<OpenTutorResponse[]> {
    if (!this.config) {
      throw new Error('not loaded');
    }
    return processUserResponse(this.lesson.lessonId, this.config, sdp);
  }
}
