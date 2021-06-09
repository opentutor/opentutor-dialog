import { Lesson } from 'apis/lessons';

export const lesson: Lesson = {
  name: 'Sensitive Dialog',
  lessonId: 'q4',
  intro: 'People considering suicide often have a plan.',
  question:
    'If a person loses the means to commit suicide, such as not having their gun, how does this affect their suicide risk?',
  expectations: [
    {
      expectation:
        'Most people do not attempt suicide again if their plan is interrupted or if they survive a suicide attempt. This means that removing guns, pills, or other ways to commit suicide are very important. However, a person with suicidal thoughts is still at-risk and they should receive professional help to decrease their risk and improve their quality of life.',
      hints: [
        {
          text: 'Compared to when they knew a clear way to commit suicide, does their long term suicide risk change?',
        },
        {
          text:
            'Are they more likely to just "find another way" or to not attempt suicide later?',
        },
        {
          text: 'Compared to before they lost their means to commit suicide (e.g., a gun), how does their risk change?',
        },
        {
          text: 'Compared to other people, how likely is this person to commit suicide?',
        },
      ],
    },
  ],
  conclusion: [
    'The person is still at risk compared to other people.',
    'Most people do not attempt suicide again if their plan is interrupted or if they survive a suicide attempt.',
    'This means that removing guns, pills, or other ways to commit suicide are very important.',
    'However, a person with suicidal thoughts is still at-risk and they should receive professional help to decrease their risk and improve their quality of life.',
  ],
};

export default lesson;
