import { test } from 'node:test';
import assert from 'node:assert/strict';
import { quoteSchema } from '../src/models/solicitud.model.js';
import { createService } from '../src/services/solicitudes.service.js';

test('Ahorro Motos guarda la meta y genera una consulta distinta del crédito', async () => {
  const input = {
    id_moto: 1,
    modelo_moto: 'Iron 250P',
    modalidad: 'AHORRO',
    precio_moto: 7800,
    meta_ahorro_mensual: 500,
    plazo_ahorro_estimado_meses: 16,
    nombre_cliente: 'Cliente de prueba',
    telefono_cliente: '999999999'
  };
  assert.equal(quoteSchema.safeParse({ ...input, meta_ahorro_mensual: undefined }).success, false);
  const datos = quoteSchema.parse(input);
  let guardado;
  const pool = {
    async execute(sql, params) {
      if (sql.startsWith('INSERT INTO solicitudes')) {
        guardado = JSON.parse(params[1]);
        return [{ insertId: 3 }];
      }
      return [[]];
    }
  };
  const respuesta = await createService(pool, { WHATSAPP_NUMERO: '51999999999' }).cotizar({ input: datos });
  const mensaje = new URL(respuesta.enlace_whatsapp).searchParams.get('text');
  assert.equal(guardado.modalidad, 'AHORRO');
  assert.equal(guardado.meta_ahorro_mensual, 500);
  assert.match(mensaje, /Ahorro Motos/);
  assert.match(mensaje, /S\/\. 500\.00/);
  assert.match(mensaje, /16 meses/);
  assert.doesNotMatch(mensaje, /CRÉDITO|CONTADO/);
});
