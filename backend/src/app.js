import { createRoutes as respaldoRoutes } from './routes/respaldo.routes.js';
import { createRoutes as comercioRoutes } from './routes/comercio.routes.js';
import express from 'express';
import { auth } from './middlewares/auth.middleware.js';
import { configureSecurity } from './middlewares/security.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { configureWeb } from './routes/web.routes.js';
import { createRoutes as authRoutes } from './routes/auth.routes.js';
import { createRoutes as catalogoRoutes } from './routes/catalogo.routes.js';
import { createRoutes as motosRoutes } from './routes/motos.routes.js';
import { createRoutes as usuariosRoutes } from './routes/usuarios.routes.js';
import { createRoutes as solicitudesRoutes } from './routes/solicitudes.routes.js';
import { createRoutes as carruselRoutes } from './routes/carrusel.routes.js';
export function createApp(pool, env = process.env) {
  const app = express();
  const limits = configureSecurity(app, env);
  const session = auth(pool, env.LUPOL_SECRET, env.LUPOL_HTTPS === 'true');
  const context = {
    ...limits,
    session
  };
  app.use(authRoutes(pool, env, context));
  app.use(catalogoRoutes(pool, env, context));
  app.use(motosRoutes(pool, env, context));
  app.use(usuariosRoutes(pool, env, context));
  app.use(solicitudesRoutes(pool, env, context));
  app.use(carruselRoutes(pool, env, context));
  app.use(respaldoRoutes(pool, env, context));
  app.use(comercioRoutes(pool, env, context));
  app.use('/api', (req, res) => res.status(404).json({
    detail: 'Ruta no encontrada'
  }));
  configureWeb(app, pool);
  app.use(errorMiddleware);
  return app;
}
