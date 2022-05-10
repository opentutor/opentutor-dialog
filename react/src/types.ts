/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

/** classifier */

export interface Classifier {
  evaluate: (request: ClassifierRequest) => Promise<ClassifierResponse>;
}

export interface ClassifierRequest {
  lesson: string;
  input: string;
  config: ClassifierConfig;
  expectation?: number;
}

export interface ClassifierResponse {
  output: ClassifierResult;
}

export interface ClassifierConfig {
  question: string;
  expectations: Expectation[];
}

export interface ClassifierResult {
  expectationResults: ExpectationResult[];
  speechActs: SpeechActs;
}

/** lessons  */

export interface Lesson {
  id: string;
  lessonId: string;
  name: string;
  intro: string;
  question: string;
  expectations: LessonExpectation[];
  conclusion: string[] | string;
  dialogCategory: 'sensitive' | 'default';
  learningFormat: 'standard' | 'survey_says';
}

export interface LessonExpectation {
  expectationId: string;
  expectation: string;
  hints: Hint[];
  prompts?: LessonPrompt[];
}

export interface LessonPrompt {
  prompt: string;
  answer: string;
}

export interface Hint {
  text: string;
}

export interface Expectation {
  expectationId: string;
  ideal: string;
}

export interface ExpectationResult {
  expectationId: string;
  evaluation: Evaluation;
  score: number;
}

export enum Evaluation {
  Good = 'Good',
  Bad = 'Bad',
}

export interface SpeechActs {
  metacognitive: ExpectationResult;
  profanity: ExpectationResult;
}

/** session-data */

export interface SessionData {
  sessionId: string;
  sessionHistory: SessionHistory;
  previousUserResponse: string;
  previousSystemResponse: string[];
  dialogState: DialogState;
}

export interface SessionDto {
  sessionId: string;
  sessionHistory: string;
  previousUserResponse: string;
  previousSystemResponse: string[];
  dialogState: DialogState;
  hash: string;
}

export interface SessionHistory {
  userResponses: UserResponse[];
  classifierGrades: ClassifierResult[];
  userScores: number[];
  systemResponses: string[][];
}

export interface DialogState {
  expectationsCompleted: boolean[];
  expectationData: ExpectationData[];
  currentExpectation: number;
  hints: boolean;
  limitHintsMode: boolean;
  numCorrectStreak: number;
}

export interface UserResponse {
  text: string;
  activeExpectation: number;
}

export interface ExpectationData {
  ideal: string;
  score: number;
  numHints: number;
  numPrompts: number;
  satisfied: boolean;
  status: ExpectationStatus;
}

export enum ExpectationStatus {
  Active = 'active',
  Complete = 'complete',
  None = 'none',
}

/** response-data */

export interface OpenTutorResponse {
  author: string;
  type: ResponseType;
  data: TextData | ImageData;
}

export interface TextData {
  text: string;
}

export interface ImageData {
  url: string;
  path: string;
}

export enum ResponseType {
  Text = 'text',
  Closing = 'closing',
  Opening = 'opening',
  MainQuestion = 'mainQuestion',
  Hint = 'hint',
  Prompt = 'prompt',
  FeedbackPositive = 'feedbackPositive',
  FeedbackNegative = 'feedbackNegative',
  FeedbackNeutral = 'feedbackNeutral',
  Profanity = 'profanity',
  Encouragement = 'encouragement',
}

/**  standard */

export interface Prompt {
  prompt: string;
  answer: string;
}

export interface DialogExpectation {
  expectation: string;
  hints: string[];
  prompts: Prompt[];
}

export interface DialogConfig {
  rootExpectationId: number;
  lessonId: string;
  expectations: DialogExpectation[];
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
  learningFormat: 'standard' | 'survey_says';
}
