import { test } from 'node:test';
import assert from 'node:assert/strict';
import { motoSchema } from '../src/models/moto.model.js';
import { createService as motosService } from '../src/services/motos.service.js';
import { carruselSchema } from '../src/models/carrusel.model.js';
import { createService as carruselService } from '../src/services/carrusel.service.js';

const imagen = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZxkAAAAASUVORK5CYII=';

function baseFalsa() {
  let moto = null;
  let carrusel = null;
  const conexion = {
    beginTransaction: async () => {},
    commit: async () => {},
    rollback: async () => {},
    release: () => {},
    execute: async (sql, params) => {
      if (sql.startsWith('INSERT INTO imagenes')) return [{}];
      if (sql.startsWith('INSERT INTO motos')) return [{ insertId: 42 }];
      if (sql.startsWith('SELECT datos FROM motos')) return [[{ datos: JSON.stringify(moto) }]];
      if (sql.startsWith('UPDATE motos')) { moto = JSON.parse(params[0]); return [{}]; }
      if (sql.startsWith('SELECT datos FROM configuracion')) return [carrusel ? [{ datos: JSON.stringify(carrusel) }] : []];
      if (sql.startsWith('INSERT INTO configuracion')) { carrusel = JSON.parse(params[1]); return [{}]; }
      throw new Error(`Consulta no simulada: ${sql}`);
    }
  };
  return { getConnection: async () => conexion, execute: (...args) => conexion.execute(...args) };
}

test('una moto nueva guarda fotos independientes para sus botones de color', async () => {
  const service = motosService(baseFalsa());
  const input = motoSchema.parse({
    categoria: 'Racing / Sport', marca: 'Prueba', modelo: '400', precio: 10000, stock: 1,
    colores: [{ nombre: 'Rojo', img_moto: imagen }, { nombre: 'Negro', img_moto: imagen }]
  });
  const moto = await service.crear({ input, actor: { usuario: 'admin' } });
  assert.equal(moto.colores.length, 2);
  assert.match(moto.colores[0].img_moto, /^\/uploads\//);
  assert.equal(moto.colores[0].img_moto, moto.colores[1].img_moto);
  assert.equal(moto.imagen_principal, moto.colores[0].img_moto);
});

test('editar colores conserva sus fotos y rechaza rutas ajenas', async () => {
  const service = motosService(baseFalsa());
  const base = { categoria: 'Racing / Sport', marca: 'Prueba', modelo: '400', precio: 10000, stock: 1 };
  const creada = await service.crear({
    input: motoSchema.parse({ ...base, colores: [{ nombre: 'Rojo', img_moto: imagen }] }),
    actor: { usuario: 'admin' }
  });
  const actor = { usuario: 'admin', rol: 'admin' };
  const editada = await service.editar({
    params: { id: creada.id },
    input: motoSchema.parse({ ...base, colores: [{ nombre: 'Rojo / Negro', img_moto: creada.colores[0].img_moto }] }),
    actor
  });
  assert.equal(editada.colores[0].nombre, 'Rojo / Negro');
  assert.equal(editada.colores[0].img_moto, creada.colores[0].img_moto);
  await assert.rejects(service.editar({
    params: { id: creada.id },
    input: motoSchema.parse({ ...base, colores: [{ nombre: 'Azul', img_moto: '/uploads/ajena.png' }] }),
    actor
  }), /no pertenece a esta moto/);
});

test('un color puede usar una foto que ya estaba en la galería de la moto', async () => {
  const service = motosService(baseFalsa());
  const base = { categoria: 'Racing / Sport', marca: 'Prueba', modelo: '400', precio: 10000, stock: 1 };
  const creada = await service.crear({ input: motoSchema.parse({ ...base, fotos: [imagen] }), actor: { usuario: 'admin' } });
  const editada = await service.editar({
    params: { id: creada.id },
    input: motoSchema.parse({
      ...base,
      imagenes_conservar: creada.imagenes,
      principal: creada.imagen_principal,
      colores: [{ nombre: 'Rojo', img_moto: creada.imagenes[0] }]
    }),
    actor: { usuario: 'admin', rol: 'admin' }
  });
  assert.equal(editada.colores[0].img_moto, creada.imagenes[0]);
});

test('el carrusel conserva fotos, orden y visibilidad', async () => {
  const service = carruselService(baseFalsa());
  const first = carruselSchema.parse({ slides: [
    { id: 'uno', imagen, activo: true }
  ] });
  const saved = await service.guardar({ input: first });
  assert.match(saved.slides[0].imagen, /^\/uploads\//);
  assert.deepEqual(Object.keys(saved.slides[0]).sort(), ['activo', 'id', 'imagen']);
  assert.equal((await service.listarPublico()).slides.length, 1);
  await service.guardar({ input: carruselSchema.parse({ slides: [{ ...saved.slides[0], activo: false }] }) });
  assert.equal((await service.listarPublico()).slides.length, 0);
});
