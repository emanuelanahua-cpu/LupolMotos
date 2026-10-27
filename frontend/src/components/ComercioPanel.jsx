import React, { useEffect, useState } from "react";
import { api } from "../services/adminService";
import { formatearSoles } from "../utils/format";
const input =
  "rounded-lg p-2 bg-zinc-900 border border-zinc-700 text-sm w-full";
const btn =
  "rounded-lg px-3 py-2 bg-[#fad911] text-black font-bold text-sm disabled:opacity-40";
const secondary = "rounded-lg px-3 py-2 border border-zinc-600 text-sm";
const fecha = (v) => new Date(v).toLocaleString("es-PE");
function Pedidos({ datos, actuar, busy }) {
  const [metodo, setMetodo] = useState("efectivo"),
    [referencia, setReferencia] = useState(""),
    [filtro, setFiltro] = useState("todos");
  return (
    <>
      <p className="text-sm text-zinc-400 mb-4">
        Confirmar reserva stock. Registra como pagado solo después de verificar
        el pago; esto genera la venta y descuenta las unidades. Se muestran los
        últimos 300 pedidos.
      </p>
      <label>
        Estado{" "}
        <select
          className={input}
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        >
          {["todos", "pendiente", "confirmado", "pagado", "cancelado"].map(
            (s) => (
              <option key={s}>{s}</option>
            ),
          )}
        </select>
      </label>
      <div className="grid sm:grid-cols-2 gap-3 my-4">
        <label className="text-sm">
          Método para registrar un pago
          <select
            className={input}
            value={metodo}
            onChange={(e) => setMetodo(e.target.value)}
          >
            {[
              "efectivo",
              "transferencia",
              "yape",
              "plin",
              "tarjeta_presencial",
            ].map((m) => (
              <option key={m} value={m}>
                {m.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Referencia del pago
          <input
            className={input}
            maxLength={120}
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
          />
        </label>
      </div>
      <div className="space-y-4">
        {datos
          .filter((p) => filtro === "todos" || p.estado === filtro)
          .map((p) => (
            <article
              key={p.id}
              className="border border-zinc-700 p-4 rounded-xl space-y-2"
            >
              <div className="flex justify-between flex-wrap gap-2">
                <h3 className="font-bold">
                  LM-{String(p.id).padStart(6, "0")} · {p.estado}
                </h3>
                <span>{fecha(p.creado)}</span>
              </div>
              <p>
                {p.cliente.nombre} · {p.cliente.telefono}
              </p>
              <p className="text-sm text-zinc-400">
                {p.cliente.email} {p.cliente.direccion}
              </p>
              <ul className="text-sm">
                {p.items.map((i) => (
                  <li key={i.moto_id}>
                    {i.cantidad} × {i.nombre} ·{" "}
                    {formatearSoles(
                      (Number(i.precio_centimos) * i.cantidad) / 100,
                    )}
                  </li>
                ))}
              </ul>
              <p className="font-bold">
                Total: {formatearSoles(p.total_centimos / 100)}
              </p>
              {p.notas && <p className="text-sm">Indicaciones: {p.notas}</p>}
              <div className="flex flex-wrap gap-2">
                {p.estado === "pendiente" && (
                  <button
                    className={btn}
                    disabled={busy}
                    onClick={() =>
                      actuar(`/api/admin/pedidos/${p.id}/estado`, "PATCH", {
                        estado: "confirmado",
                      })
                    }
                  >
                    Confirmar y reservar stock
                  </button>
                )}
                {p.estado === "confirmado" && (
                  <button
                    className={btn}
                    disabled={busy}
                    onClick={() => {
                      if (
                        window.confirm(
                          `¿Verificaste el pago completo de ${formatearSoles(p.total_centimos / 100)} del pedido LM-${p.id}? Se registrará la venta.`,
                        )
                      )
                        actuar(`/api/admin/pedidos/${p.id}/estado`, "PATCH", {
                          estado: "pagado",
                          metodo,
                          referencia,
                        });
                    }}
                  >
                    Registrar pago verificado
                  </button>
                )}
                {["pendiente", "confirmado"].includes(p.estado) && (
                  <button
                    className={secondary}
                    disabled={busy}
                    onClick={() => {
                      if (
                        window.confirm(
                          "¿Cancelar este pedido? Se liberará el stock reservado.",
                        )
                      )
                        actuar(`/api/admin/pedidos/${p.id}/estado`, "PATCH", {
                          estado: "cancelado",
                        });
                    }}
                  >
                    Cancelar pedido
                  </button>
                )}
              </div>
            </article>
          ))}
      </div>
      {!datos.length && (
        <p className="py-8 text-zinc-400">
          Aún no hay pedidos. Los pedidos del carrito aparecerán aquí.
        </p>
      )}
    </>
  );
}
function Inventario({ datos, actuar, busy }) {
  const [busqueda, setBusqueda] = useState(""),
    [id, setId] = useState(""),
    [cantidad, setCantidad] = useState(""),
    [motivo, setMotivo] = useState("");
  return (
    <>
      <form
        className="grid sm:grid-cols-4 gap-3 mb-5"
        onSubmit={async (e) => {
          e.preventDefault();
          if (
            await actuar(`/api/admin/inventario/${id}/ajustes`, "POST", {
              cantidad: Number(cantidad),
              motivo,
            })
          ) {
            setCantidad("");
            setMotivo("");
          }
        }}
      >
        <label>
          Producto
          <select
            required
            className={input}
            value={id}
            onChange={(e) => setId(e.target.value)}
          >
            <option value="">Seleccionar</option>
            {datos.motos.map((m) => (
              <option value={m.id} key={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </label>
        <label>
          Entrada (+) o salida (−)
          <input
            required
            type="number"
            min="-100000"
            max="100000"
            step="1"
            className={input}
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
          />
        </label>
        <label>
          Motivo
          <input
            required
            minLength={3}
            maxLength={300}
            className={input}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </label>
        <button disabled={busy} className={btn}>
          Registrar ajuste
        </button>
      </form>
      <input
        aria-label="Buscar inventario"
        className={input}
        placeholder="Buscar moto…"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      <div className="admin-scroll my-4" role="region" aria-label="Lista de inventario" tabIndex={0}>
        <table className="w-full text-sm text-left">
          <thead className="sticky top-0 z-10 bg-[#121318]">
            <tr>
              {["Producto", "Físico", "Reservado", "Disponible"].map((h) => (
                <th key={h} className="p-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {datos.motos
              .filter((m) =>
                m.nombre.toLowerCase().includes(busqueda.toLowerCase()),
              )
              .map((m) => (
                <tr key={m.id} className="border-t border-zinc-800">
                  <td className="p-2">{m.nombre}</td>
                  <td>{m.stock_total}</td>
                  <td>{m.stock_reservado}</td>
                  <td>{m.disponible}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <h3 className="font-bold mt-6">Últimos 300 movimientos</h3>
      <p className="text-xs text-zinc-400 my-2">
        Reserva y liberación cambian la disponibilidad; venta y ajuste cambian
        el stock físico.
      </p>
      <ul className="admin-scroll admin-scroll--compact text-sm space-y-2" aria-label="Movimientos de inventario" tabIndex={0}>
        {datos.movimientos.map((m) => (
          <li className="border-b border-zinc-800 py-2" key={m.id}>
            {fecha(m.creado)} ·{" "}
            {datos.motos.find((p) => p.id === m.moto_id)?.nombre ||
              `Moto #${m.moto_id}`}{" "}
            · {m.tipo}: {m.cantidad > 0 ? "+" : ""}
            {m.cantidad} · físico: {m.stock_resultante}
            <br />
            <span className="text-zinc-400">
              {m.motivo} · {m.actor}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
function Clientes({ datos, actuar, busy }) {
  const [editar, setEditar] = useState(null),
    [busqueda, setBusqueda] = useState("");
  return (
    <>
      <p className="text-sm text-zinc-400 mb-3">
        Los clientes se registran al enviar un pedido y se agrupan por teléfono.
        Editar la ficha conserva los datos originales de cada pedido. Últimos
        500 clientes.
      </p>
      {editar && (
        <form
          className="p-4 border border-zinc-700 rounded-xl mb-5 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            if (
              await actuar(`/api/admin/clientes/${editar.id}`, "PUT", {
                nombre: editar.nombre,
                telefono: editar.telefono,
                email: editar.email,
                direccion: editar.direccion,
              })
            )
              setEditar(null);
          }}
        >
          {["nombre", "telefono", "email", "direccion"].map((k) => (
            <label className="block capitalize" key={k}>
              {k}
              <input
                className={input}
                required={["nombre", "telefono"].includes(k)}
                type={k === "email" ? "email" : "text"}
                value={editar[k]}
                onChange={(e) => setEditar({ ...editar, [k]: e.target.value })}
              />
            </label>
          ))}
          <div className="flex gap-3">
            <button disabled={busy} className={btn}>
              Guardar cliente
            </button>
            <button
              type="button"
              className={secondary}
              onClick={() => setEditar(null)}
            >
              Cerrar
            </button>
          </div>
        </form>
      )}
      <input
        className={input}
        aria-label="Buscar clientes"
        placeholder="Buscar por nombre o teléfono"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      <div className="space-y-3 mt-4">
        {datos
          .filter((c) =>
            (c.nombre + " " + c.telefono)
              .toLowerCase()
              .includes(busqueda.toLowerCase()),
          )
          .map((c) => (
            <div
              className="p-4 border border-zinc-700 rounded-xl flex justify-between gap-3"
              key={c.id}
            >
              <div>
                <p className="font-bold">{c.nombre}</p>
                <p>
                  {c.telefono} · {c.email}
                </p>
                <p className="text-sm text-zinc-400">
                  {c.direccion} · {c.pedidos} pedidos
                </p>
              </div>
              <button className={secondary} onClick={() => setEditar(c)}>
                Editar
              </button>
            </div>
          ))}
      </div>
      {!datos.length && (
        <p className="py-6">Aún no hay clientes registrados por el carrito.</p>
      )}
    </>
  );
}
function Ventas({ datos }) {
  return (
    <>
      <div className="p-5 border border-yellow-600 rounded-xl mb-5">
        <h3 className="text-sm">Ventas con pago registrado</h3>
        <p className="text-2xl font-black">
          {formatearSoles(datos.resumen.total_centimos / 100)}
        </p>
        <p>{datos.resumen.cantidad} ventas</p>
      </div>
      <p className="text-sm text-zinc-400 mb-4">
        Últimas 300 ventas. Este registro interno no sustituye una boleta o
        factura electrónica.
      </p>
      <div className="space-y-3">
        {datos.ventas.map((v) => (
          <div key={v.id} className="border border-zinc-700 p-4 rounded-xl">
            <p className="font-bold">
              Venta #{v.id} · Pedido LM-{v.pedido_id} ·{" "}
              {formatearSoles(v.total_centimos / 100)}
            </p>
            <p>
              {v.cliente.nombre} · {v.metodo.replace("_", " ")} · {v.referencia}
            </p>
            <p className="text-sm text-zinc-400">
              {fecha(v.creado)} · Registrado por {v.actor}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
export default function ComercioPanel({ seccion }) {
  const [datos, setDatos] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [mensaje, setMensaje] = useState("");
  const cargar = () => api("GET", `/api/admin/${seccion}`).then(setDatos);
  useEffect(() => {
    let active = true;
    setDatos(null);
    setError("");
    setMensaje("");
    api("GET", `/api/admin/${seccion}`)
      .then((d) => {
        if (active) setDatos(d);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [seccion]);
  async function actuar(url, method, body) {
    setBusy(true);
    setError("");
    setMensaje("");
    try {
      await api(method, url, body);
      await cargar();
      setMensaje("Cambios guardados.");
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold capitalize">{seccion}</h2>
        <button
          className={secondary}
          disabled={busy}
          onClick={() => {
            setError("");
            cargar().catch((e) => setError(e.message));
          }}
        >
          Actualizar
        </button>
      </div>
      {error && (
        <p role="alert" className="text-red-300 mb-4">
          {error}
        </p>
      )}
      {mensaje && (
        <p role="status" className="text-emerald-300 mb-4">
          {mensaje}
        </p>
      )}
      {!datos ? (
        <p>Cargando…</p>
      ) : seccion === "pedidos" ? (
        <Pedidos {...{ datos, actuar, busy }} />
      ) : seccion === "inventario" ? (
        <Inventario {...{ datos, actuar, busy }} />
      ) : seccion === "clientes" ? (
        <Clientes {...{ datos, actuar, busy }} />
      ) : (
        <Ventas datos={datos} />
      )}
    </section>
  );
}
