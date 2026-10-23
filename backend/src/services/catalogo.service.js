import * as repository from '../repositories/catalogo.repository.js';
import { catalog, setting } from '../repositories/catalogo.repository.js';
import { httpError } from '../utils/errors.js';
export function createService(pool, env = process.env) {
  async function estado({}) {
    await repository.comprobarConexion(pool);
    return {
      estado: 'en_linea',
      base_de_datos: 'conectada',
      mensaje: 'Backend de Lupol Motos funcionando correctamente',
      version: '2.0.0'
    };
  }
  async function tienda({}) {
    return await setting(pool, 'tienda');
  }
  async function listarMotos({
    query
  }) {
    const q = query;
    let motos = (await catalog(pool)).filter(m => m.estado === 'activado');
    if (q.busqueda) motos = motos.filter(m => ['modelo', 'motor', 'detalle'].some(f => String(m[f] || '').toLowerCase().includes(String(q.busqueda).toLowerCase())));
    for (const [f, all] of [['tipo', 'Todos'], ['categoria', 'Todas']]) if (q[f] && q[f] !== all) motos = motos.filter(m => String(m[f]).toLowerCase() === String(q[f]).toLowerCase());
    if (q.precio_min !== undefined) motos = motos.filter(m => Number(m.precio) >= Number(q.precio_min));
    if (q.precio_max !== undefined) motos = motos.filter(m => Number(m.precio) <= Number(q.precio_max));
    if (q.frenos && q.frenos !== 'Todos') motos = motos.filter(m => String(m.frenos || '').toLowerCase().includes(String(q.frenos).toLowerCase()));
    if (['true', '1'].includes(q.destacados_solo)) motos = motos.filter(m => m.destacado);
    motos.sort(q.ordenar_por === 'precio_asc' ? (a, b) => a.precio - b.precio : q.ordenar_por === 'precio_desc' ? (a, b) => b.precio - a.precio : q.ordenar_por === 'nombre' ? (a, b) => a.modelo.localeCompare(b.modelo) : (a, b) => (b.visitas || 0) - (a.visitas || 0));
    return {
      total: motos.length,
      motos
    };
  }
  async function detalleMoto({
    params
  }) {
    const all = await catalog(pool),
      moto = all.find(m => m.id === Number(params.id) && m.estado === 'activado');
    if (!moto) throw httpError(404, 'Motocicleta no encontrada');
    return {
      moto,
      relacionadas: all.filter(m => m.id !== moto.id && m.estado === 'activado' && (m.tipo === moto.tipo || m.destacado)).slice(0, 4)
    };
  }
  async function listarRepuestos({
    query
  }) {
    let items = await catalog(pool, 'repuestos');
    const q = query;
    if (q.busqueda) items = items.filter(r => ['nombre', 'codigo', 'aplicacion_modelos'].some(f => String(r[f] || '').toLowerCase().includes(String(q.busqueda).toLowerCase())));
    for (const [f, all] of [['categoria', 'Todas'], ['tipo_moto', 'Todos']]) if (q[f] && q[f] !== all) items = items.filter(r => String(r[f]).toLowerCase() === String(q[f]).toLowerCase());
    if (['true', '1'].includes(q.solo_con_stock)) items = items.filter(r => r.stock > 0);
    return {
      total: items.length,
      repuestos: items
    };
  }
  async function filtros({}) {
    const motos = await catalog(pool),
      parts = await catalog(pool, 'repuestos');
    const unique = (items, key) => [...new Set(items.map(m => m[key]).filter(Boolean))].sort();
    const prices = motos.map(m => Number(m.precio)).filter(p => p > 0);
    return {
      tipos_moto: unique(motos, 'tipo'),
      categorias_moto: unique(motos, 'categoria'),
      frenos: unique(motos, 'frenos'),
      enfriamientos: unique(motos, 'enfriamiento'),
      categorias_repuestos: unique(parts, 'categoria'),
      tipos_repuesto_moto: unique(parts, 'tipo_moto'),
      rango_precios: {
        min: prices.length ? Math.min(...prices) : 5000,
        max: prices.length ? Math.max(...prices) : 25000
      }
    };
  }
  async function destacados({}) {
    const all = (await catalog(pool)).filter(m => m.estado === 'activado');
    const best = tipo => {
      const items = all.filter(m => m.tipo === tipo);
      const featured = items.filter(m => m.destacado);
      const m = (featured.length ? featured : items).sort((a, b) => b.precio - a.precio)[0];
      return m ? {
        ...m,
        nombre: `${m.marca || ''} ${m.modelo}`.trim()
      } : null;
    };
    return {
      pisteras: best('Pisteras'),
      electricas: best('Eléctricas')
    };
  }
  return {
    estado,
    tienda,
    listarMotos,
    detalleMoto,
    listarRepuestos,
    filtros,
    destacados
  };
}
