import {ProveedorCarrito,useCarrito} from '../context/ContextoCarrito';
import CarritoLateral from '../components/CarritoLateral';
import {useNavigate} from 'react-router-dom';
import {obtenerSesion} from '../services/adminService';
import React, { useState, useEffect } from 'react';
import PortadaInicio from '../components/PortadaInicio';
import CarruselProximas from '../components/CarruselProximas';
import GaleriaColores from '../components/GaleriaColores';
import CatalogoMotos from '../components/CatalogoMotos';
import SeccionAccesorios from '../components/SeccionAccesorios';
import FichaTecnicaMoto from '../components/FichaTecnicaMoto';
import CotizadorCredito from '../components/CotizadorCredito';
import SeccionBeneficios from '../components/SeccionBeneficios';
import SeccionContacto from '../components/SeccionContacto';
import SeccionSoat from '../components/SeccionSoat';
import SolicitudTarjetaCredito from '../components/SolicitudTarjetaCredito';
import PiePagina from '../components/PiePagina';
import BarraNavegacion from '../components/BarraNavegacion';

import { obtenerCatalogoMotos } from '../services/catalogoService';
import { MessageSquare, ArrowUp, ShoppingCart } from 'lucide-react';

export default function PaginaTienda() { return <ProveedorCarrito><TiendaContenido/></ProveedorCarrito>; }
function TiendaContenido() {
  const cart=useCarrito();
  const [motos, setMotos] = useState([]);

  const navigate = useNavigate();
  const [usuarioSesion, setUsuarioSesion] = useState(null);
  useEffect(() => {
    let active = true;
    obtenerSesion().then(u => { if (active) setUsuarioSesion(u.usuario); }).catch(() => {});
    return () => { active = false; };
  }, []);
  const abrirLogin = () => { navigate(usuarioSesion ? '/admin' : '/login'); window.scrollTo(0, 0); };

  // Estados de modales y carrito
  const [modalMotoId, setModalMotoId] = useState(null);
  const [motoParaCotizador, setMotoParaCotizador] = useState(null);
  const [mostrarBotonArriba, setMostrarBotonArriba] = useState(false);
  const [categoriaCatalogo, setCategoriaCatalogo] = useState('Todas');
  const [catalogoNonce, setCatalogoNonce] = useState(0);

  // El catálogo se muestra en cuanto responde su consulta, sin esperar datos generales que esta vista no usa.
  useEffect(() => {
    let activo = true;
    async function cargarTodo() {
      try {
        const listMotos = await obtenerCatalogoMotos();
        if (activo) setMotos(listMotos);
      } catch (error) {
        console.error('Error al inicializar datos:', error);
      }
    }
    cargarTodo();
    return () => { activo = false; };
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
      setCatalogoNonce(nonce => nonce + 1);
    }
    const elemento = document.getElementById(idSeccion);
    if (elemento) {
      if (idSeccion === 'inicio') {
        const altoMenu = document.querySelector('header')?.getBoundingClientRect().height || 0;
        const destino = window.scrollY + elemento.getBoundingClientRect().top - altoMenu;
        window.scrollTo({ top: Math.max(0, destino), behavior: 'smooth' });
      } else {
        elemento.scrollIntoView({ behavior: 'smooth' });
      }
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
    <div className="public-site min-h-screen bg-[#0a0a0c] text-zinc-100 flex flex-col selection:bg-[#fad911] selection:text-black">

      {/* Encabezado con botón Iniciar sesión */}
      <BarraNavegacion navegarA={navegarA} abrirLogin={abrirLogin} usuarioSesion={usuarioSesion} />

      {/* Contenido Principal */}
      <main>

        {/* Carrusel principal y presentación de la tienda */}
        <div>
          <CarruselProximas motos={motos} abrirModalMoto={abrirModalMoto} />
          <PortadaInicio 
            navegarA={navegarA} 
            abrirModalMoto={abrirModalMoto} 
          />
        </div>

        {/* 2. Galería de Colores */}
        <GaleriaColores 
          motos={motos} 
          abrirModalMoto={abrirModalMoto} 
          navegarA={navegarA} 
        />

        {/* 3. Catálogo de Motos Lineales */}
        <CatalogoMotos 
          motos={motos} 
          abrirModalMoto={abrirModalMoto} 
          abrirCotizadorConMoto={abrirCotizadorConMoto} 
          categoriaInicial={categoriaCatalogo}
          categoriaNonce={catalogoNonce}
        />  

        {/* 4. Accesorios */}
        <SeccionAccesorios />

        {/* 7. Simulador de Cotización y Crédito */}
        <CotizadorCredito 
          motos={motos} 
          motoPreseleccionada={motoParaCotizador} 
        />

        {/* 9. Beneficios Exclusivos */}
        <SeccionBeneficios />

        {/* SOAT y trámites vehiculares */}
        <SeccionSoat />

        {/* 11. Solicitud de Tarjeta */}
        <SolicitudTarjetaCredito />

        {/* 12. Ubicación, Horarios y Contacto */}
        <SeccionContacto />

      </main>

      {/* Pie de Página */}
      <PiePagina navegarA={navegarA} abrirAdmin={abrirLogin} />

      {/* Modal de Detalle de Moto */}
      {modalMotoId && (
        <FichaTecnicaMoto
          motoId={modalMotoId}
          motos={motos}
          alCerrar={() => setModalMotoId(null)}
        />
      )}

      <CarritoLateral/>
      {/* Botón Flotante WhatsApp */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end space-y-3">
        <button onClick={()=>cart.setAbierto(true)} className="relative flex items-center justify-center rounded-full bg-[#fad911] p-3.5 font-bold text-black shadow-xl transition-transform hover:scale-105 active:scale-95" aria-label="Abrir carrito de compras" title="Abrir carrito de compras"><ShoppingCart className="h-6 w-6" />{cart.items.reduce((n,i)=>n+i.cantidad,0) > 0 && (<span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[11px] font-black text-[#fad911]">{cart.items.reduce((n,i)=>n+i.cantidad,0)}</span>)}</button>
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
