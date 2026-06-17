import Link from "next/link";
import { notFound } from "next/navigation";
import { getMatch, getMatchPredictions } from "@/lib/queries";
import { isFinished } from "@/lib/types";

export const dynamic = "force-dynamic";

const fmt = new Intl.DateTimeFormat("es-MX", {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Mexico_City",
});

export default async function MatchPage({
  params,
}: {
  params: { id: string };
}) {
  const match = await getMatch(params.id);
  if (!match) notFound();

  const done = isFinished(match);
  const started = new Date(match.kickoff_at).getTime() <= Date.now();
  // Las predicciones se revelan SOLO cuando el partido ya inició.
  const preds = started ? await getMatchPredictions(params.id) : [];

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-amber hover:underline">
        ← Partidos
      </Link>

      <section className="rounded-2xl border border-line/40 bg-field/50 p-6 text-center">
        <p className="text-xs uppercase tracking-widest text-amber/80">
          {match.stage}
        </p>
        <div className="mt-3 flex items-center justify-center gap-4">
          <span className="flex-1 text-right font-display text-2xl font-bold">
            {match.home_team}
          </span>
          <span className="scoreboard rounded-lg bg-pitch px-4 py-2 text-3xl font-bold text-amber">
            {done ? `${match.home_score}–${match.away_score}` : "vs"}
          </span>
          <span className="flex-1 text-left font-display text-2xl font-bold">
            {match.away_team}
          </span>
        </div>
        <p className="mt-3 text-xs text-chalk/50">
          {fmt.format(new Date(match.kickoff_at))}
        </p>
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl font-bold uppercase tracking-wide">
          Predicciones {done && "y puntos"}
        </h2>

        {!started ? (
          <p className="rounded-xl border border-dashed border-line/50 p-6 text-center text-sm text-chalk/50">
            🔒 Las predicciones se revelan cuando el partido inicie.
          </p>
        ) : preds.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line/50 p-6 text-center text-sm text-chalk/50">
            Nadie registró predicción para este partido.
          </p>
        ) : (
          <ul className="divide-y divide-line/30 overflow-hidden rounded-xl border border-line/40 bg-field/50">
            {preds.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex-1 truncate font-medium">
                  {p.player?.name ?? "—"}
                </span>
                <span className="scoreboard text-lg text-chalk/80">
                  {p.pred_home}–{p.pred_away}
                </span>
                {done && <PointsBadge points={p.points} />}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function PointsBadge({ points }: { points: number | null }) {
  const styles =
    points === 3
      ? "bg-led/20 text-led"
      : points === 1
      ? "bg-amber/20 text-amber"
      : "bg-pitch text-chalk/40";
  return (
    <span
      className={`w-16 rounded-md px-2 py-1 text-center text-sm font-semibold ${styles}`}
    >
      {points ?? 0} pt{points === 1 ? "" : "s"}
    </span>
  );
}
