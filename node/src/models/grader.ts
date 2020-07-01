import axios from 'axios';
import { logger } from 'utils/logging';
import AutoTutorData from './autotutor-data';
import SessionDataPacket from './session-data-packet';

export interface GraderRequest {
    sessionId: string;
    username: string;
    question: Question;
    userResponses: Response[];
}

export interface Response {
    text: string;
    expectationScores: ExpectationScore[];
}

interface ExpectationScore {
    classifierGrade: string;
    graderGrade: string;
}

export interface Question {
    text: string;
    expectations: Expectation[];
}

interface Expectation {
    text: string;
}

const GRADER_ENDPOINT = process.env.GRADER_ENDPOINT || '/grader';


export function createGraderObject(atd: AutoTutorData, sdp: SessionDataPacket): GraderRequest {
    const userResponses: Response[] = sdp.sessionHistory.userResponses.map(r => {
        return { text: r, expectationScores: [{
            classifierGrade: 'Good', 
            graderGrade: ''
        },
    ]
    };
    });
    return {
        sessionId: sdp.sessionId,
        username: '',
        question: {
            text: atd.questionText, expectations: atd.expectations.map(e => {
                return { text: e } as Expectation;
            })
        },
        userResponses: userResponses,
    };
}
export async function sendGraderRequest(
    atd: AutoTutorData,
    sdp: SessionDataPacket,
): Promise<string> {
    const request: GraderRequest = createGraderObject(atd, sdp);
    logger.debug(
        `grader request to ${GRADER_ENDPOINT}: ${JSON.stringify(request)}`
    );
    const response = await axios.post(
        GRADER_ENDPOINT,
        request
    );

    //   logger.debug(`grader result: ${JSON.stringify(response.data)}`);
    //   const result = response.data;
    //   if (
    //     !result.output.expectationResults &&
    //     (result.output as any).expectation_results
    //   ) {
    //     logger.warn(
    //       `fix the snake case in classifer response!: ${JSON.stringify(result)}`
    //     );
    //     result.output.expectationResults = (result.output as any).expectation_results;
    //   }
    return response.data;
}

export default {
    sendGraderRequest
};
