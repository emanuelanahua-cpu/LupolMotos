# Frontend Lupol Motos

React + Vite, con React Router y TypeScript en el router, servicios y contratos.

- `pages`: composición de páginas y navegación.
- `components`: componentes visuales existentes en JSX.
- `services`: acceso a la API por dominio; `api.ts` centraliza HTTP y credenciales.
- `types`: contratos de usuarios, motos y solicitudes.
- `styles`: estilos globales y de componentes.

`npm ci --include=dev`, `npm run dev` para desarrollo y `npm run build` para
comprobar TypeScript y compilar. El proxy de Vite apunta al backend en desarrollo.
En Hostinger, Express sirve `dist` y `/api` bajo el mismo dominio.
