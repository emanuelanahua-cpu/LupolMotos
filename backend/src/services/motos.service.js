import { movimiento, tieneHistorial } from '../repositories/comercio.repository.js';
import * as repository from '../repositories/motos.repository.js';
import { catalog } from '../repositories/catalogo.repository.js';
import { transaction, decode } from '../config/db.js';
import { httpError } from '../utils/errors.js';
import { motoValues, fields, ELECTRICAS } from '../models/moto.model.js';
import { saveImages } from './imagenes.service.js';
export function createService(pool, env = process.env) {
  async function guardarColores(c, colores, anteriores = {}, fotosEntrantes = [], urlsEntrantes = []) {
    const rutasPermitidas = new Set([
      ...(anteriores.imagenes || []),
      anteriores.imagen_principal,
      ...(anteriores.colores || []).map(color => color.img_moto),
      ...urlsEntrantes
    ].filter(Boolean));
    const fotosGuardadas = new Map(fotosEntrantes.map((foto, indice) => [foto, urlsEntrantes[indice]]));
    const resultado = [];
    for (const color of colores || []) {
      let imagen = color.img_moto || '';
      if (imagen.startsWith('data:image/')) {
        if (!fotosGuardadas.has(imagen)) fotosGuardadas.set(imagen, (await saveImages(c, [imagen]))[0]);
        imagen = fotosGuardadas.get(imagen);
      } else if (imagen && !rutasPermitidas.has(imagen)) {
        throw httpError(400, 'La foto de un color no pertenece a esta moto');
      }
      resultado.push({ nombre: color.nombre, img_moto: imagen });
    }
    return resultado;
  }

  async function listar({}) {
    return await catalog(pool);
  }
  async function crear({
    input,
    actor
  }) {
    const d = input;
    const moto = await transaction(pool, async c => {
      const images = await saveImages(c, d.fotos);
      const colores = await guardarColores(c, d.colores || [], {}, d.fotos, images);
      const m = motoValues(d, {
        estado: 'activado',
        visitas: 0,
        stock_reservado: 0,
        colores,
        ficha_pdf: null,
        creado_por: actor.usuario
      });
      for (const f of fields) m[f] ??= 'Consultar';
      m.imagenes = images;
      m.imagen_principal = images[0] || colores[0]?.img_moto || `/multimedia/categorias/${ELECTRICAS.includes(d.categoria) ? 'electricas_static.png' : '2ruedas_static.png'}`;
      m.vistas_360 = {
        principal: m.imagen_principal
      };
      const [r] = await repository.insertarMoto(c, [JSON.stringify(m)]);
      m.id = r.insertId;
      await repository.guardarMoto(c, [JSON.stringify(m), m.id]);
      return m;
    });
    return moto;
  }
  async function editar({
    params,
    input,
    actor
  }) {
    const d = input,
      id = Number(params.id);
    const moto = await transaction(pool, async c => {
      const [rows] = await repository.bloquearMoto(c, [id]);
      if (!rows.length) throw httpError(404, 'Moto no encontrada');
      const old = decode(rows[0].datos);
      if (actor.rol === 'empleado' && old.creado_por !== actor.usuario) throw httpError(403, 'Solo puedes editar las motos que tú agregaste');
      if (!d.imagenes_conservar.every(p => (old.imagenes || []).includes(p))) throw httpError(400, 'Fotos a conservar no válidas');
      if (d.imagenes_conservar.length + d.fotos_nuevas.length > 10) throw httpError(400, 'Máximo 10 fotos por moto');
      const nuevas = await saveImages(c, d.fotos_nuevas);
      const images = [...d.imagenes_conservar, ...nuevas];
      const colores = d.colores === undefined ? old.colores || [] : await guardarColores(c, d.colores, old, d.fotos_nuevas, nuevas);
      if (d.stock < Number(old.stock_reservado || 0)) throw httpError(409, 'El stock no puede ser menor que las unidades reservadas');
      if (d.stock !== Number(old.stock_total || 0)) await movimiento(c,[id,null,'ajuste',d.stock-Number(old.stock_total||0),d.stock,'Edición de catálogo',actor.usuario]);
      const m = motoValues(d, old);
      m.id = id;
      m.imagenes = images;
      m.colores = colores;
      m.imagen_principal = images.includes(d.principal) ? d.principal : images.includes(old.imagen_principal) ? old.imagen_principal : images[0] || colores[0]?.img_moto || `/multimedia/categorias/${ELECTRICAS.includes(d.categoria) ? 'electricas_static.png' : '2ruedas_static.png'}`;
      if (!m.vistas_360 || Object.keys(m.vistas_360).length === 0 || 'principal' in m.vistas_360) m.vistas_360 = {
        principal: m.imagen_principal
      };
      m.editado_por = actor.usuario;
      await repository.guardarMoto(c, [JSON.stringify(m), id]);
      // No borrar archivos compartidos del catálogo al quitar una imagen de una moto.
      return m;
    });
    return moto;
  }
  async function cambiarEstado({
    params
  }) {
    const estado = await transaction(pool, async c => {
      const [rows] = await repository.bloquearMoto(c, [params.id]);
      if (!rows.length) throw httpError(404, 'Moto no encontrada');
      const m = decode(rows[0].datos);
      m.estado = m.estado === 'activado' ? 'desactivado' : 'activado';
      await repository.guardarMoto(c, [JSON.stringify(m), params.id]);
      return m.estado;
    });
    return {
      estado
    };
  }
  async function eliminar({
    params
  }) {
    await transaction(pool, async c => {
      const [rows] = await repository.bloquearMoto(c,[params.id]);
      if (!rows.length) throw httpError(404,'Moto no encontrada');
      const [historial] = await tieneHistorial(c,params.id);
      if (historial.length) throw httpError(409,'Esta moto tiene historial de pedidos o inventario. Desactívala para conservarlo.');
      await repository.eliminarMoto(c,[params.id]);
    });
    return {
      ok: true
    };
  }
  return {
    listar,
    crear,
    editar,
    cambiarEstado,
    eliminar
  };
}
