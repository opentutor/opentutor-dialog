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
  prompts: Prompt[];
  hints: string[];
  pump: string[];
  pumpBlank: string[];
  hintStart: string[];
  promptStart: string[];
  media: object;
  originalXml: string;
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
  prompts: [
    {
      prompt:
        'How can it affect someone emotionally when you correct their behavior?',
      answer: 'it may be harder to work with them',
      expectationId: 1,
    },
    {
      prompt: 'What might cause you to lower your standards?',
      answer: 'peer pressure',
      expectationId: 0,
    },
  ],
  hints: [
    'Why might you allow bad behavior in a group that you normally would not allow yourself to do?',
    'How can it affect someone when you correct their behavior?',
    "How can it affect you when you correct someone's behavior?",
  ],
  pump: ["Let's work through this together"],
  hintStart: ['Consider this.'],
  promptStart: ['See if you can get this'],
  pumpBlank: [],
  media: {},
  originalXml: '',
};

export const currentFlow: AutoTutorData = {
  rootExpectationId: 0,
  expectations: ['Current flows in the same direction as the arrow.'],
  questionIntro:
    '_user_, this is a warm up question on the behavior of P-N junction diodes.',
  questionText:
    'With a DC input source, does current flow in the same or the opposite direction of the diode arrow?',
  recapText: [
    'Summing up, this diode is forward biased. Positive current flows in the same direction of the arrow, from anode to cathode.',
    "Let's try a different problem.",
  ],
  confusionFeedback: [
    'Some people get confused at this point. Try typing whatever you are thinking and we will go from there.',
  ],
  positiveFeedback: ['Great'],
  negativeFeedback: ["No that's not how it works"],
  neutralFeedback: ['OK'],
  prompts: [
    {
      prompt: 'What might cause you to lower your standards?',
      answer: 'peer pressure',
      expectationId: 0,
    },
  ],
  hints: [
    'Why might you allow bad behavior in a group that you normally would not allow yourself to do?',
  ],
  pump: ["Let's work through this together"],
  hintStart: ['Consider this.'],
  promptStart: ['See if you can get this'],
  pumpBlank: [],
  media: {},
  originalXml: '',
};

export interface Prompt {
  prompt: string;
  answer: string;
  expectationId: number;
}
