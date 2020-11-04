/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
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

export function configureEnv(): void {
  findAndDecryptEnvEnc();
  const dotEnvPath = findDotEnvPath();
  for (const p of dotEnvPath) {
    dotenv.config({ path: p });
  }
}

export default configureEnv;
