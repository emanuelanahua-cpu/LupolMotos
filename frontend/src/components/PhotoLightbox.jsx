import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function PhotoLightbox({ foto, onClose }) {
  useEffect(() => {
    if (!foto) return;
    const previousFocus = document.activeElement;
    const onKeyDown = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus?.();
    };
  }, [foto, onClose]);

  if (!foto?.url) return null;
  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 p-3 sm:p-6" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-label={foto.titulo} className="flex max-h-full w-full max-w-6xl flex-col rounded-2xl border border-zinc-700 bg-[#121318] shadow-2xl" onMouseDown={event => event.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 border-b border-zinc-700 px-4 py-3">
          <h3 className="min-w-0 truncate text-sm font-bold text-white sm:text-base">{foto.titulo}</h3>
          <button type="button" autoFocus onClick={onClose} aria-label="Cerrar foto ampliada" className="rounded-lg border border-zinc-600 px-3 py-1 text-xl leading-none text-white hover:border-[#fad911]">×</button>
        </div>
        <div className="flex min-h-0 items-center justify-center overflow-auto p-3 sm:p-5">
          <img src={foto.url} alt={foto.titulo} className="max-h-[calc(100dvh-9rem)] max-w-full object-contain" />
        </div>
      </div>
    </div>,
    document.body
  );
}
