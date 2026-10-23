import { loadEnvironment } from './config/env.js';
import path from 'node:path';
import fs from 'node:fs/promises';
import { createPool, root } from './config/db.js';
import { initialize } from './migrations/initialize.js';
import { countSuperadmins } from './repositories/usuarios.repository.js';
import { newUser } from './utils/password.js';
import { loginSchema } from './models/usuario.model.js';
import { createApp } from './app.js';
loadEnvironment();
async function main() {
  const pool = createPool();
  try {
    let users = [];
    if (process.env.LUPOL_INITIAL_USERS) users = JSON.parse(Buffer.from(process.env.LUPOL_INITIAL_USERS, 'base64').toString());else {
      try {
        users = JSON.parse(await fs.readFile(path.join(root, 'backend/data/usuarios.json'), 'utf8'));
      } catch (e) {
        if (e.code !== 'ENOENT') throw e;
      }
    }
    if (!users.some(u => u.rol === 'superadmin') && process.env.LUPOL_SUPER_USER && process.env.LUPOL_SUPER_PASS) {
      const d = loginSchema.parse({
        usuario: process.env.LUPOL_SUPER_USER,
        clave: process.env.LUPOL_SUPER_PASS
      });
      users.push(await newUser(d.usuario, d.clave, 'superadmin'));
    }
    if (!process.env.LUPOL_SECRET || process.env.LUPOL_SECRET.length < 32) throw new Error('Configura LUPOL_SECRET con al menos 32 caracteres');
    await initialize(pool, users);
    const [[existing]] = await countSuperadmins(pool);
    if (!Number(existing.n)) throw new Error('Configura LUPOL_SUPER_USER y LUPOL_SUPER_PASS para crear la cuenta inicial');
    const app = createApp(pool);
    const server = app.listen(Number(process.env.PORT || 8000), process.env.HOST || '0.0.0.0', () => console.log('Lupol Motos: API y MySQL en línea'));
    for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
      server.close(async () => {
        await pool.end();
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10000).unref();
    });
  } catch (e) {
    console.error('No se pudo iniciar el backend:', e.code || e.message);
    await pool.end();
    process.exitCode = 1;
  }
}
main().catch(error => {
  console.error("Error al iniciar:", error.code || error.message);
  process.exitCode = 1;
});
