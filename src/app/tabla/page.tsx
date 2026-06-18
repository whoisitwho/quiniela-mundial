import { getLeaderboard } from "@/lib/queries";
import type { LeaderboardRow } from "@/lib/types";

export const dynamic = "force-dynamic";

type Ranked = LeaderboardRow & { rank: number; tied: boolean };

// Calcula posiciones estilo competencia: los empatados comparten número
// (1, 1, 3, …). Empate = mismos puntos, exactos y resultados.
function rankRows(rows: LeaderboardRow[]): Ranked[] {
  const sorted = [...rows].sort(
    (a, b) =>
      b.total_points - a.total_points ||
      b.exact_hits - a.exact_hits ||
      b.outcome_hits - a.outcome_hits ||
      a.name.localeCompare(b.name)
  );

  let rank = 0;
  let prevKey = "";
  const ranked = sorted.map((r, i) => {
    const key = `${r.total_points}|${r.exact_hits}|${r.outcome_hits}`;
    if (key !== prevKey) {
      rank = i + 1;
      prevKey = key;
    }
    return { ...r, rank, tied: false };
  });

  // Marca como empatados a quienes comparten su posición con alguien más.
  const countByRank = new Map<number, number>();
  ranked.forEach((r) => countByRank.set(r.rank, (countByRank.get(r.rank) ?? 0) + 1));
  ranked.forEach((r) => (r.tied = (countByRank.get(r.rank) ?? 0) > 1));

  return ranked;
}

export default async function TablaPage() {
  const rows = await getLeaderboard();
  const ranked = rankRows(rows);

  return (
    <div className="space-y-3">
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
        Tabla general
      </h1>

      {ranked.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line/50 p-6 text-center text-sm text-chalk/50">
          Todavía no hay jugadores.
        </p>
      ) : (
        <ul className="space-y-2">
          {ranked.map((r) =>
            r.rank <= 3 ? (
              <PodiumRow key={r.player_id} row={r} />
            ) : (
              <CompactRow key={r.player_id} row={r} />
            )
          )}
        </ul>
      )}

      <p className="text-center text-xs text-chalk/40">
        🎯 marcadores exactos · pts totales · los empates comparten posición
      </p>
    </div>
  );
}

// Estilos por posición: oro, plata, bronce, decrecientes.
// Quienes comparten posición (empate) usan el MISMO estilo.
const STYLES = [
  {
    medal: "🥇",
    wrap: "p-6 border-amber/60 bg-amber/10",
    rank: "text-3xl",
    name: "text-2xl",
    pts: "text-5xl text-amber",
    accent: "text-amber",
  },
  {
    medal: "🥈",
    wrap: "p-5 border-[#C8D0CC]/40 bg-[#C8D0CC]/5",
    rank: "text-2xl",
    name: "text-xl",
    pts: "text-4xl text-[#D7DEDA]",
    accent: "text-[#D7DEDA]",
  },
  {
    medal: "🥉",
    wrap: "p-4 border-[#CD7F32]/50 bg-[#CD7F32]/10",
    rank: "text-xl",
    name: "text-lg",
    pts: "text-3xl text-[#E0A86B]",
    accent: "text-[#E0A86B]",
  },
];

function PodiumRow({ row }: { row: Ranked }) {
  const s = STYLES[row.rank - 1];
  return (
    <li className={`flex items-center gap-4 rounded-2xl border ${s.wrap}`}>
      <div className="flex flex-col items-center">
        <span className="leading-none">{s.medal}</span>
        <span className={`scoreboard font-bold leading-none ${s.rank} ${s.accent}`}>
          {row.rank}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className={`truncate font-display font-bold ${s.name}`}>
          {row.name}
          {row.tied && (
            <span className="ml-2 align-middle text-xs font-normal text-chalk/50">
              empate
            </span>
          )}
        </p>
        <p className="mt-0.5 text-xs text-chalk/50">
          {row.exact_hits} exactos · {row.outcome_hits} resultados
        </p>
      </div>

      <div className="text-right leading-none">
        <span className={`scoreboard font-bold ${s.pts}`}>{row.total_points}</span>
        <span className="ml-1 text-xs text-chalk/40">pts</span>
      </div>
    </li>
  );
}

function CompactRow({ row }: { row: Ranked }) {
  return (
    <li className="flex items-center gap-3 rounded-lg border border-line/30 bg-field/40 px-4 py-2.5">
      <span className="w-7 text-center font-display text-chalk/50">{row.rank}</span>
      <span className="flex-1 truncate font-medium">
        {row.name}
        {row.tied && (
          <span className="ml-2 text-xs font-normal text-chalk/40">empate</span>
        )}
      </span>
      <span className="text-xs text-led/80">{row.exact_hits}🎯</span>
      <span className="scoreboard w-10 text-right text-lg font-bold">
        {row.total_points}
      </span>
    </li>
  );
}
