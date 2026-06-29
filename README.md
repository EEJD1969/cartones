# Cartones Bingo Cantado Solidario

Aplicación web puntual para generar cartones de **Bingo Cantado Solidario** en PDF. No incluye login, base de datos ni panel administrativo: solo un formulario para indicar cantidad de cartones y número inicial, y un backend que devuelve un PDF listo para imprimir.

## Stack

- Frontend: React + Vite, servido con Nginx.
- Backend: Node.js + Express.
- PDF: Playwright/Chromium en el backend.
- Deploy: Docker Compose con servicios `cartones-frontend` y `cartones-backend`.

## Desarrollo local

### Backend

```bash
cd backend
npm install
npm run dev
```

El backend queda en `http://localhost:3000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite proxyea `/api` a `http://localhost:3000`, por lo que conviene levantar el backend antes de usar el formulario.

## Docker

Construir y levantar todo:

```bash
docker compose up -d --build
```

Servicios publicados:

- Frontend: `http://localhost:8088`
- Backend directo: `http://localhost:3010/api/health`

Detener:

```bash
docker compose down
```

## Endpoint

### `POST /api/generar`

Body:

```json
{
  "cantidad": 400,
  "numeroInicial": 1
}
```

Respuesta: `application/pdf` como attachment. El archivo se nombra con el rango generado, por ejemplo:

```text
cartones-bingo-GA-0001-0400.pdf
```

Validaciones principales:

- `cantidad` requerida.
- `cantidad` mínima 1 y máxima 500.
- `numeroInicial` requerido.
- `numeroInicial` entero y mínimo 1.

## Ejemplo curl

```bash
curl -X POST http://localhost:3010/api/generar \
  -H 'Content-Type: application/json' \
  -d '{"cantidad":4,"numeroInicial":1}' \
  --output cartones-bingo.pdf
```

## Deploy básico

1. Instalar Docker y Docker Compose en el servidor.
2. Clonar el repositorio.
3. Ejecutar `docker compose up -d --build`.
4. Publicar el puerto `8088` detrás de un proxy reverso o acceder directo según corresponda.

El frontend proxyea `/api` hacia `cartones-backend:3000` desde Nginx, por lo que el navegador solo necesita acceder al frontend.
