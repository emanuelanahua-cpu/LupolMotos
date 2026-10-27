# Pedidos, inventario, ventas y copia local

## Flujo de atención

1. El cliente agrega motos al carrito. La selección permanece en su navegador.
2. Al registrar el pedido, el servidor consulta precios y existencias de MySQL. Un reintento del mismo envío no crea otro pedido.
3. Se crea un pedido **pendiente** con sus productos, cantidades, precios y datos del cliente. El cliente puede abrir WhatsApp para coordinarlo.
4. En **Panel → Pedidos**, un administrador confirma disponibilidad: el estado **confirmado** reserva las unidades. Los pendientes todavía no reservan stock.
5. Tras verificar el pago completo, el administrador elige el método, añade una referencia y pulsa **Registrar pago verificado**. Se crea una venta y se descuenta el stock físico una sola vez.
6. Cancelar un pedido pendiente o confirmado libera sus reservas. Una venta pagada no puede cancelarse aquí: devoluciones y reembolsos requieren un flujo posterior.

Los gastos de envío se coordinan aparte antes del pago; el total almacenado es el de los productos. Las ventas son un registro interno, no emiten comprobantes fiscales.

## Panel

- **Inventario:** existencias físicas, reservadas y disponibles; entradas/salidas con motivo y usuario responsable. Editar el stock desde Motos también deja un movimiento.
- **Clientes:** fichas agrupadas por teléfono, creadas desde pedidos. Editar una ficha no altera los datos históricos del pedido.
- **Pedidos:** últimos 300, filtro por estado y acciones de confirmación/cancelación/pago.
- **Ventas:** últimas 300 y total acumulado de pagos registrados.
- **Descargar respaldo:** solo superadministradores. Exporta las once tablas y las imágenes almacenadas en MySQL, en JSON restaurable. Incluye datos privados y hashes de contraseñas: no compartir ni subir a GitHub.

Las solicitudes antiguas de contacto, cotización y reserva conservan su sección. No se convierten automáticamente en ventas o reservas de inventario.
El carrito trabaja con las motos del catálogo actual. No se inventaron repuestos: la tabla de repuestos estaba vacía.

## Cobro con tarjeta por Internet: pendiente de activación

Actualmente no se cobran tarjetas en la web. El comercio aún no tiene una cuenta de pasarela aprobada. `tarjeta_presencial` solo permite registrar un pago ya verificado en un POS físico.

Para activar tarjetas online faltan: elegir y aprobar una cuenta de comercio, configurar sus credenciales privadas en Hostinger, integrar su checkout y verificar pagos mediante notificaciones firmadas/consulta al proveedor. Deben probarse aprobación, rechazo y reembolso antes de habilitar cobros reales. No se solicitan ni almacenan números de tarjeta en Lupol Motos.

## Base local

Requisitos: Node.js, Docker y Docker Compose. Ejecutar desde la raíz del repositorio:

```bash
npm ci --prefix backend
npm run db:local
```

Esto conserva/crea `.env.local` privado y arranca MariaDB con un volumen persistente. La conexión es `127.0.0.1:33317`, base `lupol_local`, usuario `lupol_local`; la contraseña está en `.env.local`. No modifica `.env` de producción.

La primera importación de un respaldo descargado desde el panel:

```bash
npm run db:restore -- backend/backups/lupol-produccion-2026-10-27.json
```

Si la base local ya tiene datos y deseas reemplazarlos por otro respaldo:

```bash
npm run db:restore -- backend/backups/lupol-produccion-2026-10-27.json --replace-local
```

La restauración solo admite la base local y el puerto especificados. Se ejecuta en una transacción. Para usar la copia restaurada:

```bash
npm run start:local
```

Abrir `http://localhost:8000` y `/admin` (usa las cuentas copiadas). Sirve el frontend compilado; para cambios de interfaz ejecutar `npm run build --prefix frontend` o usar `npm run dev --prefix frontend` en otra terminal y abrir `http://localhost:3000`.

También se puede ejecutar `./iniciar.sh`: prioriza `.env.local` y levanta backend y frontend de desarrollo.

La copia local es independiente: editarla **no actualiza Hostinger**, y publicar código tampoco copia los datos locales a producción. Los respaldos están excluidos de Git. No uses `docker compose down -v` salvo que quieras borrar el volumen local.

## Tablas nuevas y consistencia

`clientes`, `pedidos`, `pedido_items`, `ventas`, `inventario_movimientos`. La migración es aditiva y no reemplaza tablas existentes. Precios de pedidos/ventas se almacenan en céntimos enteros. Confirmaciones, pagos y cancelaciones usan transacciones y bloqueo de filas. Las motos con historial se desactivan en lugar de eliminarse.
