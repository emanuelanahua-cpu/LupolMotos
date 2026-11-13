import SelectorColoresMoto from './SelectorColoresMoto';
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  MessageSquare,
  Palette
} from 'lucide-react';
import { formatearSoles } from '../utils/format';

export default function GaleriaColores({ motos = [], abrirModalMoto, navegarA }) {
  // Filtrar motos que tienen fotos por color
  const modelosEstudio = motos.filter(m => m.colores && m.colores.length > 0);

  const [motoSeleccionadaId, setMotoSeleccionadaId] = useState(12); // Default NS400Z
  const [colorActivoIdx, setColorActivoIdx] = useState(0);

  // Buscar moto activa
  const motoActiva = modelosEstudio.find(m => m.id === motoSeleccionadaId) || modelosEstudio[0] || motos[0];

  useEffect(() => {
    setColorActivoIdx(0);
  }, [motoSeleccionadaId]);

  if (!motoActiva) return null;

  // Calcular imagen a mostrar según el color elegido
  const colorActual = motoActiva.colores && motoActiva.colores[colorActivoIdx];
  const imagenActual = colorActual?.img_moto || motoActiva.imagen_principal;

  // Generar enlace WhatsApp con el color seleccionado
  const mensajeWA = `Hola Lupol Motos, estuve viendo la *${motoActiva.modelo}* en color *${colorActual?.nombre || 'Predeterminado'}*. ¿Tienen stock en la tienda de Tacna?`;
  const urlWhatsApp = `https://wa.me/51980687475?text=${encodeURIComponent(mensajeWA)}`;

  return (
    <section id="colores" className="py-16 sm:py-20 bg-[#0d0e12] border-b border-zinc-800 relative overflow-x-clip">
      
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#fad911]/5 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        
        {/* Header de Sección */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#181a22] border border-[#fad911]/30 text-[#fad911] text-xs font-bold uppercase tracking-wider mb-3">
            <Palette className="w-3.5 h-3.5 text-[#fad911]" />
            <span>Configurador de Colores</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            GALERÍA DE <span className="text-[#fad911]">COLORES</span>
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base mt-2">
            Elige tu modelo favorito y descubre los colores disponibles para entrega en Tacna.
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
        <div className="tarjeta-lupol grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#121318] border border-zinc-800 rounded-3xl p-4 sm:p-10 shadow-2xl relative overflow-hidden">
          
          {/* Lado Izquierdo: Controles de Ángulos y Colores */}
          <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
            
            {/* Información del Modelo */}
            <div>
              <span className="text-xs font-bold text-[#fad911] uppercase tracking-wider">
                {motoActiva.categoria || 'Gama Lupol Motos'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                {motoActiva.modelo}
              </h3>
              <div className="text-2xl font-black text-[#fad911] mt-2">
                {formatearSoles(motoActiva.precio)}
              </div>
            </div>

            {/* Selector de Colores Disponibles */}
            {motoActiva.colores && motoActiva.colores.length > 0 && (
              <div>
                <label className="block text-xs font-extrabold text-zinc-400 uppercase tracking-wider mb-2.5">
                  Color de fábrica: <span className="text-white ml-1">{colorActual?.nombre}</span>
                </label>
                
                <SelectorColoresMoto
                  colores={motoActiva.colores}
                  seleccionado={colorActivoIdx}
                  onSelect={setColorActivoIdx}
                />

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
          <div className="lg:col-span-8 flex w-full flex-col items-center justify-center min-h-[220px] sm:min-h-[360px] lg:min-h-[440px] relative order-1 lg:order-2">
            
            {/* Plataforma base con resplandor pulsante suave */}
            <div className="absolute bottom-6 hidden sm:block w-[80%] h-12 bg-[#fad911]/15 blur-2xl rounded-full pointer-events-none animate-pedestal-glow"></div>
            <div className="absolute bottom-4 hidden sm:block w-[65%] h-6 bg-black/60 rounded-[100%] border border-zinc-700/40 shadow-inner"></div>

            {/* Imagen Principal en Grande con transición suave */}
            <div className="relative z-10 flex w-full items-center justify-center p-0 sm:p-4">
              <img
                key={`${motoActiva.id}-${colorActivoIdx}`}
                src={imagenActual}
                alt={`${motoActiva.modelo}${colorActual ? ` en color ${colorActual.nombre}` : ''}`}
                loading="lazy"
                decoding="async"
                className="block h-auto w-full max-h-[280px] object-contain sm:w-auto sm:max-h-[420px] filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.9)] animate-fade-in-scale"
                onError={(e) => {
                  e.target.src = motoActiva.imagen_principal;
                }}
              />
            </div>

            {/* Indicador del color seleccionado */}
            {colorActual?.nombre && (
              <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-800 text-[11px] font-bold text-zinc-300 flex items-center space-x-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#fad911]"></span>
                <span>Color: {colorActual.nombre}</span>
              </div>
            )}

          </div>

        </div>

      </div>

    </section>
  );
}
