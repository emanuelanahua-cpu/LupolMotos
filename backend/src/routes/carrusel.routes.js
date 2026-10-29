import { Router } from 'express';
import { createService } from '../services/carrusel.service.js';
import { createController } from '../controllers/carrusel.controller.js';
import { parse } from '../middlewares/validation.middleware.js';
import { carruselSchema } from '../models/carrusel.model.js';

export function createRoutes(pool, env, { session }) {
  const router = Router();
  const controller = createController(createService(pool));
  router.get('/api/carrusel-proximas', controller.publico);
  router.get('/api/admin/carrusel-proximas', session.required, session.roles('superadmin', 'admin'), controller.admin);
  router.put('/api/admin/carrusel-proximas', session.required, session.roles('superadmin', 'admin'), parse(carruselSchema), controller.guardar);
  return router;
}
