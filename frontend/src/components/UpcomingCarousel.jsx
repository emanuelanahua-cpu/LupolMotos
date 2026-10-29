import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { obtenerCarruselProximas } from '../services/catalogoService';

export default function UpcomingCarousel() {
  const [slides, setSlides] = useState([]);
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);

  useEffect(() => {
    let activo = true;
    obtenerCarruselProximas().then(data => { if (activo) setSlides(data); });
    return () => { activo = false; };
  }, []);

  useEffect(() => {
    if (slides.length < 2 || pausado || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setIndice(actual => (actual + 1) % slides.length), 7000);
    return () => window.clearInterval(timer);
  }, [slides.length, pausado]);

  if (!slides.length) return null;

  const actual = slides[indice] || slides[0];
  const ir = cambio => setIndice(actual => (actual + cambio + slides.length) % slides.length);

  return (
    <section id="proximas" aria-label="Motos por llegar" className="overflow-x-clip border-b border-zinc-800 bg-[#090c10] py-5 sm:py-9">
      <div className="mx-auto max-w-[1320px] px-3 sm:px-6">
        <div className="cluster-housing" onMouseEnter={() => setPausado(true)} onMouseLeave={() => setPausado(false)} onFocusCapture={() => setPausado(true)} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) setPausado(false); }}>
          <div className="cluster-frame">
            <div className="cluster-screen">
              <img key={actual.id} src={actual.imagen} alt="Moto por llegar" className="cluster-bike-image" />
            </div>
          </div>
          <span className="cluster-bolt cluster-bolt-left" aria-hidden="true" />
          <span className="cluster-bolt cluster-bolt-right" aria-hidden="true" />
        </div>

        {slides.length > 1 && (
          <div className="mt-4 flex items-center justify-center gap-3" aria-label="Controles del carrusel">
            <button type="button" onClick={() => ir(-1)} aria-label="Imagen anterior" className="rounded-full border border-zinc-700 p-2 text-white hover:border-[#fad911]"><ChevronLeft className="h-5 w-5" /></button>
            {slides.map((slide, i) => <button key={slide.id} type="button" onClick={() => setIndice(i)} aria-label={`Mostrar imagen ${i + 1}`} aria-current={indice === i ? 'true' : undefined} className={`h-2.5 rounded-full transition-all ${indice === i ? 'w-8 bg-[#fad911]' : 'w-2.5 bg-zinc-600 hover:bg-zinc-400'}`} />)}
            <button type="button" onClick={() => ir(1)} aria-label="Imagen siguiente" className="rounded-full border border-zinc-700 p-2 text-white hover:border-[#fad911]"><ChevronRight className="h-5 w-5" /></button>
          </div>
        )}
      </div>
    </section>
  );
}
