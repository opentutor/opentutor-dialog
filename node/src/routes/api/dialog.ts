import express, { Request, Response } from 'express';
const router = express.Router({ mergeParams: true });

router.post('/session', (req: Request, res: Response) => {
    //if there is no session ID, send error.
    if(req.body['Id'] == null) {
        res.status(400)
            .send();
        return;
    }

    var jsonData = {
        'Id': req.body['Id'],
        'User': req.body['User'],
        'UseDB': req.body['UseDB'],
        'ScriptXML': req.body['ScriptXML'],
        'LSASpaceName': req.body["LSASpaceName"],
        'ScriptURL': req.body['ScriptURL']
    };

    //TODO: add in mechanics to extract prompt question from the script itself

    var atq = new AutoTutorQuestion();
    res.send({
        status: 'ok',
        "data": atq.convertToJson()
    });
});

//classes for the packets?
class AutoTutorAnswer
{
    answerText = '';
    questionContext = '';
    regexMatches = {};
    type = '';
    threshold = 0.0;
    isGood = false;
}

class AutoTutorQuestion
{
    rootExpectationId = 0;
    expectations = {};
    questionIntro = '';
    questionText = 'What are the challenges to demonstrating integrity in a group?';
    recapText = {};

    positiveFeedback = {};
    negativeFeedback = {};
    neutralFeedback = {};
    promptStart = {};
    hintStart = {};
    pump = {};
    pumpBlank = {};

    media = {};
    originalXml = '';

    convertToJson() {
        var jsonObject = JSON.stringify(this);
        return jsonObject;
    }
}


export default router;