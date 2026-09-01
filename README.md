
---

## Arquitectura del Sistema

```
web-lupolmotos/
├── backend/                  # Servidor Backend en Python con FastAPI
│   ├── data/
│   │   └── lupol_data.json   # Base de datos estructurada en JSON
│   ├── venv/                 # Entorno virtual de Python
│   └── main.py               # Aplicación FastAPI con endpoints en Español
├── frontend/                 # Aplicación Frontend en React + Tailwind CSS
│   ├── public/               # Logos SVG, favicon y enlaces de multimedia
│   ├── src/
│   │   ├── components/       # Componentes modulares de interfaz
│   │   │   ├── Navbar.jsx            # Barra de navegación con accesos rápidos
│   │   │   ├── HeroSection.jsx       # Portada de alto impacto con selector por categoría
│   │   │   ├── Visualizer3D.jsx      # Estudio 360° interactivo y cambio de color
│   │   │   ├── MotosCatalog.jsx      # Catálogo de motos con filtros y ordenamiento
│   │   │   ├── MotoDetailModal.jsx   # Ficha técnica + simulador de crédito integrado
│   │   │   ├── ToritosSection.jsx    # Sección para Toritos y Vehículos de Carga
│   │   │   ├── RepuestosCatalog.jsx  # Catálogo de repuestos con SKU y stock
│   │   │   ├── CartDrawer.jsx        # Carrito para cotizar lista de repuestos por WhatsApp
│   │   │   ├── SeminuevasSection.jsx # Motos de segunda mano certificadas
│   │   │   ├── CotizadorSimulador.jsx# Simulador completo Contado vs Crédito
│   │   │   ├── TIVeSection.jsx       # Gestión de Tarjeta Vehicular SUNARP (TIVe)
│   │   │   ├── BenefitsSection.jsx   # Beneficios (Garantía, Mano de Obra, Casco)
│   │   │   ├── StoreInfoSection.jsx  # Showroom en Tacna, Mapa Google y Contacto
│   │   │   ├── ModalReserva.jsx      # Separación en línea con S/. 200
│   │   │   └── Footer.jsx            # Pie de página oficial con datos legales
│   │   ├── utils/
│   │   │   └── api.js        # Cliente API en Español con fallback local transparente
│   │   ├── App.jsx           # Orquestador de la aplicación SPA
│   │   ├── index.css         # Configuración Tailwind CSS y temas
│   │   └── main.jsx          # Punto de entrada React 19
│   ├── dist/                 # Build de producción optimizado
│   └── vite.config.js        # Configuración de Vite con proxy /api
├── public_html/              # Archivos multimedia originales (imágenes, webp, pdf)
├── iniciar_demo.sh           # Script de arranque rápido
└── README.md
```

---


## Endpoints del Backend (FastAPI)

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/saludo` | Estado del servicio y versión del backend |
| `GET` | `/api/tienda` | Información comercial de Lupol Motos, teléfonos, dirección y beneficios |
| `GET` | `/api/motos` | Catálogo filtrable por búsqueda, categoría, precio, frenos y orden |
| `GET` | `/api/motos/{id}` | Detalle completo de una moto, vistas 360°, colores y modelos relacionados |
| `GET` | `/api/toritos` | Catálogo exclusivo de Toritos y Mototaxis de pasajeros y carga |
| `GET` | `/api/repuestos` | Catálogo de repuestos originales Bajaj con filtros de SKU y stock |
| `GET` | `/api/seminuevas` | Catálogo de motos de segunda mano verificadas |
| `GET` | `/api/filtros` | Opciones disponibles para selectores y filtros dinámicos |
| `POST`| `/api/cotizaciones` | Procesa cotización (Contado/Crédito) y genera enlace de WhatsApp |
| `POST`| `/api/reservas` | Registra separación de vehículo (S/. 200) y coordina entrega |
| `POST`| `/api/contacto` | Recepción de consultas generales desde el showroom web |

---

## Cómo Ejecutar la Demo

### Opción 1: Ejecución Todo en Uno (FastAPI sirviendo la SPA de React)
El backend de FastAPI está configurado para servir tanto la API como la versión construida de React en un solo puerto:

```bash
cd /home/"usuario"/dev/web-lupolmotos
./iniciar_demo.sh
```
O manualmente:
```bash
./backend/venv/bin/uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
Abre tu navegador en: **`http://localhost:8000`**

---

### Opción 2: Modo Desarrollo con Hot-Reload (Vite + FastAPI)

1. **Iniciar Backend:**
   ```bash
   cd /home/yan/dev/web-lupolmotos
   ./backend/venv/bin/uvicorn backend.main:app --port 8000 --reload
   ```

2. **Iniciar Frontend (en otra terminal):**
   ```bash
   cd /home/yan/dev/web-lupolmotos/frontend
   npm run dev
   ```
   Abre tu navegador en: **`http://localhost:3000`** (las peticiones a `/api` se redirigen automáticamente al backend).

---
