/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import axios from 'axios';
import { logger } from 'utils/logging';

const CLASSIFIER_ENDPOINT = process.env.CLASSIFIER_ENDPOINT || '/classifier';

export interface ClassfierRequest {
  lesson: string;
  input: string;
  config: ClassifierConfig;
  expectation?: number;
}

export interface ClassifierConfig {
  question: string;
  expectations: Expectation[];
}

export interface Expectation {
  ideal: string;
}
export enum Evaluation {
  Good = 'Good',
  Bad = 'Bad',
}

export interface ExpectationResult {
  evaluation: Evaluation;
  score: number;
}

export interface SpeechActs {
  metacognitive: ExpectationResult;
  profanity: ExpectationResult;
}

export interface ClassifierResult {
  expectationResults: ExpectationResult[];
  speechActs: SpeechActs;
}

export interface ClassifierResponse {
  output: ClassifierResult;
}

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
  return result;
}

export default {
  evaluate,
  Evaluation,
};
