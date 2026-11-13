import React, { useEffect, useState } from 'react';
import { Package, Palette, Sparkles, ZoomIn } from 'lucide-react';
import { obtenerAccesorios } from '../services/catalogoService';
import VisorFotos from './VisorFotos';

function TarjetaAccesorio({ accesorio }) {
  const colores = (accesorio.colores || []).filter(color => color?.nombre);
  const [colorSeleccionado, setColorSeleccionado] = useState(colores[0] || null);
  const [fotoAmpliada, setFotoAmpliada] = useState(null);
  const fotoActual = colorSeleccionado?.img_accesorio;

  return (
    <article className="tarjeta-lupol product-card-glow flex flex-col overflow-hidden rounded-3xl border border-zinc-800/90 bg-[#121318]">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-black via-[#17181d] to-black">
        <div className="absolute -right-10 -top-10 h-40 w-40 rotate-45 bg-[#fad911]/15 blur-sm" />
        {fotoActual ? (
          <button
            type="button"
            aria-label={`Ampliar foto de ${accesorio.nombre}${colorSeleccionado ? ` en ${colorSeleccionado.nombre}` : ''}`}
            onClick={() => setFotoAmpliada({ url: fotoActual, titulo: `${accesorio.nombre}${colorSeleccionado ? ` · ${colorSeleccionado.nombre}` : ''}` })}
            className="absolute inset-0 flex cursor-zoom-in items-center justify-center p-4"
          >
            <img
              src={fotoActual}
              alt={`${accesorio.nombre}${colorSeleccionado ? ` en ${colorSeleccionado.nombre}` : ''}`}
              loading="lazy"
              className="h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.65)] transition-transform duration-300 group-hover:scale-[1.03]"
            />
            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-white/30 bg-black/70 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
              <ZoomIn className="h-3.5 w-3.5" /> Ampliar
            </span>
          </button>
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-500">
            <Package className="h-12 w-12" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 border-t border-zinc-800/60 bg-gradient-to-b from-[#121318] to-[#0d0e12] p-5">
        <div>
          <h3 className="text-lg font-black text-white">{accesorio.nombre}</h3>
          {accesorio.descripcion && <p className="mt-1 text-xs leading-relaxed text-zinc-400">{accesorio.descripcion}</p>}
        </div>

        {colores.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {colores.map((color, indice) => (
              <button
                key={`${color.nombre}-${indice}`}
                type="button"
                onClick={() => setColorSeleccionado(color)}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  colorSeleccionado === color
                    ? 'border-[#fad911] bg-[#fad911]/10 text-[#fad911]'
                    : 'border-zinc-700 text-zinc-300 hover:border-zinc-500'
                }`}
              >
                {color.img_accesorio ? (
                  <img src={color.img_accesorio} alt="" className="h-4 w-4 rounded-full border border-white/20 object-cover" />
                ) : (
                  <Palette className="h-3.5 w-3.5" />
                )}
                {color.nombre}
              </button>
            ))}
          </div>
        )}

        <p className="mt-auto text-[11px] text-zinc-500">Consultar disponibilidad y precio por WhatsApp.</p>
      </div>

      <VisorFotos foto={fotoAmpliada} onClose={() => setFotoAmpliada(null)} />
    </article>
  );
}

export default function SeccionAccesorios() {
  const [accesorios, setAccesorios] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    obtenerAccesorios().then(lista => {
      if (activo) {
        setAccesorios(lista);
        setCargando(false);
      }
    }).catch(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, []);

  return (
    <section id="accesorios" className="relative border-b border-zinc-800 bg-[#0a0a0c] py-16 sm:py-24">
      <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-[#fad911]/10 blur-[100px]" />
      <div className="relative mx-auto max-w-[1600px] px-4 sm:px-6">
        <div className="mb-10 border-b border-zinc-800/80 pb-6">
          <div className="mb-2 inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#fad911]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Complementa tu moto</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            NUESTROS <span className="text-[#fad911]">ACCESORIOS</span>
          </h2>
          <p className="mt-1 text-sm text-zinc-400 sm:text-base">
            Accesorios disponibles en Lupol Motos Tacna. Muy pronto ampliaremos esta sección.
          </p>
        </div>

        {cargando ? (
          <p className="text-sm text-zinc-500">Cargando accesorios…</p>
        ) : accesorios.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
            {accesorios.map(accesorio => <TarjetaAccesorio key={accesorio.id} accesorio={accesorio} />)}
          </div>
        ) : (
          <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-zinc-800 bg-[#121318] p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-[#fad911]">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h3 className="mb-1 text-lg font-bold text-white">Estamos preparando el catálogo</h3>
              <p className="mx-auto max-w-md text-xs leading-relaxed text-zinc-400">
                Pronto encontrarás aquí cascos, filtros, baterías, cargadores y más accesorios para tu moto.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
