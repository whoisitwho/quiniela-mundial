-- ════════════════════════════════════════════════════════════════
--  MIGRACIÓN v2 — Acceso por jugador + privacidad de predicciones
--  Ejecutar en el SQL Editor de Supabase (después de schema.sql).
--  Es seguro re-ejecutarla.
-- ════════════════════════════════════════════════════════════════

-- 1) Credenciales de jugador (contraseña hasheada, nunca en texto plano).
alter table players add column if not exists pin_hash text;

-- 2) Nombre único sin distinguir mayúsculas/acentos de capitalización.
create unique index if not exists players_name_lower on players (lower(name));

-- 3) Privacidad: las predicciones individuales dejan de ser legibles con la
--    llave pública. Así nadie puede espiarlas por la API antes del partido.
--    La app las lee desde el servidor con la llave secreta.
drop policy if exists "public read predictions" on predictions;
revoke select on prediction_points from anon, authenticated;

-- La tabla general (leaderboard) sigue siendo pública: solo expone puntos,
-- nunca los pronósticos. No se toca.

-- Nota: la inmutabilidad de cada predicción y el cierre al iniciar el partido
-- se validan en el servidor (Server Actions), que es la fuente de verdad.
