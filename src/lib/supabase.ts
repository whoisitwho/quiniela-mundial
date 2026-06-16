import { createClient } from "@supabase/supabase-js";

// Cliente público (lectura). Usa la clave ANON. Seguro de exponer:
// RLS sólo permite SELECT, así que esta clave no puede escribir nada.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Cliente de administración (escritura). Usa la SERVICE_ROLE key, que
// ignora RLS. ⚠️ NUNCA importar esto desde un componente cliente:
// sólo se usa dentro de Server Actions / código de servidor.
export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
