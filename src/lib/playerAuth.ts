import { cookies } from "next/headers";
import crypto from "crypto";

const PLAYER_COOKIE = "quiniela_player";
const secret = () => process.env.ADMIN_SESSION_SECRET ?? "cambia-este-secreto";

// ── Hash de contraseña (pbkdf2 + salt). Nunca se guarda en texto plano. ──
export function hashPin(pin: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(pin, salt, 100_000, 32, "sha256").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPin(pin: string, stored: string | null | undefined): boolean {
  if (!stored) return false;
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const test = crypto.pbkdf2Sync(pin, salt, 100_000, 32, "sha256").toString("hex");
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(test, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// ── Cookie de sesión firmada con HMAC (no se puede falsificar) ──
function sign(value: string): string {
  return crypto.createHmac("sha256", secret()).update(value).digest("hex");
}

export function setPlayerCookie(playerId: string) {
  cookies().set(PLAYER_COOKIE, `${playerId}.${sign(playerId)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 60, // 60 días
  });
}

export function clearPlayerCookie() {
  cookies().delete(PLAYER_COOKIE);
}

// Devuelve el id del jugador si la cookie es válida, o null.
export function getPlayerId(): string | null {
  const raw = cookies().get(PLAYER_COOKIE)?.value;
  if (!raw) return null;
  const i = raw.lastIndexOf(".");
  if (i < 0) return null;
  const id = raw.slice(0, i);
  const sig = raw.slice(i + 1);
  return sign(id) === sig ? id : null;
}
