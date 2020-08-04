import { Lesson } from './graphql';

export default interface AutoTutorData {
  rootExpectationId: number;
  lessonId: string;
  expectations: Expectation[];
  questionIntro: string;
  questionText: string;
  recapText: string[];
  confusionFeedback: string[];
  positiveFeedback: string[];
  negativeFeedback: string[];
  neutralFeedback: string[];
  pump: string[];
  pumpBlank: string[];
  hintStart: string[];
  promptStart: string[];
  media: object;
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

export function convertLessonDataToATData(lessonData: Lesson) {
  const defaultData: AutoTutorData = {
    lessonId: '',
    rootExpectationId: 0,
    expectations: [],
    questionIntro: '',
    questionText: '',
    recapText: [],
    confusionFeedback: [
      'Some people get confused at this point. Try typing whatever you are thinking and we will go from there.',
    ],
    positiveFeedback: ['Great'],
    negativeFeedback: ['Not really.'],
    neutralFeedback: ['OK'],
    pump: ["Let's work through this together"],
    hintStart: ['Consider this.'],
    promptStart: ['See if you can get this'],
    pumpBlank: [],
    media: {},
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

  defaultData.expectations = lessonData.expectations.map(exp => {
    return {
      expectation: exp.expectation,
      hints: exp.hints.map(h => h.text),
      prompts: exp.prompts
        ? exp.prompts.map(p => {
            return { prompt: p.prompt, answer: p.answer };
          })
        : [],
    };
  });

  return defaultData;
}
