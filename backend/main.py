import os
import json
from typing import List, Optional
from fastapi import FastAPI, Query, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

# Inicialización de la aplicación FastAPI
app = FastAPI(
    title="API Lupol Motos - Tacna",
    description="Backend oficial para el catálogo, cotizaciones, créditos y repuestos de Lupol Motos (Concesionario Bajaj Tacna)",
    version="1.0.0"
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cargar base de datos JSON
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "data", "lupol_data.json")

def cargar_datos():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"tienda": {}, "motos": [], "repuestos": [], "motos_segunda": [], "colores_catalogo": []}

DATOS = cargar_datos()

# Montar archivos estáticos para multimedia y repuestos
ROOT_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))
MULTIMEDIA_DIR = os.path.join(ROOT_DIR, "public_html", "multimedia")
REPUESTOS_DIR = os.path.join(ROOT_DIR, "public_html", "repuestos")
FRONTEND_DIST = os.path.join(ROOT_DIR, "frontend", "dist")

if os.path.exists(MULTIMEDIA_DIR):
    app.mount("/multimedia", StaticFiles(directory=MULTIMEDIA_DIR), name="multimedia")
if os.path.exists(REPUESTOS_DIR):
    app.mount("/repuestos", StaticFiles(directory=REPUESTOS_DIR), name="repuestos")

# Modelos Pydantic en Español
class SolicitudCotizacion(BaseModel):
    id_moto: int
    modelo_moto: str
    modalidad: str = Field(..., description="CONTADO o CREDITO")
    color_seleccionado: Optional[str] = None
    precio_moto: float
    cuota_inicial: Optional[float] = 0.0
    numero_cuotas: Optional[int] = 12
    cuota_mensual_estimada: Optional[float] = 0.0
    nombre_cliente: str
    telefono_cliente: str
    dni_cliente: Optional[str] = None
    email_cliente: Optional[str] = None
    ciudad: Optional[str] = "Tacna"
    comentarios: Optional[str] = None

class SolicitudReserva(BaseModel):
    id_moto: int
    modelo_moto: str
    color_seleccionado: Optional[str] = None
    monto_separacion: float = 200.0
    nombre_cliente: str
    telefono_cliente: str
    dni_cliente: str
    direccion_entrega: Optional[str] = "Tacna"
    metodo_pago: Optional[str] = "Yape/Plin/Transferencia"

class MensajeContacto(BaseModel):
    nombre: str
    telefono: str
    email: Optional[str] = None
    asunto: str
    mensaje: str

COTIZACIONES_RECIBIDAS = []
RESERVAS_RECIBIDAS = []
MENSAJES_CONTACTO = []

# ============================================================================
# ENDPOINTS API EN ESPAÑOL
# ============================================================================

@app.get("/api/saludo", summary="Estado del servicio")
def obtener_estado_api():
    """Retorna estado del servidor e información básica de Lupol Motos."""
    return {
        "estado": "en_linea",
        "mensaje": "Servidor backend de Lupol Motos funcionando correctamente",
        "tienda": DATOS.get("tienda", {}).get("nombre", "Lupol Motos"),
        "version": "1.0.0"
    }

@app.get("/api/tienda", summary="Información general de la tienda")
def obtener_informacion_tienda():
    """Obtiene la información comercial, teléfonos, dirección en Tacna, beneficios y horarios."""
    return DATOS.get("tienda", {})

@app.get("/api/motos", summary="Listado de motocicletas con filtros")
def listar_motocicletas(
    busqueda: Optional[str] = Query(None, description="Buscar por modelo o cilindrada"),
    tipo: Optional[str] = Query(None, description="Tipo de moto: Naked, Utilitario, Torito, etc."),
    categoria: Optional[str] = Query(None, description="Categoría comercial"),
    precio_min: Optional[float] = Query(None, description="Precio mínimo en Soles"),
    precio_max: Optional[float] = Query(None, description="Precio máximo en Soles"),
    frenos: Optional[str] = Query(None, description="Tipo de frenos"),
    destacados_solo: Optional[bool] = Query(False, description="Filtrar solo modelos destacados"),
    ordenar_por: Optional[str] = Query("popularidad", description="popularidad, precio_asc, precio_desc, nombre")
):
    """Retorna el catálogo filtrable de motocicletas Lupol Motos."""
    motos = DATOS.get("motos", [])
    resultado = []

    for m in motos:
        if m.get("estado") != "activado":
            continue
        
        if busqueda:
            termino = busqueda.lower()
            en_modelo = termino in m.get("modelo", "").lower()
            en_motor = termino in m.get("motor", "").lower()
            en_detalle = termino in (m.get("detalle") or "").lower()
            if not (en_modelo or en_motor or en_detalle):
                continue

        if tipo and tipo != "Todos":
            if m.get("tipo", "").lower() != tipo.lower():
                continue

        if categoria and categoria != "Todas":
            if m.get("categoria", "").lower() != categoria.lower():
                continue

        if precio_min is not None and m.get("precio", 0) < precio_min:
            continue
        if precio_max is not None and m.get("precio", 0) > precio_max:
            continue

        if frenos and frenos != "Todos":
            if frenos.lower() not in (m.get("frenos") or "").lower():
                continue

        if destacados_solo and not m.get("destacado", False):
            continue

        resultado.append(m)

    if ordenar_por == "precio_asc":
        resultado.sort(key=lambda x: x.get("precio", 0))
    elif ordenar_por == "precio_desc":
        resultado.sort(key=lambda x: x.get("precio", 0), reverse=True)
    elif ordenar_por == "nombre":
        resultado.sort(key=lambda x: x.get("modelo", ""))
    else:
        resultado.sort(key=lambda x: x.get("visitas", 0), reverse=True)

    return {
        "total": len(resultado),
        "motos": resultado
    }

@app.get("/api/motos/{id_moto}", summary="Detalle de motocicleta por ID")
def obtener_detalle_motocicleta(id_moto: int):
    """Retorna ficha técnica completa, vistas de fotos, colores disponibles y motos recomendadas."""
    motos = DATOS.get("motos", [])
    moto = next((m for m in motos if m["id"] == id_moto), None)
    if not moto:
        raise HTTPException(status_code=404, detail="Motocicleta no encontrada")

    relacionadas = [
        {
            "id": m["id"],
            "modelo": m["modelo"],
            "tipo": m["tipo"],
            "precio": m["precio"],
            "motor": m["motor"],
            "imagen_principal": m["imagen_principal"]
        }
        for m in motos
        if m["id"] != id_moto and m.get("estado") == "activado" and (m.get("tipo") == moto.get("tipo") or m.get("destacado"))
    ][:4]

    return {
        "moto": moto,
        "relacionadas": relacionadas
    }

@app.get("/api/toritos", summary="Catálogo de Toritos y Mototaxis")
def listar_toritos_mototaxis():
    """Filtra y devuelve exclusivamente los Toritos / Mototaxis Bajaj para transporte de pasajeros y carga."""
    motos = DATOS.get("motos", [])
    toritos = [m for m in motos if m.get("tipo") == "Torito" or "Torito" in m.get("categoria", "")]
    return {
        "total": len(toritos),
        "toritos": toritos
    }

@app.get("/api/repuestos", summary="Catálogo de repuestos originales")
def listar_repuestos_originales(
    busqueda: Optional[str] = Query(None, description="Buscar por nombre o código SKU"),
    categoria: Optional[str] = Query(None, description="Filtro de categoría de repuesto"),
    tipo_moto: Optional[str] = Query(None, description="2 Ruedas, Torito, Carguero o General"),
    solo_con_stock: Optional[bool] = Query(False, description="Filtrar solo con existencias")
):
    """Devuelve el inventario de repuestos y accesorios originales Bajaj."""
    repuestos = DATOS.get("repuestos", [])
    resultado = []

    for r in repuestos:
        if busqueda:
            termino = busqueda.lower()
            en_nombre = termino in r.get("nombre", "").lower()
            en_codigo = termino in r.get("codigo", "").lower()
            en_aplicacion = termino in (r.get("aplicacion_modelos") or "").lower()
            if not (en_nombre or en_codigo or en_aplicacion):
                continue

        if categoria and categoria != "Todas":
            if r.get("categoria", "").lower() != categoria.lower():
                continue

        if tipo_moto and tipo_moto != "Todos":
            if r.get("tipo_moto", "").lower() != tipo_moto.lower():
                continue

        if solo_con_stock and r.get("stock", 0) <= 0:
            continue

        resultado.append(r)

    return {
        "total": len(resultado),
        "repuestos": resultado
    }

@app.get("/api/seminuevas", summary="Motos seminuevas y segunda mano")
def listar_motos_seminuevas():
    """Lista motocicletas de segunda mano inspeccionadas y verificadas."""
    seminuevas = DATOS.get("motos_segunda", [])
    return {
        "total": len(seminuevas),
        "seminuevas": seminuevas
    }

@app.get("/api/filtros", summary="Opciones disponibles para filtros dinámicos")
def obtener_opciones_filtros():
    """Devuelve categorías, tipos de freno, enfriamiento y rangos de precio para la interfaz."""
    motos = DATOS.get("motos", [])
    repuestos = DATOS.get("repuestos", [])

    tipos_moto = sorted(list(set(m.get("tipo") for m in motos if m.get("tipo"))))
    categorias_moto = sorted(list(set(m.get("categoria") for m in motos if m.get("categoria"))))
    frenos = sorted(list(set(m.get("frenos") for m in motos if m.get("frenos"))))
    enfriamientos = sorted(list(set(m.get("enfriamiento") for m in motos if m.get("enfriamiento"))))
    
    categorias_repuestos = sorted(list(set(r.get("categoria") for r in repuestos if r.get("categoria"))))
    tipos_repuesto_moto = sorted(list(set(r.get("tipo_moto") for r in repuestos if r.get("tipo_moto"))))

    precios = [m.get("precio", 0) for m in motos if m.get("precio")]
    precio_min = min(precios) if precios else 5000
    precio_max = max(precios) if precios else 25000

    return {
        "tipos_moto": tipos_moto,
        "categorias_moto": categorias_moto,
        "frenos": frenos,
        "enfriamientos": enfriamientos,
        "categorias_repuestos": categorias_repuestos,
        "tipos_repuesto_moto": tipos_repuesto_moto,
        "rango_precios": {
            "min": precio_min,
            "max": precio_max
        }
    }

@app.post("/api/cotizaciones", summary="Registrar solicitud de cotización")
def procesar_solicitud_cotizacion(solicitud: SolicitudCotizacion):
    """Guarda la cotización de moto y genera enlace directo de WhatsApp personalizado."""
    nuevo_id = len(COTIZACIONES_RECIBIDAS) + 1
    registro = {
        "id_cotizacion": nuevo_id,
        "datos": solicitud.model_dump()
    }
    COTIZACIONES_RECIBIDAS.append(registro)

    if solicitud.modalidad == "CREDITO":
        mensaje_wa = (
            f"Hola Lupol Motos, quiero cotizar a CRÉDITO la *{solicitud.modelo_moto}* "
            f"(Color: {solicitud.color_seleccionado or 'Estándar'}). "
            f"Cuota inicial propuesta: S/. {solicitud.cuota_inicial:,.2f} a {solicitud.numero_cuotas} meses "
            f"(aprox S/. {solicitud.cuota_mensual_estimada:,.2f}/mes). "
            f"Mi nombre es {solicitud.nombre_cliente}, DNI: {solicitud.dni_cliente or 'No especificado'}."
        )
    else:
        mensaje_wa = (
            f"Hola Lupol Motos, quiero cotizar al CONTADO la *{solicitud.modelo_moto}* "
            f"(Precio catálogo: S/. {solicitud.precio_moto:,.2f}, Color: {solicitud.color_seleccionado or 'Estándar'}). "
            f"Mi nombre es {solicitud.nombre_cliente} (Cel: {solicitud.telefono_cliente}). ¿Tienen disponibilidad inmediata?"
        )

    import urllib.parse
    wa_url = f"https://wa.me/{DATOS.get('tienda', {}).get('whatsapp', '51924141939')}?text={urllib.parse.quote(mensaje_wa)}"

    return {
        "exito": True,
        "mensaje": "Cotización generada correctamente",
        "id_cotizacion": nuevo_id,
        "enlace_whatsapp": wa_url
    }

@app.post("/api/reservas", summary="Registrar reserva de motocicleta")
def procesar_reserva_motocicleta(reserva: SolicitudReserva):
    """Registra una reserva inicial de vehículo con entrega garantizada en tienda o domicilio en Tacna."""
    nuevo_id = len(RESERVAS_RECIBIDAS) + 1
    registro = {
        "id_reserva": nuevo_id,
        "datos": reserva.model_dump()
    }
    RESERVAS_RECIBIDAS.append(registro)

    mensaje_wa = (
        f"🚨 *NUEVA RESERVA LUPOL MOTOS* 🚨\n"
        f"Modelo: *{reserva.modelo_moto}*\n"
        f"Color: {reserva.color_seleccionado or 'A coordinar'}\n"
        f"Cliente: {reserva.nombre_cliente} (DNI: {reserva.dni_cliente})\n"
        f"Teléfono: {reserva.telefono_cliente}\n"
        f"Monto de separación: S/. {reserva.monto_separacion:,.2f}\n"
        f"Lugar de entrega: {reserva.direccion_entrega}"
    )

    import urllib.parse
    wa_url = f"https://wa.me/{DATOS.get('tienda', {}).get('whatsapp', '51924141939')}?text={urllib.parse.quote(mensaje_wa)}"

    return {
        "exito": True,
        "mensaje": "Reserva registrada con éxito. Un asesor de Lupol Motos confirmará la unidad.",
        "id_reserva": nuevo_id,
        "enlace_whatsapp": wa_url
    }

@app.post("/api/contacto", summary="Enviar mensaje de contacto")
def procesar_mensaje_contacto(contacto: MensajeContacto):
    """Guarda consulta general y genera mensaje de atención rápida."""
    nuevo_id = len(MENSAJES_CONTACTO) + 1
    MENSAJES_CONTACTO.append({
        "id": nuevo_id,
        "datos": contacto.model_dump()
    })
    return {
        "exito": True,
        "mensaje": "Mensaje recibido. El equipo de Lupol Motos se comunicará a la brevedad."
    }

# Servir Frontend React compilado si existe
if os.path.exists(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_react_app(full_path: str):
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))

