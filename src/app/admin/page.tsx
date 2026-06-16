import { getMatches, getPlayers } from "@/lib/queries";
import { isFinished } from "@/lib/types";
import { isAdmin } from "@/lib/auth";
import {
  login,
  logout,
  addPlayer,
  addMatch,
  addPrediction,
  setResult,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  // ── Puerta de acceso (contraseña única compartida) ──
  if (!isAdmin()) {
    return (
      <div className="mx-auto max-w-sm space-y-4 pt-10">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
          Acceso admin
        </h1>
        {searchParams.error && (
          <p className="rounded-md bg-red-500/15 px-3 py-2 text-sm text-red-300">
            Contraseña incorrecta.
          </p>
        )}
        <form action={login} className="space-y-3">
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            className={inputCls}
            autoFocus
          />
          <button className={btnCls}>Entrar</button>
        </form>
      </div>
    );
  }

  const [players, matches] = await Promise.all([getPlayers(), getMatches()]);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
          Panel admin
        </h1>
        <form action={logout}>
          <button className="text-sm text-chalk/50 hover:text-amber">
            Salir
          </button>
        </form>
      </div>

      {/* ── Jugadores ── */}
      <Panel title="Agregar jugador">
        <form action={addPlayer} className="flex gap-2">
          <input name="name" placeholder="Nombre" className={inputCls} required />
          <button className={btnCls}>Agregar</button>
        </form>
        <p className="mt-2 text-xs text-chalk/50">
          {players.length} jugador(es): {players.map((p) => p.name).join(", ")}
        </p>
      </Panel>

      {/* ── Nuevo partido ── */}
      <Panel title="Agregar partido">
        <form action={addMatch} className="grid grid-cols-2 gap-2">
          <input name="home_team" placeholder="Local" className={inputCls} required />
          <input name="away_team" placeholder="Visitante" className={inputCls} required />
          <input name="stage" placeholder="Fase (ej. Octavos)" className={inputCls} />
          <input type="datetime-local" name="kickoff_at" className={inputCls} required />
          <button className={`${btnCls} col-span-2`}>Crear partido</button>
        </form>
      </Panel>

      {/* ── Registrar predicción ── */}
      <Panel title="Registrar / actualizar predicción">
        <form action={addPrediction} className="grid grid-cols-2 gap-2">
          <select name="match_id" className={inputCls} required>
            {matches.map((m) => (
              <option key={m.id} value={m.id}>
                {m.home_team} vs {m.away_team}
              </option>
            ))}
          </select>
          <select name="player_id" className={inputCls} required>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            name="pred_home"
            min={0}
            placeholder="Goles local"
            className={inputCls}
            required
          />
          <input
            type="number"
            name="pred_away"
            min={0}
            placeholder="Goles visita"
            className={inputCls}
            required
          />
          <button className={`${btnCls} col-span-2`}>Guardar predicción</button>
        </form>
      </Panel>

      {/* ── Capturar resultado ── */}
      <Panel title="Capturar resultado final">
        <form action={setResult} className="grid grid-cols-2 gap-2">
          <select name="match_id" className={`${inputCls} col-span-2`} required>
            {matches.map((m) => (
              <option key={m.id} value={m.id}>
                {m.home_team} vs {m.away_team}
                {isFinished(m) ? ` (${m.home_score}–${m.away_score})` : ""}
              </option>
            ))}
          </select>
          <input
            type="number"
            name="home_score"
            min={0}
            placeholder="Goles local"
            className={inputCls}
          />
          <input
            type="number"
            name="away_score"
            min={0}
            placeholder="Goles visita"
            className={inputCls}
          />
          <button className={`${btnCls} col-span-2`}>
            Guardar resultado y recalcular puntos
          </button>
        </form>
      </Panel>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-line/50 bg-pitch px-3 py-2 text-chalk placeholder:text-chalk/30 focus:border-amber focus:outline-none";
const btnCls =
  "rounded-lg bg-amber px-4 py-2 font-semibold text-pitch transition hover:brightness-110";

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line/40 bg-field/40 p-5">
      <h2 className="mb-3 font-display text-lg font-bold uppercase tracking-wide text-amber/90">
        {title}
      </h2>
      {children}
    </section>
  );
}
