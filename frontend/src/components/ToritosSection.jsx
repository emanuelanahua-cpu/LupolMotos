import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  Fuel, 
  Wrench, 
  ArrowRight, 
  MessageSquare, 
  Calculator,
  Award,
  CheckCircle2
} from 'lucide-react';
import { formatearSoles } from '../utils/api';

export default function ToritosSection({ toritos = [], abrirModalMoto, abrirCotizadorConMoto }) {
  const [toritoActivoIdx, setToritoActivoIdx] = useState(0);

  const toritosData = toritos.length > 0 ? toritos : [
    {
      id: 20,
      modelo: 'VILCHEZ FULL VIP',
      precio: 22300,
      motor: '205cc, 4 tiempos',
      potencia: '15.0 HP @ 7500 RPM',
      frenos: 'Hidráulico de pie en 3 ruedas',
      suspension: 'Amortiguadores hidráulicos de doble efecto',
      tanque: '12 L',
      detalle: 'El estándar de oro en confort y servicio VIP para transporte urbano. Equipado con tapicería de alta durabilidad, iluminación LED y estructura reforzada.',
      imagen_principal: '/multimedia/vilchez_full/moto.webp'
    },
    {
      id: 18,
      modelo: 'FIVEZA GTR 3',
      precio: 21300,
      motor: '200cc, 4 tiempos',
      potencia: '14.5 HP @ 7500 RPM',
      frenos: 'Tambor hidráulico expandible',
      suspension: 'Delantera reforzada / Muelles traseros',
      tanque: '12 L',
      detalle: 'Ingeniería de vanguardia en transporte de pasajeros y carga. Chasis de acero reforzado de alta torsión para absorber irregularidades en cualquier ruta.',
      imagen_principal: '/multimedia/fivesa_gtr_3/moto.webp'
    },
    {
      id: 19,
      modelo: 'FIVEZA GTR 2',
      precio: 21300,
      motor: '197cc, 4 tiempos',
      potencia: '13.8 HP @ 7000 RPM',
      frenos: 'Tambor con zapata',
      suspension: 'Telescópica con resortes helicoidales',
      tanque: '10 L',
      detalle: 'La herramienta definitiva para la máxima rentabilidad urbana. Mínimo consumo de combustible y excelente potencia para pendientes pronunciadas.',
      imagen_principal: '/multimedia/fivesa_gtr_2/moto.webp'
    },
    {
      id: 21,
      modelo: 'VILCHEZ MODELO ESTÁNDAR',
      precio: 21800,
      motor: '198cc, 4 tiempos',
      potencia: '13.2 HP @ 7000 RPM',
      frenos: 'Mecánico / Tambor',
      suspension: 'Resortes reforzados tipo muelle',
      tanque: '9 L',
      detalle: 'Robusto, fiel y económico de mantener. Construido para resistir el trabajo diario en las calles y avenidas más exigentes.',
      imagen_principal: '/multimedia/vilchez_modelo_standar/moto.webp'
    }
  ];

  const toritoActivo = toritosData[toritoActivoIdx] || toritosData[0];

  const msgWA = `Hola Lupol Motos, deseo cotizar el Torito *${toritoActivo.modelo}* (Precio S/. ${toritoActivo.precio.toLocaleString('es-PE')}). ¿Qué planes de crédito tienen para taxistas/emprendedores en Tacna?`;
  const urlWA = `https://wa.me/51924141939?text=${encodeURIComponent(msgWA)}`;

  return (
    <section id="toritos" className="py-16 sm:py-24 bg-[#0d0e12] border-b border-zinc-800 relative">
      
      {/* Resplandor */}
      <div className="absolute top-1/3 right-0 w-[500px] h-[350px] bg-[#fad911]/5 blur-[160px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#181a22] border border-[#fad911]/30 text-[#fad911] text-xs font-bold uppercase tracking-wider mb-3">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Rentabilidad y Trabajo Diario</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            TORITOS & MOTOTAXIS <span className="text-[#fad911]">BAJAJ</span>
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base mt-2">
            La herramienta preferida por los emprendedores de Tacna. Máximo rendimiento de combustible, repuestos económicos y alta durabilidad.
          </p>
        </div>

        {/* Selector de Modelos Torito */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {toritosData.map((t, idx) => (
            <button
              key={t.id || idx}
              onClick={() => setToritoActivoIdx(idx)}
              className={`p-4 rounded-2xl text-left transition-all border ${
                toritoActivoIdx === idx
                  ? 'bg-[#181a22] border-[#fad911] shadow-lg shadow-[#fad911]/10 scale-[1.02]'
                  : 'bg-[#121318] border-zinc-800/80 hover:border-zinc-700 text-zinc-400 hover:text-white'
              }`}
            >
              <div className="text-[10px] uppercase font-bold text-zinc-500">Modelo {idx + 1}</div>
              <div className={`font-black text-sm mt-0.5 truncate ${toritoActivoIdx === idx ? 'text-[#fad911]' : 'text-white'}`}>
                {t.modelo}
              </div>
              <div className="text-xs font-bold text-zinc-300 mt-1">
                {formatearSoles(t.precio)}
              </div>
            </button>
          ))}
        </div>

        {/* Showcase Detallado del Torito Seleccionado */}
        <div className="bg-[#121318] border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Lado Izquierdo: Imagen del Torito */}
          <div className="lg:col-span-6 bg-[#090a0d] rounded-3xl border border-zinc-800/80 p-6 flex flex-col items-center justify-center min-h-[320px] sm:min-h-[400px] relative group overflow-hidden">
            
            <div className="absolute bottom-4 w-[70%] h-8 bg-[#fad911]/10 blur-2xl rounded-full pointer-events-none animate-pedestal-glow"></div>

            <div className="absolute top-4 left-4 bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-800 text-xs font-bold text-[#fad911] flex items-center space-x-1 shadow-sm">
              <Award className="w-3.5 h-3.5" />
              <span>Garantía de Fábrica</span>
            </div>

            <img
              key={toritoActivo.id}
              src={toritoActivo.imagen_principal}
              alt={toritoActivo.modelo}
              className="max-h-[280px] sm:max-h-[360px] w-auto object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)] animate-fade-in-scale relative z-10"
              onError={(e) => {
                e.target.src = '/multimedia/categorias/torito_static.png';
              }}
            />

            <div className="mt-2 text-center text-xs text-zinc-400 relative z-10">
              * Carrozado reforzado y homologado para transporte en Tacna
            </div>
          </div>

          {/* Lado Derecho: Especificaciones Comerciales y Crédito */}
          <div className="lg:col-span-6 space-y-6">
            
            <div>
              <span className="px-3 py-1 rounded-md bg-zinc-900 text-[#fad911] text-xs font-black uppercase border border-zinc-800">
                Transporte de Pasajeros
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white mt-2">
                {toritoActivo.modelo}
              </h3>
              <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
                {toritoActivo.detalle}
              </p>
            </div>

            {/* Grid de Especificaciones Clave */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
                <span className="text-zinc-500 uppercase font-bold text-[10px]">Motor:</span>
                <div className="text-zinc-100 font-bold mt-0.5">{toritoActivo.motor}</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
                <span className="text-zinc-500 uppercase font-bold text-[10px]">Potencia:</span>
                <div className="text-zinc-100 font-bold mt-0.5">{toritoActivo.potencia || '14.5 HP'}</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
                <span className="text-zinc-500 uppercase font-bold text-[10px]">Frenos:</span>
                <div className="text-zinc-100 font-bold mt-0.5 truncate">{toritoActivo.frenos || 'Hidráulico'}</div>
              </div>
            </div>

            {/* Ventajas para Emprendedores */}
            <div className="space-y-2 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs">
              <div className="flex items-center text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-[#fad911] mr-2 shrink-0" />
                <span>Excelente rendimiento por galón (Gasolina o GLP)</span>
              </div>
              <div className="flex items-center text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-[#fad911] mr-2 shrink-0" />
                <span>Repuestos genuinos disponibles de inmediato en nuestra tienda</span>
              </div>
              <div className="flex items-center text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-[#fad911] mr-2 shrink-0" />
                <span>Financiamiento a cuotas accesibles solo con DNI y recibo de luz/agua</span>
              </div>
            </div>

            {/* Precio y Botones de Acción */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-zinc-800">
              <div>
                <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Precio de Lista al Contado</div>
                <div className="text-2xl sm:text-3xl font-black text-[#fad911]">
                  {formatearSoles(toritoActivo.precio)}
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <a
                  href={urlWA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition-colors shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Consultar plan con asesor</span>
                </a>

                <button
                  onClick={() => abrirCotizadorConMoto(toritoActivo)}
                  className="px-5 py-3 rounded-xl bg-[#fad911] hover:bg-[#fce23e] text-black font-black text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-md shadow-[#fad911]/20 hover:scale-[1.01]"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Simular cuotas en cotizador</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
