# 🏍️ Lupol Motos — Concesionario Oficial Bajaj Tacna
### Web Moderna, Catálogo Interactivo, Cotizador en Tiempo Real y Arquitectura Fullstack (React + Tailwind CSS + Python FastAPI)

---

## 📌 Resumen del Proyecto

Migración y modernización total de la plataforma web de la tienda (**anteriormente TodoMotos**) hacia la nueva identidad de marca de **Lupol Motos** en Tacna, Perú. 

Diseñado bajo los estándares de máxima calidad visual, rendimiento y experiencia de usuario (UX/UI), adoptando el color oficial de marca **`#fad911` (Amarillo Lupol)** junto a una estética automotriz oscura de alta precisión (*Obsidian / Carbon Slate*).

---

## 🏗️ Arquitectura del Sistema

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

## 🎨 Identidad Visual y Paleta de Colores

- **Color Primario / Énfasis:** `#fad911` (Amarillo Lupol Motos)
- **Fondos:** `#0a0a0c` (Obsidian Base), `#121318` (Surface Card), `#181a22` (Elevated Panel)
- **Bordes y Detalles:** `#222530` / `#383c4e`
- **Textos:** `#f4f4f6` (Títulos/Primario), `#9ca3af` (Secundario/Técnico)
- **Tipografías:** `Outfit`, `Plus Jakarta Sans` y `Space Grotesk`

---

## ⚙️ Endpoints del Backend (FastAPI en Español)

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

## 🚀 Cómo Ejecutar la Demo

### Opción 1: Ejecución Todo en Uno (FastAPI sirviendo la SPA de React)
El backend de FastAPI está configurado para servir tanto la API como la versión construida de React en un solo puerto:

```bash
cd /home/yan/dev/web-lupolmotos
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

## ✨ Funcionalidades Destacadas de la Demo

1. **Estudio Interactivo Lupol 360°:** Permite cambiar el ángulo de visualización y alternar en tiempo real entre los colores oficiales de fábrica con stock inmediato.
2. **Simulador de Financiamiento:** Cálculo dinámico de cuota inicial (%) y mensualidad a 12, 18, 24 o 36 meses.
3. **Catálogo de Repuestos con Cotizador Rápido:** Carrito que genera una lista formateada lista para enviar al WhatsApp oficial.
4. **Gestión de Tarjeta TIVe:** Sección especializada para duplicados y asesoría en trámites vehiculares SUNARP.
5. **Separación de Unidades en Línea:** Formulario para reservar una moto con S/. 200 y entrega en Tacna.
