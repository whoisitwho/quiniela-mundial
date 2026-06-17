"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import {
  hashPin,
  verifyPin,
  setPlayerCookie,
  clearPlayerCookie,
} from "@/lib/playerAuth";

export type FormState = { ok: boolean; message: string };

// Escapa comodines de ILIKE para que el nombre se compare literal.
const literal = (s: string) => s.replace(/[\\%_]/g, (m) => "\\" + m);

export async function registerPlayer(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const pin = String(formData.get("pin") ?? "");
  if (name.length < 2) return { ok: false, message: "Escribe tu nombre." };
  if (pin.length < 4)
    return { ok: false, message: "La contraseña debe tener al menos 4 caracteres." };

  const db = supabaseAdmin();
  const { data: existing } = await db
    .from("players")
    .select("id, pin_hash")
    .ilike("name", literal(name))
    .maybeSingle();

  let playerId: string;
  if (!existing) {
    const { data, error } = await db
      .from("players")
      .insert({ name, pin_hash: hashPin(pin) })
      .select("id")
      .single();
    if (error || !data)
      return { ok: false, message: "No se pudo registrar. Intenta con otro nombre." };
    playerId = data.id;
  } else if (!existing.pin_hash) {
    const { error } = await db
      .from("players")
      .update({ pin_hash: hashPin(pin) })
      .eq("id", existing.id);
    if (error) return { ok: false, message: "No se pudo registrar. Intenta de nuevo." };
    playerId = existing.id;
  } else {
    return { ok: false, message: "Ese nombre ya está registrado. Inicia sesión." };
  }

  setPlayerCookie(playerId);
  redirect("/mis-predicciones");
}

export async function loginPlayer(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const pin = String(formData.get("pin") ?? "");

  const { data: player } = await supabaseAdmin()
    .from("players")
    .select("id, pin_hash")
    .ilike("name", literal(name))
    .maybeSingle();

  if (!player || !verifyPin(pin, player.pin_hash)) {
    return { ok: false, message: "Nombre o contraseña incorrectos." };
  }
  setPlayerCookie(player.id);
  redirect("/mis-predicciones");
}

export async function logoutPlayer() {
  clearPlayerCookie();
  redirect("/entrar");
}
