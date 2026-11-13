import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import PaginaTienda from './pages/PaginaTienda';
import { ProveedorTema } from './context/ContextoTema';
import { lazy, Suspense, useEffect } from 'react';

const PaginaAdmin = lazy(() => import('./pages/PaginaAdmin'));
const cargandoPanel = <div role="status" className="flex min-h-screen items-center justify-center bg-[#0a0a0c] text-[#fad911]">Cargando panel…</div>;

export default function App() {
  // Bloquear Ctrl + U para prevenir ver código fuente
  useEffect(() => {
    const bloquearTeclas = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "u") {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", bloquearTeclas);
    return () => {
      document.removeEventListener("keydown", bloquearTeclas);
    };
  }, []);

  return (
    <ProveedorTema>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PaginaTienda />} />
          <Route path="/login" element={<Suspense fallback={cargandoPanel}><PaginaAdmin /></Suspense>} />
          <Route path="/admin" element={<Suspense fallback={cargandoPanel}><PaginaAdmin /></Suspense>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ProveedorTema>
  );
}
