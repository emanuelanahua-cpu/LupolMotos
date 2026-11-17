const imagenes = new Map();
export function precargarImagen(url, prioridad = 'low') {
  if (!url || typeof window === 'undefined') return null;

  const existente = imagenes.get(url);
  if (existente) return existente;

  const img = new Image();
  img.decoding = 'async';
  try {
    img.fetchPriority = prioridad;
  } catch {
  }

  const registro = { img, cargada: false };
  const marcarCargada = () => {
    registro.cargada = true;
  };
  img.addEventListener('load', marcarCargada, { once: true });
  img.addEventListener('error', marcarCargada, { once: true });
  img.src = url;

  imagenes.set(url, registro);
  return registro;
}

export function precargarImagenes(urls = [], prioridad = 'low') {
  for (const url of urls) precargarImagen(url, prioridad);
}

export function alCargarImagen(url, callback) {
  const registro = precargarImagen(url, 'high');
  if (!registro) return () => {};

  if (registro.cargada) {
    callback();
    return () => {};
  }

  const avisar = () => callback();
  registro.img.addEventListener('load', avisar);
  registro.img.addEventListener('error', avisar);

  return () => {
    registro.img.removeEventListener('load', avisar);
    registro.img.removeEventListener('error', avisar);
  };
}
