import { createHash } from "node:crypto";
import { transaction, decode } from "../config/db.js";
import { httpError } from "../utils/errors.js";
import * as repo from "../repositories/comercio.repository.js";
import { bloquearMoto, guardarMoto } from "../repositories/motos.repository.js";
import { catalog } from "../repositories/catalogo.repository.js";

export function createService(pool, env = process.env) {
  const disponible = (m) =>
    Math.max(0, Number(m.stock_total || 0) - Number(m.stock_reservado || 0));
  async function motoBloqueada(c, id) {
    const [rows] = await bloquearMoto(c, [id]);
    if (!rows.length) throw httpError(404, "Producto no encontrado");
    return decode(rows[0].datos);
  }
  function recibo(p) {
    const numero = `LM-${String(p.id).padStart(6, "0")}`;
    const text = `Hola, quiero coordinar mi pedido ${numero} de Lupol Motos. Total de productos: S/ ${(Number(p.total_centimos) / 100).toFixed(2)}. Quedo atento a la confirmación de disponibilidad, entrega y pago.`;
    return {
      id: p.id,
      numero,
      estado: p.estado,
      total_centimos: Number(p.total_centimos),
      enlace_whatsapp: `https://wa.me/${env.WHATSAPP_NUMERO || "51980687475"}?text=${encodeURIComponent(text)}`,
    };
  }
  async function crear(input) {
    const d = {
      ...input,
      items: [...input.items].sort((a, b) => a.moto_id - b.moto_id),
    };
    const huella = createHash("sha256").update(JSON.stringify(d)).digest("hex");
    const replay = (p) => {
      if (p.huella !== huella)
        throw httpError(
          409,
          "Este intento ya se usó con otro pedido. Inicia uno nuevo.",
        );
      return recibo(p);
    };
    const [old] = await repo.pedidoPorClave(pool, d.clave);
    if (old.length) return replay(old[0]);
    try {
      return await transaction(pool, async (c) => {
        const items = [];
        let total = 0;
        for (const i of d.items) {
          const m = await motoBloqueada(c, i.moto_id);
          if (m.estado !== "activado" || disponible(m) < i.cantidad)
            throw httpError(
              409,
              `Stock insuficiente para ${m.modelo}. Actualiza tu carrito.`,
            );
          const precio = Math.round(Number(m.precio) * 100);
          if (!Number.isSafeInteger(precio) || precio <= 0)
            throw httpError(
              409,
              `${m.modelo}: consulta el precio con la tienda.`,
            );
          total += precio * i.cantidad;
          items.push({
            ...i,
            nombre: `${m.marca || ""} ${m.modelo}`.trim(),
            precio,
          });
        }
        if (total !== d.total_centimos)
          throw httpError(
            409,
            "Los precios cambiaron. Actualiza el catálogo y revisa tu carrito antes de enviar.",
          );
        const cliente = await repo.clienteId(c, d.cliente);
        const [r] = await repo.insertarPedido(c, [
          d.clave,
          huella,
          cliente,
          JSON.stringify(d.cliente),
          total,
          d.notas,
        ]);
        for (const i of items)
          await repo.insertarItem(c, [
            r.insertId,
            i.moto_id,
            i.nombre,
            i.cantidad,
            i.precio,
          ]);
        return recibo({
          id: r.insertId,
          estado: "pendiente",
          total_centimos: total,
        });
      });
    } catch (e) {
      if (e.code === "ER_DUP_ENTRY") {
        const [rows] = await repo.pedidoPorClave(pool, d.clave);
        if (rows.length) return replay(rows[0]);
      }
      throw e;
    }
  }
  async function cambiar(id, d, actor) {
    return transaction(pool, async (c) => {
      const [rows] = await repo.bloquearPedido(c, id);
      if (!rows.length) throw httpError(404, "Pedido no encontrado");
      const p = rows[0];
      if (p.estado === d.estado) return recibo(p);
      const transitions = {
        pendiente: ["confirmado", "cancelado"],
        confirmado: ["pagado", "cancelado"],
      };
      if (!transitions[p.estado]?.includes(d.estado))
        throw httpError(
          409,
          "Cambio no permitido. Confirma el pedido antes de registrar el pago. Una venta pagada no puede cancelarse aquí.",
        );
      const [items] = await repo.itemsPedido(c, id);
      for (const i of items) {
        const m = await motoBloqueada(c, i.moto_id);
        m.stock_total = Number(m.stock_total || 0);
        m.stock_reservado = Number(m.stock_reservado || 0);
        if (d.estado === "confirmado") {
          if (m.estado !== "activado" || disponible(m) < i.cantidad)
            throw httpError(409, `Stock insuficiente para ${i.nombre}`);
          m.stock_reservado += i.cantidad;
        } else if (p.estado === "confirmado") {
          if (
            m.stock_reservado < i.cantidad ||
            m.stock_total < m.stock_reservado
          )
            throw httpError(
              409,
              "El stock requiere revisión antes de continuar.",
            );
          m.stock_reservado -= i.cantidad;
          if (d.estado === "pagado") m.stock_total -= i.cantidad;
        }
        await guardarMoto(c, [JSON.stringify(m), i.moto_id]);
        if (d.estado === "confirmado" || p.estado === "confirmado")
          await repo.movimiento(c, [
            i.moto_id,
            id,
            d.estado === "pagado"
              ? "venta"
              : d.estado === "confirmado"
                ? "reserva"
                : "liberacion",
            d.estado === "cancelado" ? i.cantidad : -i.cantidad,
            m.stock_total,
            `Pedido LM-${id}: ${d.estado}`,
            actor.usuario,
          ]);
      }
      if (d.estado === "pagado")
        await repo.registrarVenta(c, [
          id,
          p.total_centimos,
          d.metodo,
          d.referencia,
          actor.usuario,
        ]);
      await repo.cambiarEstado(c, id, d.estado);
      return recibo({ ...p, estado: d.estado });
    });
  }
  async function pedidos() {
    const [rows] = await repo.listarPedidos(pool);
    const [items] = await repo.listarItems(pool);
    return rows.map(({ clave, huella, ...p }) => ({
      ...p,
      cliente: decode(p.cliente_datos),
      cliente_datos: undefined,
      total_centimos: Number(p.total_centimos),
      items: items.filter((i) => i.pedido_id === p.id),
    }));
  }
  async function clientes() {
    return (await repo.listarClientes(pool))[0];
  }
  async function editarCliente(id, d) {
    try {
      const [r] = await repo.editarCliente(pool, id, d);
      if (!r.affectedRows) throw httpError(404, "Cliente no encontrado");
      return { ok: true };
    } catch (e) {
      if (e.code === "ER_DUP_ENTRY")
        throw httpError(409, "Ese teléfono pertenece a otro cliente");
      throw e;
    }
  }
  async function ventas() {
    const [rows] = await repo.listarVentas(pool);
    const [[resumen]] = await repo.resumenVentas(pool);
    return {
      resumen: {
        cantidad: Number(resumen.cantidad),
        total_centimos: Number(resumen.total_centimos),
      },
      ventas: rows.map((v) => ({
        ...v,
        total_centimos: Number(v.total_centimos),
        cliente: decode(v.cliente_datos),
        cliente_datos: undefined,
      })),
    };
  }
  async function inventario() {
    return {
      motos: (await catalog(pool)).map((m) => ({
        id: m.id,
        nombre: `${m.marca} ${m.modelo}`,
        stock_total: Number(m.stock_total || 0),
        stock_reservado: Number(m.stock_reservado || 0),
        disponible: disponible(m),
      })),
      movimientos: (await repo.listarMovimientos(pool))[0],
    };
  }
  async function ajustar(id, d, actor) {
    return transaction(pool, async (c) => {
      const m = await motoBloqueada(c, id);
      const stock = Number(m.stock_total || 0) + d.cantidad;
      if (stock < Number(m.stock_reservado || 0) || stock < 0)
        throw httpError(
          409,
          "El ajuste no puede dejar menos unidades que las reservadas.",
        );
      m.stock_total = stock;
      await guardarMoto(c, [JSON.stringify(m), id]);
      await repo.movimiento(c, [
        id,
        null,
        "ajuste",
        d.cantidad,
        stock,
        d.motivo,
        actor.usuario,
      ]);
      return { ok: true, stock_total: stock };
    });
  }
  return {
    crear,
    cambiar,
    pedidos,
    clientes,
    editarCliente,
    ventas,
    inventario,
    ajustar,
  };
}
