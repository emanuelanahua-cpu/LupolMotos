import React, { useState } from 'react';
import { 
  ChevronRight, 
  Sparkles, 
  ShieldCheck, 
  Wrench, 
  Gift, 
  CreditCard, 
  Play, 
  Flame, 
  ArrowUpRight,
  Eye
} from 'lucide-react';
import { formatearSoles } from '../utils/api';

export default function HeroSection({ navegarA, abrirModalMoto }) {
  const [categoriaActiva, setCategoriaActiva] = useState(0);

  const categoriasHero = [
    {
      id: 'motos',
      titulo: 'Motocicletas Bajaj',
      subtitulo: 'Pulsar, Dominar y Boxer de última generación',
      descripcion: 'Tecnología DTS-i, inyección electrónica FI, frenos ABS y máxima potencia para dominar la pista o la ciudad con total eficiencia.',
      imagen: '/multimedia/categorias/2ruedas_static.png',
      modeloDestacado: {
        id: 12,
        nombre: 'Pulsar NS400Z',
        precio: 18500,
        motor: '373.3cc',
        potencia: '39.4 HP',
        tag: '¡NUEVO LANZAMIENTO!'
      },
      ctaTexto: 'Ver Catálogo de Motos',
      accion: () => navegarA('catalogo')
    },
    {
      id: 'toritos',
      titulo: 'Toritos y Pasajeros',
      subtitulo: 'La herramienta #1 de trabajo y rentabilidad en Tacna',
      descripcion: 'Chasis reforzado de alta torsión, cabina ergonómica, mínimo consumo de combustible y repuestos garantizados para tu negocio.',
      imagen: '/multimedia/categorias/torito_static.png',
      modeloDestacado: {
        id: 20,
        nombre: 'Vilchez Full VIP',
        precio: 22300,
        motor: '205cc 4T',
        potencia: '15.0 HP',
        tag: 'MÁXIMO CONFORT'
      },
      ctaTexto: 'Explorar Toritos Bajaj',
      accion: () => navegarA('toritos')
    },
    {
      id: 'carga',
      titulo: 'Vehículos de Carga',
      subtitulo: 'Cargueros resistentes para transporte pesado y logística',
      descripcion: 'Capacidad de carga superior, tolva reforzada y bajo costo de mantenimiento para llevar tu emprendimiento al siguiente nivel.',
      imagen: '/multimedia/categorias/carga_static.png',
      modeloDestacado: {
        id: 18,
        nombre: 'Fiveza GTR 3 Carga',
        precio: 21300,
        motor: '200cc Reforzado',
        potencia: '14.5 HP',
        tag: 'ALTO RENDIMIENTO'
      },
      ctaTexto: 'Ver Modelos de Carga',
      accion: () => navegarA('toritos')
    },
    {
      id: 'repuestos',
      titulo: 'Repuestos Genuinos',
      subtitulo: 'Stock 100% original directo de fábrica Bajaj',
      descripcion: 'Filtros, bujías, kits de arrastre, frenos, pistones, cilindros y accesorios certificados para mantener tu moto como nueva.',
      imagen: '/multimedia/categorias/repuestos_fondo.png',
      modeloDestacado: {
        id: null,
        nombre: 'Kits y Mantenimiento',
        precio: 35,
        motor: 'Genuino Bajaj',
        potencia: '100% Original',
        tag: 'STOCK GARANTIZADO'
      },
      ctaTexto: 'Buscar Repuestos',
      accion: () => navegarA('repuestos')
    }
  ];

  const actual = categoriasHero[categoriaActiva];

  return (
    <section className="relative overflow-hidden bg-[#0a0a0c] border-b border-zinc-800">
      
      {/* Background Decorator */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#fad911]/10 blur-[140px] rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#fad911]/5 blur-[120px] rounded-full"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#222530_1px,transparent_1px)] [background-size:24px_24px] opacity-30"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-16 lg:pt-12 lg:pb-24">
        
        {/* Selector de Categorías en Tabs Superiores */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 mb-8 sm:mb-12 no-scrollbar space-x-2 sm:space-x-3">
          {categoriasHero.map((cat, idx) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaActiva(idx)}
              className={`px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-300 flex items-center space-x-2 border ${
                categoriaActiva === idx
                  ? 'bg-[#fad911] text-black border-[#fad911] shadow-lg shadow-[#fad911]/20 scale-105'
                  : 'bg-[#121318] text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
              }`}
            >
              <span>{cat.titulo}</span>
            </button>
          ))}
        </div>

        {/* Hero Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Columna Izquierda: Información y Propuesta de Valor */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Badge de Confianza */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#181a22] border border-[#fad911]/30 text-[#fad911] text-xs font-extrabold uppercase tracking-wider shadow-inner">
              <Sparkles className="w-4 h-4 text-[#fad911]" />
              <span>Concesionario Lupol Motos Tacna</span>
            </div>

            {/* Título Principal */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
              {actual.titulo.split(' ')[0]} <span className="text-[#fad911]">{actual.titulo.split(' ').slice(1).join(' ')}</span>
            </h1>

            <p className="text-base sm:text-xl font-semibold text-zinc-300">
              {actual.subtitulo}
            </p>

            <p className="text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed">
              {actual.descripcion}
            </p>

            {/* Botones de Acción */}
            <div className="pt-2 flex flex-wrap gap-3 sm:gap-4">
              <button
                onClick={actual.accion}
                className="px-6 py-3.5 rounded-xl bg-[#fad911] hover:bg-[#fce23e] text-black font-extrabold text-sm uppercase tracking-wider flex items-center space-x-2.5 transition-all shadow-lg shadow-[#fad911]/25 hover:scale-[1.02]"
              >
                <span>{actual.ctaTexto}</span>
                <ChevronRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => navegarA('estudio360')}
                className="px-5 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-sm flex items-center space-x-2 transition-all hover:border-[#fad911]/60"
              >
                <Eye className="w-4 h-4 text-[#fad911]" />
                <span>Estudio 360° & Colores</span>
              </button>

              <button
                onClick={() => navegarA('cotizador')}
                className="px-5 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white font-bold text-sm flex items-center space-x-2 transition-all"
              >
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Simular Crédito</span>
              </button>
            </div>

            {/* Micro-beneficios con iconos */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-zinc-800/80">
              <div className="flex items-center space-x-2 text-xs text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-[#fad911] shrink-0" />
                <span>1 Año Garantía</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-zinc-300">
                <Wrench className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Mano de Obra Gratis</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-zinc-300">
                <Gift className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Casco de Regalo</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-zinc-300">
                <CreditCard className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Crédito Inmediato</span>
              </div>
            </div>

          </div>

          {/* Columna Derecha: Showcase Visual con Modelo Destacado */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl bg-gradient-to-b from-[#181a22] to-[#0e1015] border border-zinc-800 p-5 sm:p-7 shadow-2xl overflow-hidden group transition-all duration-300 hover:border-zinc-700">
              
              {/* Resplandor decorativo */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#fad911]/15 blur-3xl rounded-full pointer-events-none"></div>

              {/* Tag del Modelo */}
              <div className="flex justify-between items-center mb-4">
                <span className="px-3 py-1 rounded-full bg-[#fad911] text-black font-black text-[11px] uppercase tracking-wider flex items-center space-x-1 shadow-sm">
                  <Flame className="w-3.5 h-3.5 mr-1" />
                  {actual.modeloDestacado.tag}
                </span>
                <span className="text-xs font-bold text-zinc-400">Tacna, PE</span>
              </div>

              {/* Imagen Principal de la Categoría */}
              <div className="relative h-64 sm:h-72 w-full flex items-center justify-center my-2 overflow-hidden rounded-2xl bg-black/40 border border-zinc-800/60">
                <img
                  key={actual.id}
                  src={actual.imagen}
                  alt={actual.titulo}
                  className="max-h-full max-w-full object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)] animate-fade-in-scale"
                  onError={(e) => {
                    e.target.src = '/multimedia/pulsar_ns400Z/moto.webp';
                  }}
                />
              </div>

              {/* Ficha Flotante del Modelo Destacado */}
              <div className="mt-4 pt-4 border-t border-zinc-800/90 flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-black text-white">{actual.modeloDestacado.nombre}</h4>
                  <div className="flex items-center space-x-3 text-xs text-zinc-400 mt-0.5">
                    <span>Motor: <strong className="text-zinc-200">{actual.modeloDestacado.motor}</strong></span>
                    <span>•</span>
                    <span>Potencia: <strong className="text-zinc-200">{actual.modeloDestacado.potencia}</strong></span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-zinc-400">Desde</div>
                  <div className="text-xl font-black text-[#fad911]">
                    {formatearSoles(actual.modeloDestacado.precio)}
                  </div>
                </div>
              </div>

              {/* CTA rápido para ver detalles si es moto */}
              {actual.modeloDestacado.id && (
                <button
                  onClick={() => abrirModalMoto(actual.modeloDestacado.id)}
                  className="mt-4 w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-[#fad911] text-zinc-200 hover:text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all"
                >
                  <span>Ver Ficha Técnica y Cotizar</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              )}

            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
