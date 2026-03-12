// Endpoint de migración temporal — eliminar después de ejecutar
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const steps = [
    {
      name: "create table",
      sql: `CREATE TABLE IF NOT EXISTS public.listing_favorites (
        user_id    uuid NOT NULL REFERENCES auth.users(id)      ON DELETE CASCADE,
        listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
        created_at timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (user_id, listing_id)
      );`,
    },
    {
      name: "enable rls",
      sql: `ALTER TABLE public.listing_favorites ENABLE ROW LEVEL SECURITY;`,
    },
    {
      name: "policy select",
      sql: `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='listing_favorites' AND policyname='select_own') THEN
          CREATE POLICY "select_own" ON public.listing_favorites FOR SELECT USING (auth.uid() = user_id);
        END IF;
      END $$;`,
    },
    {
      name: "policy insert",
      sql: `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='listing_favorites' AND policyname='insert_own') THEN
          CREATE POLICY "insert_own" ON public.listing_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
        END IF;
      END $$;`,
    },
    {
      name: "policy delete",
      sql: `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='listing_favorites' AND policyname='delete_own') THEN
          CREATE POLICY "delete_own" ON public.listing_favorites FOR DELETE USING (auth.uid() = user_id);
        END IF;
      END $$;`,
    },
    {
      name: "index user",
      sql: `CREATE INDEX IF NOT EXISTS idx_fav_user ON public.listing_favorites(user_id);`,
    },
    {
      name: "index listing",
      sql: `CREATE INDEX IF NOT EXISTS idx_fav_listing ON public.listing_favorites(listing_id);`,
    },
  ];

  const results: { name: string; ok: boolean; error?: string }[] = [];

  for (const step of steps) {
    const { error } = await sb.rpc("query", { query: step.sql }).then(
      () => ({ error: null }),
      async () => {
        // fallback: try via raw fetch to PostgREST SQL endpoint
        const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_ddl`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY!,
            "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
          },
          body: JSON.stringify({ sql: step.sql }),
        });
        if (!res.ok) return { error: await res.text() };
        return { error: null };
      }
    );
    results.push({ name: step.name, ok: !error, error: error ?? undefined });
  }

  // Verify table was created
  const { error: checkErr } = await sb.from("listing_favorites").select("user_id").limit(1);
  const tableExists = !checkErr || checkErr.message.includes("0 rows");

  return NextResponse.json({
    message: tableExists
      ? "✅ Tabla listing_favorites creada correctamente"
      : "❌ La tabla no se pudo crear",
    tableExists,
    steps: results,
  });
}
