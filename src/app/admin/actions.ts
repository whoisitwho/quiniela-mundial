"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { ADMIN_COOKIE, adminToken, requireAdmin } from "@/lib/auth";

// ── Sesión de admin (una sola contraseña compartida en ADMIN_PASSWORD) ──

export async function login(formData: FormData) {
  const pass = String(formData.get("password") ?? "");
  if (pass !== process.env.ADMIN_PASSWORD) {
    redirect("/admin?error=1");
  }
  cookies().set(ADMIN_COOKIE, adminToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 60, // 60 días
  });
  redirect("/admin");
}

export async function logout() {
  cookies().delete(ADMIN_COOKIE);
  redirect("/admin");
}

// ── Jugadores ──
export async function addPlayer(formData: FormData) {
  requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await supabaseAdmin().from("players").insert({ name });
  revalidatePath("/admin");
  revalidatePath("/tabla");
}

// ── Partidos ──
export async function addMatch(formData: FormData) {
  requireAdmin();
  const payload = {
    stage: String(formData.get("stage") ?? "Fase de grupos"),
    home_team: String(formData.get("home_team") ?? "").trim(),
    away_team: String(formData.get("away_team") ?? "").trim(),
    kickoff_at: new Date(String(formData.get("kickoff_at"))).toISOString(),
  };
  if (!payload.home_team || !payload.away_team) return;
  await supabaseAdmin().from("matches").insert(payload);
  revalidatePath("/");
  revalidatePath("/admin");
}

// ── Predicciones (upsert: si ya existe, la actualiza) ──
export async function addPrediction(formData: FormData) {
  requireAdmin();
  const row = {
    match_id: String(formData.get("match_id")),
    player_id: String(formData.get("player_id")),
    pred_home: Number(formData.get("pred_home")),
    pred_away: Number(formData.get("pred_away")),
  };
  await supabaseAdmin()
    .from("predictions")
    .upsert(row, { onConflict: "match_id,player_id" });
  revalidatePath(`/partido/${row.match_id}`);
  revalidatePath("/tabla");
  revalidatePath("/admin");
}

// ── Captura de resultado (dispara el recálculo de puntos en las vistas) ──
export async function setResult(formData: FormData) {
  requireAdmin();
  const matchId = String(formData.get("match_id"));
  const home = formData.get("home_score");
  const away = formData.get("away_score");
  const clear = formData.get("clear") === "1";

  await supabaseAdmin()
    .from("matches")
    .update({
      home_score: clear ? null : Number(home),
      away_score: clear ? null : Number(away),
    })
    .eq("id", matchId);

  revalidatePath(`/partido/${matchId}`);
  revalidatePath("/tabla");
  revalidatePath("/");
  revalidatePath("/admin");
}
