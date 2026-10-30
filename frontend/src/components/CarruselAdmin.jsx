import React, { useEffect, useState } from 'react';
import { api } from '../services/adminService';
import { reducirFoto } from '../utils/reducirFoto';

const campo = 'w-full rounded-lg border border-zinc-700 bg-[#0a0a0c] px-3 py-2.5 text-sm text-white focus:border-[#fad911] focus:outline-none';
const secundario = 'rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-200 hover:border-[#fad911] disabled:opacity-40';
const foto = ruta => /^(data:|https?:|\/)/.test(ruta) ? ruta : `/${ruta}`;

export default function CarruselAdmin({ motos = [] }) {
  const [slides, setSlides] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;
    api('GET', '/api/admin/carrusel-proximas')
      .then(data => { if (activo) setSlides(data.slides || []); })
      .catch(e => { if (activo) setError(e.message); })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, []);

  const actualizar = (indice, cambio) => setSlides(actuales => actuales.map((slide, i) => i === indice ? { ...slide, ...cambio } : slide));
  const mover = (indice, direccion) => setSlides(actuales => {
    const destino = indice + direccion;
    if (destino < 0 || destino >= actuales.length) return actuales;
    const copia = [...actuales];
    [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
    return copia;
  });

  const guardar = async e => {
    e.preventDefault();
    setError(''); setMensaje(''); setGuardando(true);
    try {
      if (slides.some(slide => !slide.imagen)) throw new Error('Sube una foto para cada diapositiva.');
      const data = await api('PUT', '/api/admin/carrusel-proximas', {
        slides: slides.map(({ id, imagen, moto_id, activo }) => ({ id, imagen, moto_id: moto_id || null, activo }))
      });
      setSlides(data.slides);
      setMensaje('Carrusel actualizado. La tienda mostrará las diapositivas activas.');
    } catch (e) { setError(e.message); }
    finally { setGuardando(false); }
  };

  return (
    <section className="rounded-2xl border border-zinc-800 bg-[#121318] p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-black text-white">Carrusel · Motos por llegar</h2>
          <p className="text-sm text-zinc-400 mt-1">Sube hasta 8 imágenes y vincula cada una con la ficha técnica de su moto.</p>
        </div>
        <button type="button" className={secundario} disabled={slides.length >= 8 || cargando} onClick={() => setSlides(actuales => [...actuales, { id: crypto.randomUUID(), imagen: '', activo: true }])}>+ Añadir imagen</button>
      </div>
      {cargando ? <p className="text-sm text-zinc-400">Cargando carrusel…</p> : (
        <form onSubmit={guardar} className="space-y-4">
          {!slides.length && <p className="rounded-xl border border-dashed border-zinc-700 p-5 text-sm text-zinc-400">Aún no hay imágenes. Añade la primera para mostrar el carrusel en la tienda.</p>}
          {slides.map((slide, indice) => (
            <article key={slide.id} className="rounded-xl border border-zinc-700 bg-[#0b0c10] p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <strong className="text-sm text-[#fad911]">Diapositiva {indice + 1}</strong>
                <div className="flex items-center gap-2">
                  <button type="button" className={secundario} aria-label={`Subir diapositiva ${indice + 1}`} disabled={indice === 0} onClick={() => mover(indice, -1)}>↑</button>
                  <button type="button" className={secundario} aria-label={`Bajar diapositiva ${indice + 1}`} disabled={indice === slides.length - 1} onClick={() => mover(indice, 1)}>↓</button>
                  <button type="button" className={`${secundario} !text-red-400`} onClick={() => setSlides(actuales => actuales.filter((_, i) => i !== indice))}>Quitar</button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-36 w-full max-w-56 items-center justify-center overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900">
                  {slide.imagen ? <img src={foto(slide.imagen)} alt={`Vista previa de la imagen ${indice + 1}`} className="h-full w-full object-contain" /> : <span className="text-xs text-zinc-500">Sin foto</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <label className="block text-xs text-zinc-400">Imagen de la diapositiva
                    <input className={`${campo} mt-1`} type="file" accept="image/png,image/jpeg,image/webp" onChange={async e => {
                      const archivo = e.target.files?.[0];
                      if (!archivo) return;
                      try { actualizar(indice, { imagen: await reducirFoto(archivo) }); }
                      catch { setError('No se pudo procesar la foto. Usa JPG, PNG o WebP.'); }
                    }} />
                  </label>
                  <label className="mt-3 flex items-center gap-2 text-sm text-zinc-300">
                    <input type="checkbox" checked={slide.activo} onChange={e => actualizar(indice, { activo: e.target.checked })} /> Mostrar en la tienda
                  </label>
                  <label className="mt-3 block text-xs text-zinc-400">Ficha técnica al presionar la imagen
                    <select className={`${campo} mt-1`} value={slide.moto_id || ''} onChange={e => actualizar(indice, { moto_id: e.target.value ? Number(e.target.value) : null })}>
                      <option value="">Selecciona una moto</option>
                      {motos.filter(moto => moto.estado === 'activado').map(moto => <option key={moto.id} value={moto.id}>{moto.marca} {moto.modelo}</option>)}
                    </select>
                  </label>
                </div>
              </div>
            </article>
          ))}
          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
          {mensaje && <p role="status" className="text-sm text-emerald-400">{mensaje}</p>}
          <button type="submit" disabled={guardando} className="rounded-lg bg-[#fad911] px-5 py-3 text-sm font-bold text-black disabled:opacity-50">{guardando ? 'Guardando…' : 'Guardar carrusel'}</button>
        </form>
      )}
    </section>
  );
}
