"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const STORE_TYPES = [
  { value: "particular",   label: "Vendedor particular" },
  { value: "inmobiliaria", label: "Inmobiliaria" },
  { value: "automotora",   label: "Automotora / Concesionaria" },
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const inputStyle: React.CSSProperties = {
  width: "100%", border: "1.5px solid #e2e8f0", borderRadius: "8px",
  padding: "10px 12px", fontSize: "14px", outline: "none",
  boxSizing: "border-box", background: "#fff", color: "#1e293b",
  fontFamily: "inherit",
};

export default function StorePage() {
  const supabase = createClient();

  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);

  const [isStore,      setIsStore]      = useState(false);
  const [storeName,    setStoreName]    = useState("");
  const [storeSlug,    setStoreSlug]    = useState("");
  const [storeType,    setStoreType]    = useState("tienda");
  const [storeDesc,    setStoreDesc]    = useState("");
  const [storeWa,      setStoreWa]      = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [storeLogo,    setStoreLogo]    = useState("");
  const [storeBanner,  setStoreBanner]  = useState("");
  const [logoUploading,   setLogoUploading]   = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const logoInputRef   = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  async function uploadImage(file: File, kind: "logo" | "banner") {
    const setter    = kind === "logo" ? setStoreLogo    : setStoreBanner;
    const setLoader = kind === "logo" ? setLogoUploading : setBannerUploading;
    setLoader(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("listingId", `store-${kind}`);
      const res = await fetch("/api/images/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        setter(url);
      }
    } finally {
      setLoader(false);
    }
  }

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("store_name, store_slug, store_type, store_description, store_whatsapp, store_address, store_logo_url, store_banner_url, is_store")
        .eq("id", user.id)
        .single();
      if (data) {
        setIsStore(data.is_store ?? false);
        setStoreName(data.store_name ?? "");
        setStoreSlug(data.store_slug ?? "");
        setStoreType(data.store_type ?? "tienda");
        setStoreDesc(data.store_description ?? "");
        setStoreWa(data.store_whatsapp ?? "");
        setStoreAddress(data.store_address ?? "");
        setStoreLogo(data.store_logo_url ?? "");
        setStoreBanner(data.store_banner_url ?? "");
        if (data.store_slug) setSlugEdited(true);
      }
      setLoading(false);
    }
    load();
  }, []);

  function handleNameChange(val: string) {
    setStoreName(val);
    if (!slugEdited) setStoreSlug(slugify(val));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    // Check slug uniqueness (only if changed)
    if (storeSlug) {
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("store_slug", storeSlug)
        .neq("id", user.id)
        .maybeSingle();
      if (existing) {
        setError("Ese nombre de URL ya está en uso. Elegí otro.");
        setSaving(false);
        return;
      }
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        is_store:          isStore,
        store_name:        storeName || null,
        store_slug:        storeSlug || null,
        store_type:        storeType,
        store_description: storeDesc || null,
        store_whatsapp:    storeWa || null,
        store_address:     storeAddress || null,
        store_logo_url:    storeLogo || null,
        store_banner_url:  storeBanner || null,
      })
      .eq("id", user.id);

    setSaving(false);
    if (updateError) {
      setError(updateError.message);
    } else {
      setSaved(true);
      setSlugEdited(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  if (loading) {
    return <div style={{ padding: "40px", color: "#94a3b8", fontSize: "14px" }}>Cargando...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#333", margin: 0 }}>Mi Tienda</h1>
        {isStore && storeSlug && (
          <Link
            href={`/tienda/${storeSlug}`}
            target="_blank"
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              background: "#f0f4ff", border: "1.5px solid #c7d2fe",
              borderRadius: "8px", padding: "7px 14px",
              fontSize: "13px", fontWeight: 700, color: "#6366f1",
              textDecoration: "none", whiteSpace: "nowrap",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Ver mi tienda
          </Link>
        )}
      </div>

      {/* Toggle card */}
      <div style={{ background: "#fff", borderRadius: "10px", padding: "20px 24px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b" }}>Tienda virtual activa</div>
          <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
            Al activarla, tu perfil tendrá una página pública de tienda con tu logo, banner y descripción.
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsStore(v => !v)}
          style={{
            width: "48px", height: "26px", borderRadius: "20px", border: "none", cursor: "pointer",
            background: isStore ? "#6366f1" : "#cbd5e1",
            position: "relative", flexShrink: 0, transition: "background 0.2s",
          }}
        >
          <span style={{
            position: "absolute", top: "3px",
            left: isStore ? "25px" : "3px",
            width: "20px", height: "20px", borderRadius: "50%",
            background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            transition: "left 0.2s",
          }} />
        </button>
      </div>

      {/* Store form */}
      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ background: "#fff", borderRadius: "10px", padding: "24px", border: "1px solid #e2e8f0", opacity: isStore ? 1 : 0.5, pointerEvents: isStore ? "auto" : "none" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b", margin: "0 0 20px" }}>Información de la tienda</h2>

          {saved && (
            <div style={{ background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#16a34a", marginBottom: "16px" }}>
              ✅ Tienda guardada correctamente
              {isStore && storeSlug && (
                <span> · <Link href={`/tienda/${storeSlug}`} target="_blank" style={{ color: "#2563eb", fontWeight: 700 }}>Ver tienda →</Link></span>
              )}
            </div>
          )}
          {error && (
            <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#dc2626", marginBottom: "16px" }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "6px" }}>
                Nombre de la tienda *
              </label>
              <input
                type="text" value={storeName}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="Ej: Automotora San Juan"
                style={inputStyle}
                required={isStore}
              />
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "6px" }}>
                URL de la tienda *
              </label>
              <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #e2e8f0", borderRadius: "8px", overflow: "hidden", background: "#fff" }}>
                <span style={{ padding: "10px 10px 10px 12px", fontSize: "13px", color: "#94a3b8", background: "#f8fafc", borderRight: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>
                  /tienda/
                </span>
                <input
                  type="text" value={storeSlug}
                  onChange={e => { setStoreSlug(slugify(e.target.value)); setSlugEdited(true); }}
                  placeholder="mi-tienda"
                  style={{ flex: 1, border: "none", outline: "none", padding: "10px 12px", fontSize: "14px", fontFamily: "inherit" }}
                  required={isStore}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "6px" }}>
                Tipo de tienda
              </label>
              <select
                value={storeType}
                onChange={e => setStoreType(e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                {STORE_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "6px" }}>
                WhatsApp de contacto
              </label>
              <input
                type="text" value={storeWa}
                onChange={e => setStoreWa(e.target.value)}
                placeholder="Ej: 2646123456"
                style={inputStyle}
              />
              <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>Sin espacios ni guiones. Solo números.</div>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "6px" }}>
                Dirección física
              </label>
              <input
                type="text" value={storeAddress}
                onChange={e => setStoreAddress(e.target.value)}
                placeholder="Ej: Av. Libertador 1234, San Juan"
                style={inputStyle}
              />
              <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>Opcional. Se mostrará en la página de tu tienda.</div>
            </div>
          </div>

          <div style={{ marginTop: "14px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "6px" }}>
              Descripción
            </label>
            <textarea
              value={storeDesc}
              onChange={e => setStoreDesc(e.target.value)}
              placeholder="Contá de qué se trata tu tienda, qué vendés, dónde estás..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>
        </div>

        {/* Images */}
        <div style={{ background: "#fff", borderRadius: "10px", padding: "24px", border: "1px solid #e2e8f0", opacity: isStore ? 1 : 0.5, pointerEvents: isStore ? "auto" : "none" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b", margin: "0 0 6px" }}>Imágenes</h2>
          <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 20px" }}>JPG, PNG o WEBP. Máx 5 MB por imagen.</p>

          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: "20px", alignItems: "start" }}>

            {/* Logo uploader */}
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "8px" }}>
                Logo de la tienda
              </label>
              <input ref={logoInputRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, "logo"); }} />
              <div
                onClick={() => logoInputRef.current?.click()}
                style={{
                  width: "120px", height: "120px", borderRadius: "14px",
                  border: storeLogo ? "2px solid #e2e8f0" : "2px dashed #cbd5e1",
                  background: storeLogo ? "transparent" : "#f8fafc",
                  cursor: "pointer", overflow: "hidden",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: "6px", position: "relative",
                }}
                className="hover:border-indigo-400"
              >
                {logoUploading ? (
                  <div style={{ fontSize: "12px", color: "#6366f1", fontWeight: 600 }}>Subiendo...</div>
                ) : storeLogo ? (
                  <>
                    <img src={storeLogo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{
                      position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      opacity: 0, transition: "opacity 0.15s",
                    }} className="hover:opacity-100">
                      <span style={{ color: "#fff", fontSize: "12px", fontWeight: 700 }}>Cambiar</span>
                    </div>
                  </>
                ) : (
                  <>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span style={{ fontSize: "11px", color: "#94a3b8", textAlign: "center", lineHeight: 1.3 }}>Subir logo</span>
                  </>
                )}
              </div>
              {storeLogo && (
                <button type="button" onClick={() => setStoreLogo("")}
                  style={{ marginTop: "6px", fontSize: "11px", color: "#dc2626", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  ✕ Quitar logo
                </button>
              )}
            </div>

            {/* Banner uploader */}
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "8px" }}>
                Banner de la tienda
              </label>
              <input ref={bannerInputRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, "banner"); }} />
              <div
                onClick={() => bannerInputRef.current?.click()}
                style={{
                  width: "100%", height: "120px", borderRadius: "14px",
                  border: storeBanner ? "2px solid #e2e8f0" : "2px dashed #cbd5e1",
                  background: storeBanner ? "transparent" : "#f8fafc",
                  cursor: "pointer", overflow: "hidden",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: "6px", position: "relative",
                }}
                className="hover:border-indigo-400"
              >
                {bannerUploading ? (
                  <div style={{ fontSize: "12px", color: "#6366f1", fontWeight: 600 }}>Subiendo...</div>
                ) : storeBanner ? (
                  <>
                    <img src={storeBanner} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{
                      position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      opacity: 0, transition: "opacity 0.15s",
                    }} className="hover:opacity-100">
                      <span style={{ color: "#fff", fontSize: "12px", fontWeight: 700 }}>Cambiar banner</span>
                    </div>
                  </>
                ) : (
                  <>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>Subir banner · Recomendado 1200×300 px</span>
                  </>
                )}
              </div>
              {storeBanner && (
                <button type="button" onClick={() => setStoreBanner("")}
                  style={{ marginTop: "6px", fontSize: "11px", color: "#dc2626", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  ✕ Quitar banner
                </button>
              )}
            </div>

          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              background: saving ? "#a5b4fc" : "#6366f1",
              color: "#fff", border: "none", borderRadius: "8px",
              padding: "11px 28px", fontWeight: 700, fontSize: "14px",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Guardando..." : "Guardar tienda"}
          </button>

          {isStore && storeSlug && (
            <Link
              href={`/tienda/${storeSlug}`}
              target="_blank"
              style={{ fontSize: "13px", color: "#6366f1", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Ver tienda en vivo
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}
