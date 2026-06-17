"use client";

import { useFormState, useFormStatus } from "react-dom";
import { submitPrediction, type FormState } from "./actions";

const initial: FormState = { ok: false, message: "" };

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="rounded-lg bg-amber px-4 py-2 text-sm font-semibold text-pitch transition hover:brightness-110 disabled:opacity-60"
    >
      {pending ? "Guardando…" : "Guardar predicción"}
    </button>
  );
}

export function PredictionForm({
  matchId,
  home,
  away,
}: {
  matchId: string;
  home: string;
  away: string;
}) {
  const [state, action] = useFormState(submitPrediction, initial);

  if (state.ok) {
    return <p className="text-sm font-medium text-led">{state.message}</p>;
  }

  const numCls =
    "w-14 rounded-lg border border-line/50 bg-pitch px-2 py-2 text-center text-chalk focus:border-amber focus:outline-none";

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="match_id" value={matchId} />
      <div className="flex items-center gap-2">
        <span className="flex-1 truncate text-right text-sm">{home}</span>
        <input type="number" name="pred_home" min={0} className={numCls} required />
        <span className="text-chalk/40">–</span>
        <input type="number" name="pred_away" min={0} className={numCls} required />
        <span className="flex-1 truncate text-sm">{away}</span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <Submit />
        {state.message && <span className="text-xs text-red-400">{state.message}</span>}
      </div>
    </form>
  );
}
