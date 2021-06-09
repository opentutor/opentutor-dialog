import { Lesson } from 'apis/lessons';
import fs from 'fs-extra';
import path from 'path';

export async function findAll(): Promise<Lesson[]> {
  const lessonFiles = fs
    .readdirSync(__dirname)
    .filter((fname) => fname.endsWith('.ts') && fname !== 'index.ts');
  const lessons = [];
  for (const lf of lessonFiles) {
    lessons.push(
      (await import(path.join(__dirname, lf))).default as Lesson
    );
  }
  return lessons;
}

export default findAll;
