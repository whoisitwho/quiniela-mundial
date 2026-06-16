import { getLeaderboard } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function TablaPage() {
  const rows = await getLeaderboard();

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
        Tabla general
      </h1>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line/50 p-6 text-center text-sm text-chalk/50">
          Todavía no hay jugadores.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-line/40 bg-field/50">
          <table className="w-full text-sm">
            <thead className="bg-pitch text-xs uppercase tracking-widest text-chalk/50">
              <tr>
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">Jugador</th>
                <th className="px-3 py-2 text-center">Exactos</th>
                <th className="px-3 py-2 text-center">Result.</th>
                <th className="px-3 py-2 text-right">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/30">
              {rows.map((r, i) => (
                <tr key={r.player_id} className={i === 0 ? "bg-amber/5" : ""}>
                  <td className="px-3 py-3 font-display text-lg text-chalk/60">
                    {i + 1}
                  </td>
                  <td className="px-3 py-3 font-medium">{r.name}</td>
                  <td className="px-3 py-3 text-center text-led">{r.exact_hits}</td>
                  <td className="px-3 py-3 text-center text-amber">
                    {r.outcome_hits}
                  </td>
                  <td className="scoreboard px-3 py-3 text-right text-xl font-bold">
                    {r.total_points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
