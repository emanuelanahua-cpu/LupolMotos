import { Router } from 'express';
import { createService } from '../services/motos.service.js';
import { createController } from '../controllers/motos.controller.js';
import { parse } from '../middlewares/validation.middleware.js';
import { motoSchema } from '../models/moto.model.js';
export function createRoutes(pool, env, {
  session
}) {
  const router = Router();
  const controller = createController(createService(pool, env));
  router.get("/api/admin/motos", session.required, controller.listar);
  router.post("/api/admin/motos", session.required, parse(motoSchema), controller.crear);
  router.put("/api/admin/motos/:id", session.required, parse(motoSchema), controller.editar);
  router.patch("/api/admin/motos/:id/estado", session.required, session.roles('superadmin', 'admin'), controller.cambiarEstado);
  router.delete("/api/admin/motos/:id", session.required, session.roles('superadmin'), controller.eliminar);
  return router;
}
