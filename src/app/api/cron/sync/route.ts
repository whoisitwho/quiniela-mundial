import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  fetchWorldCupMatches,
  pairKey,
  type SyncMatch,
} from "@/lib/footballData";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Ruta protegida que sincroniza marcadores desde football-data.org.
// La llama un cron externo cada 20-30 min con el header x-cron-secret,
// o se puede abrir a mano: /api/cron/sync?key=TU_CRON_SECRET
export async function GET(req: Request) {
  // ── Autorización ──
  const secret = process.env.CRON_SECRET;
  const url = new URL(req.url);
  const provided =
    req.headers.get("x-cron-secret") ??
    req.headers.get("authorization")?.replace("Bearer ", "") ??
    url.searchParams.get("key");
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const token = process.env.FOOTBALL_DATA_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Falta FOOTBALL_DATA_TOKEN" },
      { status: 500 }
    );
  }

  let apiMatches: SyncMatch[];
  try {
    apiMatches = await fetchWorldCupMatches(token);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Error al consultar la API" },
      { status: 502 }
    );
  }

  const db = supabaseAdmin();
  const { data: dbMatches, error } = await db
    .from("matches")
    .select("id, home_team, away_team, home_score, away_score, kickoff_at");
  if (error) {
    return NextResponse.json({ error: "Error de BD" }, { status: 500 });
  }

  // Índice de partidos de la BD por par de equipos.
  const index = new Map<string, typeof dbMatches>();
  for (const m of dbMatches ?? []) {
    const k = pairKey(m.home_team, m.away_team);
    if (!index.has(k)) index.set(k, []);
    index.get(k)!.push(m);
  }

  const report = {
    actualizados: [] as string[],
    creados: [] as string[],
    sin_emparejar: [] as string[],
    ya_tenian_marcador: 0,
    revisados: 0,
  };

  for (const am of apiMatches) {
    if (!am.finished) continue; // solo partidos terminados
    report.revisados++;

    // Si algún equipo no se reconoció, se reporta para revisión manual.
    if (!am.homeEs || !am.awayEs) {
      report.sin_emparejar.push(`${am.rawHome} vs ${am.rawAway} (nombre no reconocido)`);
      continue;
    }

    const label = `${am.homeEs} ${am.homeScore}-${am.awayScore} ${am.awayEs}`;
    const candidates = index.get(pairKey(am.homeEs, am.awayEs)) ?? [];

    if (candidates.length > 0) {
      // Toma el primero sin marcador (no pisa correcciones manuales).
      const target = candidates.find(
        (c) => c.home_score === null || c.away_score === null
      );
      if (!target) {
        report.ya_tenian_marcador++;
        continue;
      }
      // Asigna el marcador respetando quién es local en NUESTRA base.
      const homeIsApiHome = target.home_team === am.homeEs;
      await db
        .from("matches")
        .update({
          home_score: homeIsApiHome ? am.homeScore : am.awayScore,
          away_score: homeIsApiHome ? am.awayScore : am.homeScore,
        })
        .eq("id", target.id);
      report.actualizados.push(label);
    } else if (am.isKnockout) {
      // Partido de eliminatoria que aún no existe: se crea.
      await db.from("matches").insert({
        stage: am.stageEs,
        home_team: am.homeEs,
        away_team: am.awayEs,
        kickoff_at: am.utcDate,
        home_score: am.homeScore,
        away_score: am.awayScore,
      });
      report.creados.push(`${label} [${am.stageEs}]`);
    } else {
      // Grupo terminado que no se encontró: probable desajuste de nombre.
      report.sin_emparejar.push(`${label} (no existe en la BD)`);
    }
  }

  return NextResponse.json({
    ok: true,
    hora: new Date().toISOString(),
    resumen: {
      revisados: report.revisados,
      actualizados: report.actualizados.length,
      creados: report.creados.length,
      sin_emparejar: report.sin_emparejar.length,
      ya_tenian_marcador: report.ya_tenian_marcador,
    },
    detalle: report,
  });
}
