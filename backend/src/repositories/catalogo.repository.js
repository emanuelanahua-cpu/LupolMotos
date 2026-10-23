export function comprobarConexion(db, parametros = []) {
  return db.query('SELECT 1', parametros);
}
import { decode } from '../config/db.js';
export async function catalog(pool, table = 'motos') {
  if (!['motos', 'repuestos'].includes(table)) throw new Error('Tabla inválida');
  const [rows] = await pool.query(`SELECT id, datos FROM ${table} ORDER BY id`);
  return rows.map(r => ({
    ...decode(r.datos),
    id: r.id
  }));
}
export async function setting(pool, key, fallback = {}) {
  const [rows] = await pool.execute('SELECT datos FROM configuracion WHERE clave = ?', [key]);
  return rows.length ? decode(rows[0].datos) : fallback;
}
