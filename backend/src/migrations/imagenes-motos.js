import fs from 'node:fs/promises';
import path from 'node:path';
import { root } from '../config/db.js';

const grupos = ['gasolina', 'electricas'];

function actualizarRutas(valor, carpetas) {
  if (typeof valor === 'string') {
    const rutaMultimedia = valor.match(/^\/?multimedia\/([^/]+)\//);
    if (!rutaMultimedia) return valor;
    const carpeta = rutaMultimedia[1];
    const grupo = carpetas.get(carpeta);
    if (grupo) return valor.replace(/^\/?multimedia\/[^/]+\//, `/multimedia/${grupo}/${carpeta}/`);
    return valor.startsWith('/') ? valor : `/${valor}`;
  }
  if (Array.isArray(valor)) return valor.map(item => actualizarRutas(item, carpetas));
  if (valor && typeof valor === 'object') {
    return Object.fromEntries(Object.entries(valor).map(([clave, dato]) => [clave, actualizarRutas(dato, carpetas)]));
  }
  return valor;
}

export async function organizarImagenesMotos(c, mediaRoot = path.join(root, 'frontend/public/multimedia')) {
  const carpetas = new Map();
  for (const grupo of grupos) {
    const entradas = await fs.readdir(path.join(mediaRoot, grupo), { withFileTypes: true });
    for (const entrada of entradas) {
      if (!entrada.isDirectory()) continue;
      if (carpetas.has(entrada.name)) throw new Error(`Carpeta de moto repetida: ${entrada.name}`);
      carpetas.set(entrada.name, grupo);
    }
  }
  for (const [tabla, clave] of [['motos', 'id'], ['configuracion', 'clave'], ['repuestos', 'id']]) {
    const [filas] = await c.query(`SELECT ${clave}, datos FROM ${tabla}`);
    for (const fila of filas) {
      const actual = JSON.parse(fila.datos);
      const organizado = actualizarRutas(actual, carpetas);
      if (tabla === 'configuracion' && fila.clave === 'colores_catalogo' && Array.isArray(organizado)) {
        for (const color of organizado) {
          if (typeof color.img_swatch !== 'string' || !/^\/multimedia\/colores\/[^/]+$/.test(color.img_swatch)) continue;
          try {
            await fs.access(path.join(mediaRoot, color.img_swatch.slice('/multimedia/'.length)));
          } catch (error) {
            if (error.code !== 'ENOENT') throw error;
            delete color.img_swatch;
          }
        }
      }
      const datos = JSON.stringify(organizado);
      if (datos !== JSON.stringify(actual)) {
        await c.execute(`UPDATE ${tabla} SET datos = ? WHERE ${clave} = ?`, [datos, fila[clave]]);
      }
    }
  }
}
