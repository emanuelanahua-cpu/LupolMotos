import React from 'react';
import { 
  Phone, 
  MapPin, 
  Mail, 
  ShieldCheck, 
  MessageSquare, 
  ChevronRight,
  ExternalLink,
  Award
} from 'lucide-react';

export default function Footer({ navegarA }) {
  return (
    <footer className="bg-[#070709] border-t border-zinc-800 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-zinc-800/80">
          
          {/* Columna 1: Marca y Razón Social */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-[#fad911] flex items-center justify-center p-1">
                <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                  <path d="M25 80L50 20L75 80L50 65L25 80Z" fill="#fad911"/>
                  <path d="M50 20L62 50L50 65L38 50L50 20Z" fill="#ffffff" fillOpacity="0.9"/>
                  <circle cx="50" cy="50" r="7" fill="#0a0a0c"/>
                </svg>
              </div>
              <div>
                <div className="text-xl font-black text-white tracking-wider">
                  LUPOL<span className="text-[#fad911]">MOTOS</span>
                </div>
                <div className="text-[9px] tracking-[0.2em] text-zinc-500 font-bold uppercase">
                  Concesionario Oficial Bajaj
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              LUPOL MOTOS S.A.C. — Concesionario autorizado de motocicletas Bajaj, toritos de pasajeros y carga, repuestos legítimos garantizados y taller mecánico especializado en Tacna, Perú.
            </p>

            <div className="text-zinc-500 text-[11px]">
              <strong>RUC:</strong> 20608912345 | <strong>Tacna - Perú</strong>
            </div>
          </div>

          {/* Columna 2: Modelos Populares */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white uppercase text-xs tracking-wider text-[#fad911]">
              Motos Bajaj
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => navegarA('catalogo')} className="hover:text-white transition-colors">
                  Pulsar NS400Z (Nuevo)
                </button>
              </li>
              <li>
                <button onClick={() => navegarA('catalogo')} className="hover:text-white transition-colors">
                  Dominar 400 & 250
                </button>
              </li>
              <li>
                <button onClick={() => navegarA('catalogo')} className="hover:text-white transition-colors">
                  Pulsar NS200 & N250
                </button>
              </li>
              <li>
                <button onClick={() => navegarA('catalogo')} className="hover:text-white transition-colors">
                  Pulsar N160 & N125
                </button>
              </li>
              <li>
                <button onClick={() => navegarA('catalogo')} className="hover:text-white transition-colors">
                  Boxer 150X & CT 125
                </button>
              </li>
            </ul>
          </div>

          {/* Columna 3: Toritos & Repuestos */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white uppercase text-xs tracking-wider text-[#fad911]">
              Toritos & Repuestos
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => navegarA('toritos')} className="hover:text-white transition-colors">
                  Vilchez Full VIP
                </button>
              </li>
              <li>
                <button onClick={() => navegarA('toritos')} className="hover:text-white transition-colors">
                  Fiveza GTR 3 & GTR 2
                </button>
              </li>
              <li>
                <button onClick={() => navegarA('repuestos')} className="hover:text-white transition-colors">
                  Filtros y Aceites Bajaj
                </button>
              </li>
              <li>
                <button onClick={() => navegarA('repuestos')} className="hover:text-white transition-colors">
                  Kits de Arrastre y Frenos
                </button>
              </li>
              <li>
                <button onClick={() => navegarA('seminuevas')} className="hover:text-white transition-colors">
                  Motos Seminuevas
                </button>
              </li>
            </ul>
          </div>

          {/* Columna 4: Trámites y Contacto */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white uppercase text-xs tracking-wider text-[#fad911]">
              Atención en Tacna
            </h4>
            <ul className="space-y-2.5">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-[#fad911] shrink-0 mt-0.5" />
                <span>Av. Coronel Mendoza N° 1420</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#fad911] shrink-0" />
                <span>+51 924 141 939 / (052) 425160</span>
              </li>
              <li>
                <button onClick={() => navegarA('tive')} className="text-zinc-300 hover:text-[#fad911] font-bold flex items-center">
                  <span>Trámites TIVe SUNARP</span>
                  <ChevronRight className="w-3 h-3 ml-1" />
                </button>
              </li>
              <li>
                <button onClick={() => navegarA('cotizador')} className="text-zinc-300 hover:text-[#fad911] font-bold flex items-center">
                  <span>Simulador de Crédito</span>
                  <ChevronRight className="w-3 h-3 ml-1" />
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-[11px] text-zinc-500 gap-4">
          <div>
            © {new Date().getFullYear()} <strong className="text-zinc-300">LUPOL MOTOS S.A.C.</strong> Todos los derechos reservados. Tacna, Perú.
          </div>

          <div className="flex space-x-6">
            <span>Términos y Condiciones</span>
            <span>Política de Privacidad</span>
            <span>Libro de Reclamaciones</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
