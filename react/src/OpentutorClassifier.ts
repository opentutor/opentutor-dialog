/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  Classifier,
  ClassifierRequest,
  ClassifierResponse,
  Evaluation,
  Lesson,
} from './types';
import {
  evaluate as classifierEvaluate,
  evaluate_default as defaultClassifierEvaluate,
} from './classifier';

export class OpentutorClassifier implements Classifier {
  w2v: any;
  features: any;

  constructor(w2v: any, features: any) {
    this.w2v = w2v;
    this.features = features;
  }

  async evaluate(props: ClassifierRequest): Promise<ClassifierResponse> {
    const expectationResults = classifierEvaluate(
      props,
      this.w2v,
      this.features
    );
    return {
      output: {
        expectationResults,
        speechActs: {
          metacognitive: {
            expectationId: '',
            evaluation: Evaluation.Bad,
            score: 0,
          },
          profanity: {
            expectationId: '',
            evaluation: Evaluation.Bad,
            score: 0,
          },
        },
      },
    };
  }
}

export class OpentutorDefaultClassifier implements Classifier {
  w2v: any;
  features: any;
  ideal: string = '';

  constructor(w2v: any, features: any, lesson: Lesson) {
    this.w2v = w2v;
    this.features = features;
    this.ideal = lesson.expectations.map((e) => e.expectation).join(' ');
  }

  async evaluate(props: ClassifierRequest): Promise<ClassifierResponse> {
    const expectationResults = defaultClassifierEvaluate(
      props,
      this.w2v,
      this.features,
      this.ideal
    );
    return {
      output: {
        expectationResults,
        speechActs: {
          metacognitive: {
            expectationId: '',
            evaluation: Evaluation.Bad,
            score: 0,
          },
          profanity: {
            expectationId: '',
            evaluation: Evaluation.Bad,
            score: 0,
          },
        },
      },
    };
  }
}
