import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import TiendaPage from './pages/TiendaPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return <BrowserRouter><Routes>
    <Route path="/" element={<TiendaPage />} />
    <Route path="/login" element={<AdminPage />} />
    <Route path="/admin" element={<AdminPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></BrowserRouter>;
}
