import React, { useState, useMemo } from 'react';
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
  ChevronDown
} from 'lucide-react';
import { formatearSoles } from '../utils/api';

export default function MotosCatalog({ motos = [], abrirModalMoto, abrirCotizadorConMoto }) {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
  const [precioMaximo, setPrecioMaximo] = useState(25000);
  const [orden, setOrden] = useState('popularidad');
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);
  const [filtroFreno, setFiltroFreno] = useState('Todos');

  const categorias = [
    'Todas',
    'Naked / Deportiva',
    'Trabajo y Utilitaria',
    'Racing / Sport',
    'Torito / Pasajeros'
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

  return (
    <section id="catalogo" className="py-16 sm:py-24 bg-[#0a0a0c] border-b border-zinc-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Encabezado de Catálogo */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-zinc-800/80 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 text-[#fad911] text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Línea Completa Bajaj Tacna</span>
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
                placeholder="Buscar por modelo o motor (Pulsar, Dominar, Boxer, 200, 400)..."
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

        {/* Grid de Tarjetas de Motos */}
        {motosFiltradas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {motosFiltradas.map((moto) => {
              const mensajeWACard = `Hola Lupol Motos, deseo consultar por la moto *${moto.modelo}* (Precio: S/. ${moto.precio.toLocaleString('es-PE')}). ¿Está disponible para entrega en Tacna?`;
              const urlWACard = `https://wa.me/51924141939?text=${encodeURIComponent(mensajeWACard)}`;

              const esABS = (moto.frenos || '').toLowerCase().includes('abs');

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

                    {moto.colores && moto.colores.length > 0 && (
                      <div className="flex items-center space-x-1 bg-black/50 px-2 py-1 rounded-md border border-zinc-800 text-[10px] text-zinc-400">
                        <Layers className="w-3 h-3 text-[#fad911]" />
                        <span>{moto.colores.length} col.</span>
                      </div>
                    )}
                  </div>

                  {/* Imagen de la Moto */}
                  <div 
                    onClick={() => abrirModalMoto(moto.id)}
                    className="relative h-48 sm:h-52 w-full flex items-center justify-center p-4 cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-radial from-[#fad911]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <img
                      src={moto.imagen_principal}
                      alt={moto.modelo}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)]"
                      onError={(e) => {
                        e.target.src = '/multimedia/pulsar_ns400Z/moto.webp';
                      }}
                    />
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
                      
                      <div className="text-xl font-black text-[#fad911] mt-1">
                        {formatearSoles(moto.precio)}
                      </div>
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
            })}
          </div>
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
  );
}
