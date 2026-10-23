# Backend Lupol Motos

Node.js + Express + MySQL. Ejecutar `npm ci` y `npm start` desde esta carpeta.
Las variables privadas se leen del `.env` en la raíz del repositorio o del entorno de Hostinger.

El flujo es `routes → controllers → services → repositories → MySQL`.
Los controladores gestionan HTTP; los servicios reciben datos ordinarios y aplican
reglas; los repositorios contienen las consultas SQL. Las transacciones se conservan
en altas/ediciones de motos e imágenes. `models` valida entradas y construye entidades.

El punto de entrada es `src/server.js`; `src/app.js` permite crear una aplicación
con un pool de pruebas. La inicialización en `src/migrations` no reemplaza datos
existentes. Consulta el README de la raíz para configurar MySQL y ejecutar pruebas.
