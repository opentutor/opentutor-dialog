import { Lesson } from 'apis/lessons';
import fs from 'fs-extra';
import path from 'path';

export async function findAll(): Promise<Record<string, Lesson>> {
  const lessonFiles = fs
    .readdirSync(__dirname)
    .filter((fname) => fname.endsWith('.ts') && fname !== 'index.ts');
  const lessonsDict: Record<string, Lesson> = {};
  for (const lf of lessonFiles) {
    let lesson = (await import(path.join(__dirname, lf))).default as Lesson;
    let lessonName = lesson.name;
    lessonsDict[lessonName] = lesson;
  }
  return lessonsDict;
}

export default findAll;
