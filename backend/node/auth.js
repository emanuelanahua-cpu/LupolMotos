import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHmac } from 'node:crypto';
import { promisify } from 'node:util';
import { z } from 'zod';
const scrypt = promisify(scryptCallback);
export const loginSchema = z.object({ usuario: z.string().trim().regex(/^[\p{L}\p{N}_.-]{3,40}$/u), clave: z.string().min(8).max(256) });
export const roles = ['superadmin', 'admin', 'empleado'];
export const publicUser = ({ id, usuario, rol, creado }) => ({ id, usuario, rol, creado });
export async function hashPassword(password, salt) {
  return (await scrypt(password, Buffer.from(salt, 'hex'), 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 })).toString('hex');
}
export async function newUser(usuario, clave, rol) {
  const sal = randomBytes(16).toString('hex');
  return { id: randomBytes(8).toString('hex'), usuario, sal, hash: await hashPassword(clave, sal), rol, creado: new Date().toISOString() };
}
export const equal = (a, b) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};
export function auth(pool, secret, secure) {
  if (!secret || secret.length < 32) throw new Error('LUPOL_SECRET debe tener al menos 32 caracteres');
  const sign = value => createHmac('sha256', secret).update(value).digest('hex');
  const cookieOptions = { httpOnly: true, sameSite: 'strict', secure, path: '/' };
  return {
    login(res, id) {
      const value = `${id}.${Math.floor(Date.now() / 1000) + 8 * 3600}`;
      res.cookie('lupol_sid', `${value}.${sign(value)}`, { ...cookieOptions, maxAge: 8 * 3600 * 1000 });
    },
    logout(res) { res.clearCookie('lupol_sid', cookieOptions); },
    async required(req, res, next) {
      try {
        const token = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith('lupol_sid='))?.slice(10);
        const [id, exp, sig] = (token || '').split('.');
        if (!sig || !/^\d+$/.test(exp) || Number(exp) <= Date.now() / 1000 || !equal(sig, sign(`${id}.${exp}`))) {
          return res.status(401).json({ detail: 'Sesión no iniciada' });
        }
        const [users] = await pool.execute('SELECT * FROM usuarios WHERE id = ?', [id]);
        if (!users.length) return res.status(401).json({ detail: 'Sesión no iniciada' });
        req.user = users[0]; next();
      } catch (e) { next(e); }
    },
    roles(...allowed) { return (req, res, next) => allowed.includes(req.user.rol) ? next() : res.status(403).json({ detail: 'No tienes permiso para esta acción' }); },
  };
}
