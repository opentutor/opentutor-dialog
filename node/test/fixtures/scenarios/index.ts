import { DialogScenario } from 'test/fixtures/types';
import fs from 'fs-extra';
import path from 'path';

export async function findAll(): Promise<DialogScenario[]> {
  const scenarioFiles = fs
    .readdirSync(__dirname)
    .filter((fname) => fname.endsWith('.ts') && fname !== 'index.ts');
  const scenarios = [];
  for (const sf of scenarioFiles) {
    scenarios.push(
      (await import(path.join(__dirname, sf))).default as DialogScenario
    );
  }
  return scenarios;
}

export default findAll;
