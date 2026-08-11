# Colombia Responde API

API REST NestJS de Colombia Responde. Mantiene PostgreSQL/PostGIS como fuente de verdad y usa Redis únicamente para capacidades temporales y degradables.

## Desarrollo

```bash
npm ci
cp .env.example .env
npm run start:dev
```

La lógica usa `DATABASE_URL`: PostgreSQL/PostGIS local y Neon son intercambiables como proveedores. En Neon, configura la URL agrupada (`-pooler`) en `DATABASE_URL` para la aplicación y la URL directa en `DATABASE_DIRECT_URL` para tareas de esquema.

Para inicializar y comprobar una base nueva:

```bash
npm run db:migrate
npm run db:verify
```

La migración es idempotente y nunca imprime las URLs ni sus credenciales. Si `DATABASE_DIRECT_URL` está vacío, usa `DATABASE_URL`, lo que resulta apropiado para PostgreSQL local.

## Rutas conservadas

- `GET /api/v1/health`
- `GET|POST /api/v1/incidents`
- `GET|POST /api/v1/missing-persons`
- `GET /api/v1/resources`

## Render

`render.yaml` define el servicio Docker. Configura en Render `DATABASE_URL`, `DATABASE_DIRECT_URL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` y `CORS_ORIGINS`; no almacenes credenciales en GitHub. En cloud, el backend prioriza Upstash REST por HTTPS. Si las variables REST no existen, usa `REDIS_URL`, lo que conserva Redis TCP para desarrollo local.

## Comprobaciones

```bash
npm run lint
npm run typecheck
npm test
npm run build
```
