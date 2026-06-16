# Quiniela Mundial 2026

App para administrar una quiniela del Mundial entre amigos. Un solo
administrador (tú) captura partidos, predicciones y resultados; el resto
sólo consulta partidos, detalle y tabla general.

## Stack

- **Next.js 14 (App Router) + TypeScript** — un solo proyecto cubre UI,
  páginas y la lógica de servidor (Server Actions). Deploy en un clic.
- **Supabase (Postgres)** — base relacional ideal para el cálculo de puntos;
  free tier suficiente; clave pública con RLS para lectura.
- **Tailwind CSS** — estilos rápidos y consistentes.
- **Vercel** — hosting gratis e integrado con Next.js.

## Puesta en marcha

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. SQL Editor → pega y ejecuta `supabase/schema.sql`.
3. `cp .env.local.example .env.local` y llena las variables
   (URL y llaves en *Project Settings → API*; define tu `ADMIN_PASSWORD`).
4. `npm install && npm run dev` → http://localhost:3000

## Deploy

Sube el repo a GitHub → impórtalo en Vercel → carga las mismas variables
de entorno → Deploy.

## Cómo se calculan los puntos

3 = marcador exacto · 1 = acierta el resultado (ganador o empate) · 0 = falla.

La lógica vive en dos lugares idénticos: `src/lib/scoring.ts` (TS) y la
función SQL `match_points` (`supabase/schema.sql`). Los puntos **no se
almacenan**: las vistas `prediction_points` y `leaderboard` los recalculan
en cada lectura, así que al capturar un resultado la tabla se actualiza sola.

## Rutas

| Ruta            | Qué hace                                          |
| --------------- | ------------------------------------------------- |
| `/`             | Próximos partidos + finalizados                   |
| `/partido/[id]` | Detalle: predicciones de cada jugador y sus puntos |
| `/tabla`        | Tabla general (leaderboard)                        |
| `/admin`        | Panel (protegido con contraseña)                  |
