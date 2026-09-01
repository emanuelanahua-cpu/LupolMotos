import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Sparkles, 
  CheckCircle2, 
  MessageSquare, 
  Send, 
  CreditCard, 
  Coins, 
  ShieldCheck, 
  Gift, 
  Layers
} from 'lucide-react';
import { formatearSoles, enviarCotizacion } from '../utils/api';

export default function CotizadorSimulador({ motos = [], motoPreseleccionada = null }) {
  const [motoId, setMotoId] = useState(motoPreseleccionada ? motoPreseleccionada.id : 12);
  const [modalidad, setModalidad] = useState('CREDITO');
  const [colorSeleccionado, setColorSeleccionado] = useState('');
  const [porcentajeInicial, setPorcentajeInicial] = useState(20);
  const [meses, setMeses] = useState(24);

  // Datos del cliente
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [ciudad, setCiudad] = useState('Tacna');
  const [enviando, setEnviando] = useState(false);
  const [respuestaExito, setRespuestaExito] = useState(null);

  useEffect(() => {
    if (motoPreseleccionada) {
      setMotoId(motoPreseleccionada.id);
    }
  }, [motoPreseleccionada]);

  const motoActiva = motos.find(m => m.id === Number(motoId)) || motos[0] || {
    modelo: 'Pulsar NS400Z',
    precio: 18500,
    motor: '373.3cc',
    imagen_principal: '/multimedia/pulsar_ns400Z/moto.webp',
    colores: []
  };

  useEffect(() => {
    if (motoActiva.colores && motoActiva.colores.length > 0) {
      setColorSeleccionado(motoActiva.colores[0].nombre);
    } else {
      setColorSeleccionado('Estándar');
    }
  }, [motoId, motoActiva]);

  const precio = motoActiva.precio || 0;
  const montoInicial = (precio * (porcentajeInicial / 100));
  const montoFinanciado = precio - montoInicial;
  const factorInteres = 1 + (0.0135 * meses);
  const cuotaMensual = meses > 0 ? ((montoFinanciado * factorInteres) / meses) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);

    const payload = {
      id_moto: motoActiva.id,
      modelo_moto: motoActiva.modelo,
      modalidad: modalidad,
      color_seleccionado: colorSeleccionado,
      precio_moto: precio,
      cuota_inicial: modalidad === 'CREDITO' ? montoInicial : 0,
      numero_cuotas: modalidad === 'CREDITO' ? meses : 0,
      cuota_mensual_estimada: modalidad === 'CREDITO' ? cuotaMensual : 0,
      nombre_cliente: nombre,
      telefono_cliente: telefono,
      dni_cliente: dni,
      email_cliente: email,
      ciudad: ciudad
    };

    const res = await enviarCotizacion(payload);
    setEnviando(false);
    setRespuestaExito(res);

    if (res && res.enlace_whatsapp) {
      window.open(res.enlace_whatsapp, '_blank');
    }
  };

  return (
    <section id="cotizador" className="py-16 sm:py-24 bg-[#0a0a0c] border-b border-zinc-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
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
            Configura tu plan de financiamiento en Soles con cuotas fijas o cotiza al contado con beneficios exclusivos.
          </p>
        </div>

        {/* Simulador Container */}
        <div className="bg-[#121318] border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Lado Izquierdo: Configuración de la Moto y Plan */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Modalidad Contado / Crédito */}
              <div className="flex bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalidad('CONTADO')}
                  className={`flex-1 py-3 rounded-xl font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center space-x-2 ${
                    modalidad === 'CONTADO' ? 'bg-[#fad911] text-black shadow-md' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Coins className="w-4 h-4" />
                  <span>Pago al Contado</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalidad('CREDITO')}
                  className={`flex-1 py-3 rounded-xl font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center space-x-2 ${
                    modalidad === 'CREDITO' ? 'bg-[#fad911] text-black shadow-md' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Crédito Vehicular</span>
                </button>
              </div>

              {/* Selector de Modelo */}
              <div>
                <label htmlFor="cotizador-modelo" className="block text-xs font-black text-zinc-300 uppercase tracking-wider mb-2">
                  1. Modelo de Motocicleta:
                </label>
                <select
                  id="cotizador-modelo"
                  value={motoId}
                  onChange={(e) => setMotoId(Number(e.target.value))}
                  aria-label="Seleccionar modelo de motocicleta para cotizar"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white font-bold focus-ring"
                >
                  {motos.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.modelo} — {formatearSoles(m.precio)} ({m.motor || 'DTS-i'})
                    </option>
                  ))}
                </select>
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
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          colorSeleccionado === col.nombre
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
              {modalidad === 'CREDITO' && (
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
                      <span>10% (Mínimo: S/ {(precio*0.1).toFixed(0)})</span>
                      <span>30%</span>
                      <span>60% (S/ {(precio*0.6).toFixed(0)})</span>
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
                          className={`py-2.5 rounded-xl text-xs font-black transition-all border ${
                            meses === m
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

              {/* Datos de Contacto */}
              <div className="space-y-3.5 pt-2">
                <label className="block text-xs font-black text-zinc-300 uppercase tracking-wider">
                  3. Datos para la Propuesta y Evaluación:
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
                      placeholder="Ej. 952 123 456"
                      required
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus-ring"
                    />
                  </div>

                  <div>
                    <label htmlFor="cotizador-dni" className="block text-[11px] font-bold text-zinc-400 mb-1">
                      DNI (Para pre-evaluación crediticia)
                    </label>
                    <input
                      id="cotizador-dni"
                      type="text"
                      maxLength={12}
                      placeholder="8 dígitos de DNI"
                      value={dni}
                      onChange={(e) => setDni(e.target.value)}
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
                      placeholder="correo@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus-ring"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Lado Derecho: Tarjeta Resumen y Enviar */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6 bg-[#0c0d10] p-6 sm:p-8 rounded-2xl border border-zinc-800/90">
              
              <div>
                <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#fad911] tracking-wider">Unidad Seleccionada</span>
                    <h3 className="text-xl font-black text-white">{motoActiva.modelo}</h3>
                  </div>

                  <div className="w-16 h-12 flex items-center justify-center">
                    <img
                      src={motoActiva.imagen_principal}
                      alt={motoActiva.modelo}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>

                {/* Desglose de Precios */}
                <div className="py-5 space-y-3 text-xs border-b border-zinc-800">
                  <div className="flex justify-between text-zinc-400">
                    <span>Precio de Catálogo:</span>
                    <strong className="text-white font-bold">{formatearSoles(precio)}</strong>
                  </div>

                  {modalidad === 'CREDITO' ? (
                    <>
                      <div className="flex justify-between text-zinc-400">
                        <span>Cuota Inicial ({porcentajeInicial}%):</span>
                        <strong className="text-[#fad911] font-bold">{formatearSoles(montoInicial)}</strong>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Saldo a Financiar:</span>
                        <strong className="text-zinc-200 font-bold">{formatearSoles(montoFinanciado)}</strong>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Plazo acordado:</span>
                        <strong className="text-white font-bold">{meses} Cuotas Mensuales</strong>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-zinc-400">
                      <span>Modalidad de Compra:</span>
                      <strong className="text-emerald-400 font-bold">Pago al Contado Inmediato</strong>
                    </div>
                  )}
                </div>

                {/* Resultado Principal */}
                <div className="pt-5 text-center">
                  <span className="text-xs uppercase font-bold text-zinc-400 block tracking-wider">
                    {modalidad === 'CREDITO' ? 'Cuota Mensual Estimada' : 'Monto Total al Contado'}
                  </span>
                  <div 
                    key={`${modalidad}-${cuotaMensual.toFixed(0)}-${precio}`}
                    className="text-3xl sm:text-4xl font-black text-[#fad911] mt-1 animate-value-update"
                  >
                    {formatearSoles(modalidad === 'CREDITO' ? cuotaMensual : precio)}
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1.5 leading-tight">
                    * Incluye IGV, trámite de placa y tarjeta de propiedad. Las cuotas finales dependen de la evaluación crediticia.
                  </p>
                </div>
              </div>

              {/* Botón de Envío */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full py-4 rounded-xl bg-[#fad911] hover:bg-[#fce23e] text-black font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#fad911]/25 hover:scale-[1.01]"
                >
                  {enviando ? (
                    <span>Generando propuesta personalizada...</span>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4" />
                      <span>Enviar cotización al asesor por WhatsApp</span>
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
