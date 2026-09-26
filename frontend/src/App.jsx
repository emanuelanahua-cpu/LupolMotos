import React, { useState, useEffect } from 'react';
import HeroSection from './components/HeroSection';
import Visualizer3D from './components/Visualizer3D';
import MotosCatalog from './components/MotosCatalog';
import MotoDetailModal from './components/MotoDetailModal';
import CotizadorSimulador from './components/CotizadorSimulador';
import BenefitsSection from './components/BenefitsSection';
import StoreInfoSection from './components/StoreInfoSection';
import TIVeSection from './components/TIVeSection';
import SolicitudTarjeta from './components/SolicitudTarjeta';
import Footer from './components/Footer';

import { 
  obtenerInformacionTienda, 
  obtenerCatalogoMotos
} from './utils/api';
import { MessageSquare, ArrowUp } from 'lucide-react';

export default function App() {
  const [motos, setMotos] = useState([]);

  // Estados de modales y carrito
  const [modalMotoId, setModalMotoId] = useState(null);
  const [motoParaCotizador, setMotoParaCotizador] = useState(null);
  const [mostrarBotonArriba, setMostrarBotonArriba] = useState(false);
  const [categoriaCatalogo, setCategoriaCatalogo] = useState('Todas');

  // Carga inicial de datos desde API (con fallback local transparente)
  useEffect(() => {
    async function cargarTodo() {
      try {
        const [, listMotos] = await Promise.all([
          obtenerInformacionTienda(),
          obtenerCatalogoMotos()
        ]);
        setMotos(listMotos);
      } catch (error) {
        console.error('Error al inicializar datos:', error);
      }
    }
    cargarTodo();
  }, []);

  // Control de scroll para botón flotante
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setMostrarBotonArriba(true);
      } else {
        setMostrarBotonArriba(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navegar a una sección suavemente, opcionalmente preseleccionando categoría en el catálogo
  const navegarA = (idSeccion, categoria) => {
    if (idSeccion === 'catalogo' && categoria) {
      setCategoriaCatalogo(categoria);
    }
    const elemento = document.getElementById(idSeccion);
    if (elemento) {
      elemento.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Abrir modal con moto
  const abrirModalMoto = (id) => {
    setModalMotoId(id);
  };

  // Abrir cotizador con moto preseleccionada
  const abrirCotizadorConMoto = (moto) => {
    setMotoParaCotizador(moto);
    navegarA('cotizador');
  };


  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 flex flex-col selection:bg-[#fad911] selection:text-black">

      {/* Contenido Principal */}
      <main>

        {/* 1. Hero Section con selector dinámico */}
        <div id="inicio">
          <HeroSection 
            navegarA={navegarA} 
            abrirModalMoto={abrirModalMoto} 
          />
        </div>

        {/* 2. Estudio 360° y Selector de Colores */}
        <Visualizer3D 
          motos={motos} 
          abrirModalMoto={abrirModalMoto} 
          navegarA={navegarA} 
        />

        {/* 3. Catálogo de Motos Lineales */}
        <MotosCatalog 
          motos={motos} 
          abrirModalMoto={abrirModalMoto} 
          abrirCotizadorConMoto={abrirCotizadorConMoto} 
          categoriaInicial={categoriaCatalogo}
        />  

        {/* 7. Simulador de Cotización y Crédito */}
        <CotizadorSimulador 
          motos={motos} 
          motoPreseleccionada={motoParaCotizador} 
        />

        {/* 9. Beneficios Exclusivos */}
        <BenefitsSection />

        {/* 10. Trámites TIVe */}
        <TIVeSection />

        {/* 11. Solicitud de Tarjeta */}
        <SolicitudTarjeta />

        {/* 12. Ubicación, Horarios y Contacto */}
        <StoreInfoSection />

      </main>

      {/* Pie de Página */}
      <Footer navegarA={navegarA} />

      {/* Modal de Detalle de Moto */}
      {modalMotoId && (
        <MotoDetailModal
          motoId={modalMotoId}
          motos={motos}
          alCerrar={() => setModalMotoId(null)}
        />
      )}

      {/* Botón Flotante WhatsApp */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end space-y-3">
        {mostrarBotonArriba && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="p-3 rounded-full bg-zinc-900/90 border border-zinc-700 text-zinc-300 hover:text-white hover:border-[#fad911] shadow-lg transition-all"
            aria-label="Volver arriba"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}

        <a
          href="https://wa.me/51980687475?text=Hola%20Lupol%20Motos,%20deseo%20atención%20inmediata%20en%20Tacna"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center space-x-2.5 px-4 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-2xl shadow-emerald-950/80 hover:scale-105 transition-all"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="hidden sm:inline">WhatsApp Lupol</span>
        </a>
      </div>

    </div>
  );
}
