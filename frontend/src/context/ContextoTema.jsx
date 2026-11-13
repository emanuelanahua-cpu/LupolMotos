import React, { createContext, useContext, useEffect, useState } from 'react';

const CLAVE = 'lupol-theme';
const ContextoTema = createContext(null);

function temaInicial() {
  if (typeof window === 'undefined') return 'dark';
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado === 'light' || guardado === 'dark') return guardado;
  } catch { /* sin almacenamiento */ }
  return 'dark';
}

export function ProveedorTema({ children }) {
  const [tema, setTema] = useState(temaInicial);

  useEffect(() => {
    const raiz = document.documentElement;
    raiz.classList.toggle('light', tema === 'light');
    raiz.style.colorScheme = tema === 'light' ? 'light' : 'dark';
    try { localStorage.setItem(CLAVE, tema); } catch { /* sin almacenamiento */ }
  }, [tema]);

  const alternar = () => setTema(actual => (actual === 'light' ? 'dark' : 'light'));

  return (
    <ContextoTema.Provider value={{ tema, alternar, esClaro: tema === 'light' }}>
      {children}
    </ContextoTema.Provider>
  );
}

export function useTema() {
  return useContext(ContextoTema) || { tema: 'dark', alternar: () => {}, esClaro: false };
}
