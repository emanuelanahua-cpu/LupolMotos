import React, { useEffect, useState } from 'react';
import { api } from '../services/adminService';
import { reducirFoto } from '../utils/reducirFoto';

const campo = 'w-full rounded-lg border border-zinc-700 bg-[#0a0a0c] px-3 py-2.5 text-sm text-white focus:border-[#fad911] focus:outline-none';
const secundario = 'rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-200 hover:border-[#fad911] disabled:opacity-40';
const foto = ruta => /^(data:|https?:|\/)/.test(ruta) ? ruta : `/${ruta}`;

export default function CarruselAdmin() {
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
      if (slides.some(slide => !slide.imagen)) throw new Error('Sube una foto para cada moto del carrusel.');
      const data = await api('PUT', '/api/admin/carrusel-proximas', { slides });
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
          <p className="text-sm text-zinc-400 mt-1">Edita hasta 8 anuncios. Sube una foto por moto y ordena las diapositivas con las flechas.</p>
        </div>
        <button type="button" className={secundario} disabled={slides.length >= 8 || cargando} onClick={() => setSlides(actuales => [...actuales, { id: crypto.randomUUID(), modelo: '', cilindrada: '', texto: '', imagen: '', activo: true }])}>+ Añadir moto</button>
      </div>
      {cargando ? <p className="text-sm text-zinc-400">Cargando carrusel…</p> : (
        <form onSubmit={guardar} className="space-y-4">
          {!slides.length && <p className="rounded-xl border border-dashed border-zinc-700 p-5 text-sm text-zinc-400">Aún no hay motos por llegar. Añade la primera para mostrarla en la tienda.</p>}
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
              <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                <div>
                  <div className="flex h-32 items-center justify-center overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900">
                    {slide.imagen ? <img src={foto(slide.imagen)} alt={`Vista previa de ${slide.modelo || 'la moto'}`} className="h-full w-full object-contain" /> : <span className="text-xs text-zinc-500">Sin foto</span>}
                  </div>
                  <label className="mt-2 block text-xs text-zinc-400">Foto de la moto
                    <input className={`${campo} mt-1`} type="file" accept="image/png,image/jpeg,image/webp" onChange={async e => {
                      const archivo = e.target.files?.[0];
                      if (!archivo) return;
                      try { actualizar(indice, { imagen: await reducirFoto(archivo) }); }
                      catch { setError('No se pudo procesar la foto. Usa JPG, PNG o WebP.'); }
                    }} />
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-xs text-zinc-400">Modelo
                    <input className={`${campo} mt-1`} required maxLength={90} placeholder="Ej. Próximo modelo" value={slide.modelo} onChange={e => actualizar(indice, { modelo: e.target.value })} />
                  </label>
                  <label className="text-xs text-zinc-400">Cilindrada
                    <input className={`${campo} mt-1`} required maxLength={30} placeholder="Ej. 400 cc" value={slide.cilindrada} onChange={e => actualizar(indice, { cilindrada: e.target.value })} />
                  </label>
                  <label className="text-xs text-zinc-400 sm:col-span-2">Mensaje breve
                    <textarea className={`${campo} mt-1`} maxLength={240} rows={2} placeholder="Ej. Potencia y diseño para una nueva experiencia." value={slide.texto} onChange={e => actualizar(indice, { texto: e.target.value })} />
                  </label>
                  <label className="flex items-center gap-2 text-sm text-zinc-300 sm:col-span-2">
                    <input type="checkbox" checked={slide.activo} onChange={e => actualizar(indice, { activo: e.target.checked })} /> Mostrar en la tienda
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
