import AutoTutorData from 'models/autotutor-data';
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
  if (expectationResults.every(x => x.evaluation === Evaluation.Good)) {
    return atd.recapText;
  }
  if (expectationResults.every(x => x.evaluation === Evaluation.Bad)) {
    //answer did not match any expectation, guide user through expectations
  }
  if (expectationResults.find(x => x.evaluation === Evaluation.Good)) {
    const expectationId = expectationResults.indexOf(
      expectationResults.find(x => x.evaluation === Evaluation.Good)
    );
    sdp.dialogState.expectationsCompleted[expectationId] = true;
    return processExpectationResponse(atd, sdp, expectationId);
  }
  return ['this path has not been implemented yet.'];
}

export function processExpectationResponse(
  atd: AutoTutorData,
  sdp: SessionDataPacket,
  expectationId: number
) {
  //give positive feedback, and ask next expectation question
  let answer: string[] = [];
  answer.push(atd.positiveFeedback[0]);
  console.log(sdp.dialogState.expectationsCompleted);
  if (sdp.dialogState.expectationsCompleted.indexOf(false) != -1) {
    answer.push(
      atd.hintStart[sdp.dialogState.expectationsCompleted.indexOf(false)]
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
