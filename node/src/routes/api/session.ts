import express, { Request, Response } from 'express';
import AutoTutorData from 'models/AutoTutorData';
//import AutoTutorOutput from "models/AutoTutorOutput";

const router = express.Router({ mergeParams: true });

//This is the array that has hardcoded dialogs
var dialogs = [
    'q1',
    'q2',
    'q3'
];

router.post('/', (req: Request, res: Response) => {

    //if there is no session ID, send error.
    if(req.body['Id'] == null) {
        res.status(400)
            .send();
        return;
    }

    //session start packet
    var jsonData = {
        'Id': req.body['Id'],
        'User': req.body['User'],
        'UseDB': req.body['UseDB'],
        'ScriptXML': req.body['ScriptXML'],
        'LSASpaceName': req.body["LSASpaceName"],
        'ScriptURL': req.body['ScriptURL']
    };

    //TODO: add in mechanics to extract prompt question from the script itself



    var atd = new AutoTutorData();

    // var ato = new AutoTutorOutput();

    res.send({
        status: 'ok',
        "data": atd.convertToJson(),
        'dialog': dialogs[0],
        'turn': 0
    });
});

router.post('/dialog', (req: Request, res: Response) => {
    //if there is no turn number, send error.
    if(req.body['turn'] == null) {
        res.status(400)
            .send();
        return;
    }
    console.log('message was ' + req.body['message'])
    var turn = req.body['turn'];
    res.send({
        status: 'ok',
        'dialog': dialogs[turn+1],
        'turn': turn+1
    });
});






export default router;