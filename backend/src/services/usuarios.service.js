import * as repository from '../repositories/usuarios.repository.js';
import { httpError } from '../utils/errors.js';
import { newUser, publicUser } from '../utils/password.js';
export function createService(pool, env = process.env) {
  async function listar({}) {
    const [users] = await repository.listarUsuarios(pool);
    return users.map(publicUser);
  }
  async function crear({
    input,
    actor
  }) {
    const d = input;
    if (actor.rol === 'admin' && d.rol !== 'empleado') throw httpError(403, 'El administrador solo puede crear empleados');
    const u = await newUser(d.usuario, d.clave, d.rol);
    try {
      await repository.insertarUsuario(pool, [u.id, u.usuario, u.sal, u.hash, u.rol, u.creado]);
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') throw httpError(409, 'Ese usuario ya existe');
      throw e;
    }
    return publicUser(u);
  }
  async function eliminar({
    params,
    actor
  }) {
    if (params.id === actor.id) throw httpError(400, 'No puedes eliminarte a ti mismo');
    const [r] = await repository.eliminarUsuario(pool, [params.id]);
    if (!r.affectedRows) throw httpError(404, 'Usuario no encontrado');
    return {
      ok: true
    };
  }
  return {
    listar,
    crear,
    eliminar
  };
}
