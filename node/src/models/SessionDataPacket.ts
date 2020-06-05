import sha256 from 'crypto-js/sha256';

 
const SESSION_SECURITY_KEY = 'Pal3KeyICT';

export default interface SessionDataPacket
{
    sessionID: string;
    sessionHistory: SessionHistory;
    previousUserResponse: string;
    previousSystemResponse: string;
    hash: string;

};

export interface SessionHistory
{
    userResponses: string[];
    userScores: number[];
    systemResponses: string[];

}

export class ATSessionPacket implements SessionDataPacket{
    sessionID: string;
    sessionHistory: SessionHistory;
    previousUserResponse: string;
    previousSystemResponse: string;
    hash: string;

    //creates a new session packet
    constructor()
    {
        this.sessionHistory = {
            'userResponses': new Array<string>(),
            'systemResponses': new Array<string>(),
            'userScores': new Array<number>()
          };
        this.sessionID = this.generateSessionID();
        this.previousUserResponse = '';
        this.previousSystemResponse =  '';
        this.updateHash();
    }

    addUserDialog(message: string){
        this.previousUserResponse = message;
        this.sessionHistory.userResponses.push(message);
    }

    addTutorDialog(message: string){
        this.previousSystemResponse = message;
        this.sessionHistory.systemResponses.push(message);
    }

    //hashes the session history object and returns the hash
    updateHash()
    {
        this.hash = sha256(JSON.stringify(this.sessionHistory), SESSION_SECURITY_KEY).toString();
    }

    

    //generates a random 8 digit session ID, can be alphanumeric
    generateSessionID()
    {
        return this.makeid(8);
    }
    
    //generator for the random alphanumeric characters for session ID
    makeid(length: number) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }



}

//returns true if history has been tampered
export function hasHistoryBeenTampered(hist: SessionHistory, hash: string){
    const newhash =  sha256(JSON.stringify(hist), SESSION_SECURITY_KEY).toString();
    return !(newhash == hash);
}


