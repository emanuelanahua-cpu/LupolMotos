import React from 'react';
import { 
  FileText, 
  CheckCircle2, 
  MessageSquare, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function TIVeSection() {
  const urlWA = "https://wa.me/51924141939?text=Hola%20Lupol%20Motos,%20deseo%20consultar%20sobre%20el%20duplicado%20o%20gesti%C3%B3n%20de%20mi%20Tarjeta%20de%20Identificaci%C3%B3n%20Vehicular%20Electr%C3%B3nica%20(TIVe)";

  return (
    <section id="tive" className="py-16 sm:py-24 bg-[#0d0e12] border-b border-zinc-800 relative overflow-hidden">
      
      {/* Background Decorators */}
      <div className="absolute top-1/2 left-0 w-[400px] h-[300px] bg-[#fad911]/5 blur-[140px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        <div className="bg-gradient-to-br from-[#181a22] to-[#101116] border border-zinc-800 rounded-3xl p-6 sm:p-12 shadow-2xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Lado Izquierdo: Mano sosteniendo celular / Tarjeta */}
            <div className="lg:col-span-5 flex items-center justify-center relative">
              <div className="relative w-full max-w-sm flex items-center justify-center p-4">
                <img
                  src="/multimedia/solicitud_tarjeta/mano.png"
                  alt="Gestión TIVe en celular"
                  className="max-h-[320px] sm:max-h-[400px] object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)]"
                  onError={(e) => {
                    e.target.src = '/multimedia/informacion.png';
                  }}
                />
              </div>
            </div>

            {/* Lado Derecho: Contenido y CTA */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-900 border border-[#fad911]/30 text-[#fad911] text-xs font-bold uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5" />
                <span>Trámites SUNARP y Documentación</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                ¿PROBLEMAS CON TU <span className="text-[#fad911]">DOCUMENTACIÓN VEHICULAR?</span>
              </h2>

              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                En <strong className="text-white">Lupol Motos Tacna</strong> te asesoramos y ayudamos a gestionar u obtener el duplicado de tu <strong className="text-[#fad911]">Tarjeta de Identificación Vehicular Electrónica (TIVe)</strong> de forma rápida, segura y sin complicaciones.
              </p>

              {/* Beneficios del Servicio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-[#fad911] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Duplicado Digital Oficial</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Obtén tu tarjeta con código QR oficial de SUNARP.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-[#fad911] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Atención Rápida</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Sin largas colas ni pérdidas de tiempo.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-start space-x-3">
                  <ShieldCheck className="w-5 h-5 text-[#fad911] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Gestión 100% Legal</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Directo en la plataforma registral.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-start space-x-3">
                  <Sparkles className="w-5 h-5 text-[#fad911] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Para Todo Tipo de Moto</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Lineales, toritos y cargueros.</p>
                  </div>
                </div>
              </div>

              {/* Botón WhatsApp */}
              <div className="pt-2">
                <a
                  href={urlWA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2.5 px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg hover:scale-[1.02]"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Consultar con un Asesor TIVe por WhatsApp</span>
                </a>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
