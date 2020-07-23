import AutoTutorData, { Prompt, Expectation } from 'models/autotutor-data';
import SessionData, { addClassifierGrades } from './session-data';
import {
  evaluate,
  ClassifierResponse,
  Evaluation,
  ExpectationResult,
  Expectation as CExpectation,
} from 'models/classifier';
import OpenTutorResponse, { createTextResponse } from './opentutor-response';
import logger from 'utils/logging';

const upperThreshold: number =
  Number.parseFloat(process.env.HIGHER_THRESHOLD) || 0.7;
const lowerThreshold: number =
  Number.parseFloat(process.env.LOWER_THRESHOLD) || 0.3;

//this should begin by sending the question prompt
export function beginDialog(atd: AutoTutorData): OpenTutorResponse[] {
  return [
    createTextResponse(atd.questionIntro, 'opening'),
    createTextResponse(atd.questionText, 'mainQuestion'),
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
    const status =
      `${err.response && err.response.status}` === '404' ? 404 : 502;
    const message =
      status === 404
        ? `classifier cannot find lesson '${lessonId}'`
        : err.message;
    throw Object.assign(err, { status, message });
  }
  logger.warn(JSON.stringify(atd));
  const expectationResults = classifierResult.output.expectationResults;
  //add results to the session history
  addClassifierGrades(sdp, {
    expectationResults: classifierResult.output.expectationResults,
  });
  //check if response was for a prompt
  let p: Prompt;
  let e: Expectation = atd.expectations.find(function(e) {
    p = e.prompts.find(p => sdp.previousSystemResponse.indexOf(p.prompt) > -1);
    if (p) return true;
    else return false;
  });
  if (e && p) {
    //response was to a prompt.
    if (
      expectationResults[sdp.dialogState.expectationsCompleted.indexOf(false)]
        .evaluation === Evaluation.Good &&
      expectationResults[sdp.dialogState.expectationsCompleted.indexOf(false)]
        .score > upperThreshold
    ) {
      //prompt completed successfully
      const index = sdp.dialogState.expectationsCompleted.indexOf(false);
      sdp.dialogState.expectationsCompleted[index] = true;
      sdp.dialogState.expectationData[index].ideal =
        atd.expectations[index].expectation;
      sdp.dialogState.expectationData[index].satisfied = true;
      sdp.dialogState.expectationData[index].score =
        expectationResults[index].score;
      sdp.dialogState.expectationData[index].status = 'complete';

      return [
        createTextResponse(atd.positiveFeedback[0], 'feedbackPositive'),
      ].concat(toNextExpectation(atd, sdp));
    } else {
      //prompt not answered correctly. Assert.
      const index = sdp.dialogState.expectationsCompleted.indexOf(false);
      sdp.dialogState.expectationsCompleted[index] = true;
      sdp.dialogState.expectationData[index].ideal =
        atd.expectations[index].expectation;
      sdp.dialogState.expectationData[index].satisfied = false;
      sdp.dialogState.expectationData[index].score =
        expectationResults[index].score;
      sdp.dialogState.expectationData[index].status = 'complete';
      return [createTextResponse(p.answer, 'text')].concat(
        toNextExpectation(atd, sdp)
      );
    }
  }

  //check if response was to a hint
  let h: string;
  e = atd.expectations.find(function(e) {
    h = e.hints.find(n => sdp.previousSystemResponse.indexOf(n) > -1);
    if (h) return true;
    else return false;
  });
  if (e && h) {
    //response is to a hint
    const expectationId: number = atd.expectations.indexOf(e);
    const finalResponses: Array<OpenTutorResponse> = [];

    //check if any other expectations were met
    expectationResults.forEach((e, id) => {
      if (
        e.evaluation === Evaluation.Good &&
        e.score > upperThreshold &&
        id != expectationId
      ) {
        //meets ANOTHER expectation
        //add some neutral response
        const neutralResponse = 'Good point! But lets focus on this part.';
        finalResponses.push(createTextResponse(neutralResponse));
        updateCompletedExpectations(expectationResults, sdp, atd);
      }
    });
    if (
      expectationResults[expectationId].evaluation === Evaluation.Good &&
      expectationResults[expectationId].score > upperThreshold
    ) {
      //hint answered successfully
      updateCompletedExpectations(expectationResults, sdp, atd);
      sdp.dialogState.expectationsCompleted[expectationId] = true;
      sdp.dialogState.expectationData[expectationId].ideal =
        atd.expectations[expectationId].expectation;
      sdp.dialogState.expectationData[expectationId].satisfied = true;
      sdp.dialogState.expectationData[expectationId].score =
        expectationResults[expectationId].score;
      sdp.dialogState.expectationData[expectationId].status = 'complete';
      finalResponses.push(
        createTextResponse(atd.positiveFeedback[0], 'feedbackPositive')
      );
      return finalResponses.concat(toNextExpectation(atd, sdp));
    } else {
      //hint not answered correctly, send prompt if exists

      if (e.prompts[0]) {
        finalResponses.push(
          createTextResponse(atd.confusionFeedback[0], 'feedbackNegative')
        );
        finalResponses.push(createTextResponse(atd.promptStart[0]));
        finalResponses.push(createTextResponse(e.prompts[0].prompt, 'prompt'));
        return finalResponses;
      } else {
        //if no prompt, assert
        const index = sdp.dialogState.expectationsCompleted.indexOf(false);
        sdp.dialogState.expectationsCompleted[index] = true;
        sdp.dialogState.expectationData[index].ideal =
          atd.expectations[index].expectation;
        sdp.dialogState.expectationData[index].satisfied = false;
        sdp.dialogState.expectationData[index].score =
          expectationResults[index].score;
        sdp.dialogState.expectationData[index].status = 'complete';
        if (sdp.dialogState.expectationsCompleted.indexOf(false) != -1) {
          // there are still incomplete expectations
          return [
            createTextResponse(atd.negativeFeedback[0], 'feedbackNegative'),
            createTextResponse(e.expectation, 'text'),
          ].concat(toNextExpectation(atd, sdp));
        } else {
          //no more incomplete expectations
          return [
            createTextResponse(atd.negativeFeedback[0], 'feedbackNegative'),
          ].concat(toNextExpectation(atd, sdp));
        }

        return finalResponses;
      }
    }
  }

  if (
    expectationResults.every(
      x => x.evaluation === Evaluation.Good && x.score > upperThreshold
    )
  ) {
    //perfect answer
    updateCompletedExpectations(expectationResults, sdp, atd);
    return [
      createTextResponse(atd.positiveFeedback[0], 'feedbackPositive'),
    ].concat(atd.recapText.map(rt => createTextResponse(rt, 'closing')));
  }
  if (
    expectationResults.every(
      x => x.score < upperThreshold && x.score > lowerThreshold
    )
  ) {
    //answer did not match any expectation, guide user through expectations
    return [createTextResponse(atd.pump[0])].concat(
      toNextExpectation(atd, sdp)
    );
  }
  if (
    expectationResults.find(
      x => x.evaluation === Evaluation.Good && x.score > upperThreshold
    )
  ) {
    //matched atleast one specific expectation
    updateCompletedExpectations(expectationResults, sdp, atd);
    return [
      createTextResponse(atd.positiveFeedback[0], 'feedbackPositive'),
    ].concat(toNextExpectation(atd, sdp));
  }
  if (
    expectationResults.find(
      x => x.evaluation === Evaluation.Bad && x.score < lowerThreshold
    )
  ) {
    //bad answer. use hint
    const expectationId = expectationResults.indexOf(
      expectationResults.find(
        x => x.evaluation === Evaluation.Bad && x.score < lowerThreshold
      )
    );
    sdp.dialogState.hints = true;
    sdp.dialogState.expectationData[expectationId].status = 'active';
    // sdp.dialogState.expectationsCompleted[expectationId] = true;
    return [
      createTextResponse(atd.confusionFeedback[0], 'feedbackNegative'),
      createTextResponse(atd.hintStart[0]),
      createTextResponse(atd.expectations[expectationId].hints[0], 'hint'),
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
      expectationResults[i].score > upperThreshold
    ) {
      expectationIds.push(i);
    }
  }
  expectationIds.forEach(expectationId => {
    sdp.dialogState.expectationsCompleted[expectationId] = true;
    sdp.dialogState.expectationData[expectationId].ideal =
      atd.expectations[expectationId].expectation;
    sdp.dialogState.expectationData[expectationId].status = 'complete';
    sdp.dialogState.expectationData[expectationId].score =
      expectationResults[expectationId].score;
    sdp.dialogState.expectationData[expectationId].satisfied = true;
  });
}
export function toNextExpectation(
  atd: AutoTutorData,
  sdp: SessionData
): OpenTutorResponse[] {
  //give positive feedback, and ask next expectation question
  let answer: OpenTutorResponse[] = [];
  // console.log(sdp.dialogState.expectationsCompleted);
  if (sdp.dialogState.expectationsCompleted.indexOf(false) != -1) {
    sdp.dialogState.hints = true;
    sdp.dialogState.expectationData[
      sdp.dialogState.expectationsCompleted.indexOf(false)
    ].status = 'active';
    answer.push(createTextResponse(atd.hintStart[0]));
    if (
      atd.expectations[sdp.dialogState.expectationsCompleted.indexOf(false)]
        .hints[0]
    ) {
      answer.push(
        createTextResponse(
          atd.expectations[sdp.dialogState.expectationsCompleted.indexOf(false)]
            .hints[0],
          'hint'
        )
      );
    } else answer.push(createTextResponse('Think about the answer!', 'hint'));
  } else {
    //all expectations completed
    answer = answer.concat(
      atd.recapText.map(rt => createTextResponse(rt, 'closing'))
    );
  }
  return answer;
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
