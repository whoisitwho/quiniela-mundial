import { getProgressRaw } from "@/lib/queries";
import { ProgressChart } from "./ProgressChart";

export const dynamic = "force-dynamic";

const PALETTE = [
  "#FFB020", "#36D399", "#60A5FA", "#F472B6", "#A78BFA", "#FBBF24",
  "#34D399", "#F87171", "#22D3EE", "#E879F9", "#4ADE80", "#FB923C",
  "#818CF8", "#2DD4BF", "#FACC15", "#F9A8D4", "#93C5FD", "#C084FC",
];

type Datum = { x: number } & Record<string, number>;

const abbr = (s: string) => s.slice(0, 3).toUpperCase();

export default async function ProgresoPage() {
  const { matches, players, points } = await getProgressRaw();

  const finished = matches.filter(
    (m) => m.home_score !== null && m.away_score !== null
  );

  // Predicciones: set de quién predijo, y puntos por (jugador, partido).
  const predSet = new Set<string>();
  const ptVal = new Map<string, number | null>();
  for (const p of points) {
    const key = `${p.player_id}|${p.match_id}`;
    predSet.add(key);
    ptVal.set(key, p.points);
  }

  const playerMeta = players.map((pl, i) => ({
    key: `p_${pl.id}`,
    id: pl.id,
    name: pl.name,
    color: PALETTE[i % PALETTE.length],
  }));

  // ── Datos para la gráfica (puntos acumulados y posición) ──
  const labels: string[] = ["Inicio"];
  const cum = new Map<string, number>();
  playerMeta.forEach((p) => cum.set(p.id, 0));
  const pointsData: Datum[] = [{ x: 0, ...zero(playerMeta) }];
  const rankData: Datum[] = [{ x: 0, ...constant(playerMeta, 1) }];

  finished.forEach((m, idx) => {
    labels.push(`${m.home_team} ${m.home_score}-${m.away_score} ${m.away_team}`);
    playerMeta.forEach((p) => {
      const got = ptVal.get(`${p.id}|${m.id}`) ?? 0;
      cum.set(p.id, (cum.get(p.id) ?? 0) + got);
    });
    const pRow: Datum = { x: idx + 1 } as Datum;
    playerMeta.forEach((p) => (pRow[p.key] = cum.get(p.id) ?? 0));
    pointsData.push(pRow);

    const ordered = [...playerMeta].sort(
      (a, b) => (cum.get(b.id) ?? 0) - (cum.get(a.id) ?? 0)
    );
    const rRow: Datum = { x: idx + 1 } as Datum;
    let rank = 0;
    let prev = Number.NaN;
    ordered.forEach((p, i) => {
      const v = cum.get(p.id) ?? 0;
      if (v !== prev) { rank = i + 1; prev = v; }
      rRow[p.key] = rank;
    });
    rankData.push(rRow);
  });

  // ── Datos para la matriz de validación ──
  const totals = new Map<string, number>();
  playerMeta.forEach((p) => {
    let t = 0;
    finished.forEach((m) => (t += ptVal.get(`${p.id}|${m.id}`) ?? 0));
    totals.set(p.id, t);
  });
  const sortedPlayers = [...playerMeta].sort(
    (a, b) => (totals.get(b.id) ?? 0) - (totals.get(a.id) ?? 0) || a.name.localeCompare(b.name)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
          Progreso
        </h1>
        <p className="text-sm text-chalk/60">
          Cómo ha evolucionado cada jugador partido a partido.
        </p>
      </div>

      {finished.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line/50 p-6 text-center text-sm text-chalk/50">
          Aún no hay partidos finalizados para graficar.
        </p>
      ) : (
        <>
          <ProgressChart
            players={playerMeta.map(({ key, name, color }) => ({ key, name, color }))}
            pointsData={pointsData}
            rankData={rankData}
            labels={labels}
            maxRank={playerMeta.length || 1}
          />

          {/* ── Matriz de validación: jugador × partido ── */}
          <section className="space-y-2">
            <h2 className="font-display text-xl font-bold uppercase tracking-wide">
              Detalle por partido
            </h2>
            <p className="text-xs text-chalk/50">
              Puntos de cada jugador en cada partido finalizado. 🟢 3 · 🟡 1 · gris 0 ·
              · sin predicción · <span className="text-red-400">?</span> punto no calculado (revisar).
            </p>
            <div className="overflow-x-auto rounded-xl border border-line/40 bg-field/40">
              <table className="min-w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-pitch text-chalk/50">
                    <th className="sticky left-0 z-10 bg-pitch px-3 py-2 text-left">
                      Jugador
                    </th>
                    {finished.map((m) => (
                      <th key={m.id} className="px-2 py-2 text-center font-medium">
                        <div className="whitespace-nowrap">
                          {abbr(m.home_team)} {m.home_score}-{m.away_score} {abbr(m.away_team)}
                        </div>
                      </th>
                    ))}
                    <th className="px-3 py-2 text-center text-amber">Tot</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPlayers.map((p) => (
                    <tr key={p.id} className="border-t border-line/20">
                      <td className="sticky left-0 z-10 bg-field/80 px-3 py-1.5 font-medium">
                        {p.name}
                      </td>
                      {finished.map((m) => {
                        const key = `${p.id}|${m.id}`;
                        const has = predSet.has(key);
                        const val = ptVal.get(key);
                        return (
                          <td key={m.id} className="px-2 py-1.5 text-center">
                            <Cell has={has} val={val} />
                          </td>
                        );
                      })}
                      <td className="scoreboard px-3 py-1.5 text-center font-bold text-amber">
                        {totals.get(p.id) ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Cell({ has, val }: { has: boolean; val: number | null | undefined }) {
  if (!has) return <span className="text-chalk/20">·</span>;
  if (val === null || val === undefined)
    return <span className="font-bold text-red-400">?</span>;
  const cls =
    val === 3 ? "text-led font-bold" : val === 1 ? "text-amber" : "text-chalk/40";
  return <span className={cls}>{val}</span>;
}

function zero(players: { id: string; key: string }[]) {
  const o: Record<string, number> = {};
  players.forEach((p) => (o[p.key] = 0));
  return o;
}
function constant(players: { id: string; key: string }[], v: number) {
  const o: Record<string, number> = {};
  players.forEach((p) => (o[p.key] = v));
  return o;
}
