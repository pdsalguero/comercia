"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const linkStyle: React.CSSProperties = { display: "block", fontSize: "12px", color: "#94a3b8", textDecoration: "none", marginBottom: "4px" };

// Columna "Mi cuenta" del pie. El footer se sirve en páginas cacheadas (sin sesión en el servidor),
// así que la sesión se lee en el navegador: con sesión, "Mi panel / Salir"; sin sesión, "Ingresar / Registrarse".
export function FooterAccountLinks() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => setLoggedIn(!!session?.user));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  const common = [
    { label: "Mis avisos", href: "/dashboard/my-listings" },
    { label: "Favoritos", href: "/dashboard/favorites" },
  ];

  return (
    <>
      {loggedIn ? (
        <Link href="/dashboard" style={linkStyle}>Mi panel</Link>
      ) : (
        <>
          <Link href="/login" style={linkStyle}>Ingresar</Link>
          <Link href="/register" style={linkStyle}>Registrarse</Link>
        </>
      )}
      {common.map((l) => (
        <Link key={l.href} href={l.href} style={linkStyle}>{l.label}</Link>
      ))}
      {loggedIn && (
        <button
          type="button"
          onClick={signOut}
          style={{ ...linkStyle, background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
        >
          Salir
        </button>
      )}
    </>
  );
}
