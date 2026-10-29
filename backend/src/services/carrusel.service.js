import { transaction, decode } from '../config/db.js';
import { setting } from '../repositories/catalogo.repository.js';
import { saveImages } from './imagenes.service.js';
import { httpError } from '../utils/errors.js';

const CLAVE = 'carrusel_proximas';

export function createService(pool) {
  const listarAdmin = async () => setting(pool, CLAVE, { slides: [] });
  const listarPublico = async () => {
    const data = await listarAdmin();
    return { slides: (data.slides || []).filter(slide => slide.activo) };
  };

  const guardar = async ({ input }) => transaction(pool, async c => {
    const [rows] = await c.execute('SELECT datos FROM configuracion WHERE clave = ? FOR UPDATE', [CLAVE]);
    const anterior = rows.length ? decode(rows[0].datos) : { slides: [] };
    const imagenesAnteriores = new Map((anterior.slides || []).map(slide => [slide.id, slide.imagen]));
    const slides = [];
    for (const slide of input.slides) {
      let imagen = slide.imagen;
      if (imagen.startsWith('data:image/')) {
        imagen = (await saveImages(c, [imagen]))[0];
      } else if (imagenesAnteriores.get(slide.id) !== imagen) {
        throw httpError(400, 'La imagen del carrusel no es válida');
      }
      slides.push({ ...slide, imagen });
    }
    const data = { slides };
    await c.execute(
      'INSERT INTO configuracion (clave, datos) VALUES (?, ?) ON DUPLICATE KEY UPDATE datos = VALUES(datos)',
      [CLAVE, JSON.stringify(data)]
    );
    return data;
  });

  return { listarAdmin, listarPublico, guardar };
}
