import axios from 'axios';

interface ClassfierRequest {
  question: string;
  inputSentence: string;
  expectation?: number;
}

export enum Evaluation {
  Good = 'Good',
  Bad = 'Bad',
}

interface ExpectationResult {
  evaluation: Evaluation;
  score: number;
}

interface ClassifierResult {
  expectationResults: ExpectationResult[];
}

interface ClassifierResponse {
  output: ClassifierResult;
}

const CLASSIFIER_ENDPOINT = process.env.CLASSIFIER_ENDPOINT || '/classifier';

export async function evaluate(
  request: ClassfierRequest
): Promise<ClassifierResponse> {
  const response = await axios.post<ClassifierResponse>(
    CLASSIFIER_ENDPOINT,
    request
  );
  return response.data;
}
