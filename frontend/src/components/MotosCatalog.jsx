import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Fuel, 
  Gauge, 
  Disc, 
  ShieldCheck, 
  ArrowUpRight, 
  MessageSquare, 
  Calculator,
  Layers,
  Sparkles,
  Palette,
  RotateCw,
  Zap,
  Fingerprint
} from 'lucide-react';
import { formatearSoles } from '../utils/api';

// Mapa aproximado de nombres de color -> color real para pintar los swatches
const MAPA_COLORES = {
  'rojo': '#dc2626', 'negro': '#18181b', 'azul': '#2563eb', 'verde': '#16a34a',
  'blanco': '#f4f4f5', 'gris': '#71717a', 'plata': '#a1a1aa', 'morado': '#7c3aed',
  'amarillo': '#facc15', 'naranja': '#f97316', 'beige': '#d6c7a1', 'celeste': '#38bdf8',
  'turquesa': '#14b8a6', 'salmón': '#fb7185', 'marrón': '#78350f', 'dorado': '#ca8a04'
};

function colorAHex(nombre = '') {
  const clave = nombre.toLowerCase().split('/')[0].trim();
  return MAPA_COLORES[clave] || '#3f3f46';
}

// Tarjeta de una moto (reutilizada en la grilla principal y en la ventana de catálogo completo)
function TarjetaMoto({ moto, motoVolteada, setMotoVolteada, abrirModalMoto, abrirCotizadorConMoto }) {
  const esABS = (moto.frenos || '').toLowerCase().includes('abs');
  const esElectrica = moto.tipo === 'Eléctricas';
  const volteada = motoVolteada === moto.id;
  const coloresMoto = (moto.colores || []).filter(c => c && c.nombre);

  return (
    <div
      key={moto.id}
      className="group rounded-3xl bg-[#121318] border border-zinc-800/90 product-card-glow flex flex-col justify-between overflow-hidden relative"
    >
      
      {/* Top Bar de la Tarjeta */}
      <div className="p-5 pb-0 flex justify-between items-start z-10">
        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
          <span className="px-2.5 py-1 rounded-md bg-[#fad911]/10 text-[#fad911] text-[10px] font-extrabold uppercase tracking-wider border border-[#fad911]/25">
            {moto.categoria || moto.tipo}
          </span>
          {moto.destacado && (
            <span className="px-2 py-0.5 rounded-md bg-[#fad911] text-black text-[10px] font-black uppercase shadow-sm">
              DESTACADO
            </span>
          )}
          {esABS && (
            <span className="px-2 py-0.5 rounded-md bg-cyan-950/70 text-cyan-300 text-[10px] font-extrabold uppercase border border-cyan-800/50">
              ABS
            </span>
          )}
        </div>

        {coloresMoto.length > 0 && (
          <div className="flex items-center space-x-1 bg-black/50 px-2 py-1 rounded-md border border-zinc-800 text-[10px] text-zinc-400">
            <Layers className="w-3 h-3 text-[#fad911]" />
            <span>{coloresMoto.length} col.</span>
          </div>
        )}
      </div>

      {/* Imagen de la Moto — estilo póster promocional con efecto flip */}
      <div className="flip-card-scene relative h-56 sm:h-60 w-full">
        <div className={`flip-card-flipper ${volteada ? 'is-flipped' : ''}`}>

          {/* Cara frontal: foto estilo póster */}
          <div className="flip-card-face rounded-none">
            <div
              onClick={() => setMotoVolteada(volteada ? null : moto.id)}
              className="relative h-full w-full flex items-center justify-center p-4 cursor-pointer overflow-hidden"
            >
              {/* Fondo diagonal estilo afiche */}
              <div className="absolute inset-0 bg-gradient-to-br from-black via-[#17181d] to-black"></div>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#fad911]/20 rotate-45 blur-sm"></div>
              <div className="absolute -left-16 bottom-0 w-48 h-24 bg-[#fad911]/10 -rotate-12"></div>
              <div className="absolute inset-0 bg-radial from-[#fad911]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <img
                src={moto.imagen_principal}
                alt={moto.modelo}
                loading="lazy"
                className="relative max-h-full max-w-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)] transition-transform duration-300 group-hover:scale-[1.04]"
                onError={(e) => {
                  e.target.src = '/multimedia/categorias/2ruedas_static.png';
                }}
              />

              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/70 border border-[#fad911]/30 text-[#fad911] text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm">
                <RotateCw className="w-3 h-3" />
                <span>Toca para ver colores y specs</span>
              </div>
            </div>
          </div>

          {/* Cara trasera: colores + info relevante */}
          <div className="flip-card-face flip-card-face-back">
            <div
              onClick={() => setMotoVolteada(null)}
              className="relative h-full w-full p-4 cursor-pointer overflow-hidden flex flex-col justify-center bg-gradient-to-br from-[#181a22] to-[#0a0a0c]"
            >
              <div className="absolute -left-10 -top-10 w-40 h-40 bg-[#fad911]/10 rotate-45"></div>

              <div className="relative space-y-3">
                <div className="flex items-center space-x-1.5 text-[#fad911] text-[10px] font-extrabold uppercase tracking-wider">
                  <Palette className="w-3.5 h-3.5" />
                  <span>Colores disponibles</span>
                </div>

                {coloresMoto.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {coloresMoto.map((c, i) => (
                      <div key={i} className="flex items-center space-x-1.5 bg-black/40 border border-zinc-800 rounded-full pl-1 pr-2.5 py-1">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: colorAHex(c.nombre) }}
                        ></span>
                        <span className="text-[10px] text-zinc-200 font-semibold">{c.nombre}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-zinc-400">Consulta colores disponibles con nuestro equipo.</p>
                )}

                <div className="pt-2 border-t border-zinc-800/80 grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
                  {esElectrica ? (
                    <>
                      <div><span className="text-zinc-500">Autonomía:</span> <span className="text-zinc-200 font-bold">{moto.autonomia || 'Consultar'}</span></div>
                      <div><span className="text-zinc-500">Vel. máx:</span> <span className="text-zinc-200 font-bold">{moto.velocidad_maxima || 'Consultar'}</span></div>
                      <div><span className="text-zinc-500">Batería:</span> <span className="text-zinc-200 font-bold truncate">{moto.bateria || 'Consultar'}</span></div>
                      <div><span className="text-zinc-500">Carga máx:</span> <span className="text-zinc-200 font-bold">{moto.carga_maxima || 'Consultar'}</span></div>
                    </>
                  ) : (
                    <>
                      <div><span className="text-zinc-500">Transmisión:</span> <span className="text-zinc-200 font-bold">{moto.transmision || 'Consultar'}</span></div>
                      <div><span className="text-zinc-500">Tanque:</span> <span className="text-zinc-200 font-bold">{moto.tanque || 'Consultar'}</span></div>
                      <div><span className="text-zinc-500">Frenos:</span> <span className="text-zinc-200 font-bold">{moto.frenos || 'Consultar'}</span></div>
                      <div><span className="text-zinc-500">Motor:</span> <span className="text-zinc-200 font-bold truncate">{moto.motor || 'Consultar'}</span></div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Contenido y Especificaciones Clave */}
      <div className="p-5 pt-2 space-y-4 border-t border-zinc-800/60 bg-gradient-to-b from-[#121318] to-[#0d0e12]">
        
        <div>
          <h3 
            onClick={() => abrirModalMoto(moto.id)}
            className="text-lg font-black text-white group-hover:text-[#fad911] transition-colors cursor-pointer"
          >
            {moto.modelo}
          </h3>
          <p className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wide mt-0.5">
            {moto.marca}
          </p>
        </div>

        {/* Especificaciones clave con codificación semántica */}
        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 text-[11px] text-zinc-400 text-center">
          <div>
            <div className="text-zinc-500 text-[9px] uppercase font-bold">Motor</div>
            <div className="text-zinc-200 font-bold truncate">{moto.motor || 'DTS-i'}</div>
          </div>
          <div>
            <div className="text-zinc-500 text-[9px] uppercase font-bold">Potencia</div>
            <div className="text-zinc-200 font-bold truncate">{moto.potencia ? moto.potencia.split('@')[0] : 'Oficial'}</div>
          </div>
          <div>
            <div className="text-zinc-500 text-[9px] uppercase font-bold">Frenos</div>
            <div className={`font-bold truncate ${esABS ? 'text-cyan-300' : 'text-zinc-200'}`}>
              {moto.frenos ? moto.frenos.split('/')[0] : 'Disco'}
            </div>
          </div>
        </div>

        {/* Acciones de la Tarjeta */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => abrirModalMoto(moto.id)}
            className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors border border-zinc-800"
          >
            <span>Ficha Técnica</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#fad911]" />
          </button>

          <button
            onClick={() => abrirCotizadorConMoto(moto)}
            className="py-2.5 px-3 rounded-xl bg-[#fad911] hover:bg-[#fce23e] text-black font-extrabold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-sm shadow-[#fad911]/15"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Simular Plan</span>
          </button>
        </div>

      </div>

    </div>
  );
}

// Ventana de catálogo completo (modal a pantalla completa dentro de la misma pestaña)
function ModalCatalogoCompleto({ titulo, motos, motoVolteada, setMotoVolteada, abrirModalMoto, abrirCotizadorConMoto, alCerrar }) {
  const [busquedaModal, setBusquedaModal] = useState('');

  const motosFiltradasModal = useMemo(() => {
    if (!busquedaModal.trim()) return motos;
    const q = busquedaModal.toLowerCase();
    return motos.filter(m =>
      m.modelo.toLowerCase().includes(q) ||
      (m.marca && m.marca.toLowerCase().includes(q)) ||
      (m.motor && m.motor.toLowerCase().includes(q))
    );
  }, [motos, busquedaModal]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0c] overflow-y-auto animate-fade-in-scale">
      <div className="sticky top-0 z-10 bg-[#0a0a0c]/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] text-[#fad911] font-bold uppercase tracking-wider">Catálogo completo</p>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {titulo} <span className="text-zinc-500 text-base font-bold">({motosFiltradasModal.length} de {motos.length})</span>
            </h2>
          </div>

          <div className="flex items-center gap-3 flex-1 sm:flex-none sm:min-w-[280px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={busquedaModal}
                onChange={(e) => setBusquedaModal(e.target.value)}
                placeholder="Buscar por modelo, marca o motor..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 focus:border-[#fad911] outline-none text-sm text-white placeholder-zinc-500 transition-colors"
              />
            </div>
            <button
              onClick={alCerrar}
              className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700 hover:border-[#fad911] text-zinc-300 hover:text-white flex items-center justify-center transition-colors shrink-0"
              aria-label="Cerrar catálogo completo"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {motosFiltradasModal.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {motosFiltradasModal.map((moto) => (
              <TarjetaMoto
                key={moto.id}
                moto={moto}
                motoVolteada={motoVolteada}
                setMotoVolteada={setMotoVolteada}
                abrirModalMoto={abrirModalMoto}
                abrirCotizadorConMoto={abrirCotizadorConMoto}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-[#121318] border border-zinc-800 rounded-2xl max-w-lg mx-auto space-y-2">
            <Search className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-sm text-zinc-400">No hay resultados para "{busquedaModal}" en {titulo.toLowerCase()}.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MotosCatalog({ motos = [], abrirModalMoto, abrirCotizadorConMoto, categoriaInicial = 'Todas' }) {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(categoriaInicial);
  const [precioMaximo, setPrecioMaximo] = useState(25000);
  const [orden, setOrden] = useState('popularidad');
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);
  const [filtroFreno, setFiltroFreno] = useState('Todos');
  const [motoVolteada, setMotoVolteada] = useState(null);
  const [modalCatalogoAbierto, setModalCatalogoAbierto] = useState(false);

  // Si el Hero (u otra sección) pide una categoría específica, la aplicamos
  useEffect(() => {
    setCategoriaSeleccionada(categoriaInicial);
  }, [categoriaInicial]);

  // Al cambiar de categoría o buscar, volvemos a mostrar solo el primer bloque de 6
  useEffect(() => {
    setModalCatalogoAbierto(false);
  }, [categoriaSeleccionada, busqueda]);

  const categorias = [
    'Todas',
    'Triciclos',
    'Pisteras',
    'Motos Eléctricas'
  ];

  // Filtrado y ordenamiento en cliente
  const motosFiltradas = useMemo(() => {
    let list = motos.filter(m => m.estado === 'activado');

    // Búsqueda
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      list = list.filter(m => 
        m.modelo.toLowerCase().includes(q) || 
        (m.motor && m.motor.toLowerCase().includes(q)) ||
        (m.detalle && m.detalle.toLowerCase().includes(q))
      );
    }

    // Categoría
    if (categoriaSeleccionada !== 'Todas') {
      list = list.filter(m => m.categoria === categoriaSeleccionada || m.tipo === categoriaSeleccionada);
    }

    // Precio máximo
    list = list.filter(m => m.precio <= precioMaximo);

    // Frenos
    if (filtroFreno !== 'Todos') {
      list = list.filter(m => (m.frenos || '').toLowerCase().includes(filtroFreno.toLowerCase()));
    }

    // Orden
    if (orden === 'precio_asc') {
      list.sort((a, b) => a.precio - b.precio);
    } else if (orden === 'precio_desc') {
      list.sort((a, b) => b.precio - a.precio);
    } else if (orden === 'nombre') {
      list.sort((a, b) => a.modelo.localeCompare(b.modelo));
    } else {
      list.sort((a, b) => (b.visitas || 0) - (a.visitas || 0));
    }

    return list;
  }, [motos, busqueda, categoriaSeleccionada, precioMaximo, orden, filtroFreno]);

  const LIMITE_INICIAL = 6;
  const motosVisibles = motosFiltradas.slice(0, LIMITE_INICIAL);
  const hayMasPorMostrar = motosFiltradas.length > LIMITE_INICIAL;

  return (
    <>
    <section id="catalogo" className="py-16 sm:py-24 bg-[#0a0a0c] border-b border-zinc-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Encabezado de Catálogo */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-zinc-800/80 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 text-[#fad911] text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Línea Completa Lupol Motos Tacna</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              CATÁLOGO DE <span className="text-[#fad911]">MOTOCICLETAS</span>
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base mt-1">
              Descubre los modelos más potentes y eficientes con entrega inmediata en Tacna.
            </p>
          </div>

          {/* Contador de Resultados */}
          <div className="text-xs sm:text-sm font-semibold text-zinc-400">
            Mostrando <strong className="text-white">{motosFiltradas.length}</strong> de <strong className="text-[#fad911]">{motos.length}</strong> unidades
          </div>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="space-y-4 mb-10">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            
            {/* Campo de Búsqueda */}
            <div className="md:col-span-5 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                aria-label="Buscar motocicletas por modelo o cilindrada"
                placeholder="Buscar por modelo o motor..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121318] border border-zinc-800 text-sm text-white placeholder-zinc-500 focus-ring"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda('')}
                  aria-label="Limpiar término de búsqueda"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white bg-zinc-800 px-2 py-0.5 rounded-md"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Ordenamiento */}
            <div className="md:col-span-4">
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
                aria-label="Ordenar catálogo por"
                className="w-full px-4 py-2.5 rounded-xl bg-[#121318] border border-zinc-800 text-sm text-zinc-200 focus-ring"
              >
                <option value="popularidad">Más Populares / Tendencia</option>
                <option value="precio_asc">Precio: Menor a Mayor</option>
                <option value="precio_desc">Precio: Mayor a Menor</option>
                <option value="nombre">Nombre: A - Z</option>
              </select>
            </div>

            {/* Toggle Filtros Avanzados */}
            <div className="md:col-span-3">
              <button
                onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
                className={`w-full py-2.5 px-4 rounded-xl border text-sm font-bold flex items-center justify-center space-x-2 transition-all ${
                  mostrarFiltrosAvanzados
                    ? 'bg-[#fad911] text-black border-[#fad911]'
                    : 'bg-[#121318] text-zinc-300 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>{mostrarFiltrosAvanzados ? 'Ocultar Filtros' : 'Filtros Avanzados'}</span>
              </button>
            </div>

          </div>

          {/* Categorías en Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaSeleccionada(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  categoriaSeleccionada === cat
                    ? 'bg-[#fad911] text-black border-[#fad911] shadow-sm font-black'
                    : 'bg-[#121318] text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Panel Desplegable de Filtros Avanzados */}
          {mostrarFiltrosAvanzados && (
            <div className="p-5 rounded-2xl bg-[#121318] border border-zinc-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
              
              {/* Filtro Rango de Precio */}
              <div>
                <div className="flex justify-between text-xs font-bold text-zinc-400 mb-2">
                  <span>Precio Máximo:</span>
                  <span className="text-[#fad911] font-black">{formatearSoles(precioMaximo)}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="25000"
                  step="500"
                  value={precioMaximo}
                  onChange={(e) => setPrecioMaximo(Number(e.target.value))}
                  aria-label="Filtro de precio máximo en Soles"
                  className="w-full accent-[#fad911] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                  <span>S/. 5,000</span>
                  <span>S/. 25,000</span>
                </div>
              </div>

              {/* Filtro Tipo de Frenos */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2">Sistema de Frenos:</label>
                <select
                  value={filtroFreno}
                  onChange={(e) => setFiltroFreno(e.target.value)}
                  aria-label="Filtro por tipo de frenos"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 focus-ring"
                >
                  <option value="Todos">Cualquier Sistema</option>
                  <option value="ABS">Frenos ABS</option>
                  <option value="Disco">Freno de Disco</option>
                </select>
              </div>

              {/* Botón de Reset */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setBusqueda('');
                    setCategoriaSeleccionada('Todas');
                    setPrecioMaximo(25000);
                    setFiltroFreno('Todos');
                    setOrden('popularidad');
                  }}
                  className="w-full py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-bold border border-zinc-800"
                >
                  Restablecer Filtros
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Grid de Tarjetas de Motos (máximo 6, el resto en la ventana de catálogo completo) */}
        {motosFiltradas.length > 0 ? (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {motosVisibles.map((moto) => (
              <TarjetaMoto
                key={moto.id}
                moto={moto}
                motoVolteada={motoVolteada}
                setMotoVolteada={setMotoVolteada}
                abrirModalMoto={abrirModalMoto}
                abrirCotizadorConMoto={abrirCotizadorConMoto}
              />
            ))}
          </div>

          {hayMasPorMostrar && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={() => setModalCatalogoAbierto(true)}
                className="px-8 py-3.5 rounded-xl bg-[#fad911] hover:bg-[#fce23e] text-black font-extrabold text-sm uppercase tracking-wide transition-all shadow-lg shadow-[#fad911]/20"
              >
                Ver catálogo completo de {categoriaSeleccionada === 'Todas' ? 'motocicletas' : categoriaSeleccionada} ({motosFiltradas.length})
              </button>
            </div>
          )}
          </>
        ) : (
          <div className="p-12 text-center bg-[#121318] border border-zinc-800 rounded-2xl max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">No encontramos motocicletas con esos filtros</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                No hay modelos que coincidan con la búsqueda actual o rango de precio. Restablece los filtros para ver todo el catálogo disponible.
              </p>
            </div>
            <button
              onClick={() => {
                setBusqueda('');
                setCategoriaSeleccionada('Todas');
                setPrecioMaximo(25000);
                setFiltroFreno('Todos');
                setOrden('popularidad');
              }}
              className="px-6 py-3 rounded-xl bg-[#fad911] hover:bg-[#fce23e] text-black font-extrabold text-xs uppercase tracking-wider transition-all"
            >
              Restablecer y ver todas las motos
            </button>
          </div>
        )}


      </div>
    </section>

    {modalCatalogoAbierto && (
      <ModalCatalogoCompleto
        titulo={categoriaSeleccionada === 'Todas' ? 'Todas las motocicletas' : categoriaSeleccionada}
        motos={motosFiltradas}
        motoVolteada={motoVolteada}
        setMotoVolteada={setMotoVolteada}
        abrirModalMoto={abrirModalMoto}
        abrirCotizadorConMoto={abrirCotizadorConMoto}
        alCerrar={() => setModalCatalogoAbierto(false)}
      />
    )}
    </>
  );
}