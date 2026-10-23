import { Router } from 'express';
import { createService } from '../services/usuarios.service.js';
import { createController } from '../controllers/usuarios.controller.js';
import { parse } from '../middlewares/validation.middleware.js';
import { loginSchema, roles } from '../models/usuario.model.js';
import { z } from 'zod';
export function createRoutes(pool, env, {
  session
}) {
  const router = Router();
  const controller = createController(createService(pool, env));
  router.get("/api/admin/usuarios", session.required, session.roles('superadmin', 'admin'), controller.listar);
  router.post("/api/admin/usuarios", session.required, session.roles('superadmin', 'admin'), parse(loginSchema.extend({
    rol: z.enum(roles)
  })), controller.crear);
  router.delete("/api/admin/usuarios/:id", session.required, session.roles('superadmin'), controller.eliminar);
  return router;
}
