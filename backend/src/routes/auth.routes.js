import { Router } from 'express';
import { createController } from '../controllers/auth.controller.js';
import { loginSchema } from '../models/usuario.model.js';
import { parse } from '../middlewares/validation.middleware.js';
export function createRoutes(pool, env, {
  session,
  loginLimit
}) {
  const router = Router(),
    c = createController(pool, session);
  router.get('/api/admin/estado', c.estado);
  router.post('/api/admin/configurar', c.configurar);
  router.post('/api/admin/login', loginLimit, parse(loginSchema), c.login);
  router.post('/api/admin/logout', c.logout);
  router.get('/api/admin/yo', session.required, c.yo);
  return router;
}
