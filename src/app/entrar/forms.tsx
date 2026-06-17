"use client";

import { useFormState, useFormStatus } from "react-dom";
import { registerPlayer, loginPlayer, type FormState } from "./actions";

const initial: FormState = { ok: false, message: "" };

const inputCls =
  "w-full rounded-lg border border-line/50 bg-pitch px-3 py-2 text-chalk placeholder:text-chalk/30 focus:border-amber focus:outline-none";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="w-full rounded-lg bg-amber px-4 py-2 font-semibold text-pitch transition hover:brightness-110 disabled:opacity-60"
    >
      {pending ? "Un momento…" : label}
    </button>
  );
}

function Error({ msg }: { msg: string }) {
  if (!msg) return null;
  return <p className="text-sm text-red-400">{msg}</p>;
}

export function LoginForm() {
  const [state, action] = useFormState(loginPlayer, initial);
  return (
    <form action={action} className="space-y-3">
      <input name="name" placeholder="Tu nombre" className={inputCls} required />
      <input
        name="pin"
        type="password"
        placeholder="Tu contraseña"
        className={inputCls}
        required
      />
      <Submit label="Entrar" />
      <Error msg={state.message} />
    </form>
  );
}

export function RegisterForm() {
  const [state, action] = useFormState(registerPlayer, initial);
  return (
    <form action={action} className="space-y-3">
      <input name="name" placeholder="Tu nombre" className={inputCls} required />
      <input
        name="pin"
        type="password"
        placeholder="Crea una contraseña (mín. 4)"
        className={inputCls}
        required
      />
      <Submit label="Crear mi acceso" />
      <Error msg={state.message} />
    </form>
  );
}
