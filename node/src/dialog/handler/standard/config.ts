/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Lesson } from 'apis/lessons';
import SessionData from 'dialog/session-data';
import { DialogConfig } from './types';

const goodThreshold: number =
  Number.parseFloat(process.env.GOOD_THRESHOLD) || 0.6;
const badThreshold: number =
  Number.parseFloat(process.env.BAD_THRESHOLD) || 0.6;
const sensitiveBadThreshold: number =
  Number.parseFloat(process.env.SENSITIVE_BAD_THRESHOLD) || 0.89;
const goodMetacognitiveThreshold: number =
  Number.parseFloat(process.env.GOOD_METACOGNITIVE_THRESHOLD) || 0.8;

export const FEEDBACK_GOOD_POINT_BUT = [
  "Good point! But let's focus on this part.",
  `That's true. Now consider this...`,
  `Yes and let's get this other point...`,
];

export const FEEDBACK_EXPECTATIONS_LEFT = [
  "But there's more.",
  "Now what's another answer?",
  `Now let's move on to another answer...`,
  'But there are more answers left.',
  'But there are still more answers.',
];

export const SOME_WRONG_FEEDBACK = [
  "Okay, that's part of it.",
  'Well, some of that is correct.',
  "I see. Good point, but that's not entirely right.",
];

export const SENSITIVE_SOME_WRONG_FEEDBACK = [
  "That's a good start.",
  "You made a good point, but there's more.",
  "That's a good thought.",
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

export const SENSITIVE_POSITIVE_FEEDBACK = [
  'Right.',
  "Yeah, that's right.",
  'Correct.',
  "That's correct.",
];

export const PERFECT_FEEDBACK_SURVEY_STYLE = [
  "Amazing! You got them all. Maybe you're the expert around here.",
  'Wow! You got them all, that was perfect.',
  "Great job! You really knew these answers, you're a pro!",
];

export const SENSITIVE_NEGATIVE_FEEDBACK = [
  "I'm not sure about that.",
  'Think about this.',
  "That isn't what I had in mind.",
  'Not quite, I was thinking about something different.',
];

export const SURVEY_STYLE_NEGATIVE_FEEDBACK = [
  "Sorry, it looks like that wasn't on the board.",
  "Sorry, I didn't match that in the list.",
  "I'm sorry, that wasn't one of the answers on the board.",
  "I'm sorry, I didn't find that answer on the list.",
];

export const FEEDBACK_OUT_OF_HINTS_ALTERNATE_EXPECTATION_FULFILLED = [
  'Good point, though I was actually thinking about another piece',
  "That's a good point, but I had another part in mind.",
];

export const SURVEY_STYLE_FEEDBACK_OUT_OF_HINTS_ALTERNATE_EXPECTATION_FULFILLED =
  [
    'Good point, though I was actually thinking about another piece. Both are on the board.',
    "That's a good answer, but I had another in mind. Both are on the board.",
  ];

export const CLOSING_POSITIVE_FEEDBACK = [
  'Nice job, you did great!',
  'You did pretty well on this lesson!',
  'Good job, it looks like you understood this lesson',
];

export const CLOSING_NEGATIVE_FEEDBACK = [
  'Try again next time and see if you can get all the answers.',
  "It looks like you didn't get all the answers, try again next time.",
  "Sorry, it looks like you missed a few answers. We'll get them next time.",
];

export const SURVEY_STYLE_EXPECTATION_REVEAL = [
  "We'll give you this one on the board.",
  "Okay, we'll put this one on the board.",
  'The answer for this one is on the board',
];

export const SENSITIVE_FAREWELL = [
  'Good job today, it was nice to see you. Bye!',
  'Thanks for working on this lesson today, you did some good work.',
  'You made a great effort on this lesson. See you later!',
];

export function givePositiveStreaksFeedback(
  streakNum: number,
  atd: DialogConfig
): string[] {
  if (atd.dialogCategory === 'sensitive') {
    return [
      `Correct, that's ${streakNum} in a row!`,
      `That's right, you got ${streakNum} in a row!`,
      `Keep it up, you're on a roll.`,
      `Right, that's ${streakNum} in a row!`,
      `Good effort, you got ${streakNum} in a row.`,
      `That's correct, you got ${streakNum} in a row now.`,
      `Keep up the good work, that's ${streakNum} in a row.`,
      `Nicely done, that's ${streakNum} in a row`,
    ];
  } else {
    return [];
  }
}

export function allowNegativeFeedback(
  atd: DialogConfig,
  sdp: SessionData
): boolean {
  if (atd.dialogCategory === 'sensitive') {
    if (
      sdp.sessionHistory.systemResponses.length >= 2 &&
      sdp.sessionHistory.systemResponses
        .slice(-2)
        .find((prevRespones) =>
          prevRespones.some((prevResponse) =>
            atd.negativeFeedback.includes(prevResponse)
          )
        )
    ) {
      return false;
    } else if (sdp.sessionHistory.systemResponses.length === 1) {
      // no negative feedback on first answer for sensitive lesson
      return false;
    }
  }
  return true;
}

export function toConfig(lessonData: Lesson): DialogConfig {
  const defaultData: DialogConfig = {
    lessonId: '',
    arch: '',
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
    positiveFeedback:
      lessonData.dialogCategory === 'sensitive'
        ? SENSITIVE_POSITIVE_FEEDBACK
        : POSITIVE_FEEDBACK,
    perfectFeedback:
      lessonData.dialogCategory === 'sensitive'
        ? []
        : lessonData.learningFormat === 'survey_says'
        ? PERFECT_FEEDBACK_SURVEY_STYLE
        : ['Nicely done!', 'You got it!'],
    negativeFeedback:
      lessonData.learningFormat === 'survey_says'
        ? SURVEY_STYLE_NEGATIVE_FEEDBACK
        : lessonData.dialogCategory === 'sensitive'
        ? SENSITIVE_NEGATIVE_FEEDBACK
        : FEEDBACK_NEGATIVE,
    neutralFeedback:
      lessonData.learningFormat === 'survey_says'
        ? SURVEY_STYLE_NEGATIVE_FEEDBACK
        : ['Ok.', 'So.', 'Well.', 'I see.', 'Okay.'],
    goodPointButFeedback: FEEDBACK_GOOD_POINT_BUT,
    goodPointButOutOfHintsFeedback:
      FEEDBACK_OUT_OF_HINTS_ALTERNATE_EXPECTATION_FULFILLED,
    expectationMetButOthersWrongFeedback:
      lessonData.dialogCategory === 'sensitive'
        ? SENSITIVE_SOME_WRONG_FEEDBACK
        : SOME_WRONG_FEEDBACK,
    expectationsLeftFeedback:
      lessonData.learningFormat === 'survey_says'
        ? FEEDBACK_EXPECTATIONS_LEFT
        : [],
    closingPositiveFeedback:
      lessonData.learningFormat === 'survey_says'
        ? CLOSING_POSITIVE_FEEDBACK
        : [],
    closingNegativeFeedback:
      lessonData.learningFormat === 'survey_says'
        ? CLOSING_NEGATIVE_FEEDBACK
        : [],
    expectationOnTheBoard:
      lessonData.learningFormat === 'survey_says'
        ? SURVEY_STYLE_EXPECTATION_REVEAL
        : [],
    pump: [
      // "Let's work through this together.",
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
    farewell:
      lessonData.dialogCategory === 'sensitive' ? SENSITIVE_FAREWELL : [],
    originalXml: '',
    goodThreshold: goodThreshold,
    badThreshold:
      lessonData.dialogCategory === 'sensitive'
        ? sensitiveBadThreshold
        : badThreshold,
    goodMetacognitiveThreshold: goodMetacognitiveThreshold,
    hasSummaryFeedback:
      lessonData.learningFormat === 'survey_says' &&
      lessonData.dialogCategory === 'default',
    givePumpOnMainQuestion: lessonData.dialogCategory === 'sensitive',
    usePump: lessonData.usePump !== undefined ? lessonData.usePump : true,
    limitHints: lessonData.dialogCategory === 'sensitive',
    dialogCategory: lessonData.dialogCategory,
    learningFormat: lessonData.learningFormat,
  };

  try {
    defaultData.questionIntro = lessonData.intro;
    defaultData.arch = lessonData.arch;
    if (lessonData.learningFormat === 'survey_says') {
      defaultData.questionIntro.concat(
        ' Try to list the top ${lessonData.expectations.length} expert answers.'
      );
    }
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
      expectationId: exp.expectationId,
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
