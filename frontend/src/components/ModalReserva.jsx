import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  MessageSquare, 
  Send, 
  MapPin, 
  CreditCard,
  Sparkles
} from 'lucide-react';
import { formatearSoles, enviarReserva } from '../utils/api';

export default function ModalReserva({ moto, alCerrar }) {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [dni, setDni] = useState('');
  const [direccion, setDireccion] = useState('Recojo en tienda Av. Coronel Mendoza 1420, Tacna');
  const [metodoPago, setMetodoPago] = useState('Yape / Plin');
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);

  if (!moto) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);

    const payload = {
      id_moto: moto.id,
      modelo_moto: moto.modelo,
      color_seleccionado: 'A coordinar',
      monto_separacion: 200.0,
      nombre_cliente: nombre,
      telefono_cliente: telefono,
      dni_cliente: dni,
      direccion_entrega: direccion,
      metodo_pago: metodoPago
    };

    const res = await enviarReserva(payload);
    setEnviando(false);
    setExito(true);

    if (res && res.enlace_whatsapp) {
      window.open(res.enlace_whatsapp, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
      
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity" 
        onClick={alCerrar} 
      />

      <div className="relative bg-[#101116] border border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden z-10 my-8 animate-fade-in-scale">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-[#14151c]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#fad911] text-black font-black flex items-center justify-center text-sm shadow-sm">
              S/
            </div>
            <div>
              <h3 className="font-black text-white text-base">Separación de Unidad</h3>
              <p className="text-xs text-zinc-400">Reserva oficial con Lupol Motos Tacna</p>
            </div>
          </div>

          <button 
            onClick={alCerrar}
            className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
            aria-label="Cerrar ventana de reserva"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          
          {/* Resumen Moto */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#fad911] tracking-wider">Unidad a reservar</span>
              <h4 className="font-black text-white text-base mt-0.5">{moto.modelo}</h4>
              <div className="text-xs text-zinc-400 mt-0.5">
                Precio de lista: <strong className="text-zinc-200">{formatearSoles(moto.precio)}</strong>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Monto de separación</span>
              <span className="text-xl font-black text-emerald-400">S/ 200.00</span>
              <span className="text-[10px] text-zinc-500 block">* Descontable del precio total</span>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label htmlFor="reserva-nombre" className="block font-bold text-zinc-300 mb-1.5">
                Nombres y Apellidos completos <span className="text-[#fad911]">*</span>
              </label>
              <input
                id="reserva-nombre"
                type="text"
                required
                placeholder="Ej. Carlos Mendoza Ramos"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus-ring text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="reserva-telefono" className="block font-bold text-zinc-300 mb-1.5">
                  Número de Celular / WhatsApp <span className="text-[#fad911]">*</span>
                </label>
                <input
                  id="reserva-telefono"
                  type="tel"
                  required
                  placeholder="Ej. 952 123 456"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus-ring text-xs"
                />
              </div>

              <div>
                <label htmlFor="reserva-dni" className="block font-bold text-zinc-300 mb-1.5">
                  Documento de Identidad (DNI / CE) <span className="text-[#fad911]">*</span>
                </label>
                <input
                  id="reserva-dni"
                  type="text"
                  required
                  maxLength={12}
                  placeholder="8 dígitos para DNI"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus-ring text-xs"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reserva-entrega" className="block font-bold text-zinc-300 mb-1.5">
                Modalidad o Punto de Entrega en Tacna:
              </label>
              <input
                id="reserva-entrega"
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus-ring text-xs"
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                Puedes recoger tu unidad en tienda o coordinar entrega en tu domicilio/taller en Tacna.
              </p>
            </div>

            <div>
              <label htmlFor="reserva-metodo" className="block font-bold text-zinc-300 mb-1.5">
                Medio preferido para el abono de los S/ 200:
              </label>
              <select
                id="reserva-metodo"
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus-ring text-xs"
              >
                <option value="Yape / Plin">Yape o Plin (Acreditación inmediata)</option>
                <option value="Transferencia BCP">Transferencia BCP</option>
                <option value="Transferencia BBVA">Transferencia BBVA / Interbank</option>
                <option value="Pago en Efectivo en Tienda">Pago en efectivo / Tarjeta en tienda física</option>
              </select>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={enviando}
              className="w-full py-4 rounded-xl bg-[#fad911] hover:bg-[#fce23e] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#fad911]/25 hover:scale-[1.01]"
            >
              {enviando ? (
                <span>Registrando solicitud de separación...</span>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  <span>Continuar separación en WhatsApp oficial</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-zinc-500 text-center leading-normal">
              Al hacer clic, se generará tu ficha de reserva y se abrirá WhatsApp con un asesor para validar tu comprobante y asignarte el número de chasis/motor.
            </p>
          </div>

          {exito && (
            <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-800 text-emerald-300 text-xs text-center flex items-center justify-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>¡Ficha de separación generada! Redirigiendo al asesor de Lupol Motos...</span>
            </div>
          )}

        </form>

      </div>
    </div>
  );
}
