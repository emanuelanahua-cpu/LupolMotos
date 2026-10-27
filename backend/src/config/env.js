import dotenv from 'dotenv';
import path from 'node:path';
import { root } from './db.js';
export function loadEnvironment() {
  dotenv.config({
    path: path.join(root, process.env.LUPOL_ENV_FILE || '.env'),
    quiet: false
  });
  return process.env;
}
