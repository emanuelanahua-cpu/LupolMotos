export type Rol = 'superadmin' | 'admin' | 'empleado';
export interface Usuario { id: string; usuario: string; rol: Rol; creado: string }
export interface Cliente { nombre_cliente: string; telefono_cliente: string; dni_cliente?: string }
export interface Cotizacion extends Cliente {
  id_moto: number; modelo_moto: string; modalidad: 'CONTADO' | 'CREDITO'; precio_moto: number;
  color_seleccionado?: string; cuota_inicial?: number; numero_cuotas?: number;
  cuota_mensual_estimada?: number; email_cliente?: string; ciudad?: string; comentarios?: string;
}
export interface Reserva extends Cliente {
  id_moto: number; modelo_moto: string; dni_cliente: string; color_seleccionado?: string;
  monto_separacion?: number; direccion_entrega?: string; metodo_pago?: string;
}
export interface Contacto { nombre: string; telefono: string; email?: string; asunto: string; mensaje: string }
export interface RespuestaSolicitud { exito: boolean; mensaje: string; enlace_whatsapp?: string; id?: number; id_cotizacion?: number; id_reserva?: number }
export interface SolicitudRecibida { id: number; tipo: 'cotizacion' | 'reserva' | 'contacto'; datos: Record<string, string | number | null>; creado: string }
export interface Moto {
  id: number; modelo: string; marca: string; motor: string; tipo: string; categoria: string;
  precio: number; estado: string; destacado: boolean; detalle?: string | null;
  potencia?: string | null; imagen_principal: string; imagenes: string[];
}
export interface Repuesto { id: number; nombre: string; codigo: string; aplicacion_modelos?: string; categoria: string; tipo_moto: string; stock: number }
export interface FiltrosCatalogo {
  busqueda?: string; tipo?: string; categoria?: string; precio_min?: number;
  precio_max?: number; frenos?: string; destacados_solo?: boolean; ordenar_por?: string;
}
export interface FiltrosRepuestos { busqueda?: string; categoria?: string; tipo_moto?: string; solo_con_stock?: boolean }
