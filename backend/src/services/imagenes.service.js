import { randomBytes } from 'node:crypto';
import { httpError } from '../utils/errors.js';
import * as repository from '../repositories/imagenes.repository.js';
export async function saveImages(c, photos) {
  const urls = [];
  for (const photo of photos) {
    const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(photo);
    if (!match) throw httpError(400, 'Foto no válida (jpg, png o webp)');
    const data = Buffer.from(match[2], 'base64');
    const valid = match[1] === 'jpeg' ? data[0] === 255 && data[1] === 216 && data[2] === 255 : match[1] === 'png' ? data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) : data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WEBP';
    if (!valid || data.length > 2_500_000) throw httpError(400, 'Imagen inválida o de más de 2.5 MB');
    const id = `${randomBytes(16).toString('hex')}.${match[1] === 'jpeg' ? 'jpg' : match[1]}`;
    await repository.insertarImagen(c, [id, `image/${match[1]}`, data]);
    urls.push(`/uploads/${id}`);
  }
  return urls;
}
export async function obtenerImagen(pool, id) {
  if (!/^[a-f0-9]{32}\.(jpg|png|webp)$/.test(id)) throw httpError(404, 'Imagen no encontrada');
  const [rows] = await repository.obtenerImagen(pool, [id]);
  if (!rows.length) throw httpError(404, 'Imagen no encontrada');
  return rows[0];
}
