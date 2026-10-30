import ComercioPanel from './ComercioPanel';
import {api} from '../services/adminService';
import React, { useState, useEffect, useCallback } from 'react';
import { fondoColor } from '../utils/colores';
import { reducirFoto } from '../utils/reducirFoto';
import CarruselAdmin from './CarruselAdmin';

const ROL = { superadmin: 'Superadministrador', admin: 'Administrador', empleado: 'Empleado' };
const SPECS = {
  p: [['motor', 'Motor (ej. 200cc, 4 tiempos)'], ['transmision', 'Transmisión'], ['tanque', 'Tanque'], ['frenos', 'Frenos'], ['enfriamiento', 'Enfriamiento']],
  e: [['motor', 'Potencia del motor (ej. 1500W)'], ['bateria', 'Batería'], ['autonomia', 'Autonomía'], ['velocidad_maxima', 'Velocidad máxima'], ['carga_maxima', 'Carga máxima'], ['frenos', 'Frenos']],
};
const SPECS_EDIT = {
  p: [...SPECS.p, ['potencia', 'Potencia'], ['torque', 'Torque'], ['suspension', 'Suspensión'], ['neumaticos', 'Neumáticos']],
  e: [...SPECS.e, ['potencia', 'Potencia'], ['suspension', 'Suspensión'], ['neumaticos', 'Neumáticos'], ['dimensiones', 'Dimensiones']],
};
const src = (p) => (!p ? '' : /^(\/|https?:|data:)/.test(p) ? p : '/' + p);
// Barra de desplazamiento delgada y amarilla (estilo Lupol)
const barra = '[scrollbar-width:thin] [scrollbar-color:#fad911_#1c1c22] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-zinc-900 [&::-webkit-scrollbar-thumb]:bg-[#fad911] [&::-webkit-scrollbar-thumb]:rounded-full';
const scroll = `max-h-[65vh] overflow-y-auto pr-2 ${barra}`;
const inp = 'w-full rounded-lg bg-[#0a0a0c] border border-zinc-700 px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-[#fad911]';
const lbl = 'block text-xs text-zinc-400 mt-3 mb-1';
const btn = 'bg-[#fad911] text-black font-bold rounded-lg px-4 py-2.5 text-sm hover:bg-[#fce23e] transition-colors';
const btnSec = 'border border-zinc-700 text-zinc-200 rounded-lg px-3 py-1.5 text-xs hover:border-[#fad911] transition-colors';
const card = 'bg-[#121318] border border-zinc-800 rounded-2xl p-5';

function Acceso({ setup, alEntrar, alVolver }) {
  const [u, setU] = useState(''); const [p, setP] = useState(''); const [p2, setP2] = useState(''); const [err, setErr] = useState('');
  const enviar = async (e) => {
    e.preventDefault(); setErr('');
    if (setup && p !== p2) return setErr('Las contraseñas no coinciden.');
    try {
      if (setup) await api('POST', '/api/admin/configurar', { usuario: u, clave: p });
      alEntrar(await api('POST', '/api/admin/login', { usuario: u, clave: p }));
    } catch (x) { setErr(x.message); }
  };
  const l = 'block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mt-5 mb-1.5';
  return (
    <form onSubmit={enviar} className="bg-[#121318] border border-zinc-800 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
      <h1 className="text-2xl font-black uppercase tracking-wide text-[#fad911] text-center leading-snug">
        {setup ? 'Crear superadministrador' : 'Ingresar al sistema'}
      </h1>
      {setup && <p className="text-xs text-zinc-400 text-center mt-2">Primer arranque: define el usuario y la clave con control total.</p>}
      <label className={l}>Usuario</label>
      <input className={inp} placeholder="tu usuario" value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" />
      <label className={l}>Contraseña</label>
      <input className={inp} type="password" placeholder="••••••••" value={p} onChange={(e) => setP(e.target.value)} autoComplete={setup ? 'new-password' : 'current-password'} />
      {setup && (<><label className={l}>Repetir contraseña</label><input className={inp} type="password" value={p2} onChange={(e) => setP2(e.target.value)} autoComplete="new-password" /></>)}
      <p className="text-xs text-red-400 min-h-4 mt-3">{err}</p>
      <button className={`${btn} w-full mt-2 uppercase tracking-wider`}>{setup ? 'Crear y entrar' : 'Entrar'}</button>
      <button type="button" onClick={alVolver} className="block mx-auto mt-5 text-xs text-zinc-400 hover:text-[#fad911]">← Volver a la tienda</button>
    </form>
  );
}

function FormMoto({ cats, alGuardar, moto, alCancelar }) {
  const editando = !!moto;
  const vacio = { marca: '', modelo: '', precio: '', stock: 1, detalle: '', destacado: false };
  const [f, setF] = useState(moto ? { marca: moto.marca, modelo: moto.modelo, precio: moto.precio, stock: moto.stock_total, detalle: moto.detalle || '', destacado: !!moto.destacado } : vacio);
  const [categoria, setCategoria] = useState(moto ? moto.categoria : (Object.values(cats).flat()[0] || ''));
  const [specs, setSpecs] = useState(moto || {});
  const [fotos, setFotos] = useState([]);
  const [kept, setKept] = useState(moto ? moto.imagenes || [] : []);
  const [principal, setPrincipal] = useState(moto ? moto.imagen_principal : null);
  const [colores, setColores] = useState(moto?.colores || []);
  const [msg, setMsg] = useState({ t: '', ok: false });
  const nombreMoto = [f.marca, f.modelo].filter(Boolean).join(' ') || 'esta moto';
  useEffect(() => { if (!categoria) setCategoria(Object.values(cats).flat()[0] || ''); }, [cats]); // eslint-disable-line react-hooks/exhaustive-deps
  const elec = (cats['Eléctricas'] || []).includes(categoria);
  const lista = (editando ? SPECS_EDIT : SPECS)[elec ? 'e' : 'p'];
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const actualizarColor = (indice, cambios) => setColores(actuales => actuales.map((color, i) => i === indice ? { ...color, ...cambios } : color));

  const guardar = async () => {
    setMsg({ t: '', ok: false });
    try {
      if (colores.some(color => !color.nombre.trim())) throw new Error('Cada color necesita un nombre.');
      const sp = {}; lista.forEach(([k]) => { sp[k] = specs[k] || ''; });
      const base = { categoria, marca: f.marca, modelo: f.modelo, precio: +f.precio || 0, stock: +f.stock || 0, destacado: f.destacado, detalle: f.detalle, specs: sp, colores };
      if (editando) {
        await api('PUT', `/api/admin/motos/${moto.id}`, { ...base, imagenes_conservar: kept, principal, fotos_nuevas: fotos });
        alGuardar(); alCancelar();
      } else {
        await api('POST', '/api/admin/motos', { ...base, fotos });
        setF(vacio); setSpecs({}); setFotos([]); setColores([]); setMsg({ t: 'Moto guardada ✔', ok: true }); alGuardar();
      }
    } catch (x) { setMsg({ t: x.message, ok: false }); }
  };

  return (
    <div className={card}>
      <h2 className="font-bold text-white mb-1">{editando ? `Editar ${moto.marca} ${moto.modelo}` : 'Agregar moto'}</h2>
      <label className={lbl}>Categoría</label>
      <select className={inp} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
        {Object.entries(cats).map(([g, a]) => (<optgroup key={g} label={g}>{a.map((c) => <option key={c}>{c}</option>)}</optgroup>))}
      </select>
      <div className="grid grid-cols-2 gap-3">
        <div><label className={lbl}>Marca</label><input className={inp} value={f.marca} onChange={set('marca')} /></div>
        <div><label className={lbl}>Modelo</label><input className={inp} value={f.modelo} onChange={set('modelo')} /></div>
        <div><label className={lbl}>Precio (S/)</label><input className={inp} type="number" min="0" value={f.precio} onChange={set('precio')} /></div>
        <div><label className={lbl}>Stock</label><input className={inp} type="number" min="0" value={f.stock} onChange={set('stock')} /></div>
      </div>
      {lista.map(([k, l]) => (
        <div key={k}><label className={lbl}>{l}</label><input className={inp} value={specs[k] || ''} onChange={(e) => setSpecs({ ...specs, [k]: e.target.value })} /></div>
      ))}
      <label className={lbl}>Detalle</label><textarea className={inp} rows={3} value={f.detalle} onChange={set('detalle')} />
      <label className="flex items-center gap-2 text-xs text-zinc-300 mt-3"><input type="checkbox" checked={f.destacado} onChange={set('destacado')} /> Destacada</label>

      {editando && kept.length > 0 && (
        <>
          <label className={lbl}>Fotos actuales</label>
          <div className="flex gap-2 flex-wrap">
            {kept.map((p) => (
              <div key={p} className={`w-24 rounded-lg border p-1 text-center ${p === principal ? 'border-[#fad911]' : 'border-zinc-700'}`}>
                <img src={src(p)} alt="" className="w-full h-16 object-cover rounded-md" />
                <button type="button" className="text-[10px] text-[#fad911] mt-1 block w-full" onClick={() => setPrincipal(p)}>{p === principal ? '★ Principal' : 'Hacer principal'}</button>
                <button type="button" className="text-[10px] text-red-400 block w-full" onClick={() => { setKept(kept.filter((x) => x !== p)); if (p === principal) setPrincipal(null); }}>Quitar</button>
              </div>
            ))}
          </div>
        </>
      )}
      <label className={lbl}>{editando ? 'Agregar más fotos' : 'Fotos (hasta 5; la primera es la principal)'}</label>
      <input className={inp} type="file" accept="image/*" multiple onChange={async (e) => setFotos(await Promise.all([...e.target.files].slice(0, 5).map(reducirFoto)))} />
      <div className="flex gap-2 flex-wrap mt-2">{fotos.map((s, i) => <img key={i} src={s} alt="" className="w-16 h-12 object-cover rounded-md" />)}</div>

      <div className="mt-5 rounded-xl border border-zinc-700 bg-zinc-950/70 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">Colores de {nombreMoto}</h3>
            <p className="text-xs text-zinc-400">Agrega el nombre y la foto de cada color. Quedarán asociados solo a esta moto.</p>
          </div>
          <button type="button" className={btnSec} disabled={colores.length >= 12} onClick={() => setColores(actuales => [...actuales, { nombre: '', img_moto: '' }])}>+ Color</button>
        </div>
        <div className="space-y-3 mt-3">
          {colores.map((color, indice) => (
            <div key={indice} className="rounded-lg border border-zinc-800 bg-[#121318] p-3">
              <p className="mb-2 text-xs font-semibold text-zinc-300">Color {indice + 1} de {nombreMoto}</p>
              <div className="flex items-center gap-3">
                <span className="h-9 w-9 rounded-full border border-white shrink-0" style={{ background: fondoColor(color.nombre) }} aria-hidden="true" />
                <input className={inp} aria-label={`Nombre del color ${indice + 1}`} maxLength={40} placeholder="Ej. Rojo / Negro" value={color.nombre} onChange={e => actualizarColor(indice, { nombre: e.target.value })} />
                <button type="button" className="text-xs text-red-400" onClick={() => setColores(actuales => actuales.filter((_, i) => i !== indice))}>Quitar</button>
              </div>
              <div className="mt-3 flex items-center gap-3">
                {color.img_moto ? (
                  <img src={src(color.img_moto)} alt={`Foto de ${nombreMoto} en ${color.nombre || `color ${indice + 1}`}`} className="h-16 w-20 shrink-0 rounded-lg border border-zinc-700 bg-zinc-900 object-contain" />
                ) : (
                  <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-lg border border-dashed border-zinc-700 text-center text-[10px] text-zinc-500">Sin foto</div>
                )}
                <div className="min-w-0 flex-1">
                  <label className="mb-1 block text-xs text-zinc-400" htmlFor={`foto-color-${moto?.id || 'nueva'}-${indice}`}>Foto de este color</label>
                  <input id={`foto-color-${moto?.id || 'nueva'}-${indice}`} className={inp} type="file" accept="image/*" onChange={async e => {
                    const archivo = e.target.files?.[0];
                    if (!archivo) return;
                    try { actualizarColor(indice, { img_moto: await reducirFoto(archivo) }); }
                    catch { setMsg({ t: 'No se pudo procesar la foto del color. Prueba con otra imagen.', ok: false }); }
                  }} />
                </div>
              </div>
              {!color.img_moto && <p className="mt-2 text-[11px] text-zinc-500">Sin foto propia, este color mostrará la foto principal de la moto.</p>}
            </div>
          ))}
        </div>
      </div>

      <p className={`text-xs min-h-4 mt-2 ${msg.ok ? 'text-green-400' : 'text-red-400'}`}>{msg.t}</p>
      <div className="flex gap-2 mt-2">
        <button onClick={guardar} className={`${btn} flex-1`}>{editando ? 'Guardar cambios' : 'Guardar moto'}</button>
        {editando && <button onClick={alCancelar} className={btnSec}>Cancelar</button>}
      </div>
    </div>
  );
}

function Catalogo({ motos, cats, yo, recargar }) {
  const [filtro, setFiltro] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
  const [editando, setEditando] = useState(null);
  const lista = motos
    .filter((m) => filtro === 'Todas' || m.categoria === filtro)
    .filter((m) => {
      const q = busqueda.trim().toLowerCase();
      if (!q) return true;
      return (
        m.marca?.toLowerCase().includes(q) ||
        m.modelo?.toLowerCase().includes(q) ||
        m.categoria?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => b.id - a.id);
  const accion = async (fn) => { try { await fn(); recargar(); } catch (x) { alert(x.message); } };
  const puedeEditar = (m) => yo.rol !== 'empleado' || m.creado_por === yo.usuario;
  return (
    <div className={card}>
      <h2 className="font-bold text-white mb-3">Catálogo ({motos.length})</h2>

      {/* Buscador */}
      <div className="relative mb-3">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </span>
        <input
          id="admin-buscador-motos"
          className={`${inp} pl-9 pr-9`}
          placeholder="Buscar por marca, modelo o categoría…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        {busqueda && (
          <button
            onClick={() => setBusqueda('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#fad911] transition-colors"
            title="Limpiar búsqueda"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filtros de categoría */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {['Todas', ...Object.values(cats).flat()].map((c) => (
          <button key={c} onClick={() => setFiltro(c)} className={`${btnSec} ${c === filtro ? '!bg-[#fad911] !text-black !border-[#fad911]' : ''}`}>{c}</button>
        ))}
      </div>

      {/* Resultado de búsqueda */}
      {busqueda.trim() && (
        <p className="text-xs text-zinc-400 mb-2">
          {lista.length} resultado{lista.length !== 1 ? 's' : ''} para "<span className="text-[#fad911]">{busqueda.trim()}</span>"
        </p>
      )}

      <div className={scroll}>
        {lista.map((m) => (
          <div key={m.id} className="flex items-center gap-3 py-2.5 border-t border-zinc-800">
            <img src={src(m.imagen_principal)} alt="" className="w-[72px] h-14 rounded-lg object-cover bg-zinc-800 shrink-0" />
            <div className="flex-1 min-w-0 text-sm">
              <b className="text-white">{m.marca} {m.modelo}</b>
              <div className="text-xs text-zinc-400">{m.categoria} · S/ {m.precio} · stock {m.stock_total}
                {m.estado !== 'activado' && <span className="ml-2 text-red-400">Desactivada</span>}</div>
              {m.creado_por && <div className="text-[11px] text-zinc-500">Agregada por {m.creado_por}</div>}
              {m.colores?.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1" aria-label={`Colores de ${m.marca} ${m.modelo}`}>
                  {m.colores.filter(color => color?.nombre).map((color, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-full border border-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-300">
                      {color.img_moto && <img src={src(color.img_moto)} alt="" className="h-5 w-7 rounded border border-zinc-700 object-cover" />}
                      <span className="h-2.5 w-2.5 rounded-full border border-white/60" style={{ background: fondoColor(color.nombre) }} aria-hidden="true" />
                      {color.nombre}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              {puedeEditar(m) && <button className={btnSec} onClick={() => setEditando(m)}>Editar</button>}
              {(yo.rol === 'superadmin' || yo.rol === 'admin') && (
                <>
                  <button className={btnSec} onClick={() => accion(() => api('PATCH', `/api/admin/motos/${m.id}/estado`))}>{m.estado === 'activado' ? 'Desactivar' : 'Activar'}</button>
                  {yo.rol === 'superadmin' && (
                  <button className={`${btnSec} !text-red-400`} onClick={() => confirm('¿Eliminar esta moto definitivamente?') && accion(() => api('DELETE', `/api/admin/motos/${m.id}`))}>Eliminar</button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
        {!lista.length && (
          <p className="text-sm text-zinc-500">
            {busqueda.trim() ? `Sin resultados para "${busqueda.trim()}".` : 'No hay motos en esta categoría.'}
          </p>
        )}
      </div>
      {editando && (
        <div className={`fixed inset-0 z-50 bg-black/80 overflow-y-auto p-4 ${barra}`}>
          <div className="max-w-xl mx-auto my-4">
            <FormMoto key={editando.id} cats={cats} moto={editando} alGuardar={recargar} alCancelar={() => setEditando(null)} />
          </div>
        </div>
      )}
    </div>
  );
}

function Usuarios({ yo }) {
  const [lista, setLista] = useState([]); const [u, setU] = useState(''); const [p, setP] = useState(''); const [rol, setRol] = useState('empleado'); const [err, setErr] = useState('');
  const cargar = useCallback(() => api('GET', '/api/admin/usuarios').then(setLista).catch(() => { }), []);
  useEffect(() => { cargar(); }, [cargar]);
  const crear = async () => { setErr(''); try { await api('POST', '/api/admin/usuarios', { usuario: u, clave: p, rol }); setU(''); setP(''); cargar(); } catch (x) { setErr(x.message); } };
  return (
    <div className="grid md:grid-cols-[360px_1fr] gap-5">
      <div className={card}>
        <h2 className="font-bold text-white">Nuevo usuario</h2>
        <label className={lbl}>Usuario</label><input className={inp} value={u} onChange={(e) => setU(e.target.value)} autoComplete="off" />
        <label className={lbl}>Contraseña (mín. 8)</label><input className={inp} type="password" value={p} onChange={(e) => setP(e.target.value)} autoComplete="new-password" />
        <label className={lbl}>Rol</label>
        <select className={inp} value={rol} onChange={(e) => setRol(e.target.value)}>
          {(yo.rol === 'superadmin' ? ['empleado', 'admin', 'superadmin'] : ['empleado']).map((r) => <option key={r} value={r}>{ROL[r]}</option>)}
        </select>
        <p className="text-xs text-red-400 min-h-4 mt-2">{err}</p>
        <button onClick={crear} className={`${btn} w-full mt-2`}>Crear usuario</button>
      </div>
      <div className={card}>
        <h2 className="font-bold text-white mb-2">Usuarios</h2>
        <div className={scroll}>
          {lista.map((x) => (
            <div key={x.id} className="flex items-center justify-between py-2.5 border-t border-zinc-800 text-sm">
              <div><b className="text-white">{x.usuario}</b><div className="text-xs text-zinc-400">{ROL[x.rol]}</div></div>
              {yo.rol === 'superadmin' && x.id !== yo.id && (
                <button className={`${btnSec} !text-red-400`} onClick={() => confirm('¿Eliminar este usuario?') && api('DELETE', `/api/admin/usuarios/${x.id}`).then(cargar).catch((e) => alert(e.message))}>Eliminar</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Solicitudes() {
  const [lista, setLista] = useState([]);
  const [tipo, setTipo] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [hayMas, setHayMas] = useState(false);
  const cargar = useCallback(async (antes) => {
    setCargando(true); setError('');
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (tipo) params.set('tipo', tipo);
      if (antes) params.set('antes_de', String(antes));
      const datos = await api('GET', `/api/admin/solicitudes?${params}`);
      setLista(prev => antes ? [...prev, ...datos] : datos);
      setHayMas(datos.length === 50);
    } catch (e) { setError(e.message); }
    finally { setCargando(false); }
  }, [tipo]);
  useEffect(() => { cargar(); }, [cargar]);
  const tipos = { cotizacion: 'Cotización', reserva: 'Reserva', contacto: 'Contacto' };
  return <section className={card}>
    <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
      <h2 className="font-bold">Solicitudes recibidas</h2>
      <select aria-label="Tipo de solicitud" className={inp + ' !w-auto'} value={tipo} onChange={e => setTipo(e.target.value)}>
        <option value="">Todas</option>{Object.entries(tipos).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
      <button className={btnSec} disabled={cargando} onClick={() => cargar()}>Actualizar</button>
    </div>
    {error && <p role="alert" className="text-red-400 mb-3">{error}</p>}
    {!lista.length && <p className="text-zinc-400 text-sm">{cargando ? 'Cargando…' : 'No hay solicitudes para mostrar.'}</p>}
    <div className="admin-scroll space-y-3" role="region" aria-label="Lista de solicitudes" tabIndex={0}>{lista.map(s => <article key={s.id} className="border border-zinc-800 rounded-xl p-4">
      <div className="flex flex-wrap justify-between gap-2 text-sm mb-2">
        <strong>{tipos[s.tipo]} #{s.id}</strong>
        <time className="text-zinc-400">{new Date(s.creado).toLocaleString('es-PE', { timeZone: 'America/Lima' })}</time>
      </div>
      <dl className="grid sm:grid-cols-2 gap-2 text-sm">{Object.entries(s.datos).filter(([, v]) => v !== null && v !== '').map(([k,v]) =>
        <div key={k}><dt className="text-zinc-500 capitalize">{k.replaceAll('_', ' ')}</dt><dd className="break-words whitespace-pre-wrap">{String(v)}</dd></div>
      )}</dl>
    </article>)}</div>
    {hayMas && <button className={btnSec + ' mt-4'} disabled={cargando} onClick={() => cargar(lista.at(-1)?.id)}>Cargar anteriores</button>}
  </section>;
}

export default function AdminPanel({ alSalir, alEntrarPanel }) {
  const [fase, setFase] = useState('cargando');
  const [yo, setYo] = useState(null);
  const [cats, setCats] = useState({});
  const [motos, setMotos] = useState([]);
  const [tab, setTab] = useState('motos');
  const recargar = useCallback(() => api('GET', '/api/admin/motos').then(setMotos).catch(() => { }), []);

  useEffect(() => {
    (async () => {
      try {
        const e = await api('GET', '/api/admin/estado');
        setCats(e.categorias);
        if (e.necesita_configuracion) return setFase('setup');
        setYo(await api('GET', '/api/admin/yo')); setFase('app');
      } catch { setFase('login'); }
    })();
  }, []);
  useEffect(() => { if (fase === 'app') recargar(); }, [fase, recargar]);

  // Al iniciar sesión se cargan las categorías (si el panel se abrió antes que el backend, estaban vacías)
  const entrar = async (u) => {
    try { setCats((await api('GET', '/api/admin/estado')).categorias); } catch { /* se reintenta al guardar */ }
    setYo(u); setFase('app');
    alEntrarPanel();
  };

  const salir = async () => { try { await api('POST', '/api/admin/logout'); } catch { /* sin sesión */ } alSalir(); };

  if (fase === 'setup' || fase === 'login') {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center px-4">
        <Acceso
          setup={fase === 'setup'}
          alVolver={alSalir}
          alEntrar={entrar}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {fase === 'cargando' && <p className="text-zinc-400 text-sm">Cargando…</p>}
        {fase === 'app' && yo && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h1 className="text-xl font-black">Panel <span className="text-[#fad911]">Lupol Motos</span></h1>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                {yo.usuario} · {ROL[yo.rol]}
                {yo.rol === 'superadmin' && <a className={btnSec} href="/api/admin/respaldo" download>Descargar respaldo</a>}
                <button className={btnSec} onClick={alSalir}>Ver tienda</button>
                <button className={btnSec} onClick={salir}>Cerrar sesión</button>
              </div>
            </div>
            {yo.rol !== 'empleado' && (
              <div className="flex flex-wrap gap-2 mb-4">
                {[['motos', 'Motos'], ['carrusel', 'Carrusel'], ['inventario','Inventario'], ['pedidos','Pedidos'], ['clientes','Clientes'], ['ventas','Ventas'], ['solicitudes', 'Solicitudes'], ['usuarios', 'Usuarios']].map(([k, n]) => (
                  <button key={k} onClick={() => setTab(k)} className={`${btnSec} ${tab === k ? '!bg-[#fad911] !text-black !border-[#fad911]' : ''}`}>{n}</button>
                ))}
              </div>
            )}
            {tab === 'motos' || yo.rol === 'empleado'
              ? (<div className="grid md:grid-cols-[360px_1fr] gap-5"><FormMoto cats={cats} alGuardar={recargar} /><Catalogo motos={motos} cats={cats} yo={yo} recargar={recargar} /></div>)
              : tab === 'carrusel' ? <CarruselAdmin motos={motos} /> : tab === 'solicitudes' ? <Solicitudes /> : ['inventario','pedidos','clientes','ventas'].includes(tab) ? <ComercioPanel key={tab} seccion={tab}/> : <Usuarios yo={yo} />}
          </>
        )}
      </div>
    </div>
  );
}
