/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import Dialog, { Prompt, Expectation } from 'dialog/dialog-data';
import SessionData, {
  addClassifierGrades,
  ExpectationStatus,
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

//this should begin by sending the question prompt
export function beginDialog(atd: Dialog): OpenTutorResponse[] {
  return [
    createTextResponse(atd.questionIntro, ResponseType.Opening),
    createTextResponse(atd.questionText, ResponseType.MainQuestion),
  ];
}

// We need a random generator that is safe to mock
// and the only way could figure out to make sinon mocking work (w ts)
// is to put it in a class
export class ScopedRandom {
  static nextRandom(): number {
    return Math.random();
  }
}

export function pickRandom<T>(a: T[]): T {
  return a[Math.floor(ScopedRandom.nextRandom() * a.length)];
}

export async function processUserResponse(
  lessonId: string,
  atd: Dialog,
  sdp: SessionData
): Promise<OpenTutorResponse[]> {
  let classifierResult: ClassifierResponse;
  try {
    const expectations: CExpectation[] = atd.expectations.map(exp => {
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
    speechActs['profanity'].score > goodThreshold &&
    speechActs['profanity'].evaluation === Evaluation.Good
  ) {
    responses.push(
      createTextResponse(
        pickRandom(atd.profanityFeedback),
        ResponseType.Profanity
      )
    );
  } else if (
    speechActs['metacognitive'].score > goodThreshold &&
    speechActs['metacognitive'].evaluation === Evaluation.Good
  ) {
    //50 percent of the time it will use encouragement. Else, it will go on.
    if (ScopedRandom.nextRandom() < 0.5) {
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
          pickRandom(atd.confusionFeedback),
          ResponseType.Encouragement
        )
      );
    }
  }

  //check if response was for a prompt
  let p: Prompt;
  let e: Expectation = atd.expectations.find(e => {
    p = e.prompts.find(p => sdp.previousSystemResponse.includes(p.prompt));
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
  e = atd.expectations.find(e => {
    h = e.hints.find(n => sdp.previousSystemResponse.includes(n));
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
      x => x.evaluation === Evaluation.Good && x.score > goodThreshold
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
      atd.recapText.map(rt => createTextResponse(rt, ResponseType.Closing))
    );
  }
  if (
    expectationResults.every(
      x =>
        (x.score < goodThreshold && x.evaluation == Evaluation.Good) ||
        (x.score < badThreshold && x.evaluation == Evaluation.Bad)
    )
  ) {
    console.log('neutral');
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
      x => x.evaluation === Evaluation.Good && x.score > goodThreshold
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
      x => x.evaluation === Evaluation.Bad && x.score > badThreshold
    )
  ) {
    //bad answer. use hint
    const expectationId = expectationResults.indexOf(
      expectationResults.find(
        x => x.evaluation === Evaluation.Bad && x.score > badThreshold
      )
    );
    sdp.dialogState.hints = true;
    sdp.dialogState.expectationData[expectationId].status =
      ExpectationStatus.Active;

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
  expectationIds.forEach(expectationId => {
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
      atd.recapText.map(rt => createTextResponse(rt, ResponseType.Closing))
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

  //check if any other expectations were met
  expectationResults.forEach((e, id) => {
    if (
      e.evaluation === Evaluation.Good &&
      e.score > goodThreshold &&
      id != expectationId
    ) {
      //meets ANOTHER expectation
      //add some neutral response
      const neutralResponse = 'Good point! But lets focus on this part.';
      finalResponses.push(
        createTextResponse(neutralResponse, ResponseType.FeedbackNeutral)
      );
      updateCompletedExpectations(expectationResults, sdp, atd);
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
      finalResponses.push(
        createTextResponse(
          pickRandom(atd.neutralFeedback),
          ResponseType.FeedbackNeutral
        )
      );
      finalResponses.push(createTextResponse(pickRandom(atd.hintStart)));
      finalResponses.push(
        createTextResponse(e.hints[e.hints.indexOf(h) + 1], ResponseType.Hint)
      );
      return finalResponses;
    } else if (e.prompts[0]) {
      finalResponses.push(
        createTextResponse(
          pickRandom(atd.negativeFeedback),
          ResponseType.FeedbackNegative
        )
      );
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
      if (sdp.dialogState.expectationsCompleted.indexOf(false) != -1) {
        // there are still incomplete expectations
        return [
          createTextResponse(
            pickRandom(atd.negativeFeedback),
            ResponseType.FeedbackNegative
          ),
          createTextResponse(e.expectation, ResponseType.Text),
        ].concat(toNextExpectation(atd, sdp));
      } else {
        //no more incomplete expectations
        return [
          createTextResponse(
            pickRandom(atd.negativeFeedback),
            ResponseType.FeedbackNegative
          ),
        ].concat(toNextExpectation(atd, sdp));
      }

      return finalResponses;
    }
  }
}

export function calculateScore(sdp: SessionData, atd: Dialog): number {
  return Math.max(
    0.0,
    Math.min(
      1.0,
      (atd.expectations.length / sdp.sessionHistory.userResponses.length) * 1.0
    )
  );
}

function normalizeScores(er: ExpectationResult) {
  if (er.evaluation == Evaluation.Bad) return 1 - er.score;
  else return er.score;
}
