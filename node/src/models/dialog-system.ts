import AutoTutorData from "autotutor-data";
import OpenTutorResponse, { createTextResponse } from "opentutor-response";

//this should begin by sending the question prompt
export function beginDialog(atd: AutoTutorData): OpenTutorResponse[] {
    return createTextResponse([atd.questionIntro, atd.questionText]);
}

export function processUserResponse(atd: AutoTutorData, userResponse : string) {
    const regexAnswer = "\bin trouble\b|\bcaptain's mast\b|\bhard(er)? to work with\b|\bembarrass(ed|ing)?\b|\bdefensive\b|\bangry\b|\bupset\b\b(group|peer|leader|commander) (pressure|influence)\b\bunpopular\b|\bhated?\b|\bunliked\b|\bnot popular\b";
    const regexBadAnswer = "bad" ;
    if(userResponse.match(regexAnswer)){
        //return response as closing
        return createTextResponse(atd.recapText);
    }

    if(userResponse.match(regexBadAnswer)) {
        //pick an unanswered expectation and return return a prompt
        return createTextResponse(atd.promptStart);
    }


}

