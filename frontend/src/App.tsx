import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import TiendaPage from './pages/TiendaPage';
import AdminPage from './pages/AdminPage';
import { useEffect } from "react";

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
        <Route path="/login" element={<AdminPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}