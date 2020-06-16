import express, { Request, Response } from 'express';
import AutoTutorData from 'models/autotutor-data';
import 'models/opentutor-response';
import SessionDataPacket, {
  hasHistoryBeenTampered,
  newSessionDataPacket,
  updateHash,
  addTutorDialog,
  addUserDialog,
} from 'models/session-data-packet';
import { createTextResponse } from 'models/opentutor-response';
// import logger from 'utils/logging';

//import AutoTutorOutput from "models/AutoTutorOutput";

const router = express.Router({ mergeParams: true });

//This is the array that has hardcoded dialogs
const dialogs = [
  [
    'Here is a question about integrity, a key Navy attribute.',
    'What are the challenges to demonstrating integrity in a group?',
  ],
  [
    'So.',
    'Look at it this way.',
    "How can it affect you when you correct someone's behavior?",
  ],
  [
    "Yeah, that's right.",
    "Let's try this together.",
    'How can it affect someone when you correct their behavior?',
  ],
  [
    'Good.',
    'Peer pressure can push you to allow and participate in inappropriate behavior.',
    "When you correct somone's behavior, you may get them in trouble or negatively impact your relationship with them.",
    'However, integrity means speaking out even when it is unpopular.',
  ],
];

router.post('/', (req: Request, res: Response) => {
  //if there is no session ID, send error.

  // if (!req.body['Id']) {
  //   return res.status(400).send();
  // }

  //session start packet, not used currently
  // const jsonData = {
  //   Id: req.body['Id'],
  //   User: req.body['User'],
  //   UseDB: req.body['UseDB'],
  //   ScriptXML: req.body['ScriptXML'],
  //   LSASpaceName: req.body['LSASpaceName'],
  //   ScriptURL: req.body['ScriptURL'],
  // };

  //new sessionDataPacket
  const sdp = newSessionDataPacket();
  addTutorDialog(sdp, dialogs[0]);
  updateHash(sdp);

  //TODO: add in mechanics to extract prompt question from the script itself
  const atd = new AutoTutorData();

  res.send({
    status: 'ok',
    data: atd,
    sessionInfo: sdp,
    response: createTextResponse(dialogs[0]),
  });
});

// TODO: session history needs to be implemented

router.post('/session', (req: Request, res: Response) => {
  //load up session data
  const sessionData: SessionDataPacket = req.body['sessionInfo'];

  //check for tampering of history
  if (hasHistoryBeenTampered(sessionData.sessionHistory, sessionData.hash)) {
    // console.log('history was tampered');
    return res.status(403).send();
  }

  //read user dialog
  // console.log('User says:  ' + req.body['message']);
  addUserDialog(sessionData, req.body['message']);

  //load next system message
  //   console.log('loading next message');
  const msg = dialogs[sessionData.sessionHistory.systemResponses.length];
  addTutorDialog(sessionData, msg);

  // console.log('updating hash');
  //update hash
  updateHash(sessionData);

  res.send({
    status: 'ok',
    sessionInfo: sessionData,
    response: createTextResponse(msg),
  });
});

export default router;
