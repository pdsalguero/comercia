"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// "Crear cuenta gratis" solo para quien no tiene sesión. El home es estático (sin sesión en el
// servidor), así que se decide en el navegador; mientras tanto no se muestra, para no parpadear.
export function FounderBannerCta() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const { data: sub } = createClient().auth.onAuthStateChange((_event, session) => setLoggedIn(!!session?.user));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (loggedIn !== false) return null;
  return (
    <Link href="/register" className="founder-banner-cta">
      Crear cuenta gratis
    </Link>
  );
}
