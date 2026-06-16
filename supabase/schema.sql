-- ════════════════════════════════════════════════════════════════
--  QUINIELA MUNDIAL — Esquema completo para Supabase (Postgres)
--  Ejecutar todo este archivo en el SQL Editor de Supabase.
-- ════════════════════════════════════════════════════════════════

-- ── 1. Tablas ───────────────────────────────────────────────────

create table if not exists players (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  created_at  timestamptz not null default now()
);

create table if not exists matches (
  id          uuid primary key default gen_random_uuid(),
  stage       text not null default 'Fase de grupos',  -- Grupos, Octavos, etc.
  home_team   text not null,
  away_team   text not null,
  kickoff_at  timestamptz not null,
  home_score  int,                                      -- null = aún no jugado
  away_score  int,
  created_at  timestamptz not null default now(),
  check (home_score is null = (away_score is null))      -- ambos o ninguno
);

create table if not exists predictions (
  id          uuid primary key default gen_random_uuid(),
  match_id    uuid not null references matches(id)  on delete cascade,
  player_id   uuid not null references players(id)  on delete cascade,
  pred_home   int  not null check (pred_home >= 0),
  pred_away   int  not null check (pred_away >= 0),
  created_at  timestamptz not null default now(),
  unique (match_id, player_id)                           -- 1 predicción por jugador/partido
);

create index if not exists idx_predictions_match  on predictions(match_id);
create index if not exists idx_predictions_player on predictions(player_id);
create index if not exists idx_matches_kickoff     on matches(kickoff_at);

-- ── 2. Función de puntos (gemela de scoring.ts) ─────────────────
--  3 = exacto · 1 = mismo resultado · 0 = falló · null = sin marcador real

create or replace function match_points(
  pred_home int, pred_away int, real_home int, real_away int
) returns int
language sql
immutable
as $$
  select case
    when real_home is null or real_away is null then null
    when pred_home = real_home and pred_away = real_away then 3
    when sign(pred_home - pred_away) = sign(real_home - real_away) then 1
    else 0
  end;
$$;

-- ── 3. Vistas (cálculo en lectura: siempre consistente) ─────────
--  No usamos triggers ni columnas almacenadas: al guardar el marcador
--  real de un partido, los puntos se recalculan automáticamente aquí.

create or replace view prediction_points as
  select
    p.id,
    p.match_id,
    p.player_id,
    p.pred_home,
    p.pred_away,
    match_points(p.pred_home, p.pred_away, m.home_score, m.away_score) as points
  from predictions p
  join matches m on m.id = p.match_id;

create or replace view leaderboard as
  select
    pl.id   as player_id,
    pl.name,
    coalesce(sum(pp.points), 0)                                  as total_points,
    count(*) filter (where pp.points = 3)                        as exact_hits,
    count(*) filter (where pp.points = 1)                        as outcome_hits,
    count(*) filter (where pp.points is not null)                as played
  from players pl
  left join prediction_points pp on pp.player_id = pl.id
  group by pl.id, pl.name
  order by total_points desc, exact_hits desc, pl.name asc;

-- ── 4. Row Level Security ───────────────────────────────────────
--  Lectura pública (clave anon). Las ESCRITURAS no tienen política,
--  por lo que la clave anon NO puede escribir aunque se filtre.
--  El admin escribe desde el servidor con la service_role key,
--  que ignora RLS por diseño.

alter table players     enable row level security;
alter table matches     enable row level security;
alter table predictions enable row level security;

drop policy if exists "public read players"     on players;
drop policy if exists "public read matches"      on matches;
drop policy if exists "public read predictions"  on predictions;

create policy "public read players"     on players     for select using (true);
create policy "public read matches"      on matches      for select using (true);
create policy "public read predictions"  on predictions  for select using (true);

-- Exponer las vistas al rol anónimo (lectura del leaderboard / puntos).
grant select on leaderboard       to anon, authenticated;
grant select on prediction_points to anon, authenticated;
