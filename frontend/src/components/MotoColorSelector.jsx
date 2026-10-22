import React from 'react';
import { fondoColor } from '../utils/colores';

export default function MotoColorSelector({ colores = [], seleccionado = -1, onSelect }) {
  const opciones = Array.isArray(colores) ? colores : [];
  return (
    <fieldset className="min-w-0 w-full border-0 p-0 text-center text-white">
      <legend className="sr-only">Colores disponibles</legend>
      <p aria-hidden="true" className="text-[11px] font-normal uppercase mb-1.5">Colores disponibles</p>
      {opciones.length === 0 && (
        <p className="text-[11px] text-zinc-400">Consulta los colores disponibles</p>
      )}
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-2">
        {opciones.map((color, idx) => (
          <button type="button" key={idx} aria-pressed={seleccionado === idx} aria-label={`Seleccionar ${color.nombre}`} onClick={(event) => { event.stopPropagation(); onSelect(idx); }} className="flex min-w-14 max-w-full flex-col items-center gap-1 rounded-lg px-1 py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fad911]">
            <span aria-hidden="true" className={`block h-10 w-10 rounded-full border border-white overflow-hidden transition-transform hover:scale-105 ${seleccionado === idx ? 'ring-2 ring-[#fad911] ring-offset-2 ring-offset-black' : ''}`} style={{ background: fondoColor(color.nombre) }} />
            <span className="text-[10px] font-extrabold uppercase break-words">{color.nombre?.replaceAll('/', ' / ')}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}



