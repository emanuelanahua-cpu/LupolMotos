// Orden oficial de categorías; coincide con el que usa el panel de administración.
export const ORDEN_CATEGORIAS = [
  'Naked',
  'Racing / Sport',
  'Chopper / Custom',
  'Chacarera',
  'Motocross',
  'Scooter',
  'Moto Eléctrica',
  'Bicimoto Eléctrica',
  'Carguero Eléctrico',
  'Trimoto Eléctrica',
  'Monopatín Eléctrico',
];

const posicionCategoria = new Map(ORDEN_CATEGORIAS.map((categoria, indice) => [categoria, indice]));

/** Categoría visible de una moto (la subcategoría; si falta, el tipo). */
export function categoriaDe(moto) {
  return String(moto?.categoria || moto?.tipo || 'Otras').trim();
}

function posicionDe(categoria) {
  return posicionCategoria.has(categoria) ? posicionCategoria.get(categoria) : ORDEN_CATEGORIAS.length;
}

export function agruparPorCategoria(motos = []) {
  const grupos = new Map();
  for (const moto of motos) {
    const categoria = categoriaDe(moto);
    if (!grupos.has(categoria)) grupos.set(categoria, []);
    grupos.get(categoria).push(moto);
  }

  return [...grupos.entries()]
    .map(([categoria, items]) => ({ categoria, motos: items }))
    .sort((a, b) => {
      const diferencia = posicionDe(a.categoria) - posicionDe(b.categoria);
      return diferencia !== 0 ? diferencia : a.categoria.localeCompare(b.categoria, 'es');
    });
}

export function compararPorCategoria(comparar) {
  return (a, b) => {
    const diferencia = posicionDe(categoriaDe(a)) - posicionDe(categoriaDe(b));
    if (diferencia !== 0) return diferencia;

    const porCategoria = categoriaDe(a).localeCompare(categoriaDe(b), 'es');
    if (porCategoria !== 0) return porCategoria;

    return comparar ? comparar(a, b) : 0;
  };
}
