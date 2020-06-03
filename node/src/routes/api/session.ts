import express, { Request, Response } from 'express';
import AutoTutorData from 'models/AutoTutorData';
//import AutoTutorOutput from "models/AutoTutorOutput";

const router = express.Router({ mergeParams: true });

//This is the array that has hardcoded dialogs
const dialogs = [
  'Here is a question about integrity, a key Navy attribute. What are the challenges to demonstrating integrity in a group?',
  "So. Look at it this way. How can it affect you when you correct someone's behavior?",
  "Yeah, that's right. Let's try this together. How can it affect someone when you correct their behavior?",
  "Good. Peer pressure can push you to allow and participate in inappropriate behavior.\nWhen you correct somone's behavior, you may get them in trouble or negatively impact your relationship with them.\nHowever, integrity means speaking out even when it is unpopular.\n AutoTutor has terminated the session. Re-open the chat window to start a new test.",
];

router.post('/', (req: Request, res: Response) => {
  //if there is no session ID, send error.
  if (!req.body['Id']) {
    return res.status(400).send();
  }

  //session start packet, not used currently
  const jsonData = {
    Id: req.body['Id'],
    User: req.body['User'],
    UseDB: req.body['UseDB'],
    ScriptXML: req.body['ScriptXML'],
    LSASpaceName: req.body['LSASpaceName'],
    ScriptURL: req.body['ScriptURL'],
  };

  //TODO: add in mechanics to extract prompt question from the script itself

  const atd = new AutoTutorData();

  // var ato = new AutoTutorOutput();

  //reset the turn when new session is started
  //currentTurn = 0;

  res.send({
    status: 'ok',
    data: atd.convertToJson(),
    dialog: dialogs[0],
    turn: 0,
  });
});

// TODO: session history needs to be implemented

router.post('/dialog', (req: Request, res: Response) => {
  //if there is no turn number, send error.
  if (req.body['turn'] == null) {
    res.status(400).send();
    return;
  }
  console.log('User says:  ' + req.body['message']);
  const turn = req.body['turn'];
  res.send({
    status: 'ok',
    dialog: dialogs[turn],
    turn: turn,
  });
});

export default router;
