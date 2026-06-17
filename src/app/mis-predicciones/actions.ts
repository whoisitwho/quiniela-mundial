"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { getPlayerId } from "@/lib/playerAuth";

export type FormState = { ok: boolean; message: string };

export async function submitPrediction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const playerId = getPlayerId();
  if (!playerId) return { ok: false, message: "Inicia sesión para predecir." };

  const matchId = String(formData.get("match_id") ?? "");
  const ph = Number(formData.get("pred_home"));
  const pa = Number(formData.get("pred_away"));
  if (!matchId || !Number.isInteger(ph) || !Number.isInteger(pa) || ph < 0 || pa < 0) {
    return { ok: false, message: "Marcador inválido." };
  }

  const db = supabaseAdmin();

  // 1) El partido debe existir y NO haber iniciado.
  const { data: match } = await db
    .from("matches")
    .select("id, kickoff_at")
    .eq("id", matchId)
    .maybeSingle();
  if (!match) return { ok: false, message: "Partido no encontrado." };
  if (new Date(match.kickoff_at).getTime() <= Date.now()) {
    return { ok: false, message: "Este partido ya cerró. Ya no se aceptan predicciones." };
  }

  // 2) Inmutable: si ya predijo, no se cambia.
  const { data: prev } = await db
    .from("predictions")
    .select("id")
    .eq("match_id", matchId)
    .eq("player_id", playerId)
    .maybeSingle();
  if (prev) {
    return {
      ok: false,
      message: "Ya registraste tu predicción para este partido y no se puede cambiar.",
    };
  }

  // 3) Insertar (no upsert).
  const { error } = await db.from("predictions").insert({
    match_id: matchId,
    player_id: playerId,
    pred_home: ph,
    pred_away: pa,
  });
  if (error) {
    return { ok: false, message: "Ya existe una predicción tuya para este partido." };
  }

  revalidatePath("/mis-predicciones");
  revalidatePath(`/partido/${matchId}`);
  return { ok: true, message: `¡Guardado! Tu predicción: ${ph}–${pa}` };
}
