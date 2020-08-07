import { OpenTutorResponse } from 'dialog/response-data';
import { ClassifierResponse } from 'apis/classifier';

interface MockAxiosResponse {
  status?: number;
  data: ClassifierResponse;
}

export interface DialogRequestResponse {
  userInput: string;
  expectedResponse: OpenTutorResponse;
  mockClassifierResponse: MockAxiosResponse;
}

export interface DialogScenario {
  name: string;
  lessonId: string;
  expectedRequestResponses: DialogRequestResponse[];
}
