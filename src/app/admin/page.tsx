import { getMatches, getPlayers } from "@/lib/queries";
import { isAdmin } from "@/lib/auth";
import { login, logout } from "./actions";
import { PlayerForm, MatchForm, ResultForm } from "./forms";

export const dynamic = "force-dynamic";

const inputCls =
  "w-full rounded-lg border border-line/50 bg-pitch px-3 py-2 text-chalk placeholder:text-chalk/30 focus:border-amber focus:outline-none";
const btnCls =
  "rounded-lg bg-amber px-4 py-2 font-semibold text-pitch transition hover:brightness-110";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
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
          <button className="text-sm text-chalk/50 hover:text-amber">Salir</button>
        </form>
      </div>

      <Panel title="Agregar jugador">
        <PlayerForm />
        <p className="mt-2 text-xs text-chalk/50">
          {players.length} jugador(es): {players.map((p) => p.name).join(", ")}
        </p>
      </Panel>

      <Panel title="Agregar partido">
        <MatchForm />
      </Panel>

      <Panel title="Capturar resultado final">
        <ResultForm matches={matches} />
      </Panel>

      <p className="text-xs text-chalk/40">
        Las predicciones ahora las captura cada jugador desde su cuenta en
        “Mis predicciones”.
      </p>
    </div>
  );
}

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
