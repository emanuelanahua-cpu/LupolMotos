import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import TiendaPage from './pages/TiendaPage';
import { lazy, Suspense, useEffect } from 'react';

const AdminPage = lazy(() => import('./pages/AdminPage'));
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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TiendaPage />} />
        <Route path="/login" element={<Suspense fallback={cargandoPanel}><AdminPage /></Suspense>} />
        <Route path="/admin" element={<Suspense fallback={cargandoPanel}><AdminPage /></Suspense>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
