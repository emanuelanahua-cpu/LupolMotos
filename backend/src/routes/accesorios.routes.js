import { Router } from 'express';
import { createService } from '../services/accesorios.service.js';
import { createController } from '../controllers/accesorios.controller.js';
import { parse } from '../middlewares/validation.middleware.js';
import { accesorioSchema } from '../models/accesorio.model.js';

export function createRoutes(pool, env, { session }) {
  const router = Router();
  const controller = createController(createService(pool, env));
  router.get('/api/accesorios', controller.listarPublico);
  router.get('/api/admin/accesorios', session.required, controller.listar);
  router.post('/api/admin/accesorios', session.required, parse(accesorioSchema), controller.crear);
  router.put('/api/admin/accesorios/:id', session.required, parse(accesorioSchema), controller.editar);
  router.patch('/api/admin/accesorios/:id/estado', session.required, session.roles('superadmin', 'admin'), controller.cambiarEstado);
  router.delete('/api/admin/accesorios/:id', session.required, session.roles('superadmin'), controller.eliminar);
  return router;
}
