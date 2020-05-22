import dotenv from 'dotenv';
import fs from 'fs';
import { logger } from './logging';
import path from 'path';

/**
 * Check if there is a .env.enc file,
 * and if found, try to decrypt it
 * with ENV_PASSWORD
 */
function findAndDecryptEnvEnc() {
  const nodeEnv = process.env['NODE_ENV'];
  const dotEnvEncPath = path.join(process.env['NODE_PATH'], '.env.enc');
  if (fs.existsSync(dotEnvEncPath)) {
    const envPasswordVar = `${nodeEnv}_ENV_PASSWORD`
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_');
    const envPassword =
      process.env['ENV_PASSWORD'] || process.env[envPasswordVar];
    if (!envPassword) {
      logger.error(
        `found a .env.enc file but no password in env vars ENV_PASSWORD or ${envPasswordVar}`
      );
      return;
    }
    require('dotenvenc')(envPassword);
  }
}

function findDotEnvPath(): string[] {
  return process.env['DOTENV_PATH']
    ? process.env['DOTENV_PATH'].split(',')
    : ['.env'];
}

export function configureEnv() {
  findAndDecryptEnvEnc();
  const dotEnvPath = findDotEnvPath();
  for (const p of dotEnvPath) {
    dotenv.config({ path: p });
  }
}

export default configureEnv;
