import express, { Request, Response } from 'express';
import AutoTutorQuestion from 'models/AutoTutorQuestion';

const router = express.Router({ mergeParams: true });

router.post('/', (req: Request, res: Response) => {
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






export default router;