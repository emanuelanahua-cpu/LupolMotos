import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createService as createCommerceService } from '../src/services/comercio.service.js';
import { createService as createRequestsService } from '../src/services/solicitudes.service.js';
import { listarPedidos } from '../src/repositories/comercio.repository.js';
import { listarSolicitudes } from '../src/repositories/solicitudes.repository.js';

function orderPool(estado) {
  const writes = [];
  const connection = {
    beginTransaction: async () => {},
    commit: async () => {},
    rollback: async () => {},
    release: () => {},
    execute: async (sql) => {
      if (sql.startsWith('SELECT * FROM pedidos')) return [[{ id: 7, estado }]];
      writes.push(sql);
      return [{ affectedRows: 1 }];
    }
  };
  return { writes, getConnection: async () => connection };
}

test('un pedido confirmado no se oculta mientras reserva stock', async () => {
  const pool = orderPool('confirmado');
  await assert.rejects(createCommerceService(pool).eliminarPedido(7), {
    status: 409,
    message: 'Cancela primero este pedido para liberar el stock reservado.'
  });
  assert.deepEqual(pool.writes, []);
});

test('un pedido pagado se quita del panel sin borrar su venta', async () => {
  const pool = orderPool('pagado');
  assert.deepEqual(await createCommerceService(pool).eliminarPedido(7), { ok: true });
  assert.equal(pool.writes.length, 1);
  assert.match(pool.writes[0], /^UPDATE pedidos SET oculto_en=/);
});

test('solicitudes se ocultan y los listados excluyen registros ocultos', async () => {
  const statements = [];
  const pool = {
    execute: async (sql) => {
      statements.push(sql);
      return [{ affectedRows: 1 }];
    },
    query: async (sql) => {
      statements.push(sql);
      return [[]];
    }
  };
  assert.deepEqual(await createRequestsService(pool).eliminar({ params: { id: '11' } }), { ok: true });
  await listarPedidos(pool);
  await listarSolicitudes(pool, null, [Number.MAX_SAFE_INTEGER, 50]);
  assert.match(statements[0], /^UPDATE solicitudes SET oculto_en=/);
  assert.ok(statements.slice(1).every(sql => sql.includes('oculto_en IS NULL')));
});
