import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { formatearSoles } from '../utils/format';

const MAX_RESULTADOS = 6;
const normalizar = (texto) => String(texto || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase('es-PE');
const nombreMoto = (moto) => [moto.marca, moto.modelo].filter(Boolean).join(' ');

export default function MotoSearchPicker({ motos, seleccionada, alSeleccionar, alLimpiar }) {
  const [busqueda, setBusqueda] = useState('');
  const [abierto, setAbierto] = useState(false);
  const [indiceActivo, setIndiceActivo] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (seleccionada) setBusqueda(nombreMoto(seleccionada));
  }, [seleccionada?.id, seleccionada?.marca, seleccionada?.modelo]);

  const coincidencias = useMemo(() => {
    const termino = normalizar(busqueda.trim());
    if (!termino || seleccionada) return [];
    return motos.filter((moto) => normalizar(`${moto.marca} ${moto.modelo} ${moto.motor}`).includes(termino));
  }, [busqueda, motos, seleccionada]);
  const resultados = coincidencias.slice(0, MAX_RESULTADOS);
  const indiceMostrado = Math.min(indiceActivo, Math.max(0, resultados.length - 1));
  const mostrarResultados = abierto && busqueda.trim() && !seleccionada;

  const elegir = (moto) => {
    alSeleccionar(moto);
    setBusqueda(nombreMoto(moto));
    setAbierto(false);
    setIndiceActivo(0);
  };

  const cambiarBusqueda = (texto) => {
    setBusqueda(texto);
    alLimpiar();
    setIndiceActivo(0);
    setAbierto(true);
  };

  const manejarTecla = (evento) => {
    if (evento.key === 'Escape') {
      setAbierto(false);
    } else if (evento.key === 'ArrowDown' && resultados.length) {
      evento.preventDefault();
      setAbierto(true);
      setIndiceActivo((indice) => Math.min(indice + 1, resultados.length - 1));
    } else if (evento.key === 'ArrowUp' && resultados.length) {
      evento.preventDefault();
      setIndiceActivo((indice) => Math.max(indice - 1, 0));
    } else if (evento.key === 'Enter') {
      evento.preventDefault();
      if (mostrarResultados && resultados.length) elegir(resultados[indiceMostrado]);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
        <input
          ref={inputRef}
          id="cotizador-modelo"
          type="text"
          inputMode="search"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={Boolean(mostrarResultados)}
          aria-controls="cotizador-modelo-resultados"
          aria-activedescendant={mostrarResultados && resultados.length ? `cotizador-modelo-opcion-${resultados[indiceMostrado].id}` : undefined}
          aria-label="Buscar motocicleta por modelo o marca"
          placeholder="Escribe el modelo o la marca de la moto"
          value={busqueda}
          onChange={(evento) => cambiarBusqueda(evento.target.value)}
          onFocus={(evento) => { evento.target.select(); setAbierto(true); }}
          onBlur={() => setAbierto(false)}
          onKeyDown={manejarTecla}
          className="w-full pl-10 pr-11 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white font-bold placeholder-zinc-500 focus-ring"
        />
        {busqueda && (
          <button
            type="button"
            aria-label="Borrar búsqueda de motocicleta"
            onMouseDown={(evento) => evento.preventDefault()}
            onClick={() => { cambiarBusqueda(''); inputRef.current?.focus(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {mostrarResultados && (
        <div id="cotizador-modelo-resultados" role="listbox" aria-label="Motocicletas encontradas" className="absolute z-30 mt-2 w-full max-h-72 overflow-y-auto rounded-xl border border-zinc-700 bg-[#1b1c22] p-1.5 shadow-2xl">
          {resultados.length ? resultados.map((moto, indice) => (
            <button
              key={moto.id}
              id={`cotizador-modelo-opcion-${moto.id}`}
              role="option"
              aria-selected={indice === indiceMostrado}
              type="button"
              onMouseDown={(evento) => evento.preventDefault()}
              onClick={() => elegir(moto)}
              className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${indice === indiceActivo ? 'bg-[#fad911] text-black' : 'text-zinc-100 hover:bg-zinc-700'}`}
            >
              <span className="min-w-0 truncate font-bold">{nombreMoto(moto)}</span>
              <span className="shrink-0 text-xs font-semibold">{formatearSoles(moto.precio)}</span>
            </button>
          )) : <p className="px-3 py-3 text-sm text-zinc-400">No encontramos motos con ese nombre.</p>}
          {coincidencias.length > MAX_RESULTADOS && <p className="px-3 py-2 text-xs text-zinc-400">Escribe más letras para precisar la búsqueda.</p>}
        </div>
      )}
      {!seleccionada && <p className="mt-2 text-xs text-zinc-400">Escribe y selecciona una moto de los resultados para continuar.</p>}
    </div>
  );
}
