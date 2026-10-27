import { Router } from "express";
import { createService } from "../services/comercio.service.js";
import { createController } from "../controllers/comercio.controller.js";
import {
  pedidoSchema,
  estadoSchema,
  ajusteSchema,
  clienteSchema,
} from "../models/comercio.model.js";
import { parse as validate } from "../middlewares/validation.middleware.js";
export function createRoutes(pool, env, { session, requestLimit }) {
  const r = Router(),
    c = createController(createService(pool, env));
  r.post("/api/pedidos", requestLimit, validate(pedidoSchema), c.crear);
  r.use("/api/admin", session.required, session.roles("superadmin", "admin"));
  r.param("id", (req, res, next, id) =>
    /^\d+$/.test(id) && Number.isSafeInteger(Number(id)) && Number(id) > 0
      ? next()
      : res.status(400).json({ detail: "ID inválido" }),
  );
  r.get("/api/admin/pedidos", c.pedidos);
  r.patch("/api/admin/pedidos/:id/estado", validate(estadoSchema), c.cambiar);
  r.get("/api/admin/clientes", c.clientes);
  r.put("/api/admin/clientes/:id", validate(clienteSchema), c.editarCliente);
  r.get("/api/admin/ventas", c.ventas);
  r.get("/api/admin/inventario", c.inventario);
  r.post(
    "/api/admin/inventario/:id/ajustes",
    validate(ajusteSchema),
    c.ajustar,
  );
  return r;
}
