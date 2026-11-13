import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { organizarImagenesMotos } from '../src/migrations/imagenes-motos.js';

test('actualiza fotos guardadas a rutas absolutas sin alterar uploads y puede repetirse', async () => {
  const media = await fs.mkdtemp(path.join(os.tmpdir(), 'lupol-imagenes-'));
  try {
    await fs.mkdir(path.join(media, 'gasolina', 'ronco-rs-200'), { recursive: true });
    await fs.mkdir(path.join(media, 'electricas', 'lupol-v10'), { recursive: true });
    const tablas = {
      motos: [{ id: 1, datos: JSON.stringify({
        imagen_principal: 'multimedia/ronco-rs-200/moto.jpg',
        imagenes: ['/multimedia/ronco-rs-200/moto.jpg', '/uploads/una.webp', 'multimedia/gasolina/ronco-rs-200/azul.webp'],
        colores: [{ img_moto: '/multimedia/ronco-rs-200/rojo.webp' }]
      }) }],
      configuracion: [
        { clave: 'carrusel', datos: JSON.stringify({ imagen: '/multimedia/lupol-v10/v10-rojo.webp' }) },
        { clave: 'colores_catalogo', datos: JSON.stringify([{ nombre: 'Rojo', img_swatch: 'multimedia/colores/rojo.png' }]) }
      ],
      repuestos: [{ id: 2, datos: JSON.stringify({ imagen: 'multimedia/categorias/2ruedas_static.png' }) }]
    };
    let escrituras = 0;
    const connection = {
      query: async sql => {
        const tabla = sql.match(/FROM (motos|configuracion|repuestos)$/)?.[1];
        return [tablas[tabla]];
      },
      execute: async (sql, [datos, id]) => {
        const tabla = sql.match(/^UPDATE (motos|configuracion|repuestos)/)?.[1];
        const key = tabla === 'configuracion' ? 'clave' : 'id';
        tablas[tabla].find(row => row[key] === id).datos = datos;
        escrituras++;
      }
    };
    await organizarImagenesMotos(connection, media);
    const moto = JSON.parse(tablas.motos[0].datos);
    assert.equal(moto.imagen_principal, '/multimedia/gasolina/ronco-rs-200/moto.jpg');
    assert.equal(moto.imagenes[0], '/multimedia/gasolina/ronco-rs-200/moto.jpg');
    assert.equal(moto.imagenes[1], '/uploads/una.webp');
    assert.equal(moto.imagenes[2], '/multimedia/gasolina/ronco-rs-200/azul.webp');
    assert.equal(moto.colores[0].img_moto, '/multimedia/gasolina/ronco-rs-200/rojo.webp');
    assert.equal(JSON.parse(tablas.configuracion[0].datos).imagen, '/multimedia/electricas/lupol-v10/v10-rojo.webp');
    assert.deepEqual(JSON.parse(tablas.configuracion[1].datos), [{ nombre: 'Rojo' }]);
    assert.equal(JSON.parse(tablas.repuestos[0].datos).imagen, '/multimedia/categorias/2ruedas_static.png');
    assert.equal(escrituras, 4);
    await organizarImagenesMotos(connection, media);
    assert.equal(escrituras, 4);
  } finally {
    await fs.rm(media, { recursive: true, force: true });
  }
});
