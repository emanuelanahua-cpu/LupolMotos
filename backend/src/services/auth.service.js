import { findByName } from '../repositories/usuarios.repository.js';
import { hashPassword, equal, publicUser } from '../utils/password.js';
import { httpError } from '../utils/errors.js';
export async function login(pool, {
  usuario,
  clave
}) {
  const [users] = await findByName(pool, [usuario]);
  const user = users[0];
  const hash = await hashPassword(clave, user?.sal || '00000000000000000000000000000000');
  if (!user || !equal(hash, user.hash)) throw httpError(401, 'Usuario o contraseña incorrectos');
  return publicUser(user);
}
