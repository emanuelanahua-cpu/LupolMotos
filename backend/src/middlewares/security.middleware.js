import express from 'express';
import { rateLimit } from 'express-rate-limit';
export function configureSecurity(app, env) {
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use((req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    if (req.path.startsWith('/api/')) res.set('Cache-Control', 'no-store');
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      const origin = req.get('origin');
      const allowed = new Set((env.ALLOWED_ORIGINS || 'https://lupolmotos.com,https://www.lupolmotos.com,http://localhost:3000,http://localhost:8000').split(','));
      if (origin && !allowed.has(origin)) return res.status(403).json({
        detail: 'Origen no autorizado'
      });
    }
    next();
  });
  app.use(express.json({
    limit: '34mb'
  }));
  const loginLimit = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
      detail: 'Demasiados intentos. Espera 10 minutos.'
    }
  });
  const requestLimit = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
      detail: 'Demasiadas solicitudes. Inténtalo más tarde.'
    }
  });
  return {
    loginLimit,
    requestLimit
  };
}
