import axios from 'axios';
import { logger } from 'utils/logging';

export interface ClassfierRequest {
  question: string;
  inputSentence: string;
  expectation?: number;
}

export enum Evaluation {
  Good = 'Good',
  Bad = 'Bad',
}

export interface ExpectationResult {
  evaluation: Evaluation;
  score: number;
}

export interface ClassifierResult {
  expectationResults: ExpectationResult[];
}

export interface ClassifierResponse {
  output: ClassifierResult;
}

const CLASSIFIER_ENDPOINT = process.env.CLASSIFIER_ENDPOINT || '/classifier';

export async function evaluate(
  request: ClassfierRequest
): Promise<ClassifierResponse> {
  logger.debug(
    `classifier request to ${CLASSIFIER_ENDPOINT}: ${JSON.stringify(request)}`
  );
  const response = await axios.post<ClassifierResponse>(
    CLASSIFIER_ENDPOINT,
    request
  );
  logger.debug(`classifier result: ${JSON.stringify(response.data)}`);
  const result = response.data;
  if (
    !result.output.expectationResults &&
    (result.output as any).expectation_results
  ) {
    logger.warn(
      `fix the snake case in classifer response!: ${JSON.stringify(result)}`
    );
    result.output.expectationResults = (result.output as any).expectation_results;
  }
  return response.data;
}

export default {
  evaluate, Evaluation
};
