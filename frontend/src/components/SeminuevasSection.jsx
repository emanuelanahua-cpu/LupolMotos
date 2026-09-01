import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  Gauge, 
  ShieldCheck, 
  MessageSquare, 
  ArrowRight,
  FileCheck
} from 'lucide-react';
import { formatearSoles } from '../utils/api';

export default function SeminuevasSection({ seminuevas = [] }) {
  const motosSeminuevas = seminuevas.length > 0 ? seminuevas : [
    {
      id: 1,
      marca: 'Honda',
      modelo: 'CB 250 TWISTER',
      tipo: 'Sport / Ciudad',
      precio: 9800.0,
      anio: 2023,
      kilometraje: 35000,
      estado_conservacion: 'Excelente',
      detalle: 'Moto de uso personal y diario en Tacna. Motor estándar muy bien cuidado con cambios de aceite al día. Incluye protector de tanque, pastillas de freno nuevas y llantas a media vida. Documentación 100% limpia sin papeletas, lista para transferencia notarial.',
      imagenes: [
        '/multimedia/segunda_mano/honda_cb_250_twister_1/1.webp',
        '/multimedia/segunda_mano/honda_cb_250_twister_1/2.webp'
      ]
    },
    {
      id: 2,
      marca: 'Yamaha',
      modelo: 'FZ 3.0 FI ABS',
      tipo: 'Naked / Urbana',
      precio: 10500.0,
      anio: 2023,
      kilometraje: 9500,
      estado_conservacion: 'Seminuevo Impecable',
      detalle: 'Yamaha FZ Version 3.0 con inyección electrónica y freno ABS delantero. Poco kilometraje (9,500 km), único dueño, mantenimientos en taller autorizado y SOAT vigente.',
      imagenes: [
        '/multimedia/segunda_mano/yamaha_fz_3_0_abs_2/1.webp',
        '/multimedia/segunda_mano/yamaha_fz_3_0_abs_2/2.webp'
      ]
    }
  ];

  return (
    <section id="seminuevas" className="py-16 sm:py-24 bg-[#0d0e12] border-b border-zinc-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#181a22] border border-[#fad911]/30 text-[#fad911] text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Motos Seminuevas Inspeccionadas</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            MOTOS DE <span className="text-[#fad911]">SEGUNDA MANO</span>
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base mt-2">
            Unidades verificadas mecánicamente con documentación en regla y listas para transferencia inmediata en Tacna.
          </p>
        </div>

        {/* Grid de Seminuevas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {motosSeminuevas.map((moto) => {
            const msgWA = `Hola Lupol Motos, estoy interesado en la moto de segunda mano *${moto.marca} ${moto.modelo}* (Año: ${moto.anio}, Precio: S/. ${moto.precio.toLocaleString('es-PE')}). ¿Se puede ver en tienda?`;
            const urlWA = `https://wa.me/51924141939?text=${encodeURIComponent(msgWA)}`;

            return (
              <div
                key={moto.id}
                className="rounded-3xl bg-[#121318] border border-zinc-800 overflow-hidden shadow-xl product-card-glow flex flex-col justify-between"
              >
                <div>
                  {/* Foto de la Moto */}
                  <div className="relative h-60 sm:h-72 w-full bg-black/60 p-4 flex items-center justify-center overflow-hidden">
                    <img
                      src={moto.imagenes && moto.imagenes[0] ? moto.imagenes[0] : '/multimedia/segunda_mano.webp'}
                      alt={moto.modelo}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain filter drop-shadow-xl"
                      onError={(e) => {
                        e.target.src = '/multimedia/segunda_mano.webp';
                      }}
                    />

                    <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg border border-zinc-700 text-xs font-bold text-zinc-200">
                      {moto.marca}
                    </div>

                    <div className="absolute top-4 right-4 bg-[#fad911] text-black px-3 py-1 rounded-lg font-black text-xs uppercase">
                      {moto.estado_conservacion}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-6 sm:p-8 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-white">{moto.modelo}</h3>
                        <p className="text-xs text-zinc-400 mt-0.5">{moto.tipo}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-zinc-500 block">Precio Final</span>
                        <div className="text-2xl font-black text-[#fad911]">
                          {formatearSoles(moto.precio)}
                        </div>
                      </div>
                    </div>

                    {/* Ficha Rápida */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-center">
                      <div>
                        <span className="text-zinc-500 text-[10px] uppercase font-bold flex items-center justify-center">
                          <Calendar className="w-3 h-3 mr-1 text-[#fad911]" /> Año
                        </span>
                        <div className="font-bold text-zinc-200 mt-0.5">{moto.anio}</div>
                      </div>
                      <div>
                        <span className="text-zinc-500 text-[10px] uppercase font-bold flex items-center justify-center">
                          <Gauge className="w-3 h-3 mr-1 text-[#fad911]" /> Km
                        </span>
                        <div className="font-bold text-zinc-200 mt-0.5">{moto.kilometraje.toLocaleString()} km</div>
                      </div>
                      <div>
                        <span className="text-zinc-500 text-[10px] uppercase font-bold flex items-center justify-center">
                          <FileCheck className="w-3 h-3 mr-1 text-[#fad911]" /> Papeles
                        </span>
                        <div className="font-bold text-emerald-400 mt-0.5">Al Día</div>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                      {moto.detalle}
                    </p>
                  </div>
                </div>

                {/* Acciones */}
                <div className="p-6 sm:p-8 pt-0">
                  <a
                    href={urlWA}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors shadow-md"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Consultar por WhatsApp / Probar en Tienda</span>
                  </a>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
