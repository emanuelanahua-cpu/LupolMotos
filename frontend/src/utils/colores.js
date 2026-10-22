const COLORES = {
  rojo: '#c90024', negro: '#050505', azul: '#2563eb', verde: '#16a34a',
  blanco: '#f4f4f5', gris: '#71717a', plata: '#a1a1aa', morado: '#7c3aed',
  amarillo: '#facc15', naranja: '#f97316', beige: '#d6c7a1', celeste: '#38bdf8',
  turquesa: '#14b8a6', salmon: '#fb7185', marron: '#78350f', dorado: '#ca8a04'
};

export function fondoColor(nombre = '') {
  const partes = nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/\s*[\/+-]\s*/).filter(Boolean);
  const tonos = partes.map(parte => COLORES[parte.trim()] || COLORES[parte.trim().split(' ')[0]] || '#52525b');
  if (tonos.length < 2) return tonos[0] || '#52525b';
  // El segundo tono queda arriba a la izquierda, como en Negro / Rojo.
  return `linear-gradient(135deg, ${[...tonos].reverse().map((tono, idx) => `${tono} ${idx * 100 / tonos.length}% ${(idx + 1) * 100 / tonos.length}%`).join(', ')})`;
}
