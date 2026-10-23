import { Router } from 'express';
import { createService } from '../services/solicitudes.service.js';
import { createController } from '../controllers/solicitudes.controller.js';
import { parse } from '../middlewares/validation.middleware.js';
import { quoteSchema, reserveSchema, contactSchema } from '../models/solicitud.model.js';
export function createRoutes(pool, env, {
  session,
  requestLimit
}) {
  const router = Router();
  const controller = createController(createService(pool, env));
  router.post("/api/cotizaciones", requestLimit, parse(quoteSchema), controller.cotizar);
  router.post("/api/reservas", requestLimit, parse(reserveSchema), controller.reservar);
  router.post("/api/contacto", requestLimit, parse(contactSchema), controller.contactar);
  router.get("/api/admin/solicitudes", session.required, session.roles('superadmin', 'admin'), controller.listar);
  return router;
}
