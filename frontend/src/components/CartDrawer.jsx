import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  MessageSquare, 
  ShoppingBag, 
  Send, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { formatearSoles } from '../utils/api';

export default function CartDrawer({ 
  abierto, 
  alCerrar, 
  carrito = [], 
  actualizarCantidad, 
  vaciarCarrito 
}) {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [modeloMoto, setModeloMoto] = useState('');

  if (!abierto) return null;

  const totalEstimado = carrito.reduce((acc, item) => acc + ((item.precio || 45) * item.cantidad), 0);

  const handleEnviarCotizacionWA = (e) => {
    e.preventDefault();
    if (carrito.length === 0) return;

    let texto = `🚨 *SOLICITUD DE COTIZACIÓN DE REPUESTOS - LUPOL MOTOS* 🚨

`;
    texto += `*Cliente:* ${nombre || 'Cliente Lupol'}
`;
    texto += `*Teléfono:* ${telefono || 'No especificado'}
`;
    if (modeloMoto) texto += `*Para Moto:* ${modeloMoto}
`;
    texto += `*Ciudad:* Tacna

`;
    texto += `*LISTA DE REPUESTOS SOLICITADOS:*
`;

    carrito.forEach((item, index) => {
      texto += `${index + 1}. *${item.nombre}* (Cód: ${item.codigo || 'N/A'}) x ${item.cantidad} und - Aprox: S/. ${(item.precio * item.cantidad).toFixed(2)}
`;
    });

    texto += `
*Total Estimado:* S/. ${totalEstimado.toFixed(2)}
`;
    texto += `
¿Tienen estos repuestos listos para recoger en su local de Av. Coronel Mendoza o entrega en Tacna?`;

    const urlWA = `https://wa.me/51924141939?text=${encodeURIComponent(texto)}`;
    window.open(urlWA, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={alCerrar}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#101116] border-l border-zinc-800 shadow-2xl flex flex-col justify-between animate-slide-in-right">
          
          {/* Header */}
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-[#14151c]">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#fad911] text-black font-black flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-black text-white text-base">Cotización de Repuestos</h2>
                <p className="text-[10px] text-zinc-400 font-medium">Lupol Motos Tacna</p>
              </div>
            </div>

            <button
              onClick={alCerrar}
              className="p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lista de Items */}
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {carrito.length > 0 ? (
              <>
                <div className="flex justify-between items-center pb-2 border-b border-zinc-800 text-xs text-zinc-400 font-bold">
                  <span>Productos ({carrito.length})</span>
                  <button
                    onClick={vaciarCarrito}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    Vaciar Lista
                  </button>
                </div>

                <div className="space-y-3">
                  {carrito.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-xs truncate">{item.nombre}</h4>
                        <div className="text-[10px] text-zinc-400 mt-0.5">
                          Cód: {item.codigo || 'N/A'} • {formatearSoles(item.precio)} c/u
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg">
                          <button
                            onClick={() => actualizarCantidad(item.id, -1)}
                            className="px-2 py-1 text-xs text-zinc-400 hover:text-white font-bold"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-bold text-white">{item.cantidad}</span>
                          <button
                            onClick={() => actualizarCantidad(item.id, 1)}
                            className="px-2 py-1 text-xs text-zinc-400 hover:text-white font-bold"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => actualizarCantidad(item.id, -item.cantidad)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                          title="Eliminar repuesto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-16 text-center text-zinc-500 space-y-4">
                <ShoppingBag className="w-12 h-12 mx-auto text-zinc-700" />
                <div>
                  <p className="text-sm font-bold text-zinc-300">Tu lista de cotización está vacía</p>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                    Explora repuestos legítimos para Bajaj Pulsar, Boxer, Dominar o Torito y agrégalos a tu lista.
                  </p>
                </div>
                <button
                  onClick={alCerrar}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors"
                >
                  Explorar Repuestos
                </button>
              </div>
            )}
          </div>

          {/* Formulario y Footer */}
          {carrito.length > 0 && (
            <div className="p-6 border-t border-zinc-800 bg-[#121318] space-y-4">
              <div className="flex justify-between items-center text-sm font-black">
                <span className="text-zinc-300">Total Estimado Referencial:</span>
                <span className="text-xl text-[#fad911]">{formatearSoles(totalEstimado)}</span>
              </div>

              <form onSubmit={handleEnviarCotizacionWA} className="space-y-3">
                <div>
                  <label htmlFor="cart-nombre" className="block text-[11px] font-bold text-zinc-400 mb-1">
                    Tu Nombre Completo <span className="text-[#fad911]">*</span>
                  </label>
                  <input
                    id="cart-nombre"
                    type="text"
                    placeholder="Ej. Juan Pérez Ramos"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus-ring"
                  />
                </div>

                <div>
                  <label htmlFor="cart-telefono" className="block text-[11px] font-bold text-zinc-400 mb-1">
                    Celular o WhatsApp <span className="text-[#fad911]">*</span>
                  </label>
                  <input
                    id="cart-telefono"
                    type="tel"
                    placeholder="Ej. 952 123 456"
                    required
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus-ring"
                  />
                </div>

                <div>
                  <label htmlFor="cart-modelo" className="block text-[11px] font-bold text-zinc-400 mb-1">
                    Modelo de tu Moto o Torito:
                  </label>
                  <input
                    id="cart-modelo"
                    type="text"
                    placeholder="Ej. Pulsar NS200 FI / Torito Vilchez"
                    value={modeloMoto}
                    onChange={(e) => setModeloMoto(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus-ring"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md mt-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Enviar lista a WhatsApp para cotizar stock</span>
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
