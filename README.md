# Colombia Responde API

API REST NestJS de Colombia Responde. Mantiene PostgreSQL/PostGIS como fuente de verdad y usa Redis únicamente para capacidades temporales y degradables.

## Desarrollo

```bash
npm ci
cp .env.example .env
npm run start:dev
```

La base nueva debe inicializarse con `migrations/001_initial.sql`. La lógica usa una única `DATABASE_URL`: PostgreSQL/PostGIS local y Neon son intercambiables como proveedores.

## Rutas conservadas

- `GET /api/v1/health`
- `GET|POST /api/v1/incidents`
- `GET|POST /api/v1/missing-persons`
- `GET /api/v1/resources`

## Render

`render.yaml` define el servicio Docker. Configura en Render `DATABASE_URL`, `REDIS_URL` y `CORS_ORIGINS`; no almacenes credenciales en GitHub.

## Comprobaciones

```bash
npm run lint
npm run typecheck
npm test
npm run build
```
