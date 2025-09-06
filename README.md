# ValorApp

Despliegue en Vercel (Vite + React + TS)

## Requisitos
- Node 18+
- Cuenta en Vercel

## Scripts
- `npm run dev` — desarrollo local
- `npm run build` — compila a `dist/`
- `npm run preview` — sirve el build localmente

## Configuración Vercel
Se incluye `vercel.json` con:
- `@vercel/static-build` usando `package.json` y salida en `dist`
- Ruta SPA: redirige todas las rutas a `index.html` (uso de hash `#/` ya evita 404)

## Pasos para desplegar
1. Subir a un repo (ya estás en GitHub).
2. En Vercel, **New Project** → importa el repo.
3. Framework Preset: **Vite** (o Other). Build Command: `npm run build`. Output: `dist`.
4. Variables: no necesarias para el demo.
5. Deploy.

## Notas
- Enrutado por hash, por lo que las rutas funcionan sin configuración adicional.
- Si cambias a router de HTML5, mantén la regla SPA en `vercel.json`.
