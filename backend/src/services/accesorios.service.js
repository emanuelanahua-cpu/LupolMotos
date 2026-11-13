import * as repository from '../repositories/accesorios.repository.js';
import { transaction, decode } from '../config/db.js';
import { httpError } from '../utils/errors.js';
import { saveImages } from './imagenes.service.js';

export function createService(pool) {
  async function guardarColores(c, colores, anteriores = {}) {
    const permitidas = new Set((anteriores.colores || []).map(color => color.img_accesorio).filter(Boolean));
    const resultado = [];
    for (const color of colores || []) {
      let imagen = color.img_accesorio || '';
      if (imagen.startsWith('data:image/')) {
        imagen = (await saveImages(c, [imagen]))[0];
      } else if (imagen && !permitidas.has(imagen)) {
        throw httpError(400, 'La foto de un color no pertenece a este accesorio');
      }
      resultado.push({ nombre: color.nombre, img_accesorio: imagen });
    }
    return resultado;
  }

  async function listar({ publico = false } = {}) {
    const [filas] = await repository.listarAccesorios(pool);
    const accesorios = filas.map(fila => ({ ...decode(fila.datos), id: fila.id }));
    return publico ? accesorios.filter(a => a.estado === 'activado') : accesorios;
  }

  async function crear({ input, actor }) {
    const accesorio = await transaction(pool, async c => {
      const colores = await guardarColores(c, input.colores);
      const datos = {
        nombre: input.nombre,
        descripcion: input.descripcion,
        colores,
        estado: 'activado',
        creado_por: actor.usuario
      };
      const [r] = await repository.insertarAccesorio(c, [JSON.stringify(datos)]);
      datos.id = r.insertId;
      await repository.guardarAccesorio(c, [JSON.stringify(datos), datos.id]);
      return datos;
    });
    return accesorio;
  }

  async function editar({ params, input, actor }) {
    const id = Number(params.id);
    const accesorio = await transaction(pool, async c => {
      const [filas] = await repository.bloquearAccesorio(c, [id]);
      if (!filas.length) throw httpError(404, 'Accesorio no encontrado');
      const anterior = decode(filas[0].datos);
      if (actor.rol === 'empleado' && anterior.creado_por !== actor.usuario) {
        throw httpError(403, 'Solo puedes editar los accesorios que tú agregaste');
      }
      const datos = {
        ...anterior,
        id,
        nombre: input.nombre,
        descripcion: input.descripcion,
        colores: await guardarColores(c, input.colores, anterior),
        editado_por: actor.usuario
      };
      await repository.guardarAccesorio(c, [JSON.stringify(datos), id]);
      return datos;
    });
    return accesorio;
  }

  async function cambiarEstado({ params }) {
    const estado = await transaction(pool, async c => {
      const [filas] = await repository.bloquearAccesorio(c, [params.id]);
      if (!filas.length) throw httpError(404, 'Accesorio no encontrado');
      const datos = decode(filas[0].datos);
      datos.estado = datos.estado === 'activado' ? 'desactivado' : 'activado';
      await repository.guardarAccesorio(c, [JSON.stringify(datos), params.id]);
      return datos.estado;
    });
    return { estado };
  }

  async function eliminar({ params }) {
    await transaction(pool, async c => {
      const [filas] = await repository.bloquearAccesorio(c, [params.id]);
      if (!filas.length) throw httpError(404, 'Accesorio no encontrado');
      await repository.eliminarAccesorio(c, [params.id]);
    });
    return { ok: true };
  }

  return { listar, crear, editar, cambiarEstado, eliminar };
}
