/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import Dialog, { Prompt, Expectation } from 'dialog/dialog-data';
import SessionData, {
  addClassifierGrades,
  ExpectationStatus,
  SessionHistory,
} from './session-data';
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
} from './response-data';

const goodThreshold: number =
  Number.parseFloat(process.env.GOOD_THRESHOLD) || 0.6;
const badThreshold: number =
  Number.parseFloat(process.env.BAD_THRESHOLD) || 0.6;
const goodMetacognitiveThreshold: number =
  Number.parseFloat(process.env.GOOD_METACOGNITIVE_THRESHOLD) || 0.8;

//this should begin by sending the question prompt
export function beginDialog(atd: Dialog): OpenTutorResponse[] {
  return [
    createTextResponse(atd.questionIntro, ResponseType.Opening),
    createTextResponse(atd.questionText, ResponseType.MainQuestion),
  ];
}

interface RandomFunction {
  (): number;
}
let _random = Math.random;

export function randomFunctionSet(f: RandomFunction): void {
  _random = f;
}

export function randomFunctionRestore(): void {
  _random = Math.random;
}

export function pickRandom<T>(a: T[], forceVariant = -1): T {
  if (forceVariant >= 0) {
    return a[forceVariant % a.length];
  } else {
    const randomNum = _random();
    return a[Math.floor(randomNum * a.length)];
  }
}

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
    const expectations: CExpectation[] = atd.expectations.map((exp) => {
      return {
        ideal: exp.expectation,
      } as CExpectation;
    });
    classifierResult = await evaluate({
      input: sdp.previousUserResponse,
      lesson: lessonId,
      config: {
        question: atd.questionText,
        expectations: expectations,
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
    speechActs?.profanity?.score > goodThreshold &&
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
    speechActs?.metacognitive?.score > goodMetacognitiveThreshold &&
    speechActs?.metacognitive?.evaluation === Evaluation.Good &&
    expectationResults.every(
      (x) => x.evaluation === Evaluation.Good && x.score <= goodThreshold
    )
  ) {
    //50 percent of the time it will use encouragement. Else, it will go on.
    if (_random() < 0.5) {
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
      (x) => x.evaluation === Evaluation.Good && x.score > goodThreshold
    )
  ) {
    //perfect answer
    updateCompletedExpectations(expectationResults, sdp, atd);
    responses.push(
      createTextResponse(
        pickRandom(atd.positiveFeedback),
        ResponseType.FeedbackPositive
      )
    );
    return responses.concat(
      atd.recapText.map((rt) => createTextResponse(rt, ResponseType.Closing))
    );
  }
  if (
    expectationResults.every(
      (x) =>
        (x.score < goodThreshold && x.evaluation === Evaluation.Good) ||
        (x.score < badThreshold && x.evaluation === Evaluation.Bad)
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
  }
  if (
    expectationResults.find(
      (x) => x.evaluation === Evaluation.Good && x.score > goodThreshold
    )
  ) {
    //matched atleast one specific expectation
    updateCompletedExpectations(expectationResults, sdp, atd);
    responses.push(
      createTextResponse(
        pickRandom(atd.positiveFeedback),
        ResponseType.FeedbackPositive
      )
    );
    return responses.concat(toNextExpectation(atd, sdp));
  }
  if (
    expectationResults.find(
      (x) => x.evaluation === Evaluation.Bad && x.score > badThreshold
    )
  ) {
    //bad answer. use hint
    const expectationId = expectationResults.indexOf(
      expectationResults.find(
        (x) => x.evaluation === Evaluation.Bad && x.score > badThreshold
      )
    );
    sdp.dialogState.hints = true;
    sdp.dialogState.expectationData[expectationId].status =
      ExpectationStatus.Active;
    setActiveExpecation(sdp);

    responses.push(
      createTextResponse(
        pickRandom(atd.negativeFeedback),
        ResponseType.FeedbackNegative
      )
    );
    responses.push(
      createTextResponse(pickRandom(atd.hintStart)),
      createTextResponse(
        atd.expectations[expectationId].hints[0],
        ResponseType.Hint
      )
    );
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
      expectationResults[i].score > goodThreshold
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
    //all expectations completed
    answer = answer.concat(
      atd.recapText.map((rt) => createTextResponse(rt, ResponseType.Closing))
    );
  }
  return answer;
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
      .score > goodThreshold
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

    return [
      createTextResponse(
        pickRandom(atd.positiveFeedback),
        ResponseType.FeedbackPositive
      ),
    ].concat(toNextExpectation(atd, sdp));
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
    return [createTextResponse(p.answer, ResponseType.Text)].concat(
      toNextExpectation(atd, sdp)
    );
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
    if (e.evaluation === Evaluation.Good && e.score > goodThreshold) {
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
  if (
    expectationResults[expectationId].evaluation === Evaluation.Good &&
    expectationResults[expectationId].score > goodThreshold
  ) {
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
    finalResponses.push(
      createTextResponse(
        pickRandom(atd.positiveFeedback),
        ResponseType.FeedbackPositive
      )
    );
    return finalResponses.concat(toNextExpectation(atd, sdp));
  } else {
    //hint not answered correctly, send other hint if exists
    // or send prompt if exists

    if (e.hints.indexOf(h) < e.hints.length - 1) {
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
      }

      finalResponses.push(createTextResponse(pickRandom(atd.hintStart)));
      finalResponses.push(
        createTextResponse(e.hints[e.hints.indexOf(h) + 1], ResponseType.Hint)
      );
      return finalResponses;
    } else if (e.prompts[0]) {
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
            pickRandom(atd.negativeFeedback),
            ResponseType.FeedbackNegative
          )
        );
      }
      finalResponses.push(createTextResponse(pickRandom(atd.promptStart)));
      finalResponses.push(
        createTextResponse(pickRandom(e.prompts).prompt, ResponseType.Prompt)
      );
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
        return finalResponses
          .concat([
            createTextResponse(
              pickRandom(atd.goodPointButOutOfHintsFeedback),
              ResponseType.Text
            ),
            createTextResponse(e.expectation, ResponseType.Text),
          ])
          .concat(toNextExpectation(atd, sdp));
      }
      return finalResponses
        .concat([
          createTextResponse(
            pickRandom(atd.negativeFeedback),
            ResponseType.FeedbackNegative
          ),
          createTextResponse(e.expectation, ResponseType.Text),
        ])
        .concat(toNextExpectation(atd, sdp));
    }
  }
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
