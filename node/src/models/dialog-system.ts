import AutoTutorData from 'models/autotutor-data';
import OpenTutorResponse, {
  createTextResponse,
} from 'models/opentutor-response';
import SessionDataPacket from './session-data-packet';
import { Session } from 'inspector';

//this should begin by sending the question prompt
export function beginDialog(atd: AutoTutorData): OpenTutorResponse[] {
  return createTextResponse([atd.questionIntro, atd.questionText]);
}

export function processUserResponse(
  atd: AutoTutorData,
  sdp: SessionDataPacket
): string[] {
  const regexAnswer =
    "\b(group|peer|leader|commander) (pressure|influence)\b\bin trouble\b|\bcaptain's mast\b|\bhard(er)? to work with\b|\bembarrass(ed|ing)?\b|\bdefensive\b|\bangry\b|\bupset\b\bunpopular\b|\bhated?\b|\bunliked\b|\bnot popular\b";
  const regexBadAnswer = 'bad';
  const userResponse = sdp.previousUserResponse;

  // if(sdp.dialogState == 'MQ'){
  //main question
  //check if user answered MQ completely
  // }
  if (
    userResponse.match(regexAnswer) ||
    userResponse.includes('Peer pressure')
  ) {
    //return response as closing
    return atd.recapText;
  }

  if (userResponse.match(regexBadAnswer)) {
    //pick an unanswered expectation and return return a prompt
    return atd.promptStart;
  }
  return ['no answer'];
}

export function processExpectationResponse(
  atd: AutoTutorData,
  sdp: SessionDataPacket
) {
  console.log('Not Implemented.');
}

// checks the session history to find out if user has met the expectations
// and returns the set of unanswered expectations
function getUnansweredExpectations(atd: AutoTutorData, sdp: Session): string[] {
  return [];
}
