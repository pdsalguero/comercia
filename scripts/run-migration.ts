/**
 * Ejecuta la migración de listing_favorites directamente en Postgres
 * npx tsx scripts/run-migration.ts
 */
import postgres from "postgres";

const DB_URL = process.env.DATABASE_URL ?? process.env.DIRECT_URL ?? "";

if (!DB_URL) {
  console.error(`
❌  No se encontró DATABASE_URL ni DIRECT_URL en las variables de entorno.

Agregá una de estas líneas a tu .env.local:

  DATABASE_URL=postgresql://postgres:[TU_PASSWORD]@db.hbeswalibpblqkrdqczh.supabase.co:5432/postgres

Encontrás la contraseña en:
  Supabase Dashboard → Settings → Database → Connection string
  `);
  process.exit(1);
}

async function main() {
  const sql = postgres(DB_URL, { ssl: "require", max: 1 });

  try {
    console.log("🔌  Conectando a la base de datos...");

    await sql`
      CREATE TABLE IF NOT EXISTS public.listing_favorites (
        user_id    uuid NOT NULL REFERENCES auth.users(id)      ON DELETE CASCADE,
        listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
        created_at timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (user_id, listing_id)
      )
    `;
    console.log("  ✓  Tabla listing_favorites creada");

    await sql`ALTER TABLE public.listing_favorites ENABLE ROW LEVEL SECURITY`;
    console.log("  ✓  RLS habilitado");

    await sql`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='listing_favorites' AND policyname='select_own') THEN
          CREATE POLICY "select_own" ON public.listing_favorites FOR SELECT USING (auth.uid() = user_id);
        END IF;
      END $$
    `;

    await sql`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='listing_favorites' AND policyname='insert_own') THEN
          CREATE POLICY "insert_own" ON public.listing_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
        END IF;
      END $$
    `;

    await sql`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='listing_favorites' AND policyname='delete_own') THEN
          CREATE POLICY "delete_own" ON public.listing_favorites FOR DELETE USING (auth.uid() = user_id);
        END IF;
      END $$
    `;
    console.log("  ✓  Políticas RLS creadas");

    await sql`CREATE INDEX IF NOT EXISTS idx_fav_user    ON public.listing_favorites(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_fav_listing ON public.listing_favorites(listing_id)`;
    console.log("  ✓  Índices creados");

    console.log("\n✅  Migración completada con éxito.");
  } catch (err: any) {
    console.error("❌  Error:", err.message);
  } finally {
    await sql.end();
  }
}

main();
