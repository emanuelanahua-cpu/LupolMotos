import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Package, 
  ShoppingBag, 
  CheckCircle2, 
  Layers, 
  Sparkles, 
  Plus, 
  Minus, 
  MessageSquare,
  Wrench,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { formatearSoles } from '../utils/api';

export default function RepuestosCatalog({ 
  repuestos = [], 
  agregarAlCarrito, 
  carrito = [], 
  abrirCarrito 
}) {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [tipoMoto, setTipoMoto] = useState('Todos');
  const [soloEnStock, setSoloEnStock] = useState(false);

  const categorias = [
    'Todas',
    'Filtros y Lubricantes',
    'Sistema de Frenos',
    'Transmisión y Embrague',
    'Sistema Eléctrico e Iluminación',
    'Motor y Cilindrada',
    'Suspensión y Dirección',
    'Accesorios y Seguridad'
  ];

  const repuestosFiltrados = useMemo(() => {
    return repuestos.filter((r) => {
      // Búsqueda
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase();
        const enNombre = r.nombre.toLowerCase().includes(q);
        const enCodigo = (r.codigo || '').toLowerCase().includes(q);
        const enAplicacion = (r.aplicacion_modelos || '').toLowerCase().includes(q);
        if (!enNombre && !enCodigo && !enAplicacion) return false;
      }

      // Categoría
      if (categoriaActiva !== 'Todas' && r.categoria !== categoriaActiva) {
        return false;
      }

      // Tipo de moto
      if (tipoMoto !== 'Todos' && r.tipo_moto !== tipoMoto) {
        return false;
      }

      // Solo en stock
      if (soloEnStock && (r.stock || 0) <= 0) {
        return false;
      }

      return true;
    });
  }, [repuestos, busqueda, categoriaActiva, tipoMoto, soloEnStock]);

  const totalItemsEnCarrito = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <section id="repuestos" className="py-16 sm:py-24 bg-[#0a0a0c] border-b border-zinc-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-zinc-800/80 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 text-[#fad911] text-xs font-bold uppercase tracking-wider mb-2">
              <Wrench className="w-3.5 h-3.5" />
              <span>Genuino 100% Bajaj</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              REPUESTOS & ACCESORIOS <span className="text-[#fad911]">ORIGINALES</span>
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base mt-1">
              Repuestos legítimos garantizados con código oficial de fábrica para alargar la vida útil de tu moto o torito.
            </p>
          </div>

          {/* Botón Flotante/Header del Carrito */}
          {totalItemsEnCarrito > 0 && (
            <button
              onClick={abrirCarrito}
              className="px-5 py-3 rounded-xl bg-[#fad911] hover:bg-[#fce23e] text-black font-extrabold text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-[#fad911]/20 transition-all hover:scale-105"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Ver Cotización ({totalItemsEnCarrito})</span>
            </button>
          )}
        </div>

        {/* Barra de Búsqueda y Filtros */}
        <div className="space-y-4 mb-10">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            
            {/* Buscador */}
            <div className="md:col-span-6 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                aria-label="Buscar repuestos por nombre, código de parte o modelo de moto"
                placeholder="Buscar por nombre o código de parte (ej: JG571014, Filtro, Bujía)..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121318] border border-zinc-800 text-sm text-white placeholder-zinc-500 focus-ring"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda('')}
                  aria-label="Limpiar búsqueda de repuestos"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white bg-zinc-800 px-2 py-0.5 rounded-md"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Selector Tipo de Vehículo */}
            <div className="md:col-span-3">
              <select
                value={tipoMoto}
                onChange={(e) => setTipoMoto(e.target.value)}
                aria-label="Filtrar repuestos por tipo de vehículo"
                className="w-full px-4 py-2.5 rounded-xl bg-[#121318] border border-zinc-800 text-sm text-zinc-200 focus-ring"
              >
                <option value="Todos">Todos los Vehículos</option>
                <option value="2 Ruedas">Motos 2 Ruedas (Pulsar/Dominar/Boxer)</option>
                <option value="Torito">Toritos y Mototaxis</option>
                <option value="General">Repuestos Generales</option>
              </select>
            </div>

            {/* Toggle Solo en Stock */}
            <div className="md:col-span-3 flex items-center">
              <label className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#121318] border border-zinc-800 cursor-pointer text-xs font-bold text-zinc-300 select-none">
                <span>Solo con Stock Inmediato</span>
                <input
                  type="checkbox"
                  checked={soloEnStock}
                  onChange={(e) => setSoloEnStock(e.target.checked)}
                  className="accent-[#fad911] w-4 h-4 rounded cursor-pointer"
                />
              </label>
            </div>

          </div>

          {/* Categorías en Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaActiva(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  categoriaActiva === cat
                    ? 'bg-[#fad911] text-black border-[#fad911] font-black'
                    : 'bg-[#121318] text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        {/* Grid de Repuestos */}
        {repuestosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {repuestosFiltrados.map((rep) => {
              const itemEnCarrito = carrito.find(item => item.id === rep.id);
              const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad : 0;
              const tieneStock = (rep.stock || 0) > 0;

              return (
                <div
                  key={rep.id}
                  className="rounded-2xl bg-[#121318] border border-zinc-800/90 product-card-glow p-4 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Tag & Stock */}
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-2.5 py-0.5 rounded-md bg-zinc-900/90 border border-zinc-800 text-[10px] font-bold text-zinc-300 truncate max-w-[130px]">
                        {rep.categoria}
                      </span>

                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        tieneStock 
                          ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/40' 
                          : 'bg-amber-950/40 text-amber-400 border border-amber-800/30'
                      }`}>
                        {tieneStock ? `${rep.stock} en stock` : 'Consultar'}
                      </span>
                    </div>

                    {/* Imagen del Repuesto */}
                    <div className="h-36 w-full rounded-xl bg-black/40 border border-zinc-800/60 p-2 flex items-center justify-center mb-3">
                      <img
                        src={rep.img_repuesto || '/multimedia/repuestos.png'}
                        alt={rep.nombre}
                        loading="lazy"
                        className="max-h-full max-w-full object-contain filter drop-shadow-md"
                        onError={(e) => {
                          e.target.src = '/multimedia/repuestos.png';
                        }}
                      />
                    </div>

                    {/* Nombre y SKU */}
                    <h3 className="font-bold text-white text-xs sm:text-sm line-clamp-2 leading-snug">
                      {rep.nombre}
                    </h3>

                    {rep.codigo && (
                      <div className="flex items-center space-x-1 mt-1 text-[11px] text-zinc-400">
                        <Tag className="w-3 h-3 text-[#fad911]" />
                        <span>Código: <strong className="text-zinc-200">{rep.codigo}</strong></span>
                      </div>
                    )}

                    {rep.aplicacion_modelos && (
                      <p className="text-[10px] text-zinc-400 mt-1 line-clamp-1">
                        Aplica: {rep.aplicacion_modelos}
                      </p>
                    )}
                  </div>

                  {/* Precio y Botón Agregar */}
                  <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase block">Precio Aprox</span>
                      <div className="text-sm font-black text-[#fad911]">
                        {formatearSoles(rep.precio || 45.0)}
                      </div>
                    </div>

                    {cantidadEnCarrito > 0 ? (
                      <div className="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-700 rounded-xl p-1">
                        <button
                          onClick={() => agregarAlCarrito(rep, -1)}
                          aria-label={`Disminuir cantidad de ${rep.nombre}`}
                          className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center font-bold text-xs transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-black text-white px-2 min-w-[20px] text-center">{cantidadEnCarrito}</span>
                        <button
                          onClick={() => agregarAlCarrito(rep, 1)}
                          aria-label={`Aumentar cantidad de ${rep.nombre}`}
                          className="w-7 h-7 rounded-lg bg-[#fad911] text-black hover:bg-[#fce23e] flex items-center justify-center font-bold text-xs transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => agregarAlCarrito(rep, 1)}
                        className="px-3.5 py-2 rounded-xl bg-[#fad911] hover:bg-[#fce23e] text-black font-extrabold text-xs uppercase flex items-center space-x-1.5 transition-all shadow-sm shadow-[#fad911]/15"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Cotizar</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-10 text-center bg-[#121318] border border-zinc-800 rounded-2xl max-w-md mx-auto">
            <Package className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No encontramos ese repuesto</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Si buscas un repuesto específico que no figura en la lista, escríbenos directamente con tu código de parte.
            </p>
            <a
              href="https://wa.me/51924141939?text=Hola%20Lupol%20Motos,%20busco%20un%20repuesto%20específico%20para%20mi%20moto"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Consultar Asesor de Repuestos</span>
            </a>
          </div>
        )}

      </div>
    </section>
  );
}
