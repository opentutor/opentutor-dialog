/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Lesson } from 'apis/lessons';

export default interface Dialog {
  rootExpectationId: number;
  lessonId: string;
  expectations: Expectation[];
  questionIntro: string;
  questionText: string;
  recapText: string[];
  confusionFeedback: string[];
  confusionFeedbackWithHint: string[];
  positiveFeedback: string[];
  negativeFeedback: string[];
  neutralFeedback: string[];
  goodPointButFeedback: string[];
  goodPointButOutOfHintsFeedback: string[];
  perfectFeedback: string[];
  pump: string[];
  pumpBlank: string[];
  hintStart: string[];
  promptStart: string[];
  profanityFeedback: string[];
  originalXml: string;
}

export interface Prompt {
  prompt: string;
  answer: string;
}

export interface Expectation {
  expectation: string;
  hints: string[];
  prompts: Prompt[];
}

export const FEEDBACK_GOOD_POINT_BUT = [
  "Good point! But let's focus on this part.",
  `That's true. Now consider this...`,
  `Yes and let's get this other point...`,
];

export const FEEDBACK_NEGATIVE = [
  'Not really.',
  "I don't think so.",
  'No.',
  "I'm not so sure about that.",
  "I don't think that is right.",
];

export const PROMPT_START = [
  'See if you can get this',
  'Try this.',
  'What about this.',
  'See if you know the answer to this.',
];

export const POSITIVE_FEEDBACK = [
  'Great.',
  'Good.',
  'Right.',
  "Yeah, that's right.",
  'Excellent.',
  'Correct.',
];

export const SENSITIVE_NEGATIVE_FEEDBACK = [
  'Think about this.',
  "I'm not sure about that.",
  "That isn't what I had in mind.",
  'Not quite, I was thinking about something different.',
];

export const FEEDBACK_OUT_OF_HINTS_ALTERNATE_EXPECTATION_FULFILLED = [
  'Good point, though I was actually thinking about another piece.',
  "That's a good point, but I had another part in mind.",
];

export function convertLessonDataToATData(lessonData: Lesson): Dialog {
  const defaultData: Dialog = {
    lessonId: '',
    rootExpectationId: 0,
    expectations: [],
    questionIntro: '',
    questionText: '',
    recapText: [],
    confusionFeedback: [
      "That's okay, can you type a bit more about what you are thinking?",
      "That's all right. Give your best guess and we'll go from there.",
      "Even if you're not sure about everything you need to answer, just type what you know. Can you say a bit more?",
    ],
    confusionFeedbackWithHint: [
      "That's okay. Let's focus on one part of the problem.",
      "Don't worry if you aren't sure. We'll work on one piece at a time.",
      "That's an okay place to start. Let's try this part together.",
    ],
    positiveFeedback: POSITIVE_FEEDBACK,
    perfectFeedback: ['Nicely done!', 'You got it!'],
    // negativeFeedback: FEEDBACK_NEGATIVE,
    negativeFeedback: SENSITIVE_NEGATIVE_FEEDBACK,
    neutralFeedback: ['Ok.', 'So.', 'Well.', 'I see.', 'Okay.'],
    goodPointButFeedback: FEEDBACK_GOOD_POINT_BUT,
    goodPointButOutOfHintsFeedback: FEEDBACK_OUT_OF_HINTS_ALTERNATE_EXPECTATION_FULFILLED,
    pump: [
      "Let's work through this together.",
      'And can you add to that?',
      'What else?',
      'Anything else?',
      'Could you elaborate on that a little?',
      'Can you add anything to that?',
    ],
    hintStart: [
      'Consider this.',
      'Let me help you a little.',
      'Think about this.',
      "Let's work through this together.",
    ],
    promptStart: PROMPT_START,
    profanityFeedback: [
      "Okay, let's calm down.",
      "Let's calm down and focus on the problem.",
      "I see. Let's take a deep breath and try this again.",
      "I hear you. Let's just both do our best to help you learn.",
      "Let's take a step back for a moment.",
      "Hey, easy there. We're both here to help you learn.",
    ],
    pumpBlank: ["I'll give you some more time."],
    originalXml: '',
  };

  try {
    defaultData.questionIntro = lessonData.intro;
    defaultData.questionText = lessonData.question;
    defaultData.lessonId = lessonData.lessonId;
    defaultData.recapText = Array.isArray(lessonData.conclusion)
      ? lessonData.conclusion
      : lessonData.conclusion
      ? [`${lessonData.conclusion}`]
      : [];
  } catch (err) {
    throw { status: '404', message: 'lesson data not found' };
  }

  defaultData.expectations = lessonData.expectations.map((exp) => {
    return {
      expectation: exp.expectation,
      hints: exp.hints.map((h) => h.text),
      prompts: exp.prompts
        ? exp.prompts.map((p) => {
            return { prompt: p.prompt, answer: p.answer };
          })
        : [],
    };
  });

  return defaultData;
}
