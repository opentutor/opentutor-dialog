/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import AutoTutorData, { Prompt, Expectation } from 'models/opentutor-data';
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
} from './opentutor-response';
import logger from 'utils/logging';

const goodThreshold: number =
  Number.parseFloat(process.env.GOOD_THRESHOLD) || 0.6;
const badThreshold: number =
  Number.parseFloat(process.env.BAD_THRESHOLD) || 0.6;

//this should begin by sending the question prompt
export function beginDialog(atd: AutoTutorData): OpenTutorResponse[] {
  return [
    createTextResponse(atd.questionIntro, ResponseType.Opening),
    createTextResponse(atd.questionText, ResponseType.MainQuestion),
  ];
}

export async function processUserResponse(
  lessonId: string,
  atd: AutoTutorData,
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
  //add results to the session history
  addClassifierGrades(sdp, {
    expectationResults: classifierResult.output.expectationResults,
  });
  //check if response was for a prompt
  let p: Prompt;
  let e: Expectation = atd.expectations.find(e => {
    p = e.prompts.find(p => sdp.previousSystemResponse.includes(p.prompt));
    return Boolean(p);
  });
  if (e && p) {
    //response was to a prompt.
    return handlePrompt(lessonId, atd, sdp, expectationResults, e, p);
  }

  //check if response was to a hint
  let h: string;
  e = atd.expectations.find(e => {
    h = e.hints.find(n => sdp.previousSystemResponse.includes(n));
    return Boolean(h);
  });
  if (e && h) {
    //response is to a hint
    return handleHints(lessonId, atd, sdp, expectationResults, e, h);
  }

  if (
    expectationResults.every(
      x => x.evaluation === Evaluation.Good && x.score > goodThreshold
    )
  ) {
    //perfect answer
    updateCompletedExpectations(expectationResults, sdp, atd);
    return [
      createTextResponse(
        atd.positiveFeedback[0],
        ResponseType.FeedbackPositive
      ),
    ].concat(
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
    //answer did not match any expectation, guide user through expectations
    return [createTextResponse(atd.pump[0])].concat(
      toNextExpectation(atd, sdp)
    );
  }
  if (
    expectationResults.find(
      x => x.evaluation === Evaluation.Good && x.score > goodThreshold
    )
  ) {
    //matched atleast one specific expectation
    updateCompletedExpectations(expectationResults, sdp, atd);
    return [
      createTextResponse(
        atd.positiveFeedback[0],
        ResponseType.FeedbackPositive
      ),
    ].concat(toNextExpectation(atd, sdp));
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
    return [
      createTextResponse(
        atd.negativeFeedback[0],
        ResponseType.FeedbackNegative
      ),
      createTextResponse(atd.hintStart[0]),
      createTextResponse(
        atd.expectations[expectationId].hints[0],
        ResponseType.Hint
      ),
    ];
  }
  return [createTextResponse('this path has not been implemented yet.')];
}

function updateCompletedExpectations(
  expectationResults: ExpectationResult[],
  sdp: SessionData,
  atd: AutoTutorData
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
  atd: AutoTutorData,
  sdp: SessionData
): OpenTutorResponse[] {
  //give positive feedback, and ask next expectation question
  let answer: OpenTutorResponse[] = [];
  if (sdp.dialogState.expectationsCompleted.indexOf(false) != -1) {
    sdp.dialogState.hints = true;
    sdp.dialogState.expectationData[
      sdp.dialogState.expectationsCompleted.indexOf(false)
    ].status = ExpectationStatus.Active;
    answer.push(createTextResponse(atd.hintStart[0]));
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
  atd: AutoTutorData,
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
        atd.positiveFeedback[0],
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
  atd: AutoTutorData,
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
      createTextResponse(atd.positiveFeedback[0], ResponseType.FeedbackPositive)
    );
    return finalResponses.concat(toNextExpectation(atd, sdp));
  } else {
    //hint not answered correctly, send other hint if exists
    // or send prompt if exists

    if (e.hints.indexOf(h) < e.hints.length - 1) {
      //another hint exists, use that.
      finalResponses.push(
        createTextResponse(atd.neutralFeedback[0], ResponseType.FeedbackNeutral)
      );
      finalResponses.push(createTextResponse(atd.hintStart[0]));
      finalResponses.push(
        createTextResponse(e.hints[e.hints.indexOf(h) + 1], ResponseType.Hint)
      );
      return finalResponses;
    } else if (e.prompts[0]) {
      finalResponses.push(
        createTextResponse(
          atd.negativeFeedback[0],
          ResponseType.FeedbackNegative
        )
      );
      finalResponses.push(createTextResponse(atd.promptStart[0]));
      finalResponses.push(
        createTextResponse(e.prompts[0].prompt, ResponseType.Prompt)
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
            atd.negativeFeedback[0],
            ResponseType.FeedbackNegative
          ),
          createTextResponse(e.expectation, ResponseType.Text),
        ].concat(toNextExpectation(atd, sdp));
      } else {
        //no more incomplete expectations
        return [
          createTextResponse(
            atd.negativeFeedback[0],
            ResponseType.FeedbackNegative
          ),
        ].concat(toNextExpectation(atd, sdp));
      }

      return finalResponses;
    }
  }
}

export function calculateScore(sdp: SessionData, atd: AutoTutorData): number {
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
