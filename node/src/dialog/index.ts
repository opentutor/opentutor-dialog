/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import SessionData, { SessionHistory } from './session-data';
import { Evaluation } from 'apis/classifier';

function calculateQuality(
  sessionHistory: SessionHistory,
  expectationIndex: number
) {
  const qualityOfUtterancesForExpecation: number[] = [];

  const baseQuality = 0.5;

  sessionHistory.userResponses.forEach((value, index) => {
    if (
      value.activeExpectation === expectationIndex ||
      value.activeExpectation === -1
    ) {
      let classifierScore =
        sessionHistory.classifierGrades[index].expectationResults[
          expectationIndex
        ].score;
      if (
        sessionHistory.classifierGrades[index].expectationResults[
          expectationIndex
        ].evaluation === Evaluation.Bad
      ) {
        classifierScore = classifierScore * -1;
      }
      qualityOfUtterancesForExpecation.push(baseQuality + classifierScore / 2);
    }
  });
  return (
    qualityOfUtterancesForExpecation.reduce((a, b) => a + b, 0) /
    qualityOfUtterancesForExpecation.length
  );
}

export function calculateScore(sdp: SessionData): number {
  const expectationScores: number[] = [];
  const c = 0.02;

  sdp.dialogState.expectationData.forEach((value, index) => {
    if (value.satisfied) {
      expectationScores.push(1 - c * value.numHints);
    } else {
      expectationScores.push(calculateQuality(sdp.sessionHistory, index));
    }
  });
  return (
    expectationScores.reduce((a, b) => a + b, 0) / expectationScores.length
  );
}
