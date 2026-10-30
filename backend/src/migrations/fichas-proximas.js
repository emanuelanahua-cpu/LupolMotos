// Datos confirmados en el catálogo Ronco de noviembre de 2026.
const fichas = {
  'ADV GS': {
    motor: '300cc, monocilíndrico, 4 tiempos, 4 válvulas, OHC',
    potencia: '22 HP a 7000 rpm',
    suspension: 'Telescópica invertida / Monoshock',
    neumaticos: '110/90-17 delantero · 130/80-17 trasero',
    detalle: 'Incluye activación automática de alarma.'
  },
  'Explorer V1': {
    motor: '200cc, monocilíndrico, 4 tiempos, OHC, balanceador',
    potencia: '16 HP a 8000 rpm',
    suspension: 'Telescópica invertida / Monoshock',
    neumaticos: '100/90-17 delantero · 110/100-17 trasero'
  }
};

const diapositivas = {
  '2053c3fe-16bf-41b8-8d21-d3efe66f93a7': {
    imagen: '/uploads/346a1ca1deeec2f47a464070fa345842.webp',
    modelo: 'ADV GS'
  },
  '7eaca18e-b774-4a67-9849-7cb50f0dcc27': {
    imagen: '/uploads/a5e5a796b2403a3c8565ab088a05170d.webp',
    modelo: 'Explorer V1'
  }
};

export async function completarFichasProximas(c) {
  const [rows] = await c.query('SELECT id, datos FROM motos');
  const ids = new Map();
  for (const row of rows) {
    const moto = JSON.parse(row.datos);
    const ficha = moto.marca?.toLowerCase() === 'ronco' && fichas[moto.modelo];
    if (!ficha) continue;
    ids.set(moto.modelo, row.id);
    let cambio = false;
    for (const [campo, valor] of Object.entries(ficha)) {
      if (!moto[campo] || moto[campo] === 'Consultar' || (campo === 'motor' && ['200', '300'].includes(moto[campo]))) {
        moto[campo] = valor;
        cambio = true;
      }
    }
    if (cambio) await c.execute('UPDATE motos SET datos = ? WHERE id = ?', [JSON.stringify(moto), row.id]);
  }

  const [config] = await c.execute('SELECT datos FROM configuracion WHERE clave = ?', ['carrusel_proximas']);
  if (!config.length) return;
  const carrusel = JSON.parse(config[0].datos);
  let cambio = false;
  for (const slide of carrusel.slides || []) {
    const esperado = diapositivas[slide.id];
    if (!slide.moto_id && esperado && slide.imagen === esperado.imagen && ids.has(esperado.modelo)) {
      slide.moto_id = ids.get(esperado.modelo);
      cambio = true;
    }
  }
  if (cambio) await c.execute('UPDATE configuracion SET datos = ? WHERE clave = ?', [JSON.stringify(carrusel), 'carrusel_proximas']);
}
