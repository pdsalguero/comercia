/**
 * Crea 3 usuarios de prueba en Supabase Auth
 * Ejecutar: npx tsx scripts/create-users.ts
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://hbeswalibpblqkrdqczh.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiZXN3YWxpYnBibHFrcmRxY3poIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjYzNzgzOSwiZXhwIjoyMDg4MjEzODM5fQ.N7NFhS6hSfOpReke3Sg4DNnf2w2ni286JvVjReI0qiA";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const USERS = [
  { email: "carlos.mendez@demo.com",  password: "Demo1234!", full_name: "Carlos Méndez" },
  { email: "laura.garcia@demo.com",   password: "Demo1234!", full_name: "Laura García"  },
  { email: "martin.lopez@demo.com",   password: "Demo1234!", full_name: "Martín López"  },
];

async function main() {
  console.log("👥  Creando usuarios de prueba...\n");

  for (const u of USERS) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.full_name },
    });

    if (error) {
      console.error(`❌  ${u.email}: ${error.message}`);
      continue;
    }

    console.log(`✅  ${u.full_name}`);
    console.log(`    email:    ${u.email}`);
    console.log(`    password: ${u.password}`);
    console.log(`    id:       ${data.user.id}\n`);
  }
}

main().catch(console.error);
