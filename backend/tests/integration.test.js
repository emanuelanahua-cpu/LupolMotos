import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createPool, initialize, catalog } from '../node/db.js';
import { newUser, hashPassword } from '../node/auth.js';
import { createApp } from '../node/app.js';

const env = { DB_HOST: process.env.TEST_DB_HOST || '127.0.0.1', DB_PORT: process.env.TEST_DB_PORT || '33316',
  DB_NAME: process.env.TEST_DB_NAME, DB_USER: process.env.TEST_DB_USER, DB_PASSWORD: process.env.TEST_DB_PASSWORD };
if (!env.DB_NAME?.endsWith('_test')) throw new Error('Usa una base de pruebas con nombre terminado en _test');
const pool = createPool(env);
const appEnv = { LUPOL_SECRET: 'local-integration-test-secret-at-least-32-characters', LUPOL_HTTPS: 'false' };
let server, base, adminCookie, employeeCookie, adminUser, addedMoto;
async function request(url, method = 'GET', body, cookie, headers = {}) {
  const r = await fetch(base + url, { method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { cookie } : {}), ...headers }, body: body ? JSON.stringify(body) : undefined });
  const raw = await r.text(); let data; try { data = JSON.parse(raw); } catch { data = raw; }
  return { status: r.status, data, headers: r.headers };
}
const moto = { categoria: 'Naked', marca: 'Prueba', modelo: 'Integración', precio: 4000, stock: 2, specs: { motor: '200 cc' }, fotos: [] };
before(async () => {
  await initialize(pool);
  for (const t of ['usuarios', 'solicitudes', 'imagenes']) await pool.query(`DELETE FROM ${t}`);
  adminUser = await newUser('testadmin', 'TestPassword123!', 'superadmin');
  const u = adminUser;
  await pool.execute('INSERT INTO usuarios (id, usuario, sal, hash, rol, creado) VALUES (?, ?, ?, ?, ?, ?)', [u.id, u.usuario, u.sal, u.hash, u.rol, u.creado]);
  server = createApp(pool, appEnv).listen(0, '127.0.0.1');
  await new Promise(ok => server.once('listening', ok)); base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => { await new Promise(ok => server.close(ok)); await pool.end(); });

test('API comprueba MySQL y conserva las 113 motos del catálogo', async () => {
  assert.equal((await request('/api/saludo')).data.base_de_datos, 'conectada');
  const all = await catalog(pool); assert.ok(all.length >= 113);
  assert.equal((await request('/api/motos?precio_min=5000&precio_max=10000')).data.motos.every(m => m.precio >= 5000 && m.precio <= 10000), true);
  assert.equal((await request('/api/no-existe')).status, 404);
  assert.equal((await request('/.env')).status, 404);
});
test('sesión firmada, acceso anónimo rechazado y creación pública bloqueada', async () => {
  assert.equal((await request('/api/admin/motos')).status, 401);
  assert.equal((await request('/api/admin/configurar', 'POST', { usuario: 'intruso', clave: 'FakePassword123' })).status, 403);
  const login = await request('/api/admin/login', 'POST', { usuario: 'testadmin', clave: 'TestPassword123!' });
  assert.equal(login.status, 200); assert.equal(login.data.hash, undefined);
  adminCookie = login.headers.get('set-cookie').split(';')[0];
  assert.match(login.headers.get('set-cookie'), /HttpOnly/i);
  assert.equal((await request('/api/admin/yo', 'GET', undefined, adminCookie)).data.rol, 'superadmin');
  assert.equal((await request('/api/admin/yo', 'GET', undefined, adminCookie + 'x')).status, 401);
  assert.equal((await request('/api/admin/login', 'POST', { usuario: 'testadmin', clave: 'incorrecta' })).status, 401);
});
test('hash compatible con scrypt del backend Python', async () => {
  const { execFileSync } = await import('node:child_process');
  const salt = '01'.repeat(16), password = 'Compatibilidad123';
  const python = execFileSync('python', ['-c', "import hashlib; print(hashlib.scrypt(b'Compatibilidad123',salt=bytes.fromhex('01'*16),n=16384,r=8,p=1).hex())"], { encoding: 'utf8' }).trim();
  assert.equal(await hashPassword(password, salt), python);
});
test('crear/editar moto, foto persistente en MySQL y errores atómicos', async () => {
  const photo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZxkAAAAASUVORK5CYII=';
  const created = await request('/api/admin/motos', 'POST', { ...moto, fotos: [photo] }, adminCookie);
  assert.equal(created.status, 201); addedMoto = created.data;
  assert.match(addedMoto.imagen_principal, /^\/uploads\//);
  const image = await fetch(base + addedMoto.imagen_principal); assert.equal(image.status, 200); assert.equal(image.headers.get('content-type'), 'image/png');
  const changed = await request(`/api/admin/motos/${addedMoto.id}`, 'PUT', { ...moto, precio: 4500, imagenes_conservar: addedMoto.imagenes }, adminCookie);
  assert.equal(changed.data.precio, 4500);
  assert.equal((await request(`/api/motos/${addedMoto.id}`)).data.moto.precio, 4500);
  const invalid = await request('/api/admin/motos', 'POST', { ...moto, fotos: [photo, 'data:image/png;base64,YmFk'] }, adminCookie);
  assert.equal(invalid.status, 400);
  const [[count]] = await pool.query('SELECT COUNT(*) AS n FROM imagenes'); assert.equal(Number(count.n), 1);
});
test('roles: empleado no accede a solicitudes ni cambia motos ajenas', async () => {
  const created = await request('/api/admin/usuarios', 'POST', { usuario: 'testemployee', clave: 'EmployeePassword123', rol: 'empleado' }, adminCookie);
  assert.equal(created.status, 201);
  const login = await request('/api/admin/login', 'POST', { usuario: 'testemployee', clave: 'EmployeePassword123' });
  employeeCookie = login.headers.get('set-cookie').split(';')[0];
  assert.equal((await request('/api/admin/solicitudes', 'GET', undefined, employeeCookie)).status, 403);
  assert.equal((await request(`/api/admin/motos/${addedMoto.id}`, 'PUT', moto, employeeCookie)).status, 403);
  assert.equal((await request(`/api/admin/motos/${addedMoto.id}/estado`, 'PATCH', undefined, employeeCookie)).status, 403);
  assert.equal((await request(`/api/admin/usuarios/${adminUser.id}`, 'DELETE', undefined, adminCookie)).status, 400);
});
test('reservas, cotizaciones y contactos se guardan y sobreviven a reiniciar la aplicación', async () => {
  const customer = { id_moto: 1, modelo_moto: 'Prueba', nombre_cliente: 'Cliente de prueba', telefono_cliente: '999999999', dni_cliente: '00000000' };
  const reserve = await request('/api/reservas', 'POST', customer);
  assert.equal(reserve.data.exito, true);
  const quote = await request('/api/cotizaciones', 'POST', { ...customer, modalidad: 'CONTADO', precio_moto: 5000, numero_cuotas: 0 });
  assert.equal(quote.data.exito, true);
  assert.equal((await request('/api/contacto', 'POST', { nombre: 'Prueba', telefono: '999999999', asunto: 'Prueba', mensaje: 'Consulta de prueba' })).data.exito, true);
  const [[count]] = await pool.query('SELECT COUNT(*) AS n FROM solicitudes'); assert.equal(Number(count.n), 3);
  await new Promise(ok => server.close(ok));
  await initialize(pool); // no sobreescribe la moto editada ni las cuentas
  server = createApp(pool, appEnv).listen(0, '127.0.0.1');
  await new Promise(ok => server.once('listening', ok)); base = `http://127.0.0.1:${server.address().port}`;
  const requests = await request('/api/admin/solicitudes', 'GET', undefined, adminCookie);
  assert.equal(requests.data.length, 3);
  assert.equal((await request(`/api/motos/${addedMoto.id}`)).data.moto.precio, 4500);
  assert.equal((await request('/api/admin/solicitudes?tipo=reserva', 'GET', undefined, adminCookie)).data.length, 1);
  assert.equal((await request('/api/contacto', 'POST', { nombre: '' })).status, 422);
  assert.equal((await request('/api/contacto', 'POST', {}, undefined, { Origin: 'https://otro-sitio.example' })).status, 403);
});
test('desactivar y eliminar una moto respeta el catálogo público', async () => {
  assert.equal((await request(`/api/admin/motos/${addedMoto.id}/estado`, 'PATCH', undefined, adminCookie)).data.estado, 'desactivado');
  assert.equal((await request(`/api/motos/${addedMoto.id}`)).status, 404);
  assert.equal((await request(`/api/admin/motos/${addedMoto.id}`, 'DELETE', undefined, adminCookie)).status, 200);
});
test('fallo de base de datos devuelve error, nunca éxito', async () => {
  const c = await pool.getConnection();
  await c.query('RENAME TABLE solicitudes TO solicitudes_test_offline');
  try {
    const r = await request('/api/contacto', 'POST', { nombre: 'Prueba', telefono: '999999999', asunto: 'Prueba', mensaje: 'Prueba' });
    assert.equal(r.status, 503); assert.equal(r.data.exito, undefined);
  } finally { await c.query('RENAME TABLE solicitudes_test_offline TO solicitudes'); c.release(); }
});
