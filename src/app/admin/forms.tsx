"use client";

import { useFormState, useFormStatus } from "react-dom";
import { addPlayer, addMatch, setResult, type FormState } from "./actions";
import type { Match, Player } from "@/lib/types";
import { isFinished } from "@/lib/types";

const initial: FormState = { ok: false, message: "" };

const inputCls =
  "w-full rounded-lg border border-line/50 bg-pitch px-3 py-2 text-chalk placeholder:text-chalk/30 focus:border-amber focus:outline-none";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="rounded-lg bg-amber px-4 py-2 font-semibold text-pitch transition hover:brightness-110 disabled:opacity-60"
    >
      {pending ? "Guardando…" : label}
    </button>
  );
}

function Feedback({ state }: { state: FormState }) {
  if (!state.message) return null;
  return (
    <p className={`text-sm ${state.ok ? "text-led" : "text-red-400"}`}>
      {state.ok ? "✅ " : "⚠️ "}
      {state.message}
    </p>
  );
}

export function PlayerForm() {
  const [state, action] = useFormState(addPlayer, initial);
  return (
    <form action={action} className="space-y-2">
      <div className="flex gap-2">
        <input name="name" placeholder="Nombre" className={inputCls} required />
        <Submit label="Agregar" />
      </div>
      <Feedback state={state} />
    </form>
  );
}

export function MatchForm() {
  const [state, action] = useFormState(addMatch, initial);
  return (
    <form action={action} className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <input name="home_team" placeholder="Local" className={inputCls} required />
        <input name="away_team" placeholder="Visitante" className={inputCls} required />
        <input name="stage" placeholder="Fase (ej. Octavos)" className={inputCls} />
        <input type="datetime-local" name="kickoff_at" className={inputCls} required />
      </div>
      <Submit label="Crear partido" />
      <Feedback state={state} />
    </form>
  );
}

export function ResultForm({ matches }: { matches: Match[] }) {
  const [state, action] = useFormState(setResult, initial);
  return (
    <form action={action} className="space-y-2">
      <select name="match_id" className={inputCls} required defaultValue="">
        <option value="" disabled>
          Elige un partido…
        </option>
        {matches.map((m) => (
          <option key={m.id} value={m.id}>
            {m.home_team} vs {m.away_team}
            {isFinished(m) ? ` (${m.home_score}–${m.away_score})` : ""}
          </option>
        ))}
      </select>
      <div className="grid grid-cols-2 gap-2">
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
      </div>
      <Submit label="Guardar resultado" />
      <Feedback state={state} />
    </form>
  );
}
