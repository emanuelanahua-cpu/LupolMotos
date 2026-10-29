# Lupol Motos

React/Vite + Node.js/Express + MySQL, en una sola aplicación para Hostinger.
La organización sigue el patrón de SIASE: rutas → controladores → servicios → repositorios.
El backend activo está en `backend/src`; Python se conserva en `backend/legacy/python` como referencia.
`backend/node/server.js` es una entrada de compatibilidad para la configuración existente de Hostinger.

## Inicio local

Requiere Node.js 22 o posterior y MySQL 8 o MariaDB 10.6 o posterior.

1. Crear una base de datos vacía y un usuario con permisos sobre esa base.
2. Copiar `.env.example` a `.env` y configurar `DB_*`, `LUPOL_SECRET` y la cuenta inicial.
3. Ejecutar `npm ci`, `npm run build` y `npm start` (la compilación instala ambos proyectos).
4. Abrir `http://localhost:8000` y `/admin` para el panel.

Para desarrollar con recarga: `./iniciar.sh` o `iniciar.bat`.

## Datos y migración

El primer arranque crea las tablas `configuracion`, `motos`, `repuestos`, `usuarios`,
`solicitudes` e `imagenes`. Importa `backend/data/lupol_data.json` una sola vez,
dentro de una transacción protegida contra inicializaciones simultáneas.
No vuelve a importar ni sobrescribe los cambios al reiniciar/desplegar.

Las cuentas de `backend/data/usuarios.json` se importan si la tabla está vacía;
conservan su contraseña y rol. Para producción, transmitir ese archivo como base64
en `LUPOL_INITIAL_USERS` (variable privada de servidor); no subirlo a GitHub.
Alternativamente usar `LUPOL_SUPER_USER` y `LUPOL_SUPER_PASS` para crear la primera cuenta.
La configuración inicial está deshabilitada en la API pública.

Las fotos nuevas del panel se almacenan en MySQL y se sirven en `/uploads/`:
no dependen del disco temporal del despliegue. Las fotos originales siguen en
`frontend/public/multimedia`. Las imágenes retiradas se conservan en la base para
no romper referencias compartidas; incluirlas en los respaldos y vigilar el tamaño de la base.

Cotizaciones, reservas y contactos se guardan antes de devolver éxito.
Las reservas son solicitudes pendientes de confirmar disponibilidad y pago;
no representan un pago ni descuentan inventario automáticamente.
Los administradores ven el historial en la pestaña **Solicitudes** del panel.

## Hostinger

Aplicación **Express**, Node.js **22**, directorio raíz del repositorio **`.`**,
comando de build **`npm run build`**, inicio **`npm start`**, entrada **`backend/node/server.js`**.
El frontend compilado se encuentra en `frontend/dist`; Express sirve sus archivos,
las rutas SPA (`/admin`, `/login`) y `/api` desde el mismo dominio.

Variables privadas del servidor:

- `NODE_ENV=production`, `HOST=0.0.0.0`, `LUPOL_HTTPS=true`.
- `DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.
- `LUPOL_SECRET` estable y aleatorio, de al menos 32 caracteres.
- `ALLOWED_ORIGINS=https://lupolmotos.com,https://www.lupolmotos.com`.
- `WHATSAPP_NUMERO=51980687475`.
- Cuenta inicial según la sección de migración.

El puerto debe ser el asignado por Hostinger mediante `PORT`.
No usar el host externo `srvNNNN.hstgr.io` desde la aplicación.
Nunca colocar contraseñas en variables `VITE_*`, archivos versionados ni código frontend.
Activar respaldos periódicos de MySQL desde hPanel y probar su restauración.

## Comprobaciones

`GET /api/saludo` debe devolver `base_de_datos: "conectada"`.
Una ruta API inexistente devuelve JSON 404, nunca la página HTML.

Las pruebas de integración requieren una base **de prueba vacía**:

```bash
TEST_DB_HOST=127.0.0.1 TEST_DB_PORT=33316 TEST_DB_NAME=lupol_test \
TEST_DB_USER=root TEST_DB_PASSWORD=local-test-only npm test
```

Las pruebas crean registros y limpian tablas exclusivamente en una base cuyo nombre termina en `_test`.

## Arquitectura basada en SIASE

Referencia: https://github.com/SENATITACNA/SIASE

```text
backend/
  package.json              # instalación y scripts propios
  src/
    app.js                  # composición de Express
    server.js               # arranque y cierre del servidor
    config/                 # entorno y conexión MySQL
    routes/                 # URL, método HTTP y middleware
    controllers/            # entrada/salida HTTP
    services/               # reglas del catálogo, cuentas y solicitudes
    repositories/           # consultas SQL parametrizadas
    models/                 # esquemas y transformación de datos
    middlewares/            # sesión, validación, seguridad y errores
    migrations/             # inicialización idempotente del esquema
    utils/                  # contraseñas y utilidades
  tests/                    # pruebas contra MariaDB/MySQL
frontend/
  package.json              # instalación y scripts propios
  src/
    App.tsx                 # rutas React Router
    pages/                  # tienda y página de administración
    components/             # interfaz reutilizable
    services/               # cliente HTTP y servicios por dominio en TypeScript
    types/                  # contratos de API
    styles/                 # estilos globales y de componentes
    utils/                  # formato y colores
```

La estructura de capas y las rutas del frontend siguen a SIASE. Los componentes
visuales existentes se conservan en JSX; TypeScript comprueba el router, los
servicios y los contratos de API. El backend usa módulos ESM, compatibles con el
arranque de Hostinger, y mantiene las cookies HttpOnly y hashes scrypt existentes.
No se copian las tablas escolares, las credenciales, los datos ni el despliegue VPS de SIASE.

Cada proyecto puede instalarse por separado con `npm ci --prefix backend` y
`npm ci --prefix frontend --include=dev`. Los scripts de la raíz coordinan ambos
para publicar una sola aplicación en Hostinger. La configuración activa usa
el mismo dominio para la web y `/api`.

## Carrito y gestión comercial

El carrito registra pedidos en MySQL y permite coordinarlos por WhatsApp. El panel incluye inventario, clientes, pedidos, ventas y respaldos privados. Consulta [la guía de comercio y base local](backend/COMERCIO-Y-BASE-LOCAL.md) para usarlo y restaurar datos en tu computadora. El cobro de tarjetas online requiere activar una pasarela y todavía no está habilitado.

## Colores y carrusel de próximas motos

En **Admin → Motos**, agrega un nombre y una foto a cada color. La tienda crea el botón de color y muestra esa foto al seleccionarlo en el catálogo, la ficha y el visor 360°. Administradores y superadministradores pueden activar o desactivar motos; desactivarlas las oculta de la tienda sin borrar su historial.

En **Admin → Carrusel**, administradores y superadministradores pueden subir hasta ocho imágenes, ordenarlas y ocultarlas sin eliminarlas. La página muestra las imágenes activas dentro del marco del tablero, sin títulos ni descripciones. Si no hay imágenes activas, el carrusel no aparece.
