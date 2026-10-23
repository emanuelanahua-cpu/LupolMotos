import dotenv from 'dotenv';
import path from 'node:path';
import { root } from './db.js';
export function loadEnvironment() {
  dotenv.config({
    path: path.join(root, '.env'),
    quiet: true
  });
  return process.env;
}
