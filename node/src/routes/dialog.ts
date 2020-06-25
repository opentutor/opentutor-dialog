import express, { Request, Response } from 'express';
import { navyIntegrity } from 'models/autotutor-data';
import 'models/opentutor-response';
import SessionDataPacket, {
  hasHistoryBeenTampered,
  newSessionDataPacket,
  updateHash,
  addTutorDialog,
  addUserDialog,
} from 'models/session-data-packet';
import { createTextResponse } from 'models/opentutor-response';
import { processUserResponse, beginDialog } from 'models/dialog-system';
// import logger from 'utils/logging';

//import AutoTutorOutput from "models/AutoTutorOutput";

const router = express.Router({ mergeParams: true });

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

  //TODO: add in mechanics to determine script, currently referring to navy integrity
  const atd = navyIntegrity;

  //new sessionDataPacket
  const sdp = newSessionDataPacket(atd);
  addTutorDialog(sdp, beginDialog(atd));
  updateHash(sdp);

  res.send({
    status: 'ok',
    data: atd,
    sessionInfo: sdp,
    response: createTextResponse(beginDialog(atd)),
  });
});

// TODO: session history needs to be implemented

router.post('/session', async (req: Request, res: Response) => {
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
  // const msg = dialogs[sessionData.sessionHistory.systemResponses.length];
  const msg = await processUserResponse(navyIntegrity, sessionData);
  console.log('system response was ');
  console.log(msg);
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
