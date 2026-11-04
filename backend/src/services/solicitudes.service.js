import * as repository from '../repositories/solicitudes.repository.js';
import { setting } from '../repositories/catalogo.repository.js';
import { decode } from '../config/db.js';
import { httpError } from '../utils/errors.js';
export function createService(pool, env = process.env) {
  async function recordRequest(type, data) {
    const [r] = await repository.insertarSolicitud(pool, [type, JSON.stringify(data)]);
    const tienda = await setting(pool, 'tienda');
    return {
      id: r.insertId,
      phone: env.WHATSAPP_NUMERO || tienda.whatsapp || '51980687475'
    };
  }
  async function cotizar({
    input
  }) {
    const d = input,
      r = await recordRequest('cotizacion', d);
    const detalle = d.modalidad === 'CREDITO'
      ? `Quiero cotizar a CRÉDITO. Inicial: S/. ${d.cuota_inicial.toFixed(2)}, ${d.numero_cuotas} cuotas estimadas de S/. ${d.cuota_mensual_estimada.toFixed(2)}.`
      : d.modalidad === 'AHORRO'
        ? `Quiero información sobre Ahorro Motos. Mi meta de ahorro mensual es S/. ${d.meta_ahorro_mensual.toFixed(2)} y el plazo referencial es ${d.plazo_ahorro_estimado_meses} meses. Solicito conocer las condiciones con un asesor.`
        : 'Quiero cotizar al CONTADO.';
    const msg = `Hola Lupol Motos, me interesa la *${d.modelo_moto}* (Color: ${d.color_seleccionado || 'Estándar'}). Precio de referencia: S/. ${d.precio_moto.toFixed(2)}. ${detalle} Mi nombre es ${d.nombre_cliente} (Cel: ${d.telefono_cliente}).`;
    return {
      exito: true,
      mensaje: d.modalidad === 'AHORRO' ? 'Consulta de Ahorro Motos guardada. Continúa la conversación en WhatsApp.' : 'Cotización guardada correctamente',
      id_cotizacion: r.id,
      enlace_whatsapp: `https://wa.me/${r.phone}?text=${encodeURIComponent(msg)}`
    };
  }
  async function reservar({
    input
  }) {
    const d = input,
      r = await recordRequest('reserva', d);
    const msg = `🚨 *SOLICITUD DE RESERVA LUPOL MOTOS*\nModelo: *${d.modelo_moto}*\nColor: ${d.color_seleccionado || 'A coordinar'}\nCliente: ${d.nombre_cliente} (DNI: ${d.dni_cliente})\nTeléfono: ${d.telefono_cliente}\nSeparación propuesta: S/. ${d.monto_separacion.toFixed(2)}\nEntrega: ${d.direccion_entrega}`;
    return {
      exito: true,
      mensaje: 'Solicitud de reserva guardada. Un asesor confirmará la disponibilidad y el pago.',
      id_reserva: r.id,
      enlace_whatsapp: `https://wa.me/${r.phone}?text=${encodeURIComponent(msg)}`
    };
  }
  async function contactar({
    input
  }) {
    const r = await recordRequest('contacto', input);
    return {
      exito: true,
      mensaje: 'Mensaje recibido correctamente',
      id: r.id
    };
  }
  async function listar({
    query
  }) {
    const tipo = query.tipo;
    if (tipo && !['cotizacion', 'reserva', 'contacto'].includes(tipo)) throw httpError(400, 'Tipo inválido');
    const limit = Math.min(Math.max(Number(query.limit) || 50, 1), 200);
    const before = Number(query.antes_de) || Number.MAX_SAFE_INTEGER;
    const [rows] = await repository.listarSolicitudes(pool, tipo, tipo ? [before, tipo, limit] : [before, limit]);
    return rows.map(r => ({
      ...r,
      datos: decode(r.datos)
    }));
  }
  async function eliminar({ params }) {
    const id = Number(params.id);
    if (!Number.isSafeInteger(id) || id < 1) throw httpError(400, 'ID inválido');
    const [result] = await repository.ocultarSolicitud(pool, id);
    if (!result.affectedRows) throw httpError(404, 'Solicitud no encontrada');
    return { ok: true };
  }
  return {
    cotizar,
    reservar,
    contactar,
    listar,
    eliminar
  };
}
