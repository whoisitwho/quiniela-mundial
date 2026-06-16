import Link from "next/link";
import { getMatches } from "@/lib/queries";
import { isFinished, type Match } from "@/lib/types";

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
  return (
    <li>
      <Link
        href={`/partido/${m.id}`}
        className="flex items-center gap-3 rounded-xl border border-line/40 bg-field/50 p-4 transition hover:border-amber/60 hover:bg-field"
      >
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-widest text-amber/80">
            {m.stage}
          </p>
          <p className="truncate font-display text-lg font-semibold">
            {m.home_team} <span className="text-chalk/40">vs</span> {m.away_team}
          </p>
          <p className="text-xs text-chalk/50">{fmt.format(new Date(m.kickoff_at))}</p>
        </div>
        {done ? (
          <span className="scoreboard rounded-lg bg-pitch px-3 py-1.5 text-2xl font-bold text-led">
            {m.home_score}–{m.away_score}
          </span>
        ) : (
          <span className="rounded-full border border-amber/40 px-3 py-1 text-xs font-medium uppercase text-amber">
            Próximo
          </span>
        )}
      </Link>
    </li>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-line/50 p-6 text-center text-sm text-chalk/50">
      {children}
    </p>
  );
}
