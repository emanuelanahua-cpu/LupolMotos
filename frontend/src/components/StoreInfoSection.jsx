import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Mail, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  ExternalLink,
  Navigation
} from 'lucide-react';
import { enviarMensajeContacto } from '../utils/api';

export default function StoreInfoSection() {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [asunto, setAsunto] = useState('Consulta General');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    await enviarMensajeContacto({ nombre, telefono, asunto, mensaje });
    setEnviando(false);
    setExito(true);
    setTimeout(() => {
      setNombre('');
      setTelefono('');
      setMensaje('');
      setExito(false);
    }, 4000);
  };

  return (
    <section id="contacto" className="py-16 sm:py-24 bg-[#0d0e12] border-b border-zinc-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#181a22] border border-[#fad911]/30 text-[#fad911] text-xs font-bold uppercase tracking-wider mb-3">
            <MapPin className="w-3.5 h-3.5" />
            <span>Tienda Física y Taller en Tacna</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            VISÍTANOS EN <span className="text-[#fad911]">NUESTRO SHOWROOM</span>
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base mt-2">
            Ven a conocer todos los modelos en persona, probar tu moto favorita y recibir asesoría personalizada.
          </p>
        </div>

        {/* Grid: Información + Mapa + Formulario */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Lado Izquierdo: Información y Mapa */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Tarjetas de Información */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="p-5 rounded-2xl bg-[#121318] border border-zinc-800 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#fad911]">
                  <MapPin className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white text-sm">Dirección Principal</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Av. Coronel Mendoza N° 1420 (frente al óvalo), Tacna, Perú
                </p>
                <a
                  href="https://maps.google.com/?q=-18.0341794,-70.252298"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-xs text-[#fad911] font-bold hover:underline pt-1"
                >
                  <span>Cómo llegar en Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-5 rounded-2xl bg-[#121318] border border-zinc-800 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#fad911]">
                  <Clock className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white text-sm">Horario de Atención</h4>
                <p className="text-xs text-zinc-400">
                  <strong className="text-zinc-200 block">Lunes a Sábado:</strong> 8:30 AM - 7:30 PM
                </p>
                <p className="text-xs text-zinc-400">
                  <strong className="text-zinc-200 block">Domingos:</strong> 9:00 AM - 1:00 PM
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#121318] border border-zinc-800 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#fad911]">
                  <Phone className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white text-sm">Teléfonos de Contacto</h4>
                <p className="text-xs text-zinc-400">
                  Ventas / WhatsApp: <strong className="text-white">+51 924 141 939</strong>
                </p>
                <p className="text-xs text-zinc-400">
                  Fijo Tienda: <strong className="text-white">(052) 425160</strong>
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#121318] border border-zinc-800 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#fad911]">
                  <Mail className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white text-sm">Correo y Redes</h4>
                <p className="text-xs text-zinc-400">
                  ventas@lupolmotos.pe
                </p>
                <p className="text-xs text-zinc-400">
                  Facebook & Instagram: <strong className="text-zinc-200">@lupolmotos</strong>
                </p>
              </div>

            </div>

            {/* Mapa Interactivo Embed */}
            <div className="rounded-2xl overflow-hidden border border-zinc-800 h-64 sm:h-72 w-full relative shadow-xl">
              <iframe
                title="Ubicación Lupol Motos Tacna"
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d204.69512858615718!2d-70.25229800378915!3d-18.03417941370267!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1ses-419!2spe!4v1778167888645!5m2!1ses-419!2spe"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

          </div>

          {/* Lado Derecho: Formulario de Contacto Directo */}
          <div className="lg:col-span-5 bg-[#121318] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center space-x-2 text-[#fad911] text-xs font-bold uppercase tracking-wider mb-2">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Atención al Cliente</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                ¿TIENES ALGUNA DUDA?
              </h3>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                Escríbenos y un asesor especialista se comunicará contigo en minutos.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="contacto-nombre" className="block text-xs font-bold text-zinc-300 mb-1">
                    Nombres y Apellidos completos <span className="text-[#fad911]">*</span>
                  </label>
                  <input
                    id="contacto-nombre"
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez Ramos"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus-ring"
                  />
                </div>

                <div>
                  <label htmlFor="contacto-telefono" className="block text-xs font-bold text-zinc-300 mb-1">
                    Celular o WhatsApp de contacto <span className="text-[#fad911]">*</span>
                  </label>
                  <input
                    id="contacto-telefono"
                    type="tel"
                    required
                    placeholder="Ej. 952 123 456"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus-ring"
                  />
                </div>

                <div>
                  <label htmlFor="contacto-asunto" className="block text-xs font-bold text-zinc-300 mb-1">
                    Tipo de Consulta o Trámite:
                  </label>
                  <select
                    id="contacto-asunto"
                    value={asunto}
                    onChange={(e) => setAsunto(e.target.value)}
                    aria-label="Seleccionar tipo de consulta"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus-ring"
                  >
                    <option value="Cotización de Moto">Cotización de Motocicleta Nueva</option>
                    <option value="Torito o Vehículo de Carga">Torito o Mototaxi de Carga/Pasajeros</option>
                    <option value="Consulta de Repuestos">Consulta de Repuestos Originales</option>
                    <option value="Trámite Tarjeta TIVe">Gestión / Duplicado TIVe SUNARP</option>
                    <option value="Taller y Mantenimiento">Servicio de Taller Mecánico y Garantía</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="contacto-mensaje" className="block text-xs font-bold text-zinc-300 mb-1">
                    Detalle de tu mensaje <span className="text-[#fad911]">*</span>
                  </label>
                  <textarea
                    id="contacto-mensaje"
                    rows={4}
                    required
                    placeholder="Escribe aquí tu consulta o el modelo específico por el que deseas información..."
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus-ring resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full py-3.5 rounded-xl bg-[#fad911] hover:bg-[#fce23e] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md mt-2"
                >
                  {enviando ? (
                    <span>Enviando tu consulta...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Enviar consulta a nuestros asesores</span>
                    </>
                  )}
                </button>

                {exito && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-800 text-emerald-300 text-xs text-center flex items-center justify-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>¡Consulta enviada! Un asesor de Lupol Motos Tacna te responderá a la brevedad.</span>
                  </div>
                )}
              </form>
            </div>

            <div className="pt-6 border-t border-zinc-800/80 mt-6 flex items-center justify-between text-xs text-zinc-500">
              <span>Atención presencial y virtual</span>
              <span className="text-[#fad911] font-bold">Tacna - Perú</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
