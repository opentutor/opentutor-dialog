export default class AutoTutorData
{
    rootExpectationId = 0;
    expectations = [
        'Peer pressure can cause you to allow inappropriate behavior.',
        'If you correct someone\'s behavior, you may get them in trouble or it may be harder to work with them.',
        'Enforcing the rules can make you unpopular.'
    ];
    questionIntro = 'Here is a question about integrity, a key Navy attribute.';
    questionText = 'What are the challenges to demonstrating integrity in a group?';
    recapText = [
        'Peer pressure can push you to allow and participate in inappropriate behavior.',
        'When you correct somone\'s behavior, you may get them in trouble or negatively impact your relationship with them.',
        'However, integrity means speaking out even when it is unpopular.'
    ];

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
