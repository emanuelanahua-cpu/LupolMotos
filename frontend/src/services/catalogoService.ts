import type {Moto, Repuesto, FiltrosCatalogo, FiltrosRepuestos} from '../types';
import datosLocales from '../data/lupol_data.json';

import {apiFetch} from './api';
const API_BASE_URL = '/api';

// La API puede conservar rutas anteriores al traslado de fotos a gasolina/electricas.
const grupoPorCarpeta = new Map<string, string>();
for (const moto of datosLocales.motos) {
  const ruta = moto.imagen_principal.match(/^\/multimedia\/(gasolina|electricas)\/([^/]+)\//);
  if (ruta) grupoPorCarpeta.set(ruta[2], ruta[1]);
}

function rutaImagen(ruta: string): string {
  if (!ruta) return ruta;
  const antigua = ruta.match(/^\/?multimedia\/([^/]+)\/(.+)$/);
  if (!antigua) return ruta;
  const [, carpeta, archivo] = antigua;
  const grupo = grupoPorCarpeta.get(carpeta);
  return grupo ? `/multimedia/${grupo}/${carpeta}/${archivo}` : `/${ruta.replace(/^\//, '')}`;
}

function normalizarImagenesMoto(moto: Moto): Moto {
  return {
    ...moto,
    imagen_principal: rutaImagen(moto.imagen_principal),
    imagenes: (moto.imagenes || []).map(rutaImagen),
    colores: moto.colores?.map(color => ({ ...color, img_moto: rutaImagen(color.img_moto) })),
    vistas_360: moto.vistas_360 && Object.fromEntries(
      Object.entries(moto.vistas_360).map(([vista, ruta]) => [vista, rutaImagen(ruta)])
    ),
  };
}

/**
 * Obtiene la información general de la tienda y concesionario Lupol Motos
 */
export async function obtenerInformacionTienda() {
  try {
    const respuesta = await apiFetch(`${API_BASE_URL}/tienda`);
    if (!respuesta.ok) throw new Error('Error al consultar API');
    return await respuesta.json();
  } catch (error) {
    return datosLocales.tienda;
  }
}

export async function obtenerCarruselProximas() {
  try {
    const respuesta = await apiFetch(`${API_BASE_URL}/carrusel-proximas`);
    if (!respuesta.ok) throw new Error('Error al consultar el carrusel');
    const datos = await respuesta.json();
    return Array.isArray(datos.slides) ? datos.slides : [];
  } catch {
    return [];
  }
}

/**
 * Obtiene el catálogo de motocicletas con filtros
 */
export async function obtenerCatalogoMotos(filtros: FiltrosCatalogo = {}): Promise<Moto[]> {
  try {
    const params = new URLSearchParams();
    if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
    if (filtros.tipo && filtros.tipo !== 'Todos') params.append('tipo', filtros.tipo);
    if (filtros.categoria && filtros.categoria !== 'Todas') params.append('categoria', filtros.categoria);
    if (filtros.precio_min) params.append('precio_min', String(filtros.precio_min));
    if (filtros.precio_max) params.append('precio_max', String(filtros.precio_max));
    if (filtros.frenos && filtros.frenos !== 'Todos') params.append('frenos', filtros.frenos);
    if (filtros.destacados_solo) params.append('destacados_solo', 'true');
    if (filtros.ordenar_por) params.append('ordenar_por', filtros.ordenar_por);

    const respuesta = await apiFetch(`${API_BASE_URL}/motos?${params.toString()}`);
    if (!respuesta.ok) throw new Error('Error al consultar API');
    const datos = await respuesta.json();
    return (datos.motos || []).map((moto: Moto) => normalizarImagenesMoto(moto));
  } catch (error) {
    let resultado = ((datosLocales.motos || []) as Moto[]).map(normalizarImagenesMoto);
    if (filtros.busqueda) {
      const q = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(m =>
        m.modelo.toLowerCase().includes(q) ||
        m.motor.toLowerCase().includes(q) ||
        (m.detalle && m.detalle.toLowerCase().includes(q))
      );
    }
    if (filtros.tipo && filtros.tipo !== 'Todos') {
      resultado = resultado.filter(m => m.tipo.toLowerCase() === (filtros.tipo || '').toLowerCase());
    }
    if (filtros.precio_min) {
      resultado = resultado.filter(m => m.precio >= (filtros.precio_min ?? 0));
    }
    if (filtros.precio_max) {
      resultado = resultado.filter(m => m.precio <= (filtros.precio_max ?? Infinity));
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
export async function obtenerDetalleMoto(idMoto: number) {
  try {
    const respuesta = await apiFetch(`${API_BASE_URL}/motos/${idMoto}`);
    if (!respuesta.ok) throw new Error('Error al consultar API');
    const datos = await respuesta.json();
    return {
      ...datos,
      moto: datos.moto && normalizarImagenesMoto(datos.moto),
      relacionadas: datos.relacionadas?.map(normalizarImagenesMoto),
    };
  } catch (error) {
    const moto = datosLocales.motos.find(m => m.id === Number(idMoto));
    if (!moto) return null;
    const relacionadas = datosLocales.motos.filter(m => m.id !== Number(idMoto)).slice(0, 4);
    return { moto: normalizarImagenesMoto(moto as Moto), relacionadas: relacionadas.map(m => normalizarImagenesMoto(m as Moto)) };
  }
}

/**
 * Obtiene el catálogo de repuestos
 */
export async function obtenerRepuestos(filtros: FiltrosRepuestos = {}): Promise<Repuesto[]> {
  try {
    const params = new URLSearchParams();
    if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
    if (filtros.categoria && filtros.categoria !== 'Todas') params.append('categoria', filtros.categoria);
    if (filtros.tipo_moto && filtros.tipo_moto !== 'Todos') params.append('tipo_moto', filtros.tipo_moto);
    if (filtros.solo_con_stock) params.append('solo_con_stock', 'true');

    const respuesta = await apiFetch(`${API_BASE_URL}/repuestos?${params.toString()}`);
    if (!respuesta.ok) throw new Error('Error al consultar API');
    const datos = await respuesta.json();
    return datos.repuestos || [];
  } catch (error) {
    let repuestos = [...((datosLocales.repuestos || []) as Repuesto[])];
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
 * Obtiene las motos destacadas para el Hero Section (dinámico desde el admin)
 */
export async function obtenerMotosDestacadas() {
  try {
    const respuesta = await apiFetch(`${API_BASE_URL}/destacados`);
    if (!respuesta.ok) throw new Error('Error al consultar API');
    const datos = await respuesta.json();
    const normalizar = (moto: { imagen_principal?: string; imagenes?: string[] } | null) => moto && ({
      ...moto,
      imagen_principal: rutaImagen(moto.imagen_principal || ''),
      imagenes: moto.imagenes?.map(rutaImagen),
    });
    return { ...datos, pisteras: normalizar(datos.pisteras), electricas: normalizar(datos.electricas) };
  } catch (error) {
    // Fallback: buscar en datos locales
    const motos = datosLocales.motos || [];
    const activas = motos.filter(m => m.estado === 'activado');
    const mejor = (tipo: string) => {
      const del_tipo = activas.filter(m => m.tipo === tipo);
      const destacadas = del_tipo.filter(m => m.destacado);
      const elegida = (destacadas.length > 0 ? destacadas : del_tipo)
        .sort((a, b) => (b.precio || 0) - (a.precio || 0))[0];
      if (!elegida) return null;
      return {
        id: elegida.id,
        nombre: `${elegida.marca || ''} ${elegida.modelo || ''}`.trim(),
        precio: elegida.precio || 0,
        motor: elegida.motor || 'Consultar',
        potencia: elegida.potencia || 'Consultar',
        imagen_principal: elegida.imagen_principal || '',
        imagenes: elegida.imagenes || [],
      };
    };
    return { pisteras: mejor('Pisteras'), electricas: mejor('Eléctricas') };
  }
}
