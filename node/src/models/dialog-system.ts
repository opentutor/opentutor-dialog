import AutoTutorData, { Prompt } from 'models/autotutor-data';
import SessionDataPacket, { addClassifierGrades } from './session-data-packet';
import {
  evaluate,
  ClassifierResponse,
  Evaluation,
  ExpectationResult,
  ClassifierResult,
} from 'models/classifier';

const upperThreshold: number =
  Number.parseFloat(process.env.HIGHER_THRESHOLD) || 0.7;
const lowerThreshold: number =
  Number.parseFloat(process.env.LOWER_THRESHOLD) || 0.3;

//this should begin by sending the question prompt
export function beginDialog(atd: AutoTutorData): string[] {
  return [atd.questionIntro, atd.questionText];
}

export async function processUserResponse(
  lessonId: string,
  atd: AutoTutorData,
  sdp: SessionDataPacket
): Promise<string[]> {
  let classifierResult: ClassifierResponse;
  try {
    classifierResult = await evaluate({
      inputSentence: sdp.previousUserResponse,
      question: lessonId,
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
  const expectationResults = classifierResult.output.expectationResults;
  //add results to the session history
  addClassifierGrades(sdp, {
    expectationResults: classifierResult.output.expectationResults,
  });
  //check if response was for a prompt
  const prompt: Prompt[] = atd.prompts.filter(function(n) {
    return sdp.previousSystemResponse.indexOf(n.prompt) > -1;
  });
  if (prompt.length > 0) {
    //response was to a prompt.
    if (
      expectationResults[sdp.dialogState.expectationsCompleted.indexOf(false)]
        .evaluation === Evaluation.Good &&
      expectationResults[sdp.dialogState.expectationsCompleted.indexOf(false)]
        .score > upperThreshold
    ) {
      //prompt completed successfully
      sdp.dialogState.expectationsCompleted[
        sdp.dialogState.expectationsCompleted.indexOf(false)
      ] = true;
      return [atd.positiveFeedback[0]].concat(toNextExpectation(atd, sdp));
    } else {
      //prompt not answered correctly, assert
      sdp.dialogState.expectationsCompleted[
        sdp.dialogState.expectationsCompleted.indexOf(false)
      ] = true;
      return [prompt[0].answer].concat(toNextExpectation(atd, sdp));
    }
  }

  //check if response was to a hint
  const hintText: string[] = atd.hints.filter(function(n) {
    return sdp.previousSystemResponse.indexOf(n) > -1;
  });
  if (hintText.length > 0) {
    //response is to a hint
    const expectationId: number = atd.hints.indexOf(hintText[0]);
    if (
      expectationResults[expectationId].evaluation === Evaluation.Good &&
      expectationResults[expectationId].score > upperThreshold
    ) {
      //hint answered successfully
      updateCompletedExpectations(expectationResults, sdp);
      sdp.dialogState.expectationsCompleted[expectationId] = true;
      return [atd.positiveFeedback[0]].concat(toNextExpectation(atd, sdp));
    } else {
      //hint not answered correctly, send prompt
      const prompt: Prompt = atd.prompts.find(
        p => p.expectationId == expectationId
      );
      return [atd.confusionFeedback[0], atd.promptStart[0], prompt.prompt];
    }
  }

  if (
    expectationResults.every(
      x => x.evaluation === Evaluation.Good && x.score > upperThreshold
    )
  ) {
    //perfect answer
    return atd.recapText;
  }
  if (
    expectationResults.every(
      x => x.score < upperThreshold && x.score > lowerThreshold
    )
  ) {
    //answer did not match any expectation, guide user through expectations
    return atd.pump.concat(toNextExpectation(atd, sdp));
  }
  if (
    expectationResults.find(
      x => x.evaluation === Evaluation.Good && x.score > upperThreshold
    )
  ) {
    //matched atleast one specific expectation
    updateCompletedExpectations(expectationResults, sdp);
    return [atd.positiveFeedback[0]].concat(toNextExpectation(atd, sdp));
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
    // sdp.dialogState.expectationsCompleted[expectationId] = true;
    return [
      atd.confusionFeedback[0],
      atd.hintStart[0],
      atd.hints[expectationId],
    ];
  }
  return ['this path has not been implemented yet.'];
}

function updateCompletedExpectations(
  expectationResults: ExpectationResult[],
  sdp: SessionDataPacket
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
  expectationIds.forEach(
    expectationId =>
      (sdp.dialogState.expectationsCompleted[expectationId] = true)
  );
}
export function toNextExpectation(atd: AutoTutorData, sdp: SessionDataPacket) {
  //give positive feedback, and ask next expectation question
  let answer: string[] = [];
  // console.log(sdp.dialogState.expectationsCompleted);
  if (sdp.dialogState.expectationsCompleted.indexOf(false) != -1) {
    sdp.dialogState.hints = true;
    answer.push(atd.hintStart[0]);
    answer.push(
      atd.hints[sdp.dialogState.expectationsCompleted.indexOf(false)]
    );
  } else {
    //all expectations completed
    answer = answer.concat(atd.recapText);
  }
  return answer;
}

// function isGood(eval: ExpectationResult){
//   if(eval)
// }
// checks the session history to find out if user has met the expectations
// and returns the set of unanswered expectations
// function getUnansweredExpectations(atd: AutoTutorData, sdp: Session): string[] {
//   const results: string[] = [];
//   //   sdp.sessionHistory .forEach(element => {

//   //   });
//   return results;
// }
