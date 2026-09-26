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
  const urlWA = "https://wa.me/51980687475?text=Hola%20Lupol%20Motos,%20deseo%20consultar%20sobre%20el%20duplicado%20o%20gesti%C3%B3n%20de%20mi%20Tarjeta%20de%20Identificaci%C3%B3n%20Vehicular%20Electr%C3%B3nica%20(TIVe)";

  return (
    <section id="tive" className="py-16 sm:py-24 bg-[#0d0e12] border-b border-zinc-800 relative overflow-hidden">
      
      {/* Background Decorators */}
      <div className="absolute top-1/2 left-0 w-[400px] h-[300px] bg-[#fad911]/5 blur-[140px] rounded-full pointer-events-none"></div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 relative z-10">
        
        <div className="bg-gradient-to-br from-[#181a22] to-[#101116] border border-zinc-800 rounded-3xl p-6 sm:p-12 shadow-2xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Lado Izquierdo: Mano sosteniendo celular / Tarjeta */}
            <div className="lg:col-span-5 flex items-center justify-center relative">
              <div className="relative w-full max-w-sm flex items-center justify-center p-4">
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
