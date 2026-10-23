import { z } from 'zod';
export const errorMiddleware = (error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error instanceof z.ZodError) return res.status(422).json({
    detail: 'Revisa los datos ingresados',
    errores: error.issues.map(i => ({
      campo: i.path.join('.'),
      mensaje: i.message
    }))
  });
  const status = error.status >= 400 && error.status < 500 ? error.status : 503;
  if (status === 503) console.error('Error de servicio:', error.code || error.name);
  res.status(status).json({
    detail: status === 503 ? 'El servicio no está disponible. Inténtalo de nuevo.' : error.message
  });
};
