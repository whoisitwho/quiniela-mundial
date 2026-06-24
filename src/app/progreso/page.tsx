import { getProgressRaw } from "@/lib/queries";
import { ProgressChart } from "./ProgressChart";

export const dynamic = "force-dynamic";

// Paleta de colores distinguibles (se cicla si hay más jugadores).
const PALETTE = [
  "#FFB020", "#36D399", "#60A5FA", "#F472B6", "#A78BFA", "#FBBF24",
  "#34D399", "#F87171", "#22D3EE", "#E879F9", "#4ADE80", "#FB923C",
  "#818CF8", "#2DD4BF", "#FACC15", "#F9A8D4", "#93C5FD", "#C084FC",
];

type Datum = { x: number } & Record<string, number>;

export default async function ProgresoPage() {
  const { matches, players, points } = await getProgressRaw();

  // Partidos finalizados en orden cronológico.
  const finished = matches.filter(
    (m) => m.home_score !== null && m.away_score !== null
  );

  // Puntos por (jugador, partido).
  const ptMap = new Map<string, number>();
  for (const p of points) {
    if (p.points !== null) ptMap.set(`${p.player_id}|${p.match_id}`, p.points);
  }

  const playerMeta = players.map((pl, i) => ({
    key: `p_${pl.id}`,
    id: pl.id,
    name: pl.name,
    color: PALETTE[i % PALETTE.length],
  }));

  // Etiquetas del eje X (tooltip): "Inicio" + cada partido.
  const labels: string[] = ["Inicio"];

  // Serie de puntos acumulados. Punto 0 = todos en cero.
  const cum = new Map<string, number>();
  playerMeta.forEach((p) => cum.set(p.id, 0));

  const pointsData: Datum[] = [{ x: 0, ...zero(playerMeta) }];
  const rankData: Datum[] = [{ x: 0, ...constant(playerMeta, 1) }];

  finished.forEach((m, idx) => {
    labels.push(`${m.home_team} ${m.home_score}-${m.away_score} ${m.away_team}`);

    // Acumula puntos de este partido.
    playerMeta.forEach((p) => {
      const got = ptMap.get(`${p.id}|${m.id}`) ?? 0;
      cum.set(p.id, (cum.get(p.id) ?? 0) + got);
    });

    const pRow: Datum = { x: idx + 1 } as Datum;
    playerMeta.forEach((p) => (pRow[p.key] = cum.get(p.id) ?? 0));
    pointsData.push(pRow);

    // Posición (rank competitivo por puntos acumulados; empates comparten).
    const ordered = [...playerMeta].sort(
      (a, b) => (cum.get(b.id) ?? 0) - (cum.get(a.id) ?? 0)
    );
    const rRow: Datum = { x: idx + 1 } as Datum;
    let rank = 0;
    let prev = Number.NaN;
    ordered.forEach((p, i) => {
      const v = cum.get(p.id) ?? 0;
      if (v !== prev) {
        rank = i + 1;
        prev = v;
      }
      rRow[p.key] = rank;
    });
    rankData.push(rRow);
  });

  const maxRank = playerMeta.length || 1;

  return (
    <div className="space-y-4">
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
        <ProgressChart
          players={playerMeta.map(({ key, name, color }) => ({ key, name, color }))}
          pointsData={pointsData}
          rankData={rankData}
          labels={labels}
          maxRank={maxRank}
        />
      )}
    </div>
  );
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
