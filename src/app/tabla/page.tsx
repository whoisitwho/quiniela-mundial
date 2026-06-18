import { getLeaderboard } from "@/lib/queries";
import type { LeaderboardRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TablaPage() {
  const rows = await getLeaderboard();
  const podium = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
        Tabla general
      </h1>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line/50 p-6 text-center text-sm text-chalk/50">
          Todavía no hay jugadores.
        </p>
      ) : (
        <>
          {/* Podio: tamaño decreciente del 1º al 3º */}
          <div className="space-y-3">
            {podium.map((r, i) => (
              <PodiumCard key={r.player_id} row={r} place={i} />
            ))}
          </div>

          {/* Resto: filas compactas */}
          {rest.length > 0 && (
            <ul className="divide-y divide-line/30 overflow-hidden rounded-xl border border-line/40 bg-field/50">
              {rest.map((r, i) => (
                <li
                  key={r.player_id}
                  className="flex items-center gap-3 px-4 py-2.5"
                >
                  <span className="w-6 text-center font-display text-chalk/50">
                    {i + 4}
                  </span>
                  <span className="flex-1 truncate font-medium">{r.name}</span>
                  <span className="text-xs text-led/80">{r.exact_hits}🎯</span>
                  <span className="scoreboard w-10 text-right text-lg font-bold">
                    {r.total_points}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <p className="text-center text-xs text-chalk/40">
        🎯 marcadores exactos · pts totales
      </p>
    </div>
  );
}

// Estilos del podio: oro, plata, bronce, decrecientes.
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

function PodiumCard({ row, place }: { row: LeaderboardRow; place: number }) {
  const s = STYLES[place];
  return (
    <div
      className={`flex items-center gap-4 rounded-2xl border ${s.wrap}`}
    >
      <div className="flex flex-col items-center">
        <span className="leading-none">{s.medal}</span>
        <span className={`scoreboard font-bold leading-none ${s.rank} ${s.accent}`}>
          {place + 1}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className={`truncate font-display font-bold ${s.name}`}>{row.name}</p>
        <p className="mt-0.5 text-xs text-chalk/50">
          {row.exact_hits} exactos · {row.outcome_hits} resultados
        </p>
      </div>

      <div className="text-right leading-none">
        <span className={`scoreboard font-bold ${s.pts}`}>{row.total_points}</span>
        <span className="ml-1 text-xs text-chalk/40">pts</span>
      </div>
    </div>
  );
}
