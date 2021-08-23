/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

export interface Prompt {
  prompt: string;
  answer: string;
}

export interface Expectation {
  expectation: string;
  hints: string[];
  prompts: Prompt[];
}

export interface DialogConfig {
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
  expectationMetButOthersWrongFeedback: string[];
  perfectFeedback: string[];
  expectationsLeftFeedback: string[];
  closingPositiveFeedback: string[];
  closingNegativeFeedback: string[];
  expectationOnTheBoard: string[];
  pump: string[];
  pumpBlank: string[];
  hintStart: string[];
  promptStart: string[];
  profanityFeedback: string[];
  farewell: string[];
  originalXml: string;
  goodThreshold: number;
  badThreshold: number;
  goodMetacognitiveThreshold: number;
  hasSummaryFeedback: boolean;
  givePumpOnMainQuestion: boolean;
  limitHints: boolean;
  dialogCategory: 'default' | 'sensitive';
  dialogStyle: 'standard' | 'survey_says';
}

export default DialogConfig;
