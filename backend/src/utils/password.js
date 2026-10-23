import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(scryptCallback);
export const publicUser = ({
  id,
  usuario,
  rol,
  creado
}) => ({
  id,
  usuario,
  rol,
  creado
});
export async function hashPassword(password, salt) {
  return (await scrypt(password, Buffer.from(salt, 'hex'), 64, {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024
  })).toString('hex');
}
export async function newUser(usuario, clave, rol) {
  const sal = randomBytes(16).toString('hex');
  return {
    id: randomBytes(8).toString('hex'),
    usuario,
    sal,
    hash: await hashPassword(clave, sal),
    rol,
    creado: new Date().toISOString()
  };
}
export const equal = (a, b) => {
  const x = Buffer.from(a),
    y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};
