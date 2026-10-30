import { migrateCommerce } from './comercio.js';
import { completarFichasProximas } from './fichas-proximas.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { root } from '../config/db.js';
export async function initialize(pool, initialUsers = []) {
  // JSON se guarda como LONGTEXT para compatibilidad tanto con MySQL como MariaDB.
  const schema = [`CREATE TABLE IF NOT EXISTS configuracion (clave VARCHAR(80) PRIMARY KEY, datos LONGTEXT NOT NULL)`, `CREATE TABLE IF NOT EXISTS motos (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, datos LONGTEXT NOT NULL)`, `CREATE TABLE IF NOT EXISTS repuestos (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, datos LONGTEXT NOT NULL)`, `CREATE TABLE IF NOT EXISTS usuarios (id VARCHAR(32) PRIMARY KEY, usuario VARCHAR(40) NOT NULL UNIQUE,
      sal VARCHAR(32) NOT NULL, hash VARCHAR(128) NOT NULL, rol VARCHAR(20) NOT NULL, creado VARCHAR(30) NOT NULL)`, `CREATE TABLE IF NOT EXISTS solicitudes (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      tipo VARCHAR(20) NOT NULL, datos LONGTEXT NOT NULL, creado TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX solicitudes_tipo (tipo, id))`, `CREATE TABLE IF NOT EXISTS imagenes (id VARCHAR(64) PRIMARY KEY, mime VARCHAR(30) NOT NULL,
      contenido MEDIUMBLOB NOT NULL, creado TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`];
  for (const sql of schema) await pool.query(sql);
  await migrateCommerce(pool);
  // Un candado de MySQL impide que dos procesos importen el catálogo a la vez.
  const c = await pool.getConnection();
  try {
    const [[lock]] = await c.query("SELECT GET_LOCK(CONCAT(DATABASE(), ':init'), 30) AS adquirido");
    if (Number(lock.adquirido) !== 1) throw new Error('No se pudo bloquear la inicialización');
    await c.beginTransaction();
    const [done] = await c.execute('SELECT clave FROM configuracion WHERE clave = ?', ['seed_v1']);
    if (!done.length) {
      const seedPath = process.env.LUPOL_SEED_FILE || path.join(root, 'backend/data/lupol_data.json');
      const seed = JSON.parse((await fs.readFile(seedPath, 'utf8')).replace(/^\uFEFF/, ''));
      for (const [key, value] of Object.entries(seed)) {
        if (['motos', 'repuestos'].includes(key)) {
          for (const item of value) await c.execute(`INSERT INTO ${key} (id, datos) VALUES (?, ?)`, [item.id, JSON.stringify(item)]);
        } else await c.execute('INSERT INTO configuracion (clave, datos) VALUES (?, ?)', [key, JSON.stringify(value)]);
      }
      await c.execute('INSERT INTO configuracion (clave, datos) VALUES (?, ?)', ['seed_v1', 'true']);
    }
    await completarFichasProximas(c);
    const [[count]] = await c.query('SELECT COUNT(*) AS n FROM usuarios');
    if (!Number(count.n)) {
      for (const u of initialUsers) {
        await c.execute('INSERT INTO usuarios (id, usuario, sal, hash, rol, creado) VALUES (?, ?, ?, ?, ?, ?)', [u.id, u.usuario, u.sal, u.hash, u.rol, u.creado]);
      }
    }
    await c.commit();
  } catch (e) {
    await c.rollback();
    throw e;
  } finally {
    await c.query("SELECT RELEASE_LOCK(CONCAT(DATABASE(), ':init'))");
    c.release();
  }
}
