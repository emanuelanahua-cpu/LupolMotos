import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Gauge, MessageCircle, Sparkles } from 'lucide-react';
import { obtenerCarruselProximas } from '../services/catalogoService';

const espera = {
  id: 'espera',
  modelo: 'La próxima potencia',
  cilindrada: 'MÁS CILINDRADA',
  texto: 'Muy pronto mostraremos aquí las motos que están por llegar a Lupol Motos.',
  imagen: ''
};

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

  const actual = slides[indice] || espera;
  const ir = cambio => setIndice(actual => (actual + cambio + slides.length) % slides.length);
  const whatsapp = `https://wa.me/51980687475?text=${encodeURIComponent(`Hola Lupol Motos, quisiera información sobre la próxima moto ${actual.modelo}.`)}`;

  return (
    <section id="proximas" className="relative overflow-x-clip border-b border-zinc-800 bg-[#090c10] py-14 sm:py-20">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-300"><Sparkles className="h-4 w-4" /> Próximamente en Tacna</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Motos <span className="text-[#fad911]">por llegar</span></h2>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">Un vistazo a los modelos y cilindradas que estamos preparando para ti.</p>
          </div>
          {slides.length > 1 && <span className="font-mono text-xs tracking-widest text-cyan-300">{String(indice + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>}
        </div>

        <div className="cluster-frame" onMouseEnter={() => setPausado(true)} onMouseLeave={() => setPausado(false)} onFocusCapture={() => setPausado(true)} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) setPausado(false); }}>
          <div className="cluster-screen">
            <div className="cluster-ticks" aria-hidden="true" />
            <div className="relative z-10 grid min-h-[340px] items-center gap-6 px-5 py-8 sm:px-10 lg:grid-cols-[1fr_1.05fr] lg:px-14">
              <div className="order-2 lg:order-1">
                <div className="mb-5 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-300"><span className="cluster-indicator" /> Próxima llegada</div>
                <h3 className="max-w-xl text-3xl font-black uppercase leading-tight text-white sm:text-5xl">{actual.modelo}</h3>
                <div className="mt-4 inline-flex items-center gap-3 rounded-xl border border-cyan-400/30 bg-cyan-400/5 px-4 py-2 shadow-[inset_0_0_24px_#22d3ee10]">
                  <Gauge className="h-6 w-6 text-cyan-300" />
                  <span className="font-mono text-xl font-black uppercase tracking-wider text-cyan-200 sm:text-2xl">{actual.cilindrada}</span>
                </div>
                <p className="mt-5 max-w-xl text-sm leading-relaxed text-zinc-300">{actual.texto}</p>
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#fad911] px-5 py-3 text-xs font-black uppercase tracking-wider text-black transition hover:bg-[#fce23e]"><MessageCircle className="h-4 w-4" /> Consultar novedades</a>
              </div>
              <div className="order-1 flex min-h-[180px] items-center justify-center lg:order-2 lg:min-h-[300px]">
                {actual.imagen ? <img key={actual.id} src={actual.imagen} alt={`Próxima moto ${actual.modelo}`} className="cluster-bike-image max-h-[280px] w-full object-contain sm:max-h-[380px]" /> : <div className="cluster-placeholder" aria-hidden="true"><Gauge className="h-24 w-24 text-cyan-300/70 sm:h-32 sm:w-32" /></div>}
              </div>
            </div>
            <div className="relative z-10 flex items-center justify-between border-t border-cyan-400/15 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300/70 sm:px-10"><span>Lupol Motos · Digital</span><span>Preparando el camino</span></div>
          </div>
        </div>

        {slides.length > 1 && (
          <div className="mt-5 flex items-center justify-center gap-3" aria-label="Controles del carrusel">
            <button type="button" onClick={() => ir(-1)} aria-label="Moto anterior" className="rounded-full border border-zinc-700 p-2 text-white hover:border-[#fad911]"><ChevronLeft className="h-5 w-5" /></button>
            {slides.map((slide, i) => <button key={slide.id} type="button" onClick={() => setIndice(i)} aria-label={`Mostrar ${slide.modelo}`} aria-current={indice === i ? 'true' : undefined} className={`h-2.5 rounded-full transition-all ${indice === i ? 'w-8 bg-[#fad911]' : 'w-2.5 bg-zinc-600 hover:bg-zinc-400'}`} />)}
            <button type="button" onClick={() => ir(1)} aria-label="Moto siguiente" className="rounded-full border border-zinc-700 p-2 text-white hover:border-[#fad911]"><ChevronRight className="h-5 w-5" /></button>
          </div>
        )}
      </div>
    </section>
  );
}
