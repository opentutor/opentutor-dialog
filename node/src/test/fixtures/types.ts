import { OpenTutorResponse } from 'models/opentutor-response';
export interface DialogRequestResponse {
  userInput: string;
  expectedResponse: OpenTutorResponse;
}

export interface DialogScenario {
  name: string;
  lessonId: string;
  expectedRequestResponses: DialogRequestResponse[];
}
