import { Lesson } from 'apis/lessons';

export const lesson: Lesson = {
  name: 'Suicide Prevention Bystander',
  lessonId: 'q5',
  intro: 'People considering suicide often have a plan.',
  question:
    'If a person loses the means to commit suicide, such as not having their gun, how does this affect their suicide risk?',
  expectations: [
    {
      expectation:
        'They will be much less likely to commit suicide and will probably not attempt suicide later.',
      hints: [
        {
          text:
            'Compared to when they knew a clear way to commit suicide, does their long term suicide risk change?',
        },
        {
          text:
            'Are they more likely to just "find another way" or to not attempt suicide later?',
        },
        {
          text:
            'Compared to before they lost their means to commit suicide (e.g., a gun), how does their risk change?',
        },
      ],
    },
    {
      expectation: 'The person is still at risk compared to other people.',
      hints: [
        {
          text:
            'Compared to other people, how likely is this person to commit suicide?',
        },
        {
          text:
            'After removing the means for suicide, how likely are they to commit suicide versus other people?',
        },
      ],
    },
  ],
  conclusion: [
    'Most people do not attempt suicide again if their plan is interrupted or if they survive a suicide attempt. This means that removing guns, pills, or other ways to commit suicide are very important.',
    'However, a person with suicidal thoughts is still at-risk and they should receive professional help to decrease their risk and improve their quality of life.',
  ],
  lessonType: 'sensitive',
};

export default lesson;
