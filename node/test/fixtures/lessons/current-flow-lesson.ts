import { Lesson } from 'apis/lessons';

export const lesson: Lesson = {
  name: 'Current Flow',
  lessonId: 'q2',
  intro:
    '_user_, this is a warm up question on the behavior of P-N junction diodes.',
  question:
    'With a DC input source, does current flow in the same or the opposite direction of the diode arrow?',
  expectations: [
    {
      expectation: 'Current flows in the same direction as the arrow.',
      hints: [
        {
          text:
            'Why might you allow bad behavior in a group that you normally would not allow yourself to do?',
        },
      ],
    },
  ],
  conclusion: [
    'Summing up, this diode is forward biased. Positive current flows in the same direction of the arrow, from anode to cathode.',
    "Let's try a different problem.",
  ],
};

export default lesson;
