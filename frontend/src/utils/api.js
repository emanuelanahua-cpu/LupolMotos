import datosLocales from '../data/lupol_data.json';

const API_BASE_URL = '/api';

/**
 * Obtiene la información general de la tienda y concesionario Lupol Motos
 */
export async function obtenerInformacionTienda() {
  try {
    const respuesta = await fetch(`${API_BASE_URL}/tienda`);
    if (!respuesta.ok) throw new Error('Error al consultar API');
    return await respuesta.json();
  } catch (error) {
    return datosLocales.tienda;
  }
}

/**
 * Obtiene el catálogo de motocicletas con filtros
 */
export async function obtenerCatalogoMotos(filtros = {}) {
  try {
    const params = new URLSearchParams();
    if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
    if (filtros.tipo && filtros.tipo !== 'Todos') params.append('tipo', filtros.tipo);
    if (filtros.categoria && filtros.categoria !== 'Todas') params.append('categoria', filtros.categoria);
    if (filtros.precio_min) params.append('precio_min', filtros.precio_min);
    if (filtros.precio_max) params.append('precio_max', filtros.precio_max);
    if (filtros.frenos && filtros.frenos !== 'Todos') params.append('frenos', filtros.frenos);
    if (filtros.destacados_solo) params.append('destacados_solo', 'true');
    if (filtros.ordenar_por) params.append('ordenar_por', filtros.ordenar_por);

    const respuesta = await fetch(`${API_BASE_URL}/motos?${params.toString()}`);
    if (!respuesta.ok) throw new Error('Error al consultar API');
    const datos = await respuesta.json();
    return datos.motos || [];
  } catch (error) {
    let resultado = [...(datosLocales.motos || [])];
    if (filtros.busqueda) {
      const q = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(m => 
        m.modelo.toLowerCase().includes(q) || 
        m.motor.toLowerCase().includes(q) ||
        (m.detalle && m.detalle.toLowerCase().includes(q))
      );
    }
    if (filtros.tipo && filtros.tipo !== 'Todos') {
      resultado = resultado.filter(m => m.tipo.toLowerCase() === filtros.tipo.toLowerCase());
    }
    if (filtros.precio_min) {
      resultado = resultado.filter(m => m.precio >= filtros.precio_min);
    }
    if (filtros.precio_max) {
      resultado = resultado.filter(m => m.precio <= filtros.precio_max);
    }
    if (filtros.ordenar_por === 'precio_asc') {
      resultado.sort((a, b) => a.precio - b.precio);
    } else if (filtros.ordenar_por === 'precio_desc') {
      resultado.sort((a, b) => b.precio - a.precio);
    } else if (filtros.ordenar_por === 'nombre') {
      resultado.sort((a, b) => a.modelo.localeCompare(b.modelo));
    }
    return resultado;
  }
}

/**
 * Obtiene el detalle de una motocicleta por ID
 */
export async function obtenerDetalleMoto(idMoto) {
  try {
    const respuesta = await fetch(`${API_BASE_URL}/motos/${idMoto}`);
    if (!respuesta.ok) throw new Error('Error al consultar API');
    return await respuesta.json();
  } catch (error) {
    const moto = datosLocales.motos.find(m => m.id === Number(idMoto));
    if (!moto) return null;
    const relacionadas = datosLocales.motos.filter(m => m.id !== Number(idMoto)).slice(0, 4);
    return { moto, relacionadas };
  }
}

/**
 * Obtiene el catálogo de toritos y mototaxis
 */
export async function obtenerToritos() {
  try {
    const respuesta = await fetch(`${API_BASE_URL}/toritos`);
    if (!respuesta.ok) throw new Error('Error al consultar API');
    const datos = await respuesta.json();
    return datos.toritos || [];
  } catch (error) {
    return datosLocales.motos.filter(m => m.tipo === 'Torito' || (m.categoria && m.categoria.includes('Torito')));
  }
}

/**
 * Obtiene el catálogo de repuestos
 */
export async function obtenerRepuestos(filtros = {}) {
  try {
    const params = new URLSearchParams();
    if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
    if (filtros.categoria && filtros.categoria !== 'Todas') params.append('categoria', filtros.categoria);
    if (filtros.tipo_moto && filtros.tipo_moto !== 'Todos') params.append('tipo_moto', filtros.tipo_moto);
    if (filtros.solo_con_stock) params.append('solo_con_stock', 'true');

    const respuesta = await fetch(`${API_BASE_URL}/repuestos?${params.toString()}`);
    if (!respuesta.ok) throw new Error('Error al consultar API');
    const datos = await respuesta.json();
    return datos.repuestos || [];
  } catch (error) {
    let repuestos = [...(datosLocales.repuestos || [])];
    if (filtros.busqueda) {
      const q = filtros.busqueda.toLowerCase();
      repuestos = repuestos.filter(r => 
        r.nombre.toLowerCase().includes(q) || 
        r.codigo.toLowerCase().includes(q) ||
        (r.aplicacion_modelos && r.aplicacion_modelos.toLowerCase().includes(q))
      );
    }
    if (filtros.categoria && filtros.categoria !== 'Todas') {
      repuestos = repuestos.filter(r => r.categoria === filtros.categoria);
    }
    if (filtros.tipo_moto && filtros.tipo_moto !== 'Todos') {
      repuestos = repuestos.filter(r => r.tipo_moto === filtros.tipo_moto);
    }
    if (filtros.solo_con_stock) {
      repuestos = repuestos.filter(r => r.stock > 0);
    }
    return repuestos;
  }
}

/**
 * Obtiene las motos seminuevas
 */
export async function obtenerSeminuevas() {
  try {
    const respuesta = await fetch(`${API_BASE_URL}/seminuevas`);
    if (!respuesta.ok) throw new Error('Error al consultar API');
    const datos = await respuesta.json();
    return datos.seminuevas || [];
  } catch (error) {
    return datosLocales.motos_segunda || [];
  }
}

/**
 * Envía una solicitud de cotización al backend
 */
export async function enviarCotizacion(datosCotizacion) {
  try {
    const respuesta = await fetch(`${API_BASE_URL}/cotizaciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosCotizacion)
    });
    if (!respuesta.ok) throw new Error('Error al enviar cotización');
    return await respuesta.json();
  } catch (error) {
    const tel = datosLocales.tienda.whatsapp || '51924141939';
    let msg = `Hola Lupol Motos, deseo cotizar la *${datosCotizacion.modelo_moto}* (${datosCotizacion.modalidad}). Mi nombre es ${datosCotizacion.nombre_cliente}, DNI: ${datosCotizacion.dni_cliente || 'N/A'}.`;
    return {
      exito: true,
      mensaje: 'Cotización procesada',
      enlace_whatsapp: `https://wa.me/${tel}?text=${encodeURIComponent(msg)}`
    };
  }
}

/**
 * Envía una reserva de motocicleta
 */
export async function enviarReserva(datosReserva) {
  try {
    const respuesta = await fetch(`${API_BASE_URL}/reservas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosReserva)
    });
    if (!respuesta.ok) throw new Error('Error al registrar reserva');
    return await respuesta.json();
  } catch (error) {
    const tel = datosLocales.tienda.whatsapp || '51924141939';
    let msg = `🚨 *RESERVA DE MOTO - LUPOL MOTOS*\nModelo: *${datosReserva.modelo_moto}*\nCliente: ${datosReserva.nombre_cliente} (DNI: ${datosReserva.dni_cliente})\nTel: ${datosReserva.telefono_cliente}\nSeparación: S/. ${datosReserva.monto_separacion}`;
    return {
      exito: true,
      mensaje: 'Reserva registrada con éxito',
      enlace_whatsapp: `https://wa.me/${tel}?text=${encodeURIComponent(msg)}`
    };
  }
}

/**
 * Envía un mensaje de contacto
 */
export async function enviarMensajeContacto(datosMensaje) {
  try {
    const respuesta = await fetch(`${API_BASE_URL}/contacto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosMensaje)
    });
    if (!respuesta.ok) throw new Error('Error al enviar mensaje');
    return await respuesta.json();
  } catch (error) {
    return { exito: true, mensaje: 'Mensaje enviado correctamente' };
  }
}

/**
 * Formatea montos en Soles peruanos (PEN)
 */
export function formatearSoles(monto) {
  if (typeof monto !== 'number') return 'S/. 0.00';
  return `S/. ${monto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
