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
import { calculateScore } from 'dialog';
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
import {
  toConfig,
  allowNegativeFeedback,
  givePositiveStreaksFeedback,
} from './config';

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
      arch: atd.arch,
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

  const expectationResults = classifierResult.data.output.expectationResults;
  const speechActs = classifierResult.data.output.speechActs;
  //add results to the session history
  addClassifierGrades(sdp, {
    expectationResults: classifierResult.data.output.expectationResults,
    speechActs: classifierResult.data.output.speechActs,
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
      return responses.concat(toNextExpectation(atd, sdp, false, false));
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
    sdp.dialogState.numCorrectStreak = 0;
    responses.push(
      createTextResponse(
        pickRandom(atd.neutralFeedback),
        ResponseType.FeedbackNeutral
      )
    );
    return responses.concat(toNextExpectation(atd, sdp, true, false));
  } else if (
    expectationResults.find(
      (x) => x.evaluation === Evaluation.Good && x.score > atd.goodThreshold
    ) &&
    expectationResults.find(
      (x) => x.evaluation === Evaluation.Bad && x.score > atd.badThreshold
    )
  ) {
    //satisfied one expectation but gave very wrong answer(s) for others
    //TODO: check if this should count towards positive streak
    sdp.dialogState.numCorrectStreak = 0;
    updateCompletedExpectations(expectationResults, sdp, atd);
    responses.push(
      createTextResponse(
        pickRandom(atd.expectationMetButOthersWrongFeedback),
        ResponseType.FeedbackNeutral
      )
    );
    return responses.concat(toNextExpectation(atd, sdp, true, false));
  } else if (
    expectationResults.find(
      (x) => x.evaluation === Evaluation.Good && x.score > atd.goodThreshold
    )
  ) {
    //matched atleast one specific expectation
    updateCompletedExpectations(expectationResults, sdp, atd);
    responses.push(givePositiveFeedback(atd, sdp));
    return responses.concat(toNextExpectation(atd, sdp, true, true));
  } else if (
    expectationResults.find(
      (x) => x.evaluation === Evaluation.Bad && x.score > atd.badThreshold
    )
  ) {
    //bad answer. use hint
    sdp.dialogState.numCorrectStreak = 0;
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
    createTextResponse(
      'Apologies, that message didn’t send right. Let’s try this again.'
    ),
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
  sdp: SessionData,
  useHintStart: boolean,
  afterPositiveFeedback: boolean
): OpenTutorResponse[] {
  //give positive feedback, and ask next expectation question
  let answer: OpenTutorResponse[] = [];
  if (sdp.dialogState.expectationsCompleted.indexOf(false) != -1) {
    sdp.dialogState.hints = true;
    sdp.dialogState.expectationData[
      sdp.dialogState.expectationsCompleted.indexOf(false)
    ].status = ExpectationStatus.Active;
    setActiveExpecation(sdp);
    // Do not add hint start message when it would be redundant
    if (
      (atd.expectationsLeftFeedback.length !== 0 &&
        !afterPositiveFeedback &&
        useHintStart) ||
      (useHintStart && atd.expectationsLeftFeedback.length === 0)
    ) {
      answer.push(createTextResponse(pickRandom(atd.hintStart)));
    }

    //for sensitive, if this was in response to main question after positive feedback, give pump instead of hint
    if (
      afterPositiveFeedback &&
      atd.givePumpOnMainQuestion &&
      sdp.sessionHistory.systemResponses.length === 1
    ) {
      answer.push(createTextResponse(pickRandom(atd.pump), ResponseType.Hint));
    } else if (
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
    } else {
      answer.push(
        createTextResponse('Think about the answer!', ResponseType.Hint)
      );
    }
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
  sdp.dialogState.numCorrectStreak += 1;
  const streaksFeedbackTextArray = givePositiveStreaksFeedback(
    sdp.dialogState.numCorrectStreak,
    atd
  );
  let positiveFeedbackText = '';
  // for sensitive, check for streak of good answers
  if (
    sdp.dialogState.numCorrectStreak > 1 &&
    streaksFeedbackTextArray.length !== 0
  ) {
    positiveFeedbackText = pickRandom(streaksFeedbackTextArray);
  } else {
    positiveFeedbackText = pickRandom(atd.positiveFeedback);
  }

  // for survey says style, check if expectations left
  if (
    atd.expectationsLeftFeedback.length !== 0 &&
    sdp.dialogState.expectationsCompleted.indexOf(false) !== -1
  ) {
    return createTextResponse(
      [positiveFeedbackText, pickRandom(atd.expectationsLeftFeedback)].join(
        ' '
      ),
      ResponseType.FeedbackPositive
    );
  } else {
    return createTextResponse(
      positiveFeedbackText,
      ResponseType.FeedbackPositive
    );
  }
}

function giveNegativeFeedback(
  expectationEnded: boolean,
  atd: Dialog,
  sdp: SessionData
): OpenTutorResponse {
  sdp.dialogState.numCorrectStreak = 0;
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

    return [givePositiveFeedback(atd, sdp)].concat(
      toNextExpectation(atd, sdp, true, true)
    );
  } else {
    //prompt not answered correctly. Assert.
    sdp.dialogState.numCorrectStreak = 0;
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
    return finalResponses.concat(toNextExpectation(atd, sdp, true, true));
  } else {
    //hint not answered correctly, send other hint if exists
    // or send prompt if exists
    //TODO: check if scenario where alternate expectation was met but hint was not should count for positive streak
    sdp.dialogState.numCorrectStreak = 0;
    //fist check if we should give any more hints for sensitive lesson
    if (atd.limitHints) {
      if (sdp.dialogState.limitHintsMode) {
        return outOfHintsFinishExpectation(
          e,
          alternateExpectationMet,
          expectedExpectationMet,
          expectationResults,
          finalResponses,
          atd,
          sdp
        );
      }
      let totalHints = 0;
      sdp.dialogState.expectationData.forEach((expData) => {
        if (expData.satisfied === false) {
          totalHints += expData.numHints;
        }
      });
      if (totalHints >= 3) {
        return outOfHintsFinishExpectation(
          e,
          alternateExpectationMet,
          expectedExpectationMet,
          expectationResults,
          finalResponses,
          atd,
          sdp
        );
      }
    }

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
      return outOfHintsFinishExpectation(
        e,
        alternateExpectationMet,
        expectedExpectationMet,
        expectationResults,
        finalResponses,
        atd,
        sdp
      );
    }
  }
}

function outOfHintsFinishExpectation(
  e: Expectation,
  alternateExpectationMet: boolean,
  expectedExpectationMet: boolean,
  expectationResults: ExpectationResult[],
  finalResponses: OpenTutorResponse[],
  atd: Dialog,
  sdp: SessionData
) {
  const index = sdp.dialogState.expectationsCompleted.indexOf(false);
  sdp.dialogState.expectationsCompleted[index] = true;
  sdp.dialogState.expectationData[index].ideal =
    atd.expectations[index].expectation;
  sdp.dialogState.expectationData[index].satisfied = false;
  sdp.dialogState.expectationData[index].score = normalizeScores(
    expectationResults[index]
  );
  sdp.dialogState.expectationData[index].status = ExpectationStatus.Complete;

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
  return response.concat(toNextExpectation(atd, sdp, true, false));
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
