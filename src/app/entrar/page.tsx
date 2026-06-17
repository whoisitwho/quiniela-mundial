import { redirect } from "next/navigation";
import { getPlayerId } from "@/lib/playerAuth";
import { LoginForm, RegisterForm } from "./forms";

export const dynamic = "force-dynamic";

export default function EntrarPage() {
  if (getPlayerId()) redirect("/mis-predicciones");

  return (
    <div className="mx-auto max-w-md space-y-8 pt-4">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
          Entra a la quiniela
        </h1>
        <p className="mt-1 text-sm text-chalk/60">
          Regístrate para guardar tus predicciones.
        </p>
      </div>

      <section className="rounded-2xl border border-line/40 bg-field/40 p-5">
        <h2 className="mb-3 font-display text-lg font-bold uppercase tracking-wide text-amber/90">
          Crear acceso
        </h2>
        <RegisterForm />
        <p className="mt-2 text-xs text-chalk/40">
          Si el admin ya te dio de alta, usa el mismo nombre para reclamar tu lugar.
        </p>
      </section>

      <section className="rounded-2xl border border-line/40 bg-field/40 p-5">
        <h2 className="mb-3 font-display text-lg font-bold uppercase tracking-wide text-chalk/80">
          Ya tengo acceso
        </h2>
        <LoginForm />
      </section>
    </div>
  );
}
