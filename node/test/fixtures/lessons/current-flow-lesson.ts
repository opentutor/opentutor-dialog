/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
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
      expectationId: '0',
      expectation: 'Current flows in the same direction as the arrow.',
      hints: [
        {
          text: 'Why might you allow bad behavior in a group that you normally would not allow yourself to do?',
        },
      ],
    },
  ],
  conclusion: [
    'Summing up, this diode is forward biased. Positive current flows in the same direction of the arrow, from anode to cathode.',
    "Let's try a different problem.",
  ],
  dialogCategory: 'default',
  learningFormat: 'standard',
};

export default lesson;
