import { Router } from 'express';
import { createService } from '../services/catalogo.service.js';
import { createController } from '../controllers/catalogo.controller.js';
export function createRoutes(pool, env, {}) {
  const router = Router();
  const controller = createController(createService(pool, env));
  router.get("/api/saludo", controller.estado);
  router.get("/api/tienda", controller.tienda);
  router.get("/api/motos", controller.listarMotos);
  router.get("/api/motos/:id", controller.detalleMoto);
  router.get("/api/repuestos", controller.listarRepuestos);
  router.get("/api/filtros", controller.filtros);
  router.get("/api/destacados", controller.destacados);
  return router;
}
