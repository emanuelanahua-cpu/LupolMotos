import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import path from 'node:path';
import { root, catalog, setting, transaction, decode } from './db.js';
import { auth, loginSchema, newUser, hashPassword, equal, roles, publicUser } from './auth.js';

const PISTERAS = ['Naked', 'Racing / Sport', 'Chopper / Custom', 'Chacarera', 'Motocross', 'Scooter'];
const ELECTRICAS = ['Moto Eléctrica', 'Bicimoto Eléctrica', 'Carguero Eléctrico', 'Trimoto Eléctrica', 'Monopatín Eléctrico'];
const fields = ['motor', 'transmision', 'tanque', 'frenos', 'enfriamiento', 'suspension', 'neumaticos', 'bateria', 'autonomia', 'velocidad_maxima', 'carga_maxima', 'dimensiones', 'potencia', 'torque'];
const text = (v, max = 120) => String(v ?? '').trim().slice(0, max);
const httpError = (status, message) => Object.assign(new Error(message), { status });
const parse = schema => (req, res, next) => { req.input = schema.parse(req.body); next(); };
const motoSchema = z.object({
  categoria: z.enum([...PISTERAS, ...ELECTRICAS]), marca: z.string().trim().min(1).max(60), modelo: z.string().trim().min(1).max(80),
  precio: z.number().finite().min(0), stock: z.number().int().min(0), destacado: z.boolean().default(false),
  detalle: z.string().max(800).default(''), specs: z.record(z.string(), z.string().max(120)).default({}),
  fotos: z.array(z.string().max(3_400_000)).max(5).default([]),
  imagenes_conservar: z.array(z.string().max(1000)).max(10).default([]), principal: z.string().max(1000).nullable().optional(),
  fotos_nuevas: z.array(z.string().max(3_400_000)).max(10).default([]),
});
const customer = { nombre_cliente: z.string().trim().min(1).max(150), telefono_cliente: z.string().trim().min(6).max(30) };
const quoteSchema = z.object({
  ...customer, id_moto: z.number().int().positive(), modelo_moto: z.string().min(1).max(150),
  modalidad: z.enum(['CONTADO', 'CREDITO']), color_seleccionado: z.string().max(100).nullable().optional(),
  precio_moto: z.number().finite().min(0), cuota_inicial: z.number().finite().min(0).default(0),
  numero_cuotas: z.number().int().min(0).max(120).default(12), cuota_mensual_estimada: z.number().finite().min(0).default(0),
  dni_cliente: z.string().max(30).nullable().optional(), email_cliente: z.string().max(254).nullable().optional(),
  ciudad: z.string().max(150).optional(), comentarios: z.string().max(2000).nullable().optional(),
});
const reserveSchema = z.object({
  ...customer, id_moto: z.number().int().positive(), modelo_moto: z.string().min(1).max(150),
  color_seleccionado: z.string().max(100).nullable().optional(), monto_separacion: z.number().finite().min(0).default(200),
  dni_cliente: z.string().min(1).max(30), direccion_entrega: z.string().max(300).default('Tacna'), metodo_pago: z.string().max(100).optional(),
});
const contactSchema = z.object({ nombre: z.string().trim().min(1).max(150), telefono: z.string().min(6).max(30),
  email: z.string().max(254).nullable().optional(), asunto: z.string().min(1).max(200), mensaje: z.string().min(1).max(4000) });

async function saveImages(c, photos) {
  const urls = [];
  for (const photo of photos) {
    const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(photo);
    if (!match) throw httpError(400, 'Foto no válida (jpg, png o webp)');
    const data = Buffer.from(match[2], 'base64');
    const valid = match[1] === 'jpeg' ? data[0] === 255 && data[1] === 216 && data[2] === 255
      : match[1] === 'png' ? data.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
      : data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WEBP';
    if (!valid || data.length > 2_500_000) throw httpError(400, 'Imagen inválida o de más de 2.5 MB');
    const id = `${randomBytes(16).toString('hex')}.${match[1] === 'jpeg' ? 'jpg' : match[1]}`;
    await c.execute('INSERT INTO imagenes (id, mime, contenido) VALUES (?, ?, ?)', [id, `image/${match[1]}`, data]);
    urls.push(`/uploads/${id}`);
  }
  return urls;
}
function motoValues(d, previous = {}) {
  const electrica = ELECTRICAS.includes(d.categoria);
  const m = { ...previous, marca: d.marca, modelo: d.modelo, categoria: d.categoria, tipo: electrica ? 'Eléctricas' : 'Pisteras',
    precio: d.precio, stock_total: d.stock, destacado: d.destacado, detalle: d.detalle };
  for (const f of fields) if (f in d.specs) m[f] = text(d.specs[f]) || 'Consultar';
  return m;
}

export function createApp(pool, env = process.env) {
  const app = express();
  app.disable('x-powered-by');
  // Hostinger está detrás de un proxy; no aceptar cadenas arbitrarias de proxies.
  app.set('trust proxy', 1);
  app.use((req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    if (req.path.startsWith('/api/')) res.set('Cache-Control', 'no-store');
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      const origin = req.get('origin');
      const allowed = new Set((env.ALLOWED_ORIGINS || 'https://lupolmotos.com,https://www.lupolmotos.com,http://localhost:3000,http://localhost:8000').split(','));
      if (origin && !allowed.has(origin)) return res.status(403).json({ detail: 'Origen no autorizado' });
    }
    next();
  });
  app.use(express.json({ limit: '34mb' }));
  const session = auth(pool, env.LUPOL_SECRET, env.LUPOL_HTTPS === 'true');
  const loginLimit = rateLimit({ windowMs: 10 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false,
    message: { detail: 'Demasiados intentos. Espera 10 minutos.' } });
  const requestLimit = rateLimit({ windowMs: 10 * 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false,
    message: { detail: 'Demasiadas solicitudes. Inténtalo más tarde.' } });

  app.get('/api/saludo', async (req, res) => {
    await pool.query('SELECT 1');
    res.json({ estado: 'en_linea', base_de_datos: 'conectada', mensaje: 'Backend de Lupol Motos funcionando correctamente', version: '2.0.0' });
  });
  app.get('/api/tienda', async (req, res) => res.json(await setting(pool, 'tienda')));
  app.get('/api/motos', async (req, res) => {
    const q = req.query;
    let motos = (await catalog(pool)).filter(m => m.estado === 'activado');
    if (q.busqueda) motos = motos.filter(m => ['modelo', 'motor', 'detalle'].some(f => String(m[f] || '').toLowerCase().includes(String(q.busqueda).toLowerCase())));
    for (const [f, all] of [['tipo', 'Todos'], ['categoria', 'Todas']]) if (q[f] && q[f] !== all) motos = motos.filter(m => String(m[f]).toLowerCase() === String(q[f]).toLowerCase());
    if (q.precio_min !== undefined) motos = motos.filter(m => Number(m.precio) >= Number(q.precio_min));
    if (q.precio_max !== undefined) motos = motos.filter(m => Number(m.precio) <= Number(q.precio_max));
    if (q.frenos && q.frenos !== 'Todos') motos = motos.filter(m => String(m.frenos || '').toLowerCase().includes(String(q.frenos).toLowerCase()));
    if (['true', '1'].includes(q.destacados_solo)) motos = motos.filter(m => m.destacado);
    motos.sort(q.ordenar_por === 'precio_asc' ? (a,b) => a.precio - b.precio : q.ordenar_por === 'precio_desc' ? (a,b) => b.precio - a.precio : q.ordenar_por === 'nombre' ? (a,b) => a.modelo.localeCompare(b.modelo) : (a,b) => (b.visitas || 0) - (a.visitas || 0));
    res.json({ total: motos.length, motos });
  });
  app.get('/api/motos/:id', async (req, res) => {
    const all = await catalog(pool), moto = all.find(m => m.id === Number(req.params.id) && m.estado === 'activado');
    if (!moto) throw httpError(404, 'Motocicleta no encontrada');
    res.json({ moto, relacionadas: all.filter(m => m.id !== moto.id && m.estado === 'activado' && (m.tipo === moto.tipo || m.destacado)).slice(0, 4) });
  });
  app.get('/api/repuestos', async (req, res) => {
    let items = await catalog(pool, 'repuestos'); const q = req.query;
    if (q.busqueda) items = items.filter(r => ['nombre', 'codigo', 'aplicacion_modelos'].some(f => String(r[f] || '').toLowerCase().includes(String(q.busqueda).toLowerCase())));
    for (const [f, all] of [['categoria', 'Todas'], ['tipo_moto', 'Todos']]) if (q[f] && q[f] !== all) items = items.filter(r => String(r[f]).toLowerCase() === String(q[f]).toLowerCase());
    if (['true', '1'].includes(q.solo_con_stock)) items = items.filter(r => r.stock > 0);
    res.json({ total: items.length, repuestos: items });
  });
  app.get('/api/filtros', async (req, res) => {
    const motos = await catalog(pool), parts = await catalog(pool, 'repuestos');
    const unique = (items, key) => [...new Set(items.map(m => m[key]).filter(Boolean))].sort();
    const prices = motos.map(m => Number(m.precio)).filter(p => p > 0);
    res.json({ tipos_moto: unique(motos, 'tipo'), categorias_moto: unique(motos, 'categoria'), frenos: unique(motos, 'frenos'), enfriamientos: unique(motos, 'enfriamiento'),
      categorias_repuestos: unique(parts, 'categoria'), tipos_repuesto_moto: unique(parts, 'tipo_moto'), rango_precios: { min: prices.length ? Math.min(...prices) : 5000, max: prices.length ? Math.max(...prices) : 25000 } });
  });
  app.get('/api/destacados', async (req, res) => {
    const all = (await catalog(pool)).filter(m => m.estado === 'activado');
    const best = tipo => { const items = all.filter(m => m.tipo === tipo); const featured = items.filter(m => m.destacado);
      const m = (featured.length ? featured : items).sort((a,b) => b.precio - a.precio)[0];
      return m ? { ...m, nombre: `${m.marca || ''} ${m.modelo}`.trim() } : null; };
    res.json({ pisteras: best('Pisteras'), electricas: best('Eléctricas') });
  });
  async function recordRequest(type, data) {
    const [r] = await pool.execute('INSERT INTO solicitudes (tipo, datos) VALUES (?, ?)', [type, JSON.stringify(data)]);
    const tienda = await setting(pool, 'tienda');
    return { id: r.insertId, phone: env.WHATSAPP_NUMERO || tienda.whatsapp || '51980687475' };
  }
  app.post('/api/cotizaciones', requestLimit, parse(quoteSchema), async (req, res) => {
    const d = req.input, r = await recordRequest('cotizacion', d);
    const msg = `Hola Lupol Motos, quiero cotizar ${d.modalidad === 'CREDITO' ? 'a CRÉDITO' : 'al CONTADO'} la *${d.modelo_moto}* (Color: ${d.color_seleccionado || 'Estándar'}). Precio de referencia: S/. ${d.precio_moto.toFixed(2)}. ${d.modalidad === 'CREDITO' ? `Inicial: S/. ${d.cuota_inicial.toFixed(2)}, ${d.numero_cuotas} cuotas estimadas de S/. ${d.cuota_mensual_estimada.toFixed(2)}. ` : ''}Mi nombre es ${d.nombre_cliente} (Cel: ${d.telefono_cliente}).`;
    res.json({ exito: true, mensaje: 'Cotización guardada correctamente', id_cotizacion: r.id, enlace_whatsapp: `https://wa.me/${r.phone}?text=${encodeURIComponent(msg)}` });
  });
  app.post('/api/reservas', requestLimit, parse(reserveSchema), async (req, res) => {
    const d = req.input, r = await recordRequest('reserva', d);
    const msg = `🚨 *SOLICITUD DE RESERVA LUPOL MOTOS*\nModelo: *${d.modelo_moto}*\nColor: ${d.color_seleccionado || 'A coordinar'}\nCliente: ${d.nombre_cliente} (DNI: ${d.dni_cliente})\nTeléfono: ${d.telefono_cliente}\nSeparación propuesta: S/. ${d.monto_separacion.toFixed(2)}\nEntrega: ${d.direccion_entrega}`;
    res.json({ exito: true, mensaje: 'Solicitud de reserva guardada. Un asesor confirmará la disponibilidad y el pago.', id_reserva: r.id, enlace_whatsapp: `https://wa.me/${r.phone}?text=${encodeURIComponent(msg)}` });
  });
  app.post('/api/contacto', requestLimit, parse(contactSchema), async (req, res) => {
    const r = await recordRequest('contacto', req.input); res.json({ exito: true, mensaje: 'Mensaje recibido correctamente', id: r.id });
  });

  app.get('/api/admin/estado', (req, res) => res.json({ necesita_configuracion: false, categorias: { Pisteras: PISTERAS, Eléctricas: ELECTRICAS } }));
  // El primer administrador se importa o se configura por variables de entorno, nunca desde una ruta pública.
  app.post('/api/admin/configurar', (req, res) => res.status(403).json({ detail: 'La cuenta inicial se configura desde el servidor.' }));
  app.post('/api/admin/login', loginLimit, parse(loginSchema), async (req, res) => {
    const d = req.input; const [users] = await pool.execute('SELECT * FROM usuarios WHERE usuario = ?', [d.usuario]);
    const user = users[0]; const hash = await hashPassword(d.clave, user?.sal || '00000000000000000000000000000000');
    if (!user || !equal(hash, user.hash)) throw httpError(401, 'Usuario o contraseña incorrectos');
    session.login(res, user.id); res.json(publicUser(user));
  });
  app.post('/api/admin/logout', (req, res) => { session.logout(res); res.json({ ok: true }); });
  app.use('/api/admin', session.required);
  app.get('/api/admin/yo', (req, res) => res.json(publicUser(req.user)));
  app.get('/api/admin/motos', async (req, res) => res.json(await catalog(pool)));
  app.post('/api/admin/motos', parse(motoSchema), async (req, res) => {
    const d = req.input;
    const moto = await transaction(pool, async c => {
      const images = await saveImages(c, d.fotos);
      const m = motoValues(d, { estado: 'activado', visitas: 0, stock_reservado: 0, colores: [], ficha_pdf: null, creado_por: req.user.usuario });
      for (const f of fields) m[f] ??= 'Consultar';
      m.imagenes = images; m.imagen_principal = images[0] || `/multimedia/categorias/${ELECTRICAS.includes(d.categoria) ? 'electricas_static.png' : '2ruedas_static.png'}`;
      m.vistas_360 = { principal: m.imagen_principal };
      const [r] = await c.execute('INSERT INTO motos (datos) VALUES (?)', [JSON.stringify(m)]); m.id = r.insertId;
      await c.execute('UPDATE motos SET datos = ? WHERE id = ?', [JSON.stringify(m), m.id]); return m;
    }); res.status(201).json(moto);
  });
  app.put('/api/admin/motos/:id', parse(motoSchema), async (req, res) => {
    const d = req.input, id = Number(req.params.id);
    const moto = await transaction(pool, async c => {
      const [rows] = await c.execute('SELECT datos FROM motos WHERE id = ? FOR UPDATE', [id]);
      if (!rows.length) throw httpError(404, 'Moto no encontrada');
      const old = decode(rows[0].datos);
      if (req.user.rol === 'empleado' && old.creado_por !== req.user.usuario) throw httpError(403, 'Solo puedes editar las motos que tú agregaste');
      if (!d.imagenes_conservar.every(p => (old.imagenes || []).includes(p))) throw httpError(400, 'Fotos a conservar no válidas');
      if (d.imagenes_conservar.length + d.fotos_nuevas.length > 10) throw httpError(400, 'Máximo 10 fotos por moto');
      const images = [...d.imagenes_conservar, ...await saveImages(c, d.fotos_nuevas)];
      const m = motoValues(d, old); m.id = id; m.imagenes = images;
      m.imagen_principal = images.includes(d.principal) ? d.principal : images.includes(old.imagen_principal) ? old.imagen_principal : images[0] || `/multimedia/categorias/${ELECTRICAS.includes(d.categoria) ? 'electricas_static.png' : '2ruedas_static.png'}`;
      if (!m.vistas_360 || Object.keys(m.vistas_360).length === 0 || 'principal' in m.vistas_360) m.vistas_360 = { principal: m.imagen_principal };
      m.editado_por = req.user.usuario;
      await c.execute('UPDATE motos SET datos = ? WHERE id = ?', [JSON.stringify(m), id]);
      // No borrar archivos compartidos del catálogo al quitar una imagen de una moto.
      return m;
    }); res.json(moto);
  });
  app.patch('/api/admin/motos/:id/estado', session.roles('superadmin'), async (req, res) => {
    const estado = await transaction(pool, async c => {
      const [rows] = await c.execute('SELECT datos FROM motos WHERE id = ? FOR UPDATE', [req.params.id]);
      if (!rows.length) throw httpError(404, 'Moto no encontrada');
      const m = decode(rows[0].datos); m.estado = m.estado === 'activado' ? 'desactivado' : 'activado';
      await c.execute('UPDATE motos SET datos = ? WHERE id = ?', [JSON.stringify(m), req.params.id]); return m.estado;
    }); res.json({ estado });
  });
  app.delete('/api/admin/motos/:id', session.roles('superadmin'), async (req, res) => {
    const [r] = await pool.execute('DELETE FROM motos WHERE id = ?', [req.params.id]);
    if (!r.affectedRows) throw httpError(404, 'Moto no encontrada'); res.json({ ok: true });
  });
  app.get('/api/admin/usuarios', session.roles('superadmin', 'admin'), async (req, res) => {
    const [users] = await pool.query('SELECT * FROM usuarios ORDER BY creado'); res.json(users.map(publicUser));
  });
  app.post('/api/admin/usuarios', session.roles('superadmin', 'admin'), parse(loginSchema.extend({ rol: z.enum(roles) })), async (req, res) => {
    const d = req.input;
    if (req.user.rol === 'admin' && d.rol !== 'empleado') throw httpError(403, 'El administrador solo puede crear empleados');
    const u = await newUser(d.usuario, d.clave, d.rol);
    try { await pool.execute('INSERT INTO usuarios (id, usuario, sal, hash, rol, creado) VALUES (?, ?, ?, ?, ?, ?)', [u.id, u.usuario, u.sal, u.hash, u.rol, u.creado]); }
    catch (e) { if (e.code === 'ER_DUP_ENTRY') throw httpError(409, 'Ese usuario ya existe'); throw e; }
    res.status(201).json(publicUser(u));
  });
  app.delete('/api/admin/usuarios/:id', session.roles('superadmin'), async (req, res) => {
    if (req.params.id === req.user.id) throw httpError(400, 'No puedes eliminarte a ti mismo');
    const [r] = await pool.execute('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
    if (!r.affectedRows) throw httpError(404, 'Usuario no encontrado'); res.json({ ok: true });
  });
  app.get('/api/admin/solicitudes', session.roles('superadmin', 'admin'), async (req, res) => {
    const tipo = req.query.tipo;
    if (tipo && !['cotizacion', 'reserva', 'contacto'].includes(tipo)) throw httpError(400, 'Tipo inválido');
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
    const before = Number(req.query.antes_de) || Number.MAX_SAFE_INTEGER;
    const [rows] = await pool.query(`SELECT id, tipo, datos, creado FROM solicitudes WHERE id < ? ${tipo ? 'AND tipo = ?' : ''} ORDER BY id DESC LIMIT ?`, tipo ? [before, tipo, limit] : [before, limit]);
    res.json(rows.map(r => ({ ...r, datos: decode(r.datos) })));
  });
  app.use('/api', (req, res) => res.status(404).json({ detail: 'Ruta no encontrada' }));
  app.get('/uploads/:id', async (req, res) => {
    if (!/^[a-f0-9]{32}\.(jpg|png|webp)$/.test(req.params.id)) throw httpError(404, 'Imagen no encontrada');
    const [rows] = await pool.execute('SELECT mime, contenido FROM imagenes WHERE id = ?', [req.params.id]);
    if (!rows.length) throw httpError(404, 'Imagen no encontrada');
    res.set('Content-Type', rows[0].mime).set('Cache-Control', 'public, max-age=31536000, immutable').send(rows[0].contenido);
  });
  const dist = path.join(root, 'frontend/dist');
  app.use(express.static(dist, { index: false, dotfiles: 'deny' }));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || path.extname(req.path) || req.path.split('/').some(p => p.startsWith('.')) || req.path.startsWith('/uploads/')) return res.status(404).json({ detail: 'Archivo no encontrado' });
    res.sendFile(path.join(dist, 'index.html'), e => e && next(e));
  });
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error instanceof z.ZodError) return res.status(422).json({ detail: 'Revisa los datos ingresados', errores: error.issues.map(i => ({ campo: i.path.join('.'), mensaje: i.message })) });
    const status = error.status >= 400 && error.status < 500 ? error.status : 503;
    if (status === 503) console.error('Error de servicio:', error.code || error.name);
    res.status(status).json({ detail: status === 503 ? 'El servicio no está disponible. Inténtalo de nuevo.' : error.message });
  });
  return app;
}
