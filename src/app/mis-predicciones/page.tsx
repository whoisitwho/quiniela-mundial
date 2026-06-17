import { redirect } from "next/navigation";
import { getPlayerId } from "@/lib/playerAuth";
import {
  getMatches,
  getPlayerById,
  getPlayerPredictions,
} from "@/lib/queries";
import { PredictionForm } from "./PredictionForm";

export const dynamic = "force-dynamic";

const fmt = new Intl.DateTimeFormat("es-MX", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Mexico_City",
});

export default async function MisPredicciones() {
  const playerId = getPlayerId();
  if (!playerId) redirect("/entrar");

  const [player, matches, preds] = await Promise.all([
    getPlayerById(playerId),
    getMatches(),
    getPlayerPredictions(playerId),
  ]);
  if (!player) redirect("/entrar");

  const byMatch = new Map(preds.map((p) => [p.match_id, p]));
  const now = Date.now();
  const open = matches.filter((m) => new Date(m.kickoff_at).getTime() > now);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
          Hola, {player.name}
        </h1>
        <p className="text-sm text-chalk/60">
          Captura tu marcador antes de que inicie cada partido. Una vez guardado,
          no se puede cambiar.
        </p>
      </div>

      {open.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line/50 p-6 text-center text-sm text-chalk/50">
          No hay partidos abiertos por ahora. ¡Vuelve antes del próximo!
        </p>
      ) : (
        <ul className="space-y-3">
          {open.map((m) => {
            const mine = byMatch.get(m.id);
            return (
              <li
                key={m.id}
                className="rounded-xl border border-line/40 bg-field/50 p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-widest text-amber/80">
                    {m.stage}
                  </span>
                  <span className="text-xs text-chalk/50">
                    {fmt.format(new Date(m.kickoff_at))}
                  </span>
                </div>
                {mine ? (
                  <p className="text-sm">
                    Tu predicción:{" "}
                    <span className="scoreboard font-bold text-led">
                      {m.home_team} {mine.pred_home}–{mine.pred_away} {m.away_team}
                    </span>{" "}
                    <span className="text-chalk/40">(bloqueada)</span>
                  </p>
                ) : (
                  <PredictionForm
                    matchId={m.id}
                    home={m.home_team}
                    away={m.away_team}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-xs text-chalk/40">
        Los partidos que ya iniciaron se ven en la sección Partidos, con las
        predicciones de todos y los puntos.
      </p>
    </div>
  );
}
