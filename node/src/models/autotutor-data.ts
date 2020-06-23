export default interface AutoTutorData {
  rootExpectationId: number;
  expectations: string[];
  questionIntro: string;
  questionText: string;
  recapText: string[];
  confusionFeedback: string[];
  positiveFeedback: string[];
  negativeFeedback: string[];
  neutralFeedback: string[];
  promptStart: string[];
  hints: string[];
  pump: string[];
  pumpBlank: string[];
  hintStart: string[];
  media: object;
  originalXml: string;
}

function convertToJson() {
  return JSON.stringify(this);
}

export const navyIntegrity: AutoTutorData = {
  rootExpectationId: 0,
  expectations: [
    'Peer pressure can cause you to allow inappropriate behavior.',
    "If you correct someone's behavior, you may get them in trouble or it may be harder to work with them.",
    'Enforcing the rules can make you unpopular.',
  ],
  questionIntro: 'Here is a question about integrity, a key Navy attribute.',
  questionText:
    'What are the challenges to demonstrating integrity in a group?',
  recapText: [
    'Peer pressure can push you to allow and participate in inappropriate behavior.',
    "When you correct somone's behavior, you may get them in trouble or negatively impact your relationship with them.",
    'However, integrity means speaking out even when it is unpopular.',
  ],
  confusionFeedback: [
    'Some people get confused at this point. Try typing whatever you are thinking and we will go from there.',
  ],
  positiveFeedback: ['Great'],
  negativeFeedback: ["No that's not how it works"],
  neutralFeedback: ['OK'],
  promptStart: ['Prompt1', 'Prompt2', 'Prompt3'],
  hints: [
    'Hint1',
    'How can it affect you when you correct their behavior?',
    'How can it affect someone when you correct their behavior?',
  ],
  pump: ["Let's work through this together"],
  hintStart: ['Consider this.'],
  pumpBlank: [],
  media: {},
  originalXml: '',
};
