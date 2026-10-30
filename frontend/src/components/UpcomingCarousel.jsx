import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { obtenerCarruselProximas } from '../services/catalogoService';

const resumenes = {
  'ADV GS': 'Una moto de aventura de 300 cc para disfrutar cada ruta con potencia y comodidad.',
  'Explorer V1': 'Explora nuevos caminos con una moto doble propósito de 200 cc ágil y versátil.'
};

const formatearPrecio = precio => `S/ ${Number(precio).toLocaleString('es-PE')}`;

export default function UpcomingCarousel({ motos = [], abrirModalMoto }) {
  const [slides, setSlides] = useState([]);
  const [posicion, setPosicion] = useState(1);
  const [animar, setAnimar] = useState(true);
  const [pausado, setPausado] = useState(false);
  const total = slides.length;
  const indice = total ? (posicion - 1 + total) % total : 0;

  useEffect(() => {
    let activo = true;
    obtenerCarruselProximas().then(data => { if (activo) setSlides(data); });
    return () => { activo = false; };
  }, []);

  useEffect(() => {
    if (total < 2 || pausado || !animar || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setTimeout(() => setPosicion(actual => actual + 1), 3000);
    return () => window.clearTimeout(timer);
  }, [posicion, total, pausado, animar]);

  useEffect(() => {
    if (animar) return;
    const frame = window.requestAnimationFrame(() => window.requestAnimationFrame(() => setAnimar(true)));
    return () => window.cancelAnimationFrame(frame);
  }, [animar]);

  if (!total) return null;

  const ir = cambio => setPosicion(actual => actual + cambio);
  const normalizar = () => {
    if (posicion === 0 || posicion === total + 1) {
      setAnimar(false);
      setPosicion(posicion === 0 ? total : 1);
    }
  };
  const visibles = total > 1 ? [slides[total - 1], ...slides, slides[0]] : slides;

  return (
    <section id="proximas" aria-label="Motos por llegar" className="upcoming-section"
      onMouseEnter={() => setPausado(true)} onMouseLeave={() => setPausado(false)}
      onFocusCapture={() => setPausado(true)}
      onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) setPausado(false); }}>
      <div className="upcoming-viewport">
        <div className={`upcoming-track${animar ? '' : ' no-transition'}`} style={{ '--position': total > 1 ? posicion : 0 }} onTransitionEnd={e => { if (e.target === e.currentTarget) normalizar(); }}>
          {visibles.map((slide, orden) => {
            const moto = motos.find(item => item.id === Number(slide.moto_id));
            const nombre = moto ? `${moto.marca} ${moto.modelo}` : 'Moto por llegar';
            const visible = total === 1 || orden === posicion;
            const motor = moto?.motor?.match(/\d+\s*cc/i)?.[0]?.replace(/\s*cc/i, ' cc');
            const specs = [
              motor && ['Motor', motor],
              moto?.potencia && ['Potencia', moto.potencia],
              moto?.suspension && ['Suspensión', moto.suspension]
            ].filter(Boolean);

            return (
              <article className="upcoming-card" key={`${slide.id}-${orden}`} aria-hidden={!visible}>
                <span className="upcoming-bolt upcoming-bolt-left" aria-hidden="true" />
                <span className="upcoming-bolt upcoming-bolt-right" aria-hidden="true" />
                <div className="upcoming-copy">
                  <div className="upcoming-eyebrow"><span className="upcoming-mark">L</span><span>MOTOS POR LLEGAR</span></div>
                  <span className="upcoming-rule" aria-hidden="true" />
                  <p className="upcoming-brand">{moto?.marca || 'Lupol Motos'}</p>
                  <h2 className="upcoming-title">{moto?.modelo || 'Tu próxima moto'}</h2>
                  <p className="upcoming-description">{resumenes[moto?.modelo] || 'Descubre las características de tu próxima moto y consulta todos los detalles en su ficha técnica.'}</p>
                  {specs.length > 0 && <dl className="upcoming-specs">{specs.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
                  {moto?.precio > 0 && <p className="upcoming-price"><span>Precio de catálogo</span><strong>{formatearPrecio(moto.precio)}</strong></p>}
                </div>
                <div className="upcoming-media">
                  <div className="upcoming-halo" aria-hidden="true" />
                  {moto ? (
                    <button type="button" className="upcoming-photo-button" onClick={() => abrirModalMoto(moto.id)} aria-label={`Ver ficha técnica de ${nombre}`} tabIndex={visible ? 0 : -1}>
                      <img src={slide.imagen} alt={nombre} className="upcoming-photo" />
                    </button>
                  ) : <div className="upcoming-photo-button"><img src={slide.imagen} alt={nombre} className="upcoming-photo" /></div>}
                </div>
              </article>
            );
          })}
        </div>
      </div>
      {total > 1 && <div className="upcoming-controls" aria-label="Controles del carrusel">
        <button type="button" className="upcoming-arrow" onClick={() => ir(-1)} aria-label="Imagen anterior"><ChevronLeft size={22} /></button>
        <span className="upcoming-count"><strong>{String(indice + 1).padStart(2, '0')}</strong> / {String(total).padStart(2, '0')}</span>
        <div className="upcoming-dots">{slides.map((slide, i) => <button key={slide.id} type="button" onClick={() => setPosicion(i + 1)} aria-label={`Mostrar imagen ${i + 1}`} aria-current={indice === i ? 'true' : undefined} className={indice === i ? 'active' : ''} />)}</div>
        <button type="button" className="upcoming-arrow" onClick={() => ir(1)} aria-label="Imagen siguiente"><ChevronRight size={22} /></button>
      </div>}
    </section>
  );
}
