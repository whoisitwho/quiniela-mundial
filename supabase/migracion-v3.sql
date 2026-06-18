-- ════════════════════════════════════════════════════════════════
--  MIGRACIÓN v3 — Desempates de la tabla general
--  Ordena por: puntos → marcadores exactos → resultados acertados → nombre.
--  Ejecutar en el SQL Editor de Supabase. Es seguro re-ejecutarla.
-- ════════════════════════════════════════════════════════════════

create or replace view leaderboard as
  select
    pl.id   as player_id,
    pl.name,
    coalesce(sum(pp.points), 0)                   as total_points,
    count(*) filter (where pp.points = 3)         as exact_hits,
    count(*) filter (where pp.points = 1)         as outcome_hits,
    count(*) filter (where pp.points is not null) as played
  from players pl
  left join prediction_points pp on pp.player_id = pl.id
  group by pl.id, pl.name
  order by
    total_points desc,
    exact_hits   desc,
    outcome_hits desc,
    pl.name      asc;

grant select on leaderboard to anon, authenticated;
