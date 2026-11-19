import React, { useCallback, useEffect, useState } from 'react';
import { Palette } from 'lucide-react';
import { api } from '../services/adminService';
import { reducirFoto } from '../utils/reducirFoto';
import { fondoColor, NOMBRES_COLORES } from '../utils/colores';
import VisorFotos from './VisorFotos';

const barra = '[scrollbar-width:thin] [scrollbar-color:#fad911_#1c1c22] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-zinc-900 [&::-webkit-scrollbar-thumb]:bg-[#fad911] [&::-webkit-scrollbar-thumb]:rounded-full';
const scroll = `max-h-[65vh] overflow-y-auto pr-2 ${barra}`;
const inp = 'w-full rounded-lg bg-[#0a0a0c] border border-zinc-700 px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-[#fad911]';
const lbl = 'block text-xs text-zinc-400 mt-3 mb-1';
const btn = 'bg-[#fad911] text-black font-bold rounded-lg px-4 py-2.5 text-sm hover:bg-[#fce23e] transition-colors';
const btnSec = 'border border-zinc-700 text-zinc-200 rounded-lg px-3 py-1.5 text-xs hover:border-[#fad911] transition-colors';
const card = 'tarjeta-lLupol bg-[#121318] border border-zinc-800 rounded-2xl p-5';
const src = (p) => (!p ? '' : /^(\/|https?:|data:)/.test(p) ? p : '/' + p);

function FormAccesorio({ accesorio, alGuardar, alCancelar }) {
  const editando = !!accesorio;
  const [nombre, setNombre] = useState(accesorio?.nombre || '');
  const [descripcion, setDescripcion] = useState(accesorio?.descripcion || '');
  const [colores, setColores] = useState(
    accesorio?.colores?.length ? accesorio.colores : [{ nombre: '', img_accesorio: '' }]
  );
  const [msg, setMsg] = useState({ t: '', ok: false });
  const [fotoAmpliada, setFotoAmpliada] = useState(null);

  const actualizarColor = (indice, cambios) => {
    setColores(actuales => actuales.map((color, i) => i === indice ? { ...color, ...cambios } : color));
  };

  const guardar = async () => {
    setMsg({ t: '', ok: false });
    try {
      if (!nombre.trim()) throw new Error('Escribe el nombre del accesorio.');
      if (colores.some(color => !color.nombre.trim())) throw new Error('Cada color necesita un nombre.');
      if (colores.some(color => !color.img_accesorio)) throw new Error('Sube una foto para cada color.');
      const base = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        colores: colores.map(({ nombre: color, img_accesorio }) => ({ nombre: color.trim(), img_accesorio }))
      };
      if (editando) {
        await api('PUT', `/api/admin/accesorios/${accesorio.id}`, base);
        alGuardar();
        alCancelar();
      } else {
        await api('POST', '/api/admin/accesorios', base);
        setNombre(''); setDescripcion(''); setColores([{ nombre: '', img_accesorio: '' }]);
        setMsg({ t: 'Accesorio guardado ✔', ok: true });
        alGuardar();
      }
    } catch (x) {
      setMsg({ t: x.message, ok: false });
    }
  };

  return (
    <div className={card}>
      <h2 className="mb-1 font-bold text-white">{editando ? `Editar ${accesorio.nombre}` : 'Agregar accesorio'}</h2>
      <p className="text-xs text-zinc-400">Registra el nombre y una foto por cada color del accesorio.</p>

      <label className={lbl}>Nombre del accesorio</label>
      <input className={inp} value={nombre} maxLength={80} placeholder="Ej. Casco integral" onChange={e => setNombre(e.target.value)} />

      <label className={lbl}>Descripción (opcional)</label>
      <textarea className={inp} rows={2} maxLength={500} placeholder="Material, medidas o detalles del accesorio" value={descripcion} onChange={e => setDescripcion(e.target.value)} />

      <div className="mt-5 rounded-xl border border-zinc-700 bg-zinc-950/70 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">Colores de {nombre.trim() || 'este accesorio'}</h3>
            <p className="text-xs text-zinc-400">Cada color debe tener su propia foto.</p>
          </div>
          <button type="button" className={btnSec} disabled={colores.length >= 12} onClick={() => setColores(actuales => [...actuales, { nombre: '', img_accesorio: '' }])}>+ Color</button>
        </div>
        <div className="mt-3 space-y-3">
          {colores.map((color, indice) => (
            <div key={indice} className="rounded-lg border border-zinc-800 bg-[#121318] p-3">
              <p className="mb-2 text-xs font-semibold text-zinc-300">Color {indice + 1}</p>
              <div className="flex items-center gap-3">
                <span className="h-9 w-9 shrink-0 rounded-full border border-white" style={{ background: fondoColor(color.nombre) }} aria-hidden="true" />
                <input className={inp} list="colores-lupol-accesorios" aria-label={`Nombre del color ${indice + 1}`} maxLength={40} placeholder="Ej. Rojo / Negro o #c90024" value={color.nombre} onChange={e => actualizarColor(indice, { nombre: e.target.value })} />
                <button type="button" className="text-xs text-red-400" onClick={() => setColores(actuales => actuales.filter((_, i) => i !== indice))}>Quitar</button>
              </div>
              <div className="mt-3 flex items-center gap-3">
                {color.img_accesorio ? (
                  <button type="button" aria-label={`Ampliar foto del color ${indice + 1}`} onClick={() => setFotoAmpliada({ url: color.img_accesorio, titulo: `${nombre.trim() || 'Accesorio'} · ${color.nombre || `Color ${indice + 1}`}` })} className="shrink-0 cursor-zoom-in">
                    <img src={src(color.img_accesorio)} alt="" className="h-16 w-20 rounded-lg border border-zinc-700 bg-zinc-900 object-contain" />
                  </button>
                ) : (
                  <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-lg border border-dashed border-zinc-700 text-center text-[10px] text-zinc-500">Sin foto</div>
                )}
                <div className="min-w-0 flex-1">
                  <label className="mb-1 block text-xs text-zinc-400" htmlFor={`foto-accesorio-${accesorio?.id || 'nuevo'}-${indice}`}>Foto de este color</label>
                  <input id={`foto-accesorio-${accesorio?.id || 'nuevo'}-${indice}`} className={inp} type="file" accept="image/*" onChange={async e => {
                    const archivo = e.target.files?.[0];
                    if (!archivo) return;
                    try { actualizarColor(indice, { img_accesorio: await reducirFoto(archivo) }); }
                    catch { setMsg({ t: 'No se pudo procesar la foto. Prueba con otra imagen.', ok: false }); }
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <datalist id="colores-lupol-accesorios">
          {NOMBRES_COLORES.map(nombreColor => <option key={nombreColor} value={nombreColor} />)}
        </datalist>
      </div>

      <p className={`mt-2 min-h-4 text-xs ${msg.ok ? 'text-green-400' : 'text-red-400'}`}>{msg.t}</p>
      <div className="mt-2 flex gap-2">
        <button onClick={guardar} className={`${btn} flex-1`}>{editando ? 'Guardar cambios' : 'Guardar accesorio'}</button>
        {editando && <button onClick={alCancelar} className={btnSec}>Cancelar</button>}
      </div>
      <VisorFotos foto={fotoAmpliada} onClose={() => setFotoAmpliada(null)} />
    </div>
  );
}

export default function AdminAccesorios({ yo }) {
  const [lista, setLista] = useState([]);
  const [editando, setEditando] = useState(null);
  const [fotoAmpliada, setFotoAmpliada] = useState(null);
  const [error, setError] = useState('');

  const cargar = useCallback(() => api('GET', '/api/admin/accesorios').then(setLista).catch(() => {}), []);
  useEffect(() => { cargar(); }, [cargar]);

  const accion = async (fn) => {
    setError('');
    try { await fn(); cargar(); } catch (x) { setError(x.message); }
  };
  const puedeEditar = (a) => yo.rol !== 'empleado' || a.creado_por === yo.usuario;

  return (
    <div className="grid gap-5 md:grid-cols-[360px_1fr]">
      <FormAccesorio alGuardar={cargar} alCancelar={() => {}} />

      <div className={card}>
        <h2 className="mb-1 font-bold text-white">Accesorios ({lista.length})</h2>
        <p className="mb-3 text-xs text-zinc-400">Los accesorios activos se muestran en la sección pública de la tienda.</p>
        {error && <p role="alert" className="mb-3 text-xs text-red-400">{error}</p>}
        <div className={scroll}>
          {lista.map(a => {
            const foto = a.colores?.find(color => color.img_accesorio)?.img_accesorio;
            return (
              <div key={a.id} className="flex items-center gap-3 border-t border-zinc-800 py-2.5">
                <button type="button" aria-label={`Ampliar foto de ${a.nombre}`} title="Ver foto en grande" onClick={() => foto && setFotoAmpliada({ url: foto, titulo: a.nombre })} className="shrink-0 cursor-zoom-in">
                  {foto ? <img src={src(foto)} alt="" className="h-14 w-[72px] rounded-lg bg-zinc-800 object-cover" /> : <div className="flex h-14 w-[72px] items-center justify-center rounded-lg border border-dashed border-zinc-700 text-zinc-600"><Palette className="h-5 w-5" /></div>}
                </button>
                <div className="min-w-0 flex-1 text-sm">
                  <b className="text-white">{a.nombre}</b>
                  <div className="text-xs text-zinc-400">
                    {a.estado === 'activado' ? 'Activo' : <span className="text-red-400">Desactivado</span>}
                    {' · '}{a.colores?.length || 0} color{(a.colores?.length || 0) === 1 ? '' : 'es'}
                  </div>
                  {a.descripcion && <div className="truncate text-[11px] text-zinc-500">{a.descripcion}</div>}
                  {a.colores?.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1" aria-label={`Colores de ${a.nombre}`}>
                      {a.colores.filter(color => color?.nombre).map((color, i) => (
                        <span key={i} className="inline-flex items-center gap-1 rounded-full border border-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-300">
                          {color.img_accesorio && <img src={src(color.img_accesorio)} alt="" className="h-5 w-7 rounded border border-zinc-700 object-cover" />}
                          <span className="h-2.5 w-2.5 rounded-full border border-white/60" style={{ background: fondoColor(color.nombre) }} aria-hidden="true" />
                          {color.nombre}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  {puedeEditar(a) && <button className={btnSec} onClick={() => setEditando(a)}>Editar</button>}
                  {(yo.rol === 'superadmin' || yo.rol === 'admin') && (
                    <>
                      <button className={btnSec} onClick={() => accion(() => api('PATCH', `/api/admin/accesorios/${a.id}/estado`))}>{a.estado === 'activado' ? 'Desactivar' : 'Activar'}</button>
                      {yo.rol === 'superadmin' && (
                        <button className={`${btnSec} !text-red-400`} onClick={() => confirm('¿Eliminar este accesorio definitivamente?') && accion(() => api('DELETE', `/api/admin/accesorios/${a.id}`))}>Eliminar</button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {!lista.length && <p className="text-sm text-zinc-500">Aún no hay accesorios. Agrega el primero con el formulario.</p>}
        </div>
      </div>

      {editando && (
        <div className={`fixed inset-0 z-50 overflow-y-auto bg-black/80 p-4 ${barra}`}>
          <div className="mx-auto my-4 max-w-xl">
            <FormAccesorio key={editando.id} accesorio={editando} alGuardar={cargar} alCancelar={() => setEditando(null)} />
          </div>
        </div>
      )}
      <VisorFotos foto={fotoAmpliada} onClose={() => setFotoAmpliada(null)} />
    </div>
  );
}
