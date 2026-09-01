import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Gift, 
  Wrench, 
  CreditCard, 
  Calculator, 
  MessageSquare, 
  ChevronRight,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { formatearSoles, enviarCotizacion } from '../utils/api';

export default function MotoDetailModal({ motoId, motos = [], alCerrar, abrirModalReserva }) {
  const moto = motos.find(m => m.id === Number(motoId));
  
  const [colorSeleccionadoIdx, setColorSeleccionadoIdx] = useState(0);
  const [imagenPrincipal, setImagenPrincipal] = useState('');
  const [modalidad, setModalidad] = useState('CREDITO');
  const [porcentajeInicial, setPorcentajeInicial] = useState(20);
  const [meses, setMeses] = useState(24);
  const [enviando, setEnviando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [dni, setDni] = useState('');

  useEffect(() => {
    if (moto) {
      setImagenPrincipal(moto.imagen_principal);
      setColorSeleccionadoIdx(0);
      setMensajeExito('');
    }
  }, [moto]);

  if (!moto) return null;

  const colorActual = moto.colores && moto.colores[colorSeleccionadoIdx];
  const precio = moto.precio || 0;
  const cuotaInicialMonto = (precio * (porcentajeInicial / 100));
  const montoAFinanciar = precio - cuotaInicialMonto;
  const factorInteres = 1 + (0.0135 * meses);
  const totalConInteres = montoAFinanciar * factorInteres;
  const cuotaMensual = meses > 0 ? (totalConInteres / meses) : 0;

  const handleSelectColor = (idx) => {
    setColorSeleccionadoIdx(idx);
    const col = moto.colores[idx];
    if (col && col.img_moto) {
      setImagenPrincipal(col.img_moto);
    }
  };

  const handleEnviarCotizacion = async (e) => {
    e.preventDefault();
    setEnviando(true);
    
    const payload = {
      id_moto: moto.id,
      modelo_moto: moto.modelo,
      modalidad: modalidad,
      color_seleccionado: colorActual ? colorActual.nombre : 'Estándar',
      precio_moto: precio,
      cuota_inicial: modalidad === 'CREDITO' ? cuotaInicialMonto : 0,
      numero_cuotas: modalidad === 'CREDITO' ? meses : 0,
      cuota_mensual_estimada: modalidad === 'CREDITO' ? cuotaMensual : 0,
      nombre_cliente: nombre || 'Cliente Lupol',
      telefono_cliente: telefono || '924141939',
      dni_cliente: dni || '',
      ciudad: 'Tacna'
    };

    const res = await enviarCotizacion(payload);
    setEnviando(false);
    
    if (res && res.enlace_whatsapp) {
      window.open(res.enlace_whatsapp, '_blank');
      setMensajeExito('¡Cotización generada! Te redirigimos al WhatsApp oficial de Lupol Motos.');
    }
  };

  const msgDirecto = `Hola Lupol Motos, quiero cotizar la *${moto.modelo}* (${colorActual?.nombre || 'Color estándar'}) en modalidad *${modalidad}*.`;
  const urlWADirecto = `https://wa.me/51924141939?text=${encodeURIComponent(msgDirecto)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity" 
        onClick={alCerrar} 
      />

      <div className="relative bg-[#101116] border border-zinc-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden z-10 my-8 max-h-[90vh] flex flex-col animate-fade-in-scale">
        
        <div className="p-5 sm:p-6 border-b border-zinc-800 flex justify-between items-center bg-[#14151c]">
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 rounded-md bg-[#fad911] text-black text-xs font-black uppercase">
              {moto.categoria || moto.tipo}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">{moto.modelo}</h2>
          </div>

          <button 
            onClick={alCerrar}
            className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 bg-[#0b0c0e] rounded-2xl border border-zinc-800/80 p-6 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[380px] relative">
              <div className="absolute top-4 left-4 bg-zinc-900/90 px-3 py-1 rounded-lg border border-zinc-800 text-xs font-bold text-zinc-300">
                100% Original Bajaj
              </div>

              <img
                src={imagenPrincipal}
                alt={moto.modelo}
                className="max-h-[260px] sm:max-h-[320px] w-auto object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]"
                onError={(e) => {
                  e.target.src = moto.imagen_principal;
                }}
              />

              {moto.colores && moto.colores.length > 0 && (
                <div className="mt-4 pt-4 border-t border-zinc-800/80 w-full flex items-center justify-between">
                  <div className="text-xs font-bold text-zinc-400">
                    Color: <strong className="text-[#fad911]">{colorActual?.nombre}</strong>
                  </div>

                  <div className="flex space-x-2">
                    {moto.colores.map((col, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectColor(idx)}
                        className={`p-0.5 rounded-lg border-2 transition-all ${
                          colorSeleccionadoIdx === idx ? 'border-[#fad911] scale-110' : 'border-zinc-700'
                        }`}
                        title={col.nombre}
                      >
                        <div className="w-6 h-6 rounded-md overflow-hidden bg-zinc-900">
                          {col.img_swatch ? (
                            <img src={col.img_swatch} alt={col.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[8px] font-bold text-zinc-300">C</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-5 space-y-5">
              <div>
                <div className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">Precio de Lista Oficial en Tacna</div>
                <div className="text-3xl sm:text-4xl font-black text-[#fad911]">
                  {formatearSoles(moto.precio)}
                </div>
                <p className="text-xs text-zinc-300 mt-1">
                  Incluye IGV (18%), gestión notarial de placa y tarjeta de propiedad SUNARP (TIVe).
                </p>
              </div>

              <div className="space-y-2.5 p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs">
                <div className="font-black text-[#fad911] uppercase text-[11px] tracking-wider">
                  Beneficios incluidos con tu compra:
                </div>
                <div className="flex items-center text-zinc-200">
                  <ShieldCheck className="w-4 h-4 text-[#fad911] mr-2.5 shrink-0" />
                  <span>1 Año de Garantía o 20,000 km en motor y chasis</span>
                </div>
                <div className="flex items-center text-zinc-200">
                  <Wrench className="w-4 h-4 text-[#fad911] mr-2.5 shrink-0" />
                  <span>Mano de obra 100% gratuita hasta los 5,000 km</span>
                </div>
                <div className="flex items-center text-zinc-200">
                  <Gift className="w-4 h-4 text-[#fad911] mr-2.5 shrink-0" />
                  <span>Casco de seguridad certificado (Homologado)</span>
                </div>
              </div>

              <button
                onClick={() => {
                  alCerrar();
                  abrirModalReserva(moto);
                }}
                className="w-full py-3.5 rounded-xl bg-[#fad911] hover:bg-[#fce23e] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-[#fad911]/20 transition-all hover:scale-[1.01]"
              >
                <span>Separar unidad con S/ 200.00</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <a
                href={urlWADirecto}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Consultar disponibilidad con un asesor</span>
              </a>
            </div>

          </div>

          <div>
            <h3 className="text-lg font-black text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 text-[#fad911] mr-2" />
              <span>FICHA TÉCNICA Y ESPECIFICACIONES</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <div className="text-[10px] uppercase font-bold text-zinc-500">Cilindrada / Motor</div>
                <div className="text-sm font-bold text-white mt-0.5">{moto.motor || 'DTS-i'}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <div className="text-[10px] uppercase font-bold text-zinc-500">Potencia Máxima</div>
                <div className="text-sm font-bold text-white mt-0.5">{moto.potencia || 'No especificada'}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <div className="text-[10px] uppercase font-bold text-zinc-500">Torque Máximo</div>
                <div className="text-sm font-bold text-white mt-0.5">{moto.torque || 'No especificado'}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <div className="text-[10px] uppercase font-bold text-zinc-500">Sistema de Frenos</div>
                <div className="text-sm font-bold text-white mt-0.5">{moto.frenos || 'Disco / Tambor'}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <div className="text-[10px] uppercase font-bold text-zinc-500">Suspensión</div>
                <div className="text-sm font-bold text-white mt-0.5">{moto.suspension || 'Telescópica / Nitrox'}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <div className="text-[10px] uppercase font-bold text-zinc-500">Enfriamiento</div>
                <div className="text-sm font-bold text-white mt-0.5">{moto.enfriamiento || 'Aire / Líquido'}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <div className="text-[10px] uppercase font-bold text-zinc-500">Tanque de Combustible</div>
                <div className="text-sm font-bold text-white mt-0.5">{moto.tanque || '12 L'}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <div className="text-[10px] uppercase font-bold text-zinc-500">Neumáticos</div>
                <div className="text-sm font-bold text-white mt-0.5">{moto.neumaticos || 'Estándar'}</div>
              </div>
            </div>

            {moto.detalle && (
              <div className="mt-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {moto.detalle}
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#181a22] to-[#121318] border border-zinc-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center">
                  <Calculator className="w-5 h-5 text-[#fad911] mr-2" />
                  <span>SIMULADOR DE FINANCIAMIENTO LUPOL</span>
                </h3>
                <p className="text-xs text-zinc-400">Calcula tu cuota mensual estimada en segundos.</p>
              </div>

              <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                <button
                  onClick={() => setModalidad('CONTADO')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                    modalidad === 'CONTADO' ? 'bg-[#fad911] text-black shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  CONTADO
                </button>
                <button
                  onClick={() => setModalidad('CREDITO')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                    modalidad === 'CREDITO' ? 'bg-[#fad911] text-black shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  CRÉDITO
                </button>
              </div>
            </div>

            {modalidad === 'CREDITO' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-zinc-300 mb-1.5">
                      <span>Cuota Inicial ({porcentajeInicial}%):</span>
                      <span className="text-[#fad911] font-black">{formatearSoles(cuotaInicialMonto)}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="60"
                      step="5"
                      value={porcentajeInicial}
                      onChange={(e) => setPorcentajeInicial(Number(e.target.value))}
                      aria-label="Porcentaje de cuota inicial"
                      className="w-full accent-[#fad911] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                      <span>10% (Mínimo)</span>
                      <span>30%</span>
                      <span>60%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-2">Plazo de Financiamiento:</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[12, 18, 24, 36].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMeses(m)}
                          className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                            meses === m
                              ? 'bg-[#fad911] text-black border-[#fad911]'
                              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          {m} Meses
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 p-5 rounded-2xl bg-black/60 border border-zinc-800 text-center space-y-2">
                  <div className="text-xs font-bold text-zinc-400">Cuota Mensual Estimada:</div>
                  <div className="text-3xl sm:text-4xl font-black text-[#fad911]">
                    {formatearSoles(cuotaMensual)}
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    A pagar en <strong className="text-white">{meses} cuotas</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-black/40 border border-zinc-800 text-center text-sm text-zinc-300">
                Precio al Contado: <strong className="text-[#fad911] text-xl font-black">{formatearSoles(precio)}</strong>. Entrega en 24 horas hábiles con placa lista.
              </div>
            )}

            <form onSubmit={handleEnviarCotizacion} className="pt-3 border-t border-zinc-800 space-y-3.5">
              <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Solicita tu propuesta formal y evaluación directa:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="modal-cotiz-nombre" className="block text-[11px] font-bold text-zinc-400 mb-1">
                    Nombres y Apellidos <span className="text-[#fad911]">*</span>
                  </label>
                  <input
                    id="modal-cotiz-nombre"
                    type="text"
                    placeholder="Ej. Juan Pérez Ramos"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus-ring"
                  />
                </div>

                <div>
                  <label htmlFor="modal-cotiz-tel" className="block text-[11px] font-bold text-zinc-400 mb-1">
                    Celular / WhatsApp <span className="text-[#fad911]">*</span>
                  </label>
                  <input
                    id="modal-cotiz-tel"
                    type="tel"
                    placeholder="Ej. 952 123 456"
                    required
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus-ring"
                  />
                </div>

                <div>
                  <label htmlFor="modal-cotiz-dni" className="block text-[11px] font-bold text-zinc-400 mb-1">
                    DNI / CE (Opcional)
                  </label>
                  <input
                    id="modal-cotiz-dni"
                    type="text"
                    maxLength={12}
                    placeholder="8 dígitos de DNI"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus-ring"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="w-full py-3.5 rounded-xl bg-[#fad911] hover:bg-[#fce23e] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md mt-2"
              >
                {enviando ? (
                  <span>Generando propuesta...</span>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4" />
                    <span>Enviar propuesta a WhatsApp oficial</span>
                  </>
                )}
              </button>

              {mensajeExito && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs text-center flex items-center justify-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{mensajeExito}</span>
                </div>
              )}
            </form>

          </div>

        </div>

      </div>

    </div>
  );
}
