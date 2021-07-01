/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Lesson } from 'apis/lessons';

export const lesson: Lesson = {
  name: 'Current Flow2',
  lessonId: 'q3',
  intro: 'Here is a question about integrity, a key Navy attribute.',
  question: 'What are the challenges to demonstrating integrity in a group?',
  expectations: [
    {
      expectationId: '0',
      expectation:
        'Peer pressure can cause you to allow inappropriate behavior.',
      hints: [
        {
          text: 'Why might you allow bad behavior in a group that you normally would not allow yourself to do?',
        },
      ],
      prompts: [],
    },
    {
      expectationId: '1',
      expectation:
        "If you correct someone's behavior, you may get them in trouble or it may be harder to work with them.",
      hints: [
        {
          text: 'How can it affect someone when you correct their behavior?',
        },
      ],
      prompts: [],
    },
    {
      expectationId: '2',
      expectation: 'Enforcing the rules can make you unpopular.',
      hints: [
        {
          text: "How can it affect you when you correct someone's behavior?",
        },
      ],
      prompts: [],
    },
  ],
  conclusion: [
    'Peer pressure can push you to allow and participate in inappropriate behavior.',
    "When you correct somone's behavior, you may get them in trouble or negatively impact your relationship with them.",
    'However, integrity means speaking out even when it is unpopular.',
  ],
  dialogCategory: 'default',
  dialogStyle: 'standard',
};

export default lesson;