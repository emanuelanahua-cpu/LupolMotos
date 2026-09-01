import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  RotateCw, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Maximize2,
  Share2,
  MessageSquare
} from 'lucide-react';
import { formatearSoles } from '../utils/api';

export default function Visualizer3D({ motos = [], abrirModalMoto, navegarA }) {
  // Filtrar motos que tienen vistas o colores
  const modelosEstudio = motos.filter(m => 
    (m.colores && m.colores.length > 0) || 
    (m.vistas_360 && (m.vistas_360.derecha || m.vistas_360.frente))
  );

  const [motoSeleccionadaId, setMotoSeleccionadaId] = useState(12); // Default NS400Z
  const [colorActivoIdx, setColorActivoIdx] = useState(0);
  const [vistaActiva, setVistaActiva] = useState('principal'); // 'principal', 'derecha', 'izquierda', 'frente', 'atras'

  // Buscar moto activa
  const motoActiva = modelosEstudio.find(m => m.id === motoSeleccionadaId) || modelosEstudio[0] || motos[0];

  useEffect(() => {
    setColorActivoIdx(0);
    setVistaActiva('principal');
  }, [motoSeleccionadaId]);

  if (!motoActiva) return null;

  // Calcular imagen a mostrar
  let imagenActual = motoActiva.imagen_principal;
  const colorActual = motoActiva.colores && motoActiva.colores[colorActivoIdx];

  if (vistaActiva !== 'principal' && motoActiva.vistas_360 && motoActiva.vistas_360[vistaActiva]) {
    imagenActual = motoActiva.vistas_360[vistaActiva];
  } else if (colorActual && colorActual.img_moto) {
    imagenActual = colorActual.img_moto;
  }

  // Generar enlace WhatsApp con el color seleccionado
  const mensajeWA = `Hola Lupol Motos, estuve configurando en el Estudio 360 la *${motoActiva.modelo}* en color *${colorActual?.nombre || 'Predeterminado'}*. ¿Tienen stock en la tienda de Tacna?`;
  const urlWhatsApp = `https://wa.me/51924141939?text=${encodeURIComponent(mensajeWA)}`;

  return (
    <section id="estudio360" className="py-16 sm:py-20 bg-[#0d0e12] border-b border-zinc-800 relative">
      
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#fad911]/5 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header de Sección */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#181a22] border border-[#fad911]/30 text-[#fad911] text-xs font-bold uppercase tracking-wider mb-3">
            <RotateCw className="w-3.5 h-3.5 text-[#fad911]" />
            <span>Configurador Visual Interactivo</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            ESTUDIO INTERACTIVO <span className="text-[#fad911]">LUPOL 360°</span>
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base mt-2">
            Explora las motocicletas Bajaj desde diferentes ángulos y personaliza el color oficial de fábrica en tiempo real.
          </p>
        </div>

        {/* Selector de Modelos Disponibles */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 mb-8 space-x-2 no-scrollbar">
          {modelosEstudio.slice(0, 8).map((m) => (
            <button
              key={m.id}
              onClick={() => setMotoSeleccionadaId(m.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
                motoSeleccionadaId === m.id
                  ? 'bg-[#fad911] text-black border-[#fad911] shadow-md shadow-[#fad911]/20 font-black'
                  : 'bg-[#14151b] text-zinc-300 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {m.modelo}
            </button>
          ))}
        </div>

        {/* Canvas / Visor Central */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#121318] border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          
          {/* Lado Izquierdo: Controles de Ángulos y Colores */}
          <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
            
            {/* Información del Modelo */}
            <div>
              <span className="text-xs font-bold text-[#fad911] uppercase tracking-wider">
                {motoActiva.categoria || 'Gama Bajaj'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                {motoActiva.modelo}
              </h3>
              <div className="text-2xl font-black text-[#fad911] mt-2">
                {formatearSoles(motoActiva.precio)}
              </div>
            </div>

            {/* Selector de Ángulos / Vistas */}
            {motoActiva.vistas_360 && (
              <div>
                <label className="block text-xs font-extrabold text-zinc-400 uppercase tracking-wider mb-2.5">
                  1. Ángulo de Visión:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => setVistaActiva('principal')}
                    aria-pressed={vistaActiva === 'principal'}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                      vistaActiva === 'principal'
                        ? 'bg-zinc-800 text-[#fad911] border-[#fad911] shadow-sm'
                        : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    Principal
                  </button>
                  {motoActiva.vistas_360.derecha && (
                    <button
                      onClick={() => setVistaActiva('derecha')}
                      aria-pressed={vistaActiva === 'derecha'}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                        vistaActiva === 'derecha'
                          ? 'bg-zinc-800 text-[#fad911] border-[#fad911] shadow-sm'
                          : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                      }`}
                    >
                      Lateral Der.
                    </button>
                  )}
                  {motoActiva.vistas_360.izquierda && (
                    <button
                      onClick={() => setVistaActiva('izquierda')}
                      aria-pressed={vistaActiva === 'izquierda'}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                        vistaActiva === 'izquierda'
                          ? 'bg-zinc-800 text-[#fad911] border-[#fad911] shadow-sm'
                          : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                      }`}
                    >
                      Lateral Izq.
                    </button>
                  )}
                  {motoActiva.vistas_360.frente && (
                    <button
                      onClick={() => setVistaActiva('frente')}
                      aria-pressed={vistaActiva === 'frente'}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                        vistaActiva === 'frente'
                          ? 'bg-zinc-800 text-[#fad911] border-[#fad911] shadow-sm'
                          : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                      }`}
                    >
                      Frontal
                    </button>
                  )}
                  {motoActiva.vistas_360.atras && (
                    <button
                      onClick={() => setVistaActiva('atras')}
                      aria-pressed={vistaActiva === 'atras'}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                        vistaActiva === 'atras'
                          ? 'bg-zinc-800 text-[#fad911] border-[#fad911] shadow-sm'
                          : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                      }`}
                    >
                      Posterior
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Selector de Colores Disponibles */}
            {motoActiva.colores && motoActiva.colores.length > 0 && (
              <div>
                <label className="block text-xs font-extrabold text-zinc-400 uppercase tracking-wider mb-2.5">
                  2. Color de Fábrica: <span className="text-white ml-1">{colorActual?.nombre}</span>
                </label>
                
                <div className="flex flex-wrap gap-2.5">
                  {motoActiva.colores.map((col, idx) => (
                    <button
                      key={col.id_color || idx}
                      onClick={() => {
                        setColorActivoIdx(idx);
                        setVistaActiva('principal');
                      }}
                      aria-pressed={colorActivoIdx === idx}
                      aria-label={`Seleccionar color ${col.nombre}`}
                      className={`group relative p-1 rounded-xl transition-all border-2 ${
                        colorActivoIdx === idx
                          ? 'border-[#fad911] bg-zinc-800 shadow-md scale-105'
                          : 'border-zinc-800 bg-zinc-900/80 hover:border-zinc-700'
                      }`}
                      title={col.nombre}
                    >
                      <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-zinc-950">
                        {col.img_swatch ? (
                          <img src={col.img_swatch} alt={col.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-bold text-zinc-400">{col.nombre.slice(0, 2)}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-3 flex items-center text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  <span>Color disponible para entrega en Tacna</span>
                </div>
              </div>
            )}

            {/* Especificaciones Rápidas */}
            <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Motor:</span>
                <strong className="text-zinc-200">{motoActiva.motor || 'DTS-i'}</strong>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Potencia:</span>
                <strong className="text-zinc-200">{motoActiva.potencia || 'Oficial'}</strong>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Frenos:</span>
                <strong className="text-zinc-200">{motoActiva.frenos || 'Disco'}</strong>
              </div>
            </div>

            {/* Acciones */}
            <div className="space-y-2.5 pt-2">
              <a
                href={urlWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Consultar Disponibilidad</span>
              </a>

              <button
                onClick={() => abrirModalMoto(motoActiva.id)}
                className="w-full py-3 rounded-xl bg-[#fad911] hover:bg-[#fce23e] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all"
              >
                <span>Ver Ficha Técnica y Financiamiento</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Lado Derecho: Display de la Moto */}
          <div className="lg:col-span-8 flex flex-col items-center justify-center min-h-[360px] sm:min-h-[440px] relative order-1 lg:order-2">
            
            {/* Plataforma base con resplandor pulsante suave */}
            <div className="absolute bottom-6 w-[80%] h-12 bg-[#fad911]/15 blur-2xl rounded-full pointer-events-none animate-pedestal-glow"></div>
            <div className="absolute bottom-4 w-[65%] h-6 bg-black/60 rounded-[100%] border border-zinc-700/40 shadow-inner"></div>

            {/* Imagen Principal en Grande con transición suave */}
            <div className="relative z-10 w-full flex items-center justify-center p-4">
              <img
                key={`${motoActiva.id}-${vistaActiva}-${colorActivoIdx}`}
                src={imagenActual}
                alt={motoActiva.modelo}
                className="max-h-[320px] sm:max-h-[420px] w-auto object-contain filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.9)] animate-fade-in-scale"
                onError={(e) => {
                  e.target.src = motoActiva.imagen_principal;
                }}
              />
            </div>

            {/* Indicador de Modo */}
            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-800 text-[11px] font-bold text-zinc-300 flex items-center space-x-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#fad911] animate-pulse"></span>
              <span>Vista: {vistaActiva.toUpperCase()}</span>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
