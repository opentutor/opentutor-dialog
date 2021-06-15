import { DialogHandler } from './types';
import { StandardDialogHandler } from './standard';
import { Lesson } from 'apis/lessons';

export async function handlerFor(lesson: Lesson): Promise<DialogHandler> {
  return new StandardDialogHandler(lesson);
}
