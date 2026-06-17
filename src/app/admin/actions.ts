"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { ADMIN_COOKIE, adminToken, isAdmin } from "@/lib/auth";

export type FormState = { ok: boolean; message: string };

// ── Sesión de admin ──
export async function login(formData: FormData) {
  const pass = String(formData.get("password") ?? "");
  if (pass !== process.env.ADMIN_PASSWORD) redirect("/admin?error=1");
  cookies().set(ADMIN_COOKIE, adminToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 60,
  });
  redirect("/admin");
}

export async function logout() {
  cookies().delete(ADMIN_COOKIE);
  redirect("/admin");
}

// ── Jugadores ──
export async function addPlayer(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  if (!isAdmin()) return { ok: false, message: "No autorizado." };
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, message: "Escribe un nombre." };
  const { error } = await supabaseAdmin().from("players").insert({ name });
  if (error) return { ok: false, message: "No se pudo (¿nombre repetido?)." };
  revalidatePath("/admin");
  revalidatePath("/tabla");
  return { ok: true, message: `Jugador "${name}" agregado.` };
}

// ── Partidos ──
export async function addMatch(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  if (!isAdmin()) return { ok: false, message: "No autorizado." };
  const home = String(formData.get("home_team") ?? "").trim();
  const away = String(formData.get("away_team") ?? "").trim();
  const kickoff = String(formData.get("kickoff_at") ?? "");
  if (!home || !away || !kickoff)
    return { ok: false, message: "Faltan datos del partido." };
  const { error } = await supabaseAdmin().from("matches").insert({
    stage: String(formData.get("stage") ?? "Fase de grupos"),
    home_team: home,
    away_team: away,
    kickoff_at: new Date(kickoff).toISOString(),
  });
  if (error) return { ok: false, message: "No se pudo crear el partido." };
  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true, message: `Partido ${home} vs ${away} creado.` };
}

// ── Captura de resultado (recalcula puntos automáticamente) ──
export async function setResult(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  if (!isAdmin()) return { ok: false, message: "No autorizado." };
  const matchId = String(formData.get("match_id") ?? "");
  const clear = formData.get("clear") === "1";
  const home = formData.get("home_score");
  const away = formData.get("away_score");
  if (!matchId) return { ok: false, message: "Elige un partido." };
  if (!clear && (home === "" || away === "" || home === null || away === null))
    return { ok: false, message: "Captura ambos marcadores." };

  const { error } = await supabaseAdmin()
    .from("matches")
    .update({
      home_score: clear ? null : Number(home),
      away_score: clear ? null : Number(away),
    })
    .eq("id", matchId);
  if (error) return { ok: false, message: "No se pudo guardar el resultado." };

  revalidatePath("/");
  revalidatePath("/tabla");
  revalidatePath(`/partido/${matchId}`);
  revalidatePath("/admin");
  return {
    ok: true,
    message: clear
      ? "Resultado borrado."
      : `Resultado ${home}–${away} guardado y puntos recalculados.`,
  };
}
