// Colores reconocidos por nombre. Están normalizados: minúsculas, sin tildes.
// Se pueden combinar con "/", "+", "," o " y " para crear degradados
// y con claro, oscuro, pastel, mate, etc. para cambiar el tono.
const COLORES = {
  // Neutros y metales
  negro: '#000000', azabache: '#0b0b0f', carbon: '#1c1c1e', grafito: '#2f3437',
  gunmetal: '#2a3439', plomo: '#4b4f54', humo: '#6b6f75', gris: '#71717a',
  'gris claro': '#d1d1d6', 'gris oscuro': '#3a3a3c', 'gris grafito': '#2f3437',
  plata: '#c0c0c0', 'gris plata': '#c0c0c0', platino: '#e5e4e2', aluminio: '#a8b0b8',
  acero: '#7d8a96', titanio: '#8a8f98', cromo: '#d4d8dd', niquel: '#a9b0b8',
  magnesio: '#b7bcc2', metalico: '#8a8f98', blanco: '#ffffff', perla: '#f2efe9',
  'blanco perla': '#f2efe9', marfil: '#fffff0', crema: '#fffdd0', hueso: '#f5f1e6',
  beige: '#d6c7a1', arena: '#d9c8a9', caqui: '#c3b091', taupe: '#8b7d6b', vison: '#7b6a58',

  // Rojos
  rojo: '#c90024', escarlata: '#ff2400', carmesi: '#a50034', carmin: '#960018',
  bermellon: '#d94b2b', granate: '#7b1e2b', vino: '#722f37', 'rojo vino': '#722f37',
  borgona: '#5b1a24', burdeos: '#6d071a', cereza: '#b3122f', 'rojo cereza': '#b3122f',
  frambuesa: '#c2185b', fresa: '#e63946', coral: '#ff6f61', salmon: '#fb7185',
  ladrillo: '#b04a3a', teja: '#b55239', oxido: '#8a3b12', 'rojo oxido': '#8a3b12',
  terracota: '#cb6843', rubi: '#9b111e', amapola: '#e35336', sandia: '#e05a5a',
  tomate: '#e23d28', 'rojo racing': '#d50000', 'rojo ducati': '#cc0000',

  // Naranjas y amarillos
  naranja: '#f97316', mandarina: '#f28c28', zanahoria: '#ed9121', calabaza: '#e8712b',
  cobre: '#b87333', bronce: '#a97142', canela: '#9b5b2f', ocre: '#c49a3a',
  ambar: '#ffbf00', miel: '#d4a017', dorado: '#ca8a04', oro: '#d4af37',
  'oro viejo': '#b8860b', champan: '#e8d3a9', champagne: '#e8d3a9', durazno: '#ffcb97',
  melocoton: '#ffb07c', albaricoque: '#fbc4ab', amarillo: '#facc15', limon: '#d4e157',
  lima: '#a3e635', maiz: '#f2d16b', vainilla: '#f5e6b8', paja: '#e3cf9a',
  girasol: '#f0c420', mostaza: '#c9a227', yema: '#ffd23f',

  // Verdes
  verde: '#16a34a', 'verde lima': '#84cc16', esmeralda: '#059669', jade: '#00a86b',
  menta: '#98f5c1', hierbabuena: '#6fbf73', oliva: '#6b7a2f', 'verde oliva': '#6b7a2f',
  aceituna: '#7d8a2e', militar: '#4b5320', 'verde militar': '#4b5320', bosque: '#1f4d2e',
  selva: '#146b3a', pino: '#0b3d2e', abeto: '#173f35', musgo: '#6a7b45',
  salvia: '#8aa37a', pistacho: '#93c572', aguacate: '#568203', manzana: '#8db600',
  loro: '#3c8d40', botella: '#006a4e', 'verde botella': '#006a4e', 'verde azulado': '#0f766e',
  'verde oscuro': '#14532d', 'verde claro': '#86efac', 'verde kawasaki': '#4e9f3d',
  camuflaje: '#5a6b3b',

  // Azules
  azul: '#2563eb', 'azul cielo': '#38bdf8', cielo: '#38bdf8', celeste: '#38bdf8',
  ceruleo: '#2a9df4', cobalto: '#0047ab', ultramar: '#1a2a6c', marino: '#1e3a5f',
  'azul marino': '#1e3a5f', navy: '#000080', 'azul real': '#1d4ed8', rey: '#1d4ed8',
  zafiro: '#0f52ba', 'azul acero': '#4682b4', denim: '#1560bd', jean: '#4a6fa5',
  turquesa: '#14b8a6', aguamarina: '#7fffd4', aqua: '#00ffff', cian: '#06b6d4',
  petroleo: '#0f4c5c', 'azul noche': '#0b1f3a', 'azul electrico': '#1e40af',
  'azul francia': '#318ce7', 'azul hielo': '#b9e2f2', 'azul pastel': '#a5c8e4',
  bebe: '#a7d8f0', 'celeste bebe': '#a7d8f0', 'azul honda': '#0057b8', 'azul yamaha': '#0033a0',

  // Morados y rosas
  morado: '#7c3aed', purpura: '#800080', violeta: '#8b5cf6', lila: '#b39ddb',
  lavanda: '#e6d7f7', malva: '#c48ba3', berenjena: '#4b1e3a', ciruela: '#673147',
  uva: '#6f2da8', amatista: '#9966cc', orquidea: '#da70d6', fucsia: '#d1007a',
  magenta: '#c2187a', rosa: '#f472b6', rosado: '#f472b6', 'rosa pastel': '#ffc2d4',
  'rosa palo': '#e8b4b8', 'rosa antiguo': '#c08081', chicle: '#ff7eb9', piel: '#f3c3a0',
  nude: '#e3c2ac',

  // Marrones
  marron: '#78350f', cafe: '#6f4e37', 'cafe claro': '#a67b5b', chocolate: '#5d4037',
  cacao: '#4a2c2a', mocha: '#6b4f3a', avellana: '#8b6a4f', nuez: '#7a5c3e',
  castano: '#7b3f00', tabaco: '#6b4423', cuero: '#8b5a2b', siena: '#a0522d',
  camel: '#c19a6b', caramelo: '#c68e58', tostado: '#9c6b3f', tierra: '#6b4f33',
  barro: '#6a4b36', caoba: '#6b2f1f', wengue: '#3b2a24',

  // Combinaciones comunes
  'azul rey': '#1d4ed8', 'azul petroleo': '#0f4c5c', 'azul turquesa': '#14b8a6',
  'azul grisaceo': '#64748b', 'gris azulado': '#64748b', 'gris perla': '#eae7e1',
  'verde limon': '#a3e635', 'verde menta': '#98f5c1', 'verde jade': '#00a86b',
  'verde esmeralda': '#059669', 'verde grisaceo': '#7d8a7a', 'rojo sangre': '#8a0303',
  'rojo pasion': '#c8102e', 'rojo fuego': '#d7261e', 'rosa coral': '#f88379',
  'rosa salmon': '#fa8072', 'marron claro': '#a67b5b', 'marron oscuro': '#4a2c17',
  'oro rosa': '#b76e79', 'dorado rosa': '#b76e79', 'beige rosado': '#e3c9b8',
};

// Palabras que aclaran u oscurecen cualquier color del diccionario.
const MODIFICADORES = {
  claro: ['#ffffff', 0.35], pastel: ['#ffffff', 0.5], palido: ['#ffffff', 0.45],
  suave: ['#ffffff', 0.3], brillante: ['#ffffff', 0.12], perla: ['#ffffff', 0.2],
  oscuro: ['#000000', 0.32], profundo: ['#000000', 0.45], mate: ['#000000', 0.12],
};

// Lista para el autocompletado del panel de administración.
export const NOMBRES_COLORES = Object.keys(COLORES).sort((a, b) => a.localeCompare(b, 'es'));

// Quita tildes y espacios extra para comparar los nombres.
const normalizar = texto => texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();

// Acepta #rgb, #rrggbb, #rrggbbaa y rgb(...) escritos directamente.
const esColorDirecto = valor =>
  /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(valor) || /^rgba?\(/i.test(valor);

function aRgb(color) {
  if (color.toLowerCase().startsWith('rgb')) {
    const [r, g, b] = color.match(/[\d.]+/g).map(Number);
    return [r, g, b];
  }
  const limpio = color.replace('#', '');
  const hex = limpio.length === 3 || limpio.length === 4
    ? limpio.split('').map(c => c + c).join('')
    : limpio;
  const numero = parseInt(hex.slice(0, 6), 16);
  return [numero >> 16 & 255, numero >> 8 & 255, numero & 255];
}

// Mezcla dos colores. cantidad 0 = primero, 1 = segundo.
function mezclar(color, otro, cantidad) {
  const [r1, g1, b1] = aRgb(color);
  const [r2, g2, b2] = aRgb(otro);
  const canal = (a, b) => Math.round(a + (b - a) * cantidad).toString(16).padStart(2, '0');
  return `#${canal(r1, r2)}${canal(g1, g2)}${canal(b1, b2)}`;
}

function aplicarModificadores(color, palabras) {
  return palabras.reduce((tono, palabra) => {
    const regla = MODIFICADORES[palabra];
    return regla ? mezclar(tono, regla[0], regla[1]) : tono;
  }, color);
}

// Devuelve el color de una frase como "azul marino oscuro".
function tonoDe(frase) {
  const texto = normalizar(frase);
  if (!texto) return null;
  if (esColorDirecto(frase.trim())) return frase.trim();
  if (COLORES[texto]) return COLORES[texto];

  // Busca la combinación de palabras más larga que exista en el diccionario.
  const palabras = texto.split(' ');
  for (let largo = Math.min(4, palabras.length); largo >= 1; largo--) {
    for (let inicio = 0; inicio + largo <= palabras.length; inicio++) {
      const clave = palabras.slice(inicio, inicio + largo).join(' ');
      if (!COLORES[clave]) continue;
      const resto = [...palabras.slice(0, inicio), ...palabras.slice(inicio + largo)];
      return aplicarModificadores(COLORES[clave], resto);
    }
  }
  return null;
}

// Si el nombre no existe, genera un tono estable a partir del texto.
function colorDeRespaldo(texto) {
  let suma = 0;
  for (const letra of texto) suma = (suma * 31 + letra.charCodeAt(0)) % 360;
  return `hsl(${suma} 48% 46%)`;
}

export function fondoColor(nombre = '') {
  const limpio = nombre.trim();
  if (!limpio) return '#52525b';
  if (esColorDirecto(limpio)) return limpio;

  // Un nombre completo ("azul marino") tiene prioridad sobre la separación.
  const tieneVarios = /[/+,]|\by\b|-/i.test(limpio);
  if (!tieneVarios) {
    const completo = tonoDe(limpio);
    if (completo) return completo;
  }

  const partes = limpio.split(/\s*(?:\/|\+|,|\by\b|-)\s*/i).filter(Boolean);
  const tonos = partes.map(parte => tonoDe(parte) || colorDeRespaldo(parte));
  if (tonos.length === 1) return tonos[0];

  // El segundo tono queda arriba a la izquierda, como en Negro / Rojo.
  return `linear-gradient(135deg, ${tonos.map((tono, i) => `${tono} ${i * 100 / tonos.length}% ${(i + 1) * 100 / tonos.length}%`).join(', ')})`;
}
