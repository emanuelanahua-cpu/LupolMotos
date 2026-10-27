import React, { useEffect, useRef, useState } from "react";
import { X, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { enviarPedido, terminarIntento } from "../services/pedidoService";
import { formatearSoles } from "../utils/format";
const inputClass =
  "w-full rounded-lg bg-zinc-900 border border-zinc-700 p-3 text-sm text-white";
export default function CartDrawer() {
  const cart = useCart(),
    [cliente, setCliente] = useState({
      nombre: "",
      telefono: "",
      email: "",
      direccion: "",
    }),
    [notas, setNotas] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [recibo, setRecibo] = useState(null);
  const closeRef = useRef(null);
  useEffect(() => {
    if (!cart.abierto) return;
    closeRef.current?.focus();
    const key = (e) => {
      if (e.key === "Escape" && !busy) cart.setAbierto(false);
    };
    document.addEventListener("keydown", key);
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = old;
    };
  }, [cart.abierto, busy]);
  useEffect(() => {
    if (cart.items.length) setRecibo(null);
  }, [cart.items]);
  if (!cart.abierto) return null;
  const total = cart.carrito.reduce(
    (n, i) => n + Math.round(Number(i.precio || 0) * 100) * i.cantidad,
    0,
  );
  const invalido = cart.carrito.some(
    (i) =>
      !i.modelo ||
      Number(i.precio) <= 0 ||
      i.cantidad >
        Math.max(
          0,
          Number(i.stock_total || 0) - Number(i.stock_reservado || 0),
        ),
  );
  async function enviar(e) {
    e.preventDefault();
    if (busy || invalido || cart.cargando || cart.error) return;
    setBusy(true);
    setError("");
    try {
      const res = await enviarPedido({
        cliente,
        notas,
        items: cart.carrito.map((i) => ({
          moto_id: i.id,
          cantidad: i.cantidad,
        })),
        total_centimos: total,
      });
      cart.vaciar();
      setRecibo(res);
      terminarIntento();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70"
      onClick={() => !busy && cart.setAbierto(false)}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="carrito-title"
        onClick={(e) => e.stopPropagation()}
        className="absolute inset-y-0 right-0 w-full max-w-lg overflow-y-auto bg-[#101116] p-5 sm:p-7 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="carrito-title" className="text-xl font-black flex gap-2">
            <ShoppingBag />
            Tu carrito
          </h2>
          <button
            ref={closeRef}
            disabled={busy}
            aria-label="Cerrar carrito"
            onClick={() => cart.setAbierto(false)}
            className="p-2"
          >
            <X />
          </button>
        </div>
        {recibo ? (
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-emerald-400">
              Pedido {recibo.numero} registrado
            </h3>
            <p>Productos: {formatearSoles(recibo.total_centimos / 100)}</p>
            <p className="text-zinc-300 text-sm">
              Tu pedido está pendiente. Coordinaremos disponibilidad, entrega y
              pago contigo. Todavía no se ha realizado ningún cobro.
            </p>
            <a
              href={recibo.enlace_whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center bg-emerald-600 p-3 rounded-xl font-bold"
            >
              Coordinar por WhatsApp
            </a>
            <button
              className="underline"
              onClick={() => cart.setAbierto(false)}
            >
              Seguir explorando
            </button>
          </div>
        ) : !cart.items.length ? (
          <p className="text-zinc-400 py-10">
            Tu carrito está vacío. Agrega una moto desde el catálogo.
          </p>
        ) : (
          <>
            {(cart.error || error) && (
              <p
                role="alert"
                className="bg-red-950 text-red-200 rounded-lg p-3 mb-3"
              >
                {error || cart.error}
              </p>
            )}
            <div className="flex justify-between text-sm mb-4">
              <span>
                {cart.items.reduce((n, i) => n + i.cantidad, 0)} unidades
              </span>
              <button
                disabled={busy || cart.cargando}
                onClick={() => cart.actualizarCatalogo().catch(() => {})}
                className="underline"
              >
                {cart.cargando ? "Actualizando…" : "Actualizar precios y stock"}
              </button>
            </div>
            <div className="space-y-3">
              {cart.carrito.map((i) => {
                const stock = Math.max(
                  0,
                  Number(i.stock_total || 0) - Number(i.stock_reservado || 0),
                );
                return (
                  <article
                    key={i.id}
                    className="rounded-xl border border-zinc-700 p-4"
                  >
                    <h3 className="font-bold">
                      {i.modelo
                        ? `${i.marca} ${i.modelo}`
                        : `Producto #${i.id} no disponible`}
                    </h3>
                    <p className="text-yellow-300 my-2">
                      {formatearSoles(Number(i.precio || 0))}
                    </p>
                    <div className="flex items-center gap-4">
                      <button
                        disabled={busy}
                        aria-label={`Reducir ${i.modelo}`}
                        onClick={() => cart.cambiar(i.id, -1)}
                        className="p-2 bg-zinc-800 rounded"
                      >
                        −
                      </button>
                      <span>{i.cantidad}</span>
                      <button
                        disabled={busy || i.cantidad >= Math.min(20, stock)}
                        aria-label={`Aumentar ${i.modelo}`}
                        onClick={() => cart.cambiar(i.id, 1)}
                        className="p-2 bg-zinc-800 rounded disabled:opacity-30"
                      >
                        +
                      </button>
                      <button
                        disabled={busy}
                        aria-label={`Eliminar ${i.modelo}`}
                        onClick={() => cart.cambiar(i.id, -i.cantidad)}
                        className="ml-auto p-2 text-red-400"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    {!cart.cargando && i.cantidad > stock && (
                      <p className="text-red-300 text-sm mt-2">
                        Disponibles: {stock}. Reduce la cantidad o retira este
                        producto.
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
            <div className="flex justify-between font-bold text-lg my-5">
              <span>Total de productos</span>
              <span>{formatearSoles(total / 100)}</span>
            </div>
            <p className="text-xs text-zinc-400 mb-5">
              Entrega y posibles gastos de envío se coordinan antes del pago. El
              pedido no reserva stock hasta que la tienda lo confirme.
            </p>
            <form onSubmit={enviar} className="space-y-3">
              {Object.entries({
                nombre: "Nombre completo",
                telefono: "Celular / WhatsApp",
                email: "Correo (opcional)",
                direccion: "Dirección o ciudad de entrega (opcional)",
              }).map(([key, label]) => (
                <label key={key} className="block text-sm">
                  {label}
                  <input
                    className={inputClass}
                    required={["nombre", "telefono"].includes(key)}
                    minLength={key === "nombre" ? 3 : undefined}
                    maxLength={
                      key === "nombre"
                        ? 120
                        : key === "telefono"
                          ? 25
                          : key === "email"
                            ? 180
                            : 400
                    }
                    pattern={
                      key === "telefono" ? "[0-9+() -]{7,25}" : undefined
                    }
                    type={
                      key === "email"
                        ? "email"
                        : key === "telefono"
                          ? "tel"
                          : "text"
                    }
                    value={cliente[key]}
                    onChange={(e) =>
                      setCliente({ ...cliente, [key]: e.target.value })
                    }
                  />
                </label>
              ))}
              <label className="block text-sm">
                Color o indicaciones (opcional)
                <textarea
                  className={inputClass}
                  maxLength={800}
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                />
              </label>
              <p className="text-xs text-zinc-400">
                Usaremos estos datos para atender tu pedido y contactarte.
              </p>
              <button
                disabled={busy || cart.cargando || !!cart.error || invalido}
                className="w-full rounded-xl p-4 bg-[#fad911] text-black font-bold disabled:opacity-40"
              >
                {busy ? "Guardando pedido…" : "Registrar pedido"}
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
