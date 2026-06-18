import Link from "next/link";
import { getMatches } from "@/lib/queries";
import { isFinished, type Match } from "@/lib/types";
import { Flag } from "@/components/Flag";

export const dynamic = "force-dynamic";

const fmt = new Intl.DateTimeFormat("es-MX", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Mexico_City",
});

export default async function HomePage() {
  const matches = await getMatches();
  const upcoming = matches.filter((m) => !isFinished(m));
  const finished = matches.filter(isFinished).reverse();

  return (
    <div className="space-y-8">
      <section>
        <h1 className="mb-3 font-display text-2xl font-bold uppercase tracking-wide">
          Próximos partidos
        </h1>
        {upcoming.length === 0 ? (
          <Empty>No hay partidos programados. Agrégalos en Admin.</Empty>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((m) => (
              <MatchRow key={m.id} match={m} />
            ))}
          </ul>
        )}
      </section>

      {finished.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-xl font-bold uppercase tracking-wide text-chalk/70">
            Finalizados
          </h2>
          <ul className="space-y-2">
            {finished.map((m) => (
              <MatchRow key={m.id} match={m} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function MatchRow({ match: m }: { match: Match }) {
  const done = isFinished(m);
  const homeWin = done && (m.home_score ?? 0) > (m.away_score ?? 0);
  const awayWin = done && (m.away_score ?? 0) > (m.home_score ?? 0);

  return (
    <li>
      <Link
        href={`/partido/${m.id}`}
        className="block rounded-xl border border-line/40 bg-field/50 p-4 transition hover:border-amber/60 hover:bg-field"
      >
        <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-widest">
          <span className="text-amber/80">{m.stage}</span>
          <span className="text-chalk/40">
            {done ? "Final" : fmt.format(new Date(m.kickoff_at))}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Local */}
          <div
            className={`flex min-w-0 flex-1 items-center justify-end gap-2 ${teamCls(
              done,
              homeWin
            )}`}
          >
            <span className="truncate font-display text-lg">{m.home_team}</span>
            <Flag team={m.home_team} />
            {homeWin && <span className="text-led">▸</span>}
          </div>

          {/* Marcador / vs */}
          {done ? (
            <span className="scoreboard rounded-lg bg-pitch px-3 py-1.5 text-xl font-bold text-amber">
              {m.home_score}–{m.away_score}
            </span>
          ) : (
            <span className="rounded-lg bg-pitch px-3 py-1.5 text-sm font-semibold text-chalk/40">
              vs
            </span>
          )}

          {/* Visitante */}
          <div
            className={`flex min-w-0 flex-1 items-center gap-2 ${teamCls(
              done,
              awayWin
            )}`}
          >
            {awayWin && <span className="text-led">◂</span>}
            <Flag team={m.away_team} />
            <span className="truncate font-display text-lg">{m.away_team}</span>
          </div>
        </div>
      </Link>
    </li>
  );
}

// Resalta al ganador (verde + negritas) y atenúa al perdedor.
function teamCls(done: boolean, isWinner: boolean) {
  if (!done) return "text-chalk";
  return isWinner ? "font-bold text-led" : "text-chalk/40";
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-line/50 p-6 text-center text-sm text-chalk/50">
      {children}
    </p>
  );
}
