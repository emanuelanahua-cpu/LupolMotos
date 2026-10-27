import React, { createContext, useContext, useEffect, useState } from "react";
import { request } from "../services/api";
const Context = createContext(null);
const KEY = "lupol-carrito-v1";
export const useCart = () => useContext(Context);
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]")
        .filter(
          (i) =>
            Number.isInteger(i.id) &&
            Number.isInteger(i.cantidad) &&
            i.cantidad > 0,
        )
        .slice(0, 30);
    } catch {
      return [];
    }
  });
  const [catalogo, setCatalogo] = useState([]),
    [abierto, setAbierto] = useState(false),
    [error, setError] = useState(""),
    [cargando, setCargando] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* almacenamiento no disponible */
    }
  }, [items]);
  async function actualizarCatalogo() {
    setCargando(true);
    setError("");
    try {
      const d = await request("/api/motos");
      setCatalogo(d.motos);
      return d.motos;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setCargando(false);
    }
  }
  useEffect(() => {
    if (abierto) actualizarCatalogo().catch(() => {});
  }, [abierto]);
  const agregar = (m) => {
    setItems((old) => {
      const found = old.find((i) => i.id === m.id);
      return found
        ? old.map((i) =>
            i.id === m.id
              ? { ...i, cantidad: Math.min(20, i.cantidad + 1) }
              : i,
          )
        : old.length < 30
          ? [...old, { id: m.id, cantidad: 1 }]
          : old;
    });
    setAbierto(true);
  };
  const cambiar = (id, delta) =>
    setItems((old) =>
      old
        .map((i) =>
          i.id === id
            ? { ...i, cantidad: Math.min(20, i.cantidad + delta) }
            : i,
        )
        .filter((i) => i.cantidad > 0),
    );
  const carrito = items.map((i) => ({
    ...catalogo.find((m) => m.id === i.id),
    ...i,
  }));
  return (
    <Context.Provider
      value={{
        items,
        carrito,
        agregar,
        cambiar,
        vaciar: () => setItems([]),
        abierto,
        setAbierto,
        error,
        cargando,
        actualizarCatalogo,
      }}
    >
      {children}
    </Context.Provider>
  );
}
