import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  MessageSquare, 
  Menu, 
  X, 
  ShoppingBag, 
  MapPin, 
  Compass, 
  Sparkles, 
  Wrench, 
  Calculator, 
  FileText, 
  Award,
  ChevronRight
} from 'lucide-react';

export default function Navbar({ 
  seccionActiva, 
  navegarA, 
  cantidadCarritoRepuestos = 0, 
  abrirCarrito,
  abrirCotizadorGlobal 
}) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [esScrolled, setEsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setEsScrolled(true);
      } else {
        setEsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const itemsNavegacion = [
    { id: 'inicio', etiqueta: 'Inicio' },
    { id: 'catalogo', etiqueta: 'Motos Bajaj' },
    { id: 'estudio360', etiqueta: 'Estudio 360°' },
    { id: 'toritos', etiqueta: 'Toritos & Carga' },
    { id: 'repuestos', etiqueta: 'Repuestos' },
    { id: 'seminuevas', etiqueta: 'Seminuevas' },
    { id: 'cotizador', etiqueta: 'Cotizador' },
    { id: 'tive', etiqueta: 'Trámites TIVe' },
    { id: 'contacto', etiqueta: 'Ubicación' }
  ];

  const handleNavClick = (id) => {
    navegarA(id);
    setMenuAbierto(false);
  };

  return (
    <>
      {/* Top Banner de Atención y Beneficio */}
      <div className="bg-[#101116] border-b border-zinc-800/80 text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-zinc-400">
          <div className="flex items-center space-x-6">
            <span className="flex items-center text-zinc-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#fad911] inline-block mr-2 animate-pulse"></span>
              Concesionario Oficial Bajaj en Tacna, Perú
            </span>
            <span className="flex items-center text-zinc-400">
              <Award className="w-3.5 h-3.5 text-[#fad911] mr-1" />
              1 Año de Garantía y Mano de Obra Gratis
            </span>
          </div>
          <div className="flex items-center space-x-5">
            <a 
              href="https://maps.google.com/?q=-18.0341794,-70.252298" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center hover:text-[#fad911] transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 mr-1 text-[#fad911]" />
              Av. Coronel Mendoza N° 1420
            </a>
            <a 
              href="tel:+51924141939" 
              className="flex items-center hover:text-[#fad911] transition-colors font-semibold text-zinc-200"
            >
              <Phone className="w-3.5 h-3.5 mr-1 text-[#fad911]" />
              +51 924 141 939
            </a>
          </div>
        </div>
      </div>

      {/* Header Principal */}
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          esScrolled 
            ? 'bg-[#0a0a0c]/95 backdrop-blur-md py-3 shadow-xl border-b border-zinc-800/90' 
            : 'bg-[#0a0a0c] py-4 border-b border-zinc-800/50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          
          {/* Logo Lupol Motos */}
          <button 
            onClick={() => handleNavClick('inicio')} 
            className="flex items-center space-x-3 text-left group focus-ring rounded-lg"
          >
            <div className="w-11 h-11 rounded-xl bg-zinc-900 border-2 border-[#fad911] flex items-center justify-center p-1.5 shadow-md shadow-[#fad911]/10 group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                <path d="M25 80L50 20L75 80L50 65L25 80Z" fill="#fad911"/>
                <path d="M50 20L62 50L50 65L38 50L50 20Z" fill="#ffffff" fillOpacity="0.9"/>
                <circle cx="50" cy="50" r="7" fill="#0a0a0c"/>
              </svg>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black tracking-wider text-white flex items-center">
                LUPOL<span className="text-[#fad911] ml-0.5">MOTOS</span>
              </div>
              <p className="text-[10px] tracking-[0.25em] text-zinc-400 font-bold uppercase -mt-1">
                Bajaj Oficial Tacna
              </p>
            </div>
          </button>

          {/* Navegación Desktop */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {itemsNavegacion.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-1.5 rounded-md text-xs xl:text-sm font-semibold transition-all duration-200 ${
                  seccionActiva === item.id
                    ? 'text-black bg-[#fad911] shadow-sm font-bold'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                {item.etiqueta}
              </button>
            ))}
          </nav>

          {/* Acciones del Header */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            
            {/* Botón Carrito de Repuestos */}
            {cantidadCarritoRepuestos > 0 && (
              <button
                onClick={abrirCarrito}
                className="relative p-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 hover:text-[#fad911] hover:border-[#fad911] transition-colors"
                title="Ver lista de cotización de repuestos"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 bg-[#fad911] text-black font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                  {cantidadCarritoRepuestos}
                </span>
              </button>
            )}

            {/* Botón Cotizar Rápido */}
            <button
              onClick={() => handleNavClick('cotizador')}
              className="hidden sm:inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#fad911] hover:bg-[#fce23e] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#fad911]/20 hover:scale-[1.02]"
            >
              <Calculator className="w-4 h-4" />
              <span>Cotizar Moto</span>
            </button>

            {/* Enlace WhatsApp Directo */}
            <a
              href="https://wa.me/51924141939?text=Hola%20Lupol%20Motos,%20deseo%20información%20sobre%20sus%20motos%20y%20repuestos"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm hover:scale-105"
              title="Chatear con un Asesor por WhatsApp"
            >
              <MessageSquare className="w-5 h-5" />
            </a>

            {/* Toggle Mobile */}
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white lg:hidden"
              aria-label="Abrir menú de navegación"
            >
              {menuAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </header>

      {/* Menú Lateral Mobile */}
      {menuAbierto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
            onClick={() => setMenuAbierto(false)} 
          />

          <div className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-[#101116] border-l border-zinc-800 shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto animate-slide-in-right">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-zinc-800">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#fad911] text-black font-black flex items-center justify-center text-base">
                    L
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base">LUPOL MOTOS</h3>
                    <p className="text-[10px] text-zinc-400 font-medium">Tacna - Distribuidor Bajaj</p>
                  </div>
                </div>
                <button 
                  onClick={() => setMenuAbierto(false)}
                  className="p-2 text-zinc-400 hover:text-white rounded-lg bg-zinc-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Enlaces Mobile */}
              <nav className="mt-6 flex flex-col space-y-1">
                {itemsNavegacion.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                      seccionActiva === item.id
                        ? 'bg-[#fad911] text-black font-bold'
                        : 'text-zinc-200 hover:bg-zinc-900 hover:text-white'
                    }`}
                  >
                    <span>{item.etiqueta}</span>
                    <ChevronRight className={`w-4 h-4 ${seccionActiva === item.id ? 'text-black' : 'text-zinc-600'}`} />
                  </button>
                ))}
              </nav>
            </div>

            {/* Footer Mobile */}
            <div className="pt-6 border-t border-zinc-800 space-y-3">
              <button
                onClick={() => handleNavClick('cotizador')}
                className="w-full py-3 rounded-lg bg-[#fad911] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md shadow-[#fad911]/20"
              >
                <Calculator className="w-4 h-4" />
                <span>Simular Cotización</span>
              </button>

              <a
                href="https://wa.me/51924141939?text=Hola%20Lupol%20Motos,%20deseo%20atención%20inmediata"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Asesor por WhatsApp</span>
              </a>

              <div className="text-center pt-2 text-xs text-zinc-500">
                Av. Coronel Mendoza N° 1420, Tacna
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
