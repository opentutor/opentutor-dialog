export default class AutoTutorQuestion
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
};
