import AutoTutorData, { Prompt } from 'models/autotutor-data';
import SessionDataPacket from './session-data-packet';
import { evaluate, Evaluation } from 'models/classifier';

//this should begin by sending the question prompt
export function beginDialog(atd: AutoTutorData): string[] {
  return [atd.questionIntro, atd.questionText];
}

export async function processUserResponse(
  atd: AutoTutorData,
  sdp: SessionDataPacket
): Promise<string[]> {
  const classifierResult = await evaluate({
    inputSentence: sdp.previousUserResponse,
    question: 'fixme',
  });
  const expectationResults = classifierResult.output.expectationResults;

  //check if response was for a prompt
  const prompt: Prompt[] = atd.prompts.filter(function(n) {
    return sdp.previousSystemResponse.indexOf(n.prompt) > -1;
  });
  if (prompt.length > 0) {
    //response was to a prompt.
    if (
      expectationResults[sdp.dialogState.expectationsCompleted.indexOf(false)]
        .evaluation === Evaluation.Good
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
    // console.log('inside a hint');
    // console.log(hintText);
    //response is to a hint
    const expectationId: number = atd.hints.indexOf(hintText[0]);
    if (expectationResults[expectationId].evaluation === Evaluation.Good) {
      //hint answered successfully
      sdp.dialogState.expectationsCompleted[expectationId] = true;
      return [atd.positiveFeedback[0]].concat(toNextExpectation(atd, sdp));
    } else {
      //hint not answered correctly, send prompt
      const prompt: Prompt = atd.prompts.find(
        p => p.expectationId == expectationId
      );
      return [atd.promptStart[0], prompt.prompt];
    }
  }

  if (expectationResults.every(x => x.evaluation === Evaluation.Good)) {
    //perfect answer
    return atd.recapText;
  }
  if (expectationResults.every(x => x.evaluation === Evaluation.Neutral)) {
    //answer did not match any expectation, guide user through expectations
    return atd.pump.concat(toNextExpectation(atd, sdp));
  }
  if (expectationResults.find(x => x.evaluation === Evaluation.Good)) {
    //matched one specific expectation
    const expectationId = expectationResults.indexOf(
      expectationResults.find(x => x.evaluation === Evaluation.Good)
    );
    sdp.dialogState.expectationsCompleted[expectationId] = true;
    return [atd.positiveFeedback[0]].concat(toNextExpectation(atd, sdp));
  }
  if (expectationResults.find(x => x.evaluation === Evaluation.Bad)) {
    //bad answer. use hint
    const expectationId = expectationResults.indexOf(
      expectationResults.find(x => x.evaluation === Evaluation.Bad)
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

// checks the session history to find out if user has met the expectations
// and returns the set of unanswered expectations
// function getUnansweredExpectations(atd: AutoTutorData, sdp: Session): string[] {
//   const results: string[] = [];
//   //   sdp.sessionHistory .forEach(element => {

//   //   });
//   return results;
// }
