import Dialog, { Prompt, Expectation } from 'dialog/dialog-data';
import SessionData, {
  addClassifierGrades,
  ExpectationStatus,
  SessionHistory,
} from 'dialog/session-data';
import {
  ClassifierResponse,
} from 'apis/classifier';
import OpenTutorResponse, {
} from 'dialog/response-data';

interface DialogHandler {
  process(
    lessonId: string,
    atd: Dialog,
    sdp: SessionData,
    classifierResult: ClassifierResponse
  ): OpenTutorResponse[];
}

class DefaultDialogHandler implements DialogHandler {
  process(
    lessonId: string,
    atd: Dialog,
    sdp: SessionData,
    classifierResult: ClassifierResponse
  ): OpenTutorResponse[] {
    return [];
  }
}
