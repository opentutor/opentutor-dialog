/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Lesson } from 'apis/lessons';
import fs from 'fs-extra';
import path from 'path';

export async function findAll(): Promise<Lesson[]> {
  const lessonFiles = fs
    .readdirSync(__dirname)
    .filter((fname) => fname.endsWith('.ts') && fname !== 'index.ts');
  const lessons = [];
  for (const lf of lessonFiles) {
    lessons.push((await import(path.join(__dirname, lf))).default as Lesson);
  }
  return lessons;
}

export default findAll;
