import { cookies } from "next/headers";

export const ADMIN_COOKIE = "quiniela_admin";

export function adminToken(): string {
  return Buffer.from(process.env.ADMIN_SESSION_SECRET ?? "").toString("base64");
}

export function isAdmin(): boolean {
  return cookies().get(ADMIN_COOKIE)?.value === adminToken();
}

export function requireAdmin(): void {
  if (!isAdmin()) throw new Error("No autorizado");
}