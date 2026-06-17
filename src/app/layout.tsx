import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getPlayerId } from "@/lib/playerAuth";
import { logoutPlayer } from "./entrar/actions";

const oswald = Oswald({ subsets: ["latin"], variable: "--font-display" });
const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Quiniela Mundial 2026",
  description: "Quiniela del Mundial entre amigos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const signedIn = Boolean(getPlayerId());

  return (
    <html lang="es" className={`${oswald.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-pitch text-chalk antialiased">
        <header className="border-b border-line/40 bg-field/60 backdrop-blur">
          <nav className="mx-auto flex max-w-3xl flex-wrap items-center gap-1 px-4 py-3">
            <Link
              href="/"
              className="mr-auto font-display text-xl font-bold uppercase tracking-wide"
            >
              Quiniela <span className="text-amber">2026</span>
            </Link>
            <NavLink href="/">Partidos</NavLink>
            <NavLink href="/tabla">Tabla</NavLink>
            {signedIn ? (
              <>
                <NavLink href="/mis-predicciones">Mis predicciones</NavLink>
                <form action={logoutPlayer}>
                  <button className="rounded-md px-3 py-1.5 text-sm font-medium uppercase tracking-wide text-chalk/50 transition hover:text-amber">
                    Salir
                  </button>
                </form>
              </>
            ) : (
              <NavLink href="/entrar">Entrar</NavLink>
            )}
          </nav>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-3xl px-4 py-8 text-center text-xs text-chalk/40">
          3 pts marcador exacto · 1 pt resultado · 0 pts falla
        </footer>
      </body>
    </html>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-1.5 text-sm font-medium uppercase tracking-wide text-chalk/70 transition hover:bg-amber/10 hover:text-amber"
    >
      {children}
    </Link>
  );
}
