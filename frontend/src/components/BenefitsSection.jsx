import React from 'react';
import { 
  ShieldCheck, 
  Wrench, 
  Gift, 
  CreditCard, 
  FileCheck, 
  PackageCheck,
  CheckCircle,
  Sparkles
} from 'lucide-react';

export default function BenefitsSection() {
  const beneficios = [
    {
      icono: ShieldCheck,
      titulo: 'Garantía Oficial Bajaj',
      subtitulo: '1 Año o 20,000 km',
      descripcion: 'Respaldo directo del fabricante para motor y componentes esenciales con total tranquilidad.',
      accentColor: 'text-[#fad911]',
      bgColor: 'bg-[#fad911]/10 border-[#fad911]/25',
      badgeBg: 'text-[#fad911] bg-[#fad911]/10 border-[#fad911]/20'
    },
    {
      icono: Wrench,
      titulo: 'Mano de Obra Gratis',
      subtitulo: 'Hasta los 5,000 km',
      descripcion: 'Taller mecánico autorizado en Tacna con técnicos certificados por Bajaj Perú.',
      accentColor: 'text-sky-400',
      bgColor: 'bg-sky-500/10 border-sky-500/25',
      badgeBg: 'text-sky-400 bg-sky-500/10 border-sky-500/20'
    },
    {
      icono: Gift,
      titulo: 'Casco de Regalo',
      subtitulo: 'Certificado DOT/ECE',
      descripcion: 'Te llevas un casco de alta seguridad homologado totalmente gratis por la compra de tu moto.',
      accentColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/25',
      badgeBg: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    },
    {
      icono: CreditCard,
      titulo: 'Financiamiento Inmediato',
      subtitulo: 'Solo con tu DNI',
      descripcion: 'Planes a medida con cuotas fijas en Soles y pre-aprobación en menos de 2 horas en tienda.',
      accentColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/25',
      badgeBg: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      icono: FileCheck,
      titulo: 'Placa y Tarjeta TIVe',
      subtitulo: 'Entrega Rápida',
      descripcion: 'Nos encargamos de toda la gestión notarial y registral SUNARP para que manejes seguro.',
      accentColor: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10 border-indigo-500/25',
      badgeBg: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
    },
    {
      icono: PackageCheck,
      titulo: 'Repuestos Genuinos',
      subtitulo: '100% de Fábrica',
      descripcion: 'Inventario permanente de piezas y accesorios originales para máxima durabilidad.',
      accentColor: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10 border-yellow-500/25',
      badgeBg: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
    }
  ];

  return (
    <section id="beneficios" className="py-16 sm:py-24 bg-[#0a0a0c] border-b border-zinc-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#181a22] border border-[#fad911]/30 text-[#fad911] text-xs font-bold uppercase tracking-wider mb-3 shadow-inner">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Valor Agregado Lupol</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            ¿POR QUÉ ELEGIR <span className="text-[#fad911]">LUPOL MOTOS?</span>
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base mt-2">
            Más de 10 años de experiencia brindando confianza, asesoría personalizada y respaldo técnico oficial en Tacna.
          </p>
        </div>

        {/* Grid de Beneficios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {beneficios.map((b, idx) => {
            const Icono = b.icono;
            return (
              <div
                key={idx}
                className="rounded-3xl bg-[#121318] border border-zinc-800/90 p-6 sm:p-8 product-card-glow space-y-4 relative group hover:border-zinc-700"
              >
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${b.bgColor} ${b.accentColor}`}>
                  <Icono className="w-6 h-6" />
                </div>

                <div>
                  <div className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border mb-2 ${b.badgeBg}`}>
                    {b.subtitulo}
                  </div>
                  <h3 className="text-xl font-black text-white">
                    {b.titulo}
                  </h3>
                  <p className="text-zinc-400 text-xs sm:text-sm mt-2 leading-relaxed">
                    {b.descripcion}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
