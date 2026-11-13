import { useState } from 'react';
import { ArrowUpRight, MessageSquare, ShieldCheck } from 'lucide-react';

const SBS_SOAT = 'https://www.sbs.gob.pe/usuarios/aprende-con-la-sbs/seguros-obligatorios-de-accidentes-de-transito_';

export default function SeccionSoat() {
  const [vehiculo, setVehiculo] = useState('Moto lineal');
  const [placa, setPlaca] = useState('');
  const [dni, setDni] = useState('');
  const [errorDni, setErrorDni] = useState('');

  const dniLimpio = dni.replace(/\D/g, '');
  const dniValido = /^\d{8}$/.test(dniLimpio);
  const mensaje = `Hola Lupol Motos, deseo cotizar y comprar un SOAT. Vehículo: ${vehiculo}. Placa: ${placa.trim().toUpperCase() || 'Aún sin placa'}. DNI del propietario: ${dniLimpio || 'Por confirmar'}. ¿Me confirman el precio, la aseguradora y cómo completar la compra?`;
  const enlaceWhatsApp = `https://wa.me/51980687475?text=${encodeURIComponent(mensaje)}`;

  const validarDni = event => {
    if (!dniValido) {
      event.preventDefault();
      setErrorDni('Ingresa los 8 dígitos del DNI del propietario.');
      document.getElementById('soat-dni')?.focus();
      return;
    }
    setErrorDni('');
  };

  return (
    <section id="soat" aria-labelledby="soat-titulo" className="soat-seccion relative overflow-hidden border-y border-zinc-800 bg-[#101115] py-12 sm:py-16">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#fad911]/10 blur-[100px]" />
      <div className="relative mx-auto max-w-[1600px] px-4 sm:px-6">
        <div className="tarjeta-lupol soat-panel grid gap-8 overflow-hidden rounded-3xl border border-zinc-700 p-6 shadow-2xl sm:p-9 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12 lg:p-12">
          <div className="flex flex-col justify-center">
            <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-[#fad911]/40 bg-[#fad911]/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#fad911]">
              <ShieldCheck className="h-4 w-4" /> SOAT en Lupol Motos
            </span>
            <h2 id="soat-titulo" className="max-w-2xl text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
              Tu moto y tú, <span className="text-[#fad911]">listos para la ruta.</span>
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-300 sm:text-base">
              Cotiza tu Seguro Obligatorio de Accidentes de Tránsito y continúa la compra con nuestro asesor. Te confirmaremos el precio y la aseguradora antes de pagar.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-zinc-200">
              <span className="rounded-full border border-zinc-600 bg-black/20 px-3 py-1.5">Cobertura nacional</span>
              <span className="rounded-full border border-zinc-600 bg-black/20 px-3 py-1.5">Ocupantes y terceros</span>
            </div>
            <a href={SBS_SOAT} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-zinc-300 underline decoration-zinc-600 underline-offset-4 hover:text-[#fad911]">
              Conoce las coberturas en la SBS <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="relative rounded-2xl border border-zinc-700 bg-[#0d0e12]/92 p-5 shadow-xl backdrop-blur-sm sm:p-6">
            <h3 className="text-xl font-black text-white">Cotiza tu SOAT</h3>
            <p className="mt-1 text-sm text-zinc-400">Cuéntanos qué vehículo deseas asegurar.</p>

            <label htmlFor="soat-vehiculo" className="mt-5 block text-xs font-bold uppercase tracking-wide text-zinc-300">Tipo de vehículo</label>
            <select id="soat-vehiculo" value={vehiculo} onChange={event => setVehiculo(event.target.value)} className="mt-2 w-full rounded-xl border border-zinc-600 bg-[#17191f] px-4 py-3 text-sm text-white outline-none focus:border-[#fad911]">
              <option>Moto lineal</option>
              <option>Trimoto / mototaxi</option>
              <option>Otro vehículo</option>
            </select>

            <label htmlFor="soat-placa" className="mt-4 block text-xs font-bold uppercase tracking-wide text-zinc-300">Placa <span className="font-normal normal-case text-zinc-500">(si ya la tienes)</span></label>
            <input id="soat-placa" value={placa} onChange={event => setPlaca(event.target.value.slice(0, 12))} maxLength={12} autoComplete="off" placeholder="Ej. ABC-123" className="mt-2 w-full rounded-xl border border-zinc-600 bg-[#17191f] px-4 py-3 text-sm uppercase text-white outline-none placeholder:normal-case placeholder:text-zinc-500 focus:border-[#fad911]" />

            <label htmlFor="soat-dni" className="mt-4 block text-xs font-bold uppercase tracking-wide text-zinc-300">DNI del propietario <span className="font-normal normal-case text-zinc-500">(8 dígitos)</span></label>
            <input
              id="soat-dni"
              value={dni}
              onChange={event => { setDni(event.target.value.replace(/\D/g, '').slice(0, 8)); setErrorDni(''); }}
              inputMode="numeric"
              pattern="[0-9]{8}"
              maxLength={8}
              autoComplete="off"
              placeholder="Ej. 12345678"
              aria-invalid={errorDni ? 'true' : undefined}
              aria-describedby={errorDni ? 'soat-dni-error' : undefined}
              className={`mt-2 w-full rounded-xl border bg-[#17191f] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#fad911] ${errorDni ? 'border-red-500' : 'border-zinc-600'}`}
            />
            {errorDni && <p id="soat-dni-error" role="alert" className="mt-1.5 text-xs font-semibold text-red-400">{errorDni}</p>}

            <a href={enlaceWhatsApp} onClick={validarDni} aria-disabled={!dniValido} target="_blank" rel="noopener noreferrer" className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#fad911] px-4 py-3.5 text-center text-sm font-black text-black shadow-lg shadow-[#fad911]/15 transition-colors hover:bg-[#ffe34b] ${!dniValido ? 'opacity-80' : ''}`}>
              <MessageSquare className="h-4 w-4" /> Cotizar y comprar por WhatsApp
            </a>
            <p className="mt-3 text-center text-xs leading-relaxed text-zinc-500">Un asesor confirmará la disponibilidad, el precio y los pasos para completar la compra.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
