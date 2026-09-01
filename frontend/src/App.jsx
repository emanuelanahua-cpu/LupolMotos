import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import Visualizer3D from './components/Visualizer3D';
import MotosCatalog from './components/MotosCatalog';
import MotoDetailModal from './components/MotoDetailModal';
import ToritosSection from './components/ToritosSection';
import RepuestosCatalog from './components/RepuestosCatalog';
import CartDrawer from './components/CartDrawer';
import SeminuevasSection from './components/SeminuevasSection';
import CotizadorSimulador from './components/CotizadorSimulador';
import TIVeSection from './components/TIVeSection';
import BenefitsSection from './components/BenefitsSection';
import StoreInfoSection from './components/StoreInfoSection';
import Footer from './components/Footer';
import ModalReserva from './components/ModalReserva';

import { 
  obtenerInformacionTienda, 
  obtenerCatalogoMotos, 
  obtenerToritos, 
  obtenerRepuestos, 
  obtenerSeminuevas 
} from './utils/api';
import { MessageSquare, ArrowUp, Sparkles, Phone } from 'lucide-react';

export default function App() {
  const [seccionActiva, setSeccionActiva] = useState('inicio');
  const [tiendaInfo, setTiendaInfo] = useState(null);
  const [motos, setMotos] = useState([]);
  const [toritos, setToritos] = useState([]);
  const [repuestos, setRepuestos] = useState([]);
  const [seminuevas, setSeminuevas] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados de modales y carrito
  const [modalMotoId, setModalMotoId] = useState(null);
  const [modalReservaMoto, setModalReservaMoto] = useState(null);
  const [motoParaCotizador, setMotoParaCotizador] = useState(null);
  const [carritoRepuestos, setCarritoRepuestos] = useState([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [mostrarBotonArriba, setMostrarBotonArriba] = useState(false);

  // Carga inicial de datos desde API (con fallback local transparente)
  useEffect(() => {
    async function cargarTodo() {
      setCargando(true);
      try {
        const [info, listMotos, listToritos, listRepuestos, listSeminuevas] = await Promise.all([
          obtenerInformacionTienda(),
          obtenerCatalogoMotos(),
          obtenerToritos(),
          obtenerRepuestos(),
          obtenerSeminuevas()
        ]);
        setTiendaInfo(info);
        setMotos(listMotos);
        setToritos(listToritos);
        setRepuestos(listRepuestos);
        setSeminuevas(listSeminuevas);
      } catch (error) {
        console.error('Error al inicializar datos:', error);
      } finally {
        setCargando(false);
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

  // Navegar a una sección suavemente
  const navegarA = (idSeccion) => {
    setSeccionActiva(idSeccion);
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

  // Manejo del carrito de repuestos
  const agregarAlCarrito = (repuesto, delta = 1) => {
    setCarritoRepuestos((prev) => {
      const existe = prev.find(item => item.id === repuesto.id);
      if (existe) {
        const nuevaCantidad = existe.cantidad + delta;
        if (nuevaCantidad <= 0) {
          return prev.filter(item => item.id !== repuesto.id);
        }
        return prev.map(item => item.id === repuesto.id ? { ...item, cantidad: nuevaCantidad } : item);
      } else if (delta > 0) {
        return [...prev, { ...repuesto, cantidad: delta }];
      }
      return prev;
    });
  };

  const vaciarCarrito = () => {
    setCarritoRepuestos([]);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 flex flex-col selection:bg-[#fad911] selection:text-black">
      
      {/* Barra de Navegación Principal */}
      <Navbar
        seccionActiva={seccionActiva}
        navegarA={navegarA}
        cantidadCarritoRepuestos={carritoRepuestos.reduce((acc, i) => acc + i.cantidad, 0)}
        abrirCarrito={() => setCarritoAbierto(true)}
      />

      {/* Contenido Principal */}
      <main className="flex-1">
        
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
        />

        {/* 4. Toritos & Mototaxis de Pasajeros y Carga */}
        <ToritosSection 
          toritos={toritos} 
          abrirModalMoto={abrirModalMoto} 
          abrirCotizadorConMoto={abrirCotizadorConMoto} 
        />

        {/* 5. Catálogo de Repuestos Originales */}
        <RepuestosCatalog 
          repuestos={repuestos} 
          agregarAlCarrito={agregarAlCarrito} 
          carrito={carritoRepuestos} 
          abrirCarrito={() => setCarritoAbierto(true)} 
        />

        {/* 6. Motos Seminuevas */}
        <SeminuevasSection 
          seminuevas={seminuevas} 
        />

        {/* 7. Simulador de Cotización y Crédito */}
        <CotizadorSimulador 
          motos={motos} 
          motoPreseleccionada={motoParaCotizador} 
        />

        {/* 8. Trámites TIVe SUNARP */}
        <TIVeSection />

        {/* 9. Beneficios Exclusivos */}
        <BenefitsSection />

        {/* 10. Ubicación, Horarios y Contacto */}
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
          abrirModalReserva={(moto) => setModalReservaMoto(moto)}
        />
      )}

      {/* Modal de Reserva */}
      {modalReservaMoto && (
        <ModalReserva
          moto={modalReservaMoto}
          alCerrar={() => setModalReservaMoto(null)}
        />
      )}

      {/* Drawer del Carrito de Repuestos */}
      <CartDrawer
        abierto={carritoAbierto}
        alCerrar={() => setCarritoAbierto(false)}
        carrito={carritoRepuestos}
        actualizarCantidad={(id, delta) => {
          const item = carritoRepuestos.find(i => i.id === id);
          if (item) agregarAlCarrito(item, delta);
        }}
        vaciarCarrito={vaciarCarrito}
      />

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
          href="https://wa.me/51924141939?text=Hola%20Lupol%20Motos,%20deseo%20atención%20inmediata%20en%20Tacna"
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
