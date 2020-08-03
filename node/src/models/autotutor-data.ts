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
      prompts: [],
    };
  });

  return defaultData;
}

// export const navyIntegrity: AutoTutorData = {
//   rootExpectationId: 0,
//   lessonId: 'q1',
//   expectations:

//   questionIntro: ,
//   questionText:

//   recapText:
//   confusionFeedback: [
//     'Some people get confused at this point. Try typing whatever you are thinking and we will go from there.',
//   ],
//   positiveFeedback: ['Great'],
//   negativeFeedback: ['Not really.'],
//   neutralFeedback: ['OK'],
//   pump: ["Let's work through this together"],
//   hintStart: ['Consider this.'],
//   promptStart: ['See if you can get this'],
//   pumpBlank: [],
//   media: {},
//   originalXml: '',
// };

// export const currentFlow: AutoTutorData = {
//   rootExpectationId: 0,
//   lessonId: 'q2',
//   expectations: [
//     {
//       expectation: 'Current flows in the same direction as the arrow.',
//       hints: [
//         'Why might you allow bad behavior in a group that you normally would not allow yourself to do?',
//       ],
//       prompts: [
//         {
//           prompt: 'What might cause you to lower your standards?',
//           answer: 'peer pressure',
//         },
//       ],
//     },
//   ],
//   questionIntro:
//     '_user_, this is a warm up question on the behavior of P-N junction diodes.',
//   questionText:
//     'With a DC input source, does current flow in the same or the opposite direction of the diode arrow?',
//   recapText: [
//     'Summing up, this diode is forward biased. Positive current flows in the same direction of the arrow, from anode to cathode.',
//     "Let's try a different problem.",
//   ],
//   confusionFeedback: [
//     'Some people get confused at this point. Try typing whatever you are thinking and we will go from there.',
//   ],
//   positiveFeedback: ['Great'],
//   negativeFeedback: ['Not really.'],
//   neutralFeedback: ['OK'],
//   pump: ["Let's work through this together"],
//   hintStart: ['Consider this.'],
//   promptStart: ['See if you can get this'],
//   pumpBlank: [],
//   media: {},
//   originalXml: '',
// };
