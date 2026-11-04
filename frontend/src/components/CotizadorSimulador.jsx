import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Sparkles,
  CheckCircle2,
  MessageSquare,
  Send,
  CreditCard,
  Coins,
  Search,
  PiggyBank,
  ShieldCheck,
  Gift,
  Layers
} from 'lucide-react';
import { formatearSoles } from '../utils/format';
import { enviarCotizacion } from '../services/solicitudService';
import MotoSearchPicker from './MotoSearchPicker';

const MOTO_VACIA = {
  modelo: 'Selecciona un modelo',
  precio: 0,
  motor: '-',
  imagen_principal: '/multimedia/categorias/2ruedas_static.png',
  colores: []
};

export default function CotizadorSimulador({ motos = [], motoPreseleccionada = null }) {
  const [motoId, setMotoId] = useState(motoPreseleccionada ? motoPreseleccionada.id : 12);
  const [modalidad, setModalidad] = useState('CREDITO');
  const [colorSeleccionado, setColorSeleccionado] = useState('');
  const [porcentajeInicial, setPorcentajeInicial] = useState(20);
  const [meses, setMeses] = useState(24);
  const [metaAhorroMensual, setMetaAhorroMensual] = useState(500);

  // Datos del cliente
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [ciudad, setCiudad] = useState('Tacna');
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');
  const [respuestaExito, setRespuestaExito] = useState(null);

  useEffect(() => {
    if (motoPreseleccionada) {
      setMotoId(motoPreseleccionada.id);
    }
  }, [motoPreseleccionada]);

  const motoActiva = motos.find(m => m.id === Number(motoId)) || (motoId === null ? MOTO_VACIA : motos[0] || MOTO_VACIA);

  useEffect(() => {
    if (motoActiva.colores && motoActiva.colores.length > 0) {
      setColorSeleccionado(motoActiva.colores[0].nombre);
    } else {
      setColorSeleccionado('Estándar');
    }
  }, [motoId, motoActiva]);

  const precio = motoActiva.precio || 0;
  const imagenCotizador = motoActiva.colores?.find((color) => color.nombre === colorSeleccionado)?.img_moto || motoActiva.imagen_principal;
  const montoInicial = (precio * (porcentajeInicial / 100));
  const montoFinanciado = precio - montoInicial;
  const factorInteres = 1 + (0.0135 * meses);
  const cuotaMensual = meses > 0 ? ((montoFinanciado * factorInteres) / meses) : 0;
  const aporteMensual = Math.max(0, Number(metaAhorroMensual) || 0);
  const mesesAhorroEstimados = precio > 0 && aporteMensual > 0 ? Math.ceil(precio / aporteMensual) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!motoActiva.id) {
      setErrorEnvio('Busca y selecciona una motocicleta antes de enviar la propuesta.');
      return;
    }
    setEnviando(true);
    setErrorEnvio('');
    try {

      const payload = {
        id_moto: motoActiva.id,
        modelo_moto: motoActiva.modelo,
        modalidad: modalidad,
        color_seleccionado: colorSeleccionado,
        precio_moto: precio,
        cuota_inicial: modalidad === 'CREDITO' ? montoInicial : 0,
        numero_cuotas: modalidad === 'CREDITO' ? meses : 0,
        cuota_mensual_estimada: modalidad === 'CREDITO' ? cuotaMensual : 0,
        ...(modalidad === 'AHORRO' ? {
          meta_ahorro_mensual: aporteMensual,
          plazo_ahorro_estimado_meses: mesesAhorroEstimados
        } : {}),
        nombre_cliente: nombre,
        telefono_cliente: telefono,
        dni_cliente: dni,
        email_cliente: email,
        ciudad: ciudad
      };

      const res = await enviarCotizacion(payload);
      setRespuestaExito(res);

      if (res && res.enlace_whatsapp) {
        window.open(res.enlace_whatsapp, '_blank');
      }
    } catch (e) {
      setErrorEnvio(e.message || 'No se pudo guardar la solicitud. Inténtalo de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section id="cotizador" className="py-16 sm:py-24 bg-[#0a0a0c] border-b border-zinc-800 relative">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#181a22] border border-[#fad911]/30 text-[#fad911] text-xs font-bold uppercase tracking-wider mb-3">
            <Calculator className="w-3.5 h-3.5" />
            <span>Simulador Financiero en Línea</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            COTIZA TU <span className="text-[#fad911]">PRÓXIMA MOTO</span>
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base mt-2">
            Compara el pago al contado, el crédito vehicular o una meta mensual para ahorrar por tu próxima moto.
          </p>
        </div>

        {/* Simulador Container */}
        <div className="bg-[#121318] border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl">

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {errorEnvio && <p role="alert" className="text-red-400 text-sm col-span-full">{errorEnvio}</p>}

            {/* Lado Izquierdo: Configuración de la Moto y Plan */}
            <div className="lg:col-span-7 space-y-6">

              {/* Modalidad de compra */}
              <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800" aria-label="Modalidad de cotización">
                <button
                  type="button"
                  onClick={() => setModalidad('CONTADO')}
                  aria-pressed={modalidad === 'CONTADO'}
                  className={`min-w-0 px-1 py-3 rounded-xl font-extrabold text-[10px] sm:text-xs uppercase tracking-wide transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${modalidad === 'CONTADO' ? 'bg-[#fad911] text-black shadow-md' : 'text-zinc-400 hover:text-white'
                    }`}
                >
                  <Coins className="w-4 h-4" />
                  <span>Pago al Contado</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalidad('CREDITO')}
                  aria-pressed={modalidad === 'CREDITO'}
                  className={`min-w-0 px-1 py-3 rounded-xl font-extrabold text-[10px] sm:text-xs uppercase tracking-wide transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${modalidad === 'CREDITO' ? 'bg-[#fad911] text-black shadow-md' : 'text-zinc-400 hover:text-white'
                    }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Crédito Vehicular</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalidad('AHORRO')}
                  aria-pressed={modalidad === 'AHORRO'}
                  className={`min-w-0 px-1 py-3 rounded-xl font-extrabold text-[10px] sm:text-xs uppercase tracking-wide transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${modalidad === 'AHORRO' ? 'bg-[#fad911] text-black shadow-md' : 'text-zinc-400 hover:text-white'}`}
                >
                  <PiggyBank className="w-4 h-4 shrink-0" />
                  <span>Ahorro Motos</span>
                </button>
              </div>

              {/* Selector de Modelo */}
              <div>
                <label htmlFor="cotizador-modelo" className="block text-xs font-black text-zinc-300 uppercase tracking-wider mb-2">
                  1. Modelo de Motocicleta:
                </label>
                <MotoSearchPicker
                  motos={motos}
                  seleccionada={motoActiva.id ? motoActiva : null}
                  alSeleccionar={(moto) => setMotoId(moto.id)}
                  alLimpiar={() => setMotoId(null)}
                />
              </div>

              {/* Selector de Color si aplica */}
              {motoActiva.colores && motoActiva.colores.length > 0 && (
                <div>
                  <label className="block text-xs font-black text-zinc-300 uppercase tracking-wider mb-2">
                    2. Color Preferido de Fábrica:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {motoActiva.colores.map((col) => (
                      <button
                        key={col.id_color}
                        type="button"
                        onClick={() => setColorSeleccionado(col.nombre)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${colorSeleccionado === col.nombre
                          ? 'bg-[#fad911] text-black border-[#fad911] font-black'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                          }`}
                      >
                        {col.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Controles de Crédito */}
              {modalidad === 'CREDITO' && motoActiva.id && (
                <div className="space-y-5 p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800">
                  {/* Slider Cuota Inicial */}
                  <div>
                    <div className="flex justify-between text-xs font-extrabold text-zinc-300 mb-2">
                      <span>Cuota Inicial ({porcentajeInicial}%):</span>
                      <span className="text-[#fad911] font-black text-sm">{formatearSoles(montoInicial)}</span>
                    </div>
                    <input
                      id="cotizador-slider-inicial"
                      type="range"
                      min="10"
                      max="60"
                      step="5"
                      value={porcentajeInicial}
                      onChange={(e) => setPorcentajeInicial(Number(e.target.value))}
                      aria-label="Porcentaje de cuota inicial para el crédito"
                      className="w-full accent-[#fad911] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                      <span>10% (Mínimo: S/ {(precio * 0.1).toFixed(0)})</span>
                      <span>30%</span>
                      <span>60% (S/ {(precio * 0.6).toFixed(0)})</span>
                    </div>
                  </div>

                  {/* Plazos */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-2">Plazo de Pago (Meses):</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[12, 18, 24, 36].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMeses(m)}
                          className={`py-2.5 rounded-xl text-xs font-black transition-all border ${meses === m
                            ? 'bg-[#fad911] text-black border-[#fad911]'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
                            }`}
                        >
                          {m} Meses
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {modalidad === 'AHORRO' && motoActiva.id && (
                <div className="space-y-4 p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800">
                  <div>
                    <h3 className="text-sm font-black text-white">Organiza tu meta de ahorro</h3>
                    <p className="text-xs text-zinc-400 mt-1">Indica cuánto te gustaría separar cada mes para la moto seleccionada.</p>
                  </div>
                  <div>
                    <label htmlFor="cotizador-ahorro-mensual" className="block text-xs font-bold text-zinc-300 mb-2">Meta de ahorro mensual (S/)</label>
                    <input
                      id="cotizador-ahorro-mensual"
                      type="number"
                      inputMode="decimal"
                      min="1"
                      step="1"
                      required
                      value={metaAhorroMensual}
                      onChange={(e) => setMetaAhorroMensual(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white font-bold focus-ring"
                    />
                  </div>
                  <p className="text-xs text-zinc-400">Con esta meta, alcanzarías el precio actual en <strong className="text-[#fad911]">{mesesAhorroEstimados || '—'} {mesesAhorroEstimados === 1 ? 'mes' : 'meses'}</strong> aproximadamente.</p>
                </div>
              )}

              {/* Datos de Contacto */}
              <div className="space-y-3.5 pt-2">
                <label className="block text-xs font-black text-zinc-300 uppercase tracking-wider">
                  3. Datos para la Propuesta:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="cotizador-nombre" className="block text-[11px] font-bold text-zinc-400 mb-1">
                      Nombres y Apellidos <span className="text-[#fad911]">*</span>
                    </label>
                    <input
                      id="cotizador-nombre"
                      type="text"
                      placeholder="Ej. Juan Pérez Ramos"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus-ring"
                    />
                  </div>

                  <div>
                    <label htmlFor="cotizador-tel" className="block text-[11px] font-bold text-zinc-400 mb-1">
                      Celular / WhatsApp <span className="text-[#fad911]">*</span>
                    </label>
                    <input
                      id="cotizador-tel"
                      type="tel"
                      inputMode="numeric"
                      placeholder="Ej. 952123456"
                      required
                      maxLength={9}
                      pattern="[0-9]{9}"
                      title="Ingresa un celular de 9 dígitos, sin espacios ni +51"
                      value={telefono}
                      onChange={(e) =>
                        setTelefono(e.target.value.replace(/[^0-9]/g, '').slice(0, 9))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus-ring"
                    />
                  </div>

                  <div>
                    <label htmlFor="cotizador-dni" className="block text-[11px] font-bold text-zinc-400 mb-1">
                      {modalidad === 'CREDITO' ? 'DNI (para pre-evaluación crediticia)' : 'DNI (opcional)'}
                    </label>
                    <input
                      id="cotizador-dni"
                      type="text"
                      inputMode='numeric'
                      maxLength={8}
                      pattern="[0-9]{8}"
                      title="Ingresa los 8 digitos del DNI"
                      placeholder="8 digitos de DNI"
                      value={dni}
                      onChange={(e) =>
                        setDni(e.target.value.replace(/[^0-9]/g, '').slice(0, 8))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus-ring"
                    />
                  </div>

                  <div>
                    <label htmlFor="cotizador-email" className="block text-[11px] font-bold text-zinc-400 mb-1">
                      Correo Electrónico (Opcional)
                    </label>
                    <input
                      id="cotizador-email"
                      type="email"
                      maxLength={254}
                      pattern="[^@ ]+@(gmail|hotmail|outlook)\.com"
                      title="Usa un correo de Gmail, Hotmail o Outlook"
                      placeholder="[EMAIL_ADDRESS]"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.toLowerCase())}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus-ring"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Lado Derecho: Tarjeta Resumen y Enviar */}
            <div className="lg:col-span-5 self-start flex flex-col gap-6 bg-[#0c0d10] p-6 sm:p-8 rounded-2xl border border-zinc-800/90">

              <div>
                {motoActiva.id ? <>
                <div className="aspect-[16/9] w-full overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900">
                  <img
                    src={imagenCotizador}
                    alt={`${motoActiva.marca || ''} ${motoActiva.modelo}`.trim()}
                    className="h-full w-full object-cover object-center"
                  />
                </div>

                <div className="mt-4 border-b border-zinc-800 pb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#fad911]">Unidad seleccionada</span>
                  <p className="mt-1 text-xs font-bold uppercase tracking-widest text-zinc-400">{motoActiva.marca}</p>
                  <h3 className="text-xl font-black text-white break-words sm:text-2xl">{motoActiva.modelo}</h3>
                </div>

                {/* Cuota o meta a la izquierda; precio de la moto a la derecha */}
                <div className="grid grid-cols-2 gap-2 pt-5 sm:gap-3">
                  {modalidad !== 'CONTADO' && (
                    <div className="min-w-0 text-left">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        {modalidad === 'AHORRO' ? 'Meta mensual de ahorro' : 'Cuota mensual estimada'}
                      </span>
                      <strong key={`${modalidad}-${cuotaMensual.toFixed(0)}-${aporteMensual}`} className="mt-1 block whitespace-nowrap text-[clamp(0.875rem,4vw,1.875rem)] font-black text-[#fad911] animate-value-update">
                        {formatearSoles(modalidad === 'AHORRO' ? aporteMensual : cuotaMensual)}
                      </strong>
                    </div>
                  )}
                  <div className={`min-w-0 text-right ${modalidad === 'CONTADO' ? 'col-span-2' : 'border-l border-zinc-800 pl-2 sm:pl-3'}`}>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Precio de la moto</span>
                    <strong className="mt-1 block whitespace-nowrap text-[clamp(0.875rem,4vw,1.875rem)] font-black text-white">{formatearSoles(precio)}</strong>
                  </div>
                </div>
                </> : (
                  <div className="flex min-h-72 flex-col items-center justify-center text-center">
                    <Search aria-hidden="true" className="h-9 w-9 text-[#fad911] mb-4" />
                    <h3 className="text-lg font-black text-white">Elige tu motocicleta</h3>
                    <p className="mt-2 max-w-xs text-sm text-zinc-400">Busca un modelo y selecciónalo para ver el precio y preparar tu propuesta.</p>
                  </div>
                )}
              </div>

              {/* Botón de Envío */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={enviando || !motoActiva.id}
                  className="w-full py-4 rounded-xl bg-[#fad911] hover:bg-[#fce23e] text-black font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#fad911]/25 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  {enviando ? (
                    <span>Generando propuesta personalizada...</span>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4" />
                      <span>{!motoActiva.id ? 'Selecciona una moto para continuar' : modalidad === 'AHORRO' ? 'Consultar Ahorro Motos por WhatsApp' : 'Enviar cotización al asesor por WhatsApp'}</span>
                    </>
                  )}
                </button>

                {respuestaExito && (
                  <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-800 text-emerald-300 text-xs text-center flex items-center justify-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{respuestaExito.mensaje || '¡Cotización enviada! Se abrirá la conversación en WhatsApp.'}</span>
                  </div>
                )}
              </div>

            </div>

          </form>

        </div>

      </div>
    </section>
  );
}
