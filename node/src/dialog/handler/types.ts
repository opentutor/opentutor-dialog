import SessionData from 'dialog/session-data';
import OpenTutorResponse from 'dialog/response-data';

export interface DialogHandler {
  beginDialog(): Promise<OpenTutorResponse[]>;

  process(sdp: SessionData): Promise<OpenTutorResponse[]>;
}
