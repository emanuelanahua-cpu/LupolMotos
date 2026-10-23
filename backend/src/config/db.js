import mysql from 'mysql2/promise';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
export function createPool(env = process.env) {
  for (const key of ['DB_NAME', 'DB_USER', 'DB_PASSWORD']) {
    if (!env[key]) throw new Error(`Falta configurar ${key}`);
  }
  return mysql.createPool({
    host: env.DB_HOST || '127.0.0.1',
    port: Number(env.DB_PORT || 3306),
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    charset: 'utf8mb4', 
    timezone: 'Z',
    connectionLimit: 5,
    waitForConnections: true,
    multipleStatements: false
  });
}
export async function transaction(pool, action) {
  const c = await pool.getConnection();
  try {
    await c.beginTransaction();
    const result = await action(c);
    await c.commit();
    return result;
  } catch (error) {
    await c.rollback();
    throw error;
  } finally {
    c.release();
  }
}
export const decode = value => typeof value === 'string' ? JSON.parse(value) : value;
