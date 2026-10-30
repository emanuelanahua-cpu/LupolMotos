import test from 'node:test';
import assert from 'node:assert/strict';
import { completarFichasProximas } from '../src/migrations/fichas-proximas.js';

test('completa las fichas confirmadas y vincula solo las fotos originales', async () => {
  const motos = [
    { id: 115, datos: JSON.stringify({ marca: 'Ronco', modelo: 'ADV GS', motor: '300', potencia: 'Consultar', suspension: 'Consultar', neumaticos: 'Consultar', detalle: '' }) },
    { id: 116, datos: JSON.stringify({ marca: 'Ronco', modelo: 'Explorer V1', motor: '200', potencia: 'Consultar', suspension: 'Consultar', neumaticos: 'Consultar', enfriamiento: 'Arire' }) },
    { id: 117, datos: JSON.stringify({ marca: 'Otra', modelo: 'ADV GS', potencia: 'Consultar' }) }
  ];
  const carrusel = { slides: [
    { id: '2053c3fe-16bf-41b8-8d21-d3efe66f93a7', imagen: '/uploads/346a1ca1deeec2f47a464070fa345842.webp', activo: true },
    { id: '7eaca18e-b774-4a67-9849-7cb50f0dcc27', imagen: '/uploads/a5e5a796b2403a3c8565ab088a05170d.webp', activo: true },
    { id: '2053c3fe-16bf-41b8-8d21-d3efe66f93a7', imagen: '/uploads/otra.webp', activo: true }
  ] };
  const config = { datos: JSON.stringify(carrusel) };
  const c = {
    query: async () => [motos],
    execute: async (sql, args) => {
      if (sql.startsWith('SELECT')) return [[config]];
      if (sql.startsWith('UPDATE motos')) motos.find(m => m.id === args[1]).datos = args[0];
      if (sql.startsWith('UPDATE configuracion')) config.datos = args[0];
      return [[]];
    }
  };

  await completarFichasProximas(c);
  const gs = JSON.parse(motos[0].datos);
  const explorer = JSON.parse(motos[1].datos);
  const actualizado = JSON.parse(config.datos).slides;
  assert.equal(gs.potencia, '22 HP a 7000 rpm');
  assert.equal(explorer.potencia, '16 HP a 8000 rpm');
  assert.equal(explorer.enfriamiento, 'Consultar');
  assert.equal(gs.suspension, 'Telescópica invertida / Monoshock');
  assert.equal(JSON.parse(motos[2].datos).potencia, 'Consultar');
  assert.equal(actualizado[0].moto_id, 115);
  assert.equal(actualizado[1].moto_id, 116);
  assert.equal(actualizado[2].moto_id, undefined);
});
