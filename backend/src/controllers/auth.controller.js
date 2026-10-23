import { login } from '../services/auth.service.js';
import { publicUser } from '../utils/password.js';
import { PISTERAS, ELECTRICAS } from '../models/moto.model.js';
export function createController(pool, session) {
  return {
    estado: (req, res) => res.json({
      necesita_configuracion: false,
      categorias: {
        Pisteras: PISTERAS,
        'Eléctricas': ELECTRICAS
      }
    }),
    configurar: (req, res) => res.status(403).json({
      detail: 'La cuenta inicial se configura desde el servidor.'
    }),
    login: async (req, res) => {
      const user = await login(pool, req.input);
      session.login(res, user.id);
      res.json(user);
    },
    logout: (req, res) => {
      session.logout(res);
      res.json({
        ok: true
      });
    },
    yo: (req, res) => res.json(publicUser(req.user))
  };
}
