# E-Commerce — Frontend (este repo)

Sistema de gestión y venta para una tienda física de un solo local (no es un
e-commerce online): POS de ventas + dashboard administrativo. Este repo es
el **frontend** de ese sistema. Proyecto nuevo, separado del viejo
"E-commer" (descartado).

Repos hermanos (mismo sistema, repos independientes):
- `../E-Commerce-backend` → API NestJS
- `../E-Commerce-ML` → microservicio de ML (forecasting + anomalías)

## Stack de este repo
- React + Vite + TypeScript
- Tailwind CSS v4 (integrado vía plugin de Vite)
- React Router (navegación por páginas)
- Axios como cliente HTTP, con interceptor que agrega el Bearer token JWT
- Context API para estado de sesión (`AuthContext`)

## Stack del sistema completo (contexto)
- Backend: NestJS + TypeORM + MySQL, auth JWT con roles
  Empleado/Supervisor/Administrador
- ML: FastAPI (Python), microservicio aparte
- Infra objetivo: Docker Compose (local) → deploy real para la tienda física

## Alcance funcional decidido
- Interfaz responsive para desktop/tablet, uso tipo POS
- Roles con permisos diferenciados
- Productos perecederos y no perecederos, lotes/vencimientos
- Alertas de stock
- Compras y proveedores
- Ventas estilo punto de venta (pensado para escaneo de código de barras)
- Dashboard con métricas

## Estructura (`src/`)
- `pages/`: `login`, `dashboard`, `productos`, `inventario`, `compras`,
  `ventas`, `usuarios` — **stubs**, sin conectar a la API todavía
- `context/`: `AuthContext` (estado global de usuario/sesión)
- `services/`: cliente axios con interceptor de Bearer token
- `components/`: vacío por ahora, sin componentes compartidos aún
- `hooks/`, `types/`: creados, sin contenido específico todavía
- `index.css`: sistema de diseño base con soporte light/dark

## Estado actual (10 ago 2026)
Scaffolding completo: routing con 7 páginas, Tailwind v4 funcionando,
AuthProvider integrado en el entry point, cliente HTTP listo. Assets del
template de Vite (`App.css`, logos) eliminados. `tsc` compila sin errores.
**Ninguna página tiene lógica real ni está conectada al backend.**

## Próximos pasos
1. Implementar login real contra `/auth` del backend una vez exista.
2. Conectar cada página stub a su endpoint correspondiente vía el cliente
   axios ya configurado.
3. Guards de ruta según rol (Empleado/Supervisor/Administrador).
4. Componentes compartidos (tabla, formularios, layout) en `components/`.
