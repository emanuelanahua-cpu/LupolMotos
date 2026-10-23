import { createHmac } from 'node:crypto';
import { equal } from '../utils/password.js';
import { findById } from '../repositories/usuarios.repository.js';
export function auth(pool, secret, secure) {
  if (!secret || secret.length < 32) throw new Error('LUPOL_SECRET debe tener al menos 32 caracteres');
  const sign = value => createHmac('sha256', secret).update(value).digest('hex');
  const cookieOptions = {
    httpOnly: true,
    sameSite: 'strict',
    secure,
    path: '/'
  };
  return {
    login(res, id) {
      const value = `${id}.${Math.floor(Date.now() / 1000) + 8 * 3600}`;
      res.cookie('lupol_sid', `${value}.${sign(value)}`, {
        ...cookieOptions,
        maxAge: 8 * 3600 * 1000
      });
    },
    logout(res) {
      res.clearCookie('lupol_sid', cookieOptions);
    },
    async required(req, res, next) {
      try {
        const token = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith('lupol_sid='))?.slice(10);
        const [id, exp, sig] = (token || '').split('.');
        if (!sig || !/^\d+$/.test(exp) || Number(exp) <= Date.now() / 1000 || !equal(sig, sign(`${id}.${exp}`))) {
          return res.status(401).json({
            detail: 'Sesión no iniciada'
          });
        }
        const [users] = await findById(pool, [id]);
        if (!users.length) return res.status(401).json({
          detail: 'Sesión no iniciada'
        });
        req.user = users[0];
        next();
      } catch (e) {
        next(e);
      }
    },
    roles(...allowed) {
      return (req, res, next) => allowed.includes(req.user.rol) ? next() : res.status(403).json({
        detail: 'No tienes permiso para esta acción'
      });
    }
  };
}
