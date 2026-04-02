"use client";

import { useState, useTransition, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getCategoryConfig } from "@/lib/category-config";
import { CAR_BRANDS, getModels, getVersions } from "@/lib/vehicle-data";
import { RE_LOCATIONS } from "@/lib/re-locations";

const CONDITIONS = [
  { value: "new",       label: "Nuevo / A estrenar" },
  { value: "like_new",  label: "Como nuevo / Excelente" },
  { value: "very_good", label: "Muy bueno" },
  { value: "good",      label: "Bueno" },
  { value: "fair",      label: "Regular / A refaccionar" },
  { value: "for_parts", label: "Para repuestos" },
];

const CURRENCIES = [
  { value: "ARS", label: "$ ARS" },
  { value: "USD", label: "U$S USD" },
];


const FUELS = [
  { value: "nafta",      label: "Nafta" },
  { value: "diesel",     label: "Diésel" },
  { value: "gnc",        label: "GNC" },
  { value: "nafta+gnc",  label: "Nafta + GNC" },
  { value: "electrico",  label: "Eléctrico" },
  { value: "hibrido",    label: "Híbrido" },
  { value: "glp",        label: "GLP" },
];
const TRANSMISIONS = [
  { value: "manual",     label: "Manual" },
  { value: "automatica", label: "Automática" },
  { value: "cvt",        label: "CVT" },
];

interface Image { id: string; url: string; position: number }

interface Props {
  listing: {
    id: string;
    title: string;
    description: string | null;
    price: number | null;
    currency: string | null;
    condition: string | null;
    neighborhood: string | null;
    category_id: number;
    attributes: Record<string, any> | null;
  };
  images: Image[];
  onSave: (formData: FormData) => Promise<{ error?: string }>;
  onDeleteImage: (imageId: string) => Promise<void>;
  onAddImage: (url: string) => Promise<void>;
}

const inp: React.CSSProperties = {
  width: "100%", border: "1.5px solid #e2e8f0", borderRadius: "8px",
  padding: "9px 12px", fontSize: "14px", color: "#1e293b",
  background: "#f8fafc", outline: "none", boxSizing: "border-box",
  fontFamily: "inherit",
};

const lbl: React.CSSProperties = {
  fontSize: "11px", fontWeight: 700, color: "#64748b",
  textTransform: "uppercase", letterSpacing: "0.5px",
  display: "block", marginBottom: "6px",
};

const sel: React.CSSProperties = { ...inp, appearance: "none" as const };

export function EditForm({ listing, images: initialImages, onSave, onDeleteImage, onAddImage }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [images, setImages] = useState(initialImages);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const catConfig = getCategoryConfig(listing.category_id);
  const [attrs, setAttrs] = useState<Record<string, any>>(listing.attributes ?? {});
  const isVehicle = listing.category_id === 2;
  const isRealEstate = listing.category_id === 3;

  // Province derived from existing zone slug
  const [province, setProvince] = useState<string>(() => {
    const zone = (listing.attributes?.zone ?? listing.attributes?.neighborhood) as string | undefined;
    if (!zone) return "";
    return Object.entries(RE_LOCATIONS).find(([, p]) => p.zones.some(z => z.value === zone))?.[0] ?? "";
  });
  const localityOptions = province ? (RE_LOCATIONS[province]?.zones ?? []) : [];

  function setAttr(key: string, value: any) {
    setAttrs(prev => ({ ...prev, [key]: value }));
  }

  const vehicleModels = useMemo(() => getModels(attrs.brand ?? ""), [attrs.brand]);
  const vehicleVersions = useMemo(() => getVersions(attrs.brand ?? "", attrs.model ?? ""), [attrs.brand, attrs.model]);

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("attributes", JSON.stringify(attrs));
    startTransition(async () => {
      const result = await onSave(fd);
      if (result?.error) {
        setError(result.error);
      } else {
        router.push(`/listings/${listing.id}`);
      }
    });
  }

  async function handleDeleteImage(img: Image) {
    setDeletingId(img.id);
    await onDeleteImage(img.id);
    setImages(prev => prev.filter(i => i.id !== img.id));
    setDeletingId(null);
  }

  async function handleUploadFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("listingId", listing.id);
      try {
        const res = await fetch("/api/images/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.url) {
          await onAddImage(data.url);
          setImages(prev => [...prev, { id: data.url, url: data.url, position: prev.length }]);
        }
      } catch { /* ignore */ }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const actionButtons = (
    <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
      <button type="button" onClick={() => router.back()} style={{
        background: "#f1f5f9", color: "#475569",
        border: "1px solid #e2e8f0", borderRadius: "8px",
        padding: "11px 20px", fontSize: "14px", fontWeight: 700, cursor: "pointer",
      }}>
        Cancelar
      </button>
      <button type="submit" disabled={pending} style={{
        background: pending ? "#93c5fd" : "#3483fa",
        color: "#fff", border: "none", borderRadius: "8px",
        padding: "11px 28px", fontSize: "14px",
        fontWeight: 700, cursor: pending ? "not-allowed" : "pointer",
        minWidth: "140px",
      }}>
        {pending ? "Guardando..." : "Guardar cambios"}
      </button>
    </div>
  );

  return (
    <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {actionButtons}

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "12px 16px", fontSize: "13px", color: "#dc2626" }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Photos ── */}
      <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc", fontSize: "13px", fontWeight: 700, color: "#334155" }}>
          🖼️ Fotos ({images.length})
        </div>
        <div style={{ padding: "16px 20px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "flex-start" }}>
          {images.map(img => (
            <div key={img.id} style={{ position: "relative", width: "100px", height: "100px", flexShrink: 0 }}>
              <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px", border: "1px solid #e2e8f0" }} />
              <button type="button" onClick={() => handleDeleteImage(img)} disabled={deletingId === img.id} style={{
                position: "absolute", top: "4px", right: "4px",
                width: "22px", height: "22px",
                background: deletingId === img.id ? "#9ca3af" : "#dc2626",
                color: "#fff", border: "none", borderRadius: "50%",
                fontSize: "12px", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {deletingId === img.id ? "…" : "×"}
              </button>
            </div>
          ))}
          <div onClick={() => !uploading && fileInputRef.current?.click()} style={{
            width: "100px", height: "100px", flexShrink: 0,
            border: "2px dashed #cbd5e1", borderRadius: "8px",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "4px",
            cursor: uploading ? "not-allowed" : "pointer",
            background: uploading ? "#f8fafc" : "#fafbfc",
            color: "#94a3b8", fontSize: "11px", fontWeight: 600,
          }}>
            {uploading ? (
              <span style={{ width: "20px", height: "20px", border: "2px solid #cbd5e1", borderTopColor: "#3483fa", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
            ) : (
              <><span style={{ fontSize: "22px", lineHeight: 1 }}>+</span><span>Agregar</span></>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleUploadFiles} />
        </div>
      </div>

      {/* ── Core fields ── */}
      <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc", fontSize: "13px", fontWeight: 700, color: "#334155" }}>
          📝 Información principal
        </div>
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 120px", gap: "12px", alignItems: "start" }}>
            <div>
              <label style={lbl}>Título *</label>
              <input name="title" defaultValue={listing.title} required style={inp} placeholder="Título del aviso..." />
            </div>
            <div>
              <label style={lbl}>Precio *</label>
              <input name="price" type="text" inputMode="numeric" defaultValue={listing.price ?? ""} required style={inp} placeholder="0" onChange={e => { e.target.value = e.target.value.replace(/[^0-9]/g, '') }} />
            </div>
            <div>
              <label style={lbl}>Moneda</label>
              <select name="currency" defaultValue={listing.currency ?? "ARS"} style={sel}>
                {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={lbl}>Descripción</label>
            <textarea name="description" defaultValue={listing.description ?? ""} rows={4} style={{ ...inp, resize: "vertical" }} placeholder="Describí tu producto con detalle..." />
          </div>

          {/* Condition + zone for non-vehicle */}
          {!isVehicle && !isRealEstate && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={lbl}>Condición</label>
                <select name="condition" defaultValue={listing.condition ?? ""} style={sel}>
                  <option value="">Sin especificar</option>
                  {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Zona / Barrio</label>
                <input name="neighborhood" defaultValue={listing.neighborhood ?? ""} style={inp} placeholder="Ej: Rivadavia, Capital..." />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── VEHICLE FIELDS ── */}
      {isVehicle && (
        <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc", fontSize: "13px", fontWeight: 700, color: "#334155" }}>
            🚗 Detalles del vehículo
          </div>
          <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>

            {/* Tipo */}
            <div>
              <label style={lbl}>Tipo <span style={{ color: "#dc2626" }}>*</span></label>
              <select value={attrs.sub_category ?? ""} onChange={e => setAttr("sub_category", e.target.value)} style={sel}>
                <option value="">Seleccionar...</option>
                <option value="auto">Auto</option>
                <option value="camioneta">Pickup / SUV / Utilitario</option>
                <option value="moto">Moto</option>
                <option value="cuatriciclo">Cuatriciclo</option>
                <option value="utv">Areneros/UTV</option>
                <option value="camion">Camión</option>
                <option value="nautica">Náutica</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            {/* Marca */}
            <div>
              <label style={lbl}>Marca <span style={{ color: "#dc2626" }}>*</span></label>
              <select value={attrs.brand ?? ""} onChange={e => { setAttr("brand", e.target.value); setAttr("model", ""); }} style={sel}>
                <option value="">Seleccionar...</option>
                {CAR_BRANDS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>

            {/* Modelo */}
            <div>
              <label style={lbl}>Modelo <span style={{ color: "#dc2626" }}>*</span></label>
              {vehicleModels.length > 0 ? (
                <select value={attrs.model ?? ""} onChange={e => setAttr("model", e.target.value)} style={sel}>
                  <option value="">Seleccionar...</option>
                  {vehicleModels.map(m => <option key={m} value={m}>{m}</option>)}
                  <option value="Otro">Otro</option>
                </select>
              ) : (
                <input value={attrs.model ?? ""} onChange={e => setAttr("model", e.target.value)} placeholder="Up!, Hilux, Corolla..." style={inp} />
              )}
            </div>

            {/* Versión */}
            <div>
              <label style={lbl}>Versión</label>
              {vehicleVersions.length > 0 ? (
                <select value={attrs.version ?? ""} onChange={e => setAttr("version", e.target.value)} style={sel}>
                  <option value="">Sin especificar</option>
                  {vehicleVersions.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              ) : (
                <input value={attrs.version ?? ""} onChange={e => setAttr("version", e.target.value)} placeholder="Move, SR 4x4..." style={inp} />
              )}
            </div>

            {/* Año */}
            <div>
              <label style={lbl}>Año <span style={{ color: "#dc2626" }}>*</span></label>
              <select value={attrs.year ?? ""} onChange={e => setAttr("year", Number(e.target.value))} style={sel}>
                <option value="">Seleccionar...</option>
                {Array.from({ length: 40 }, (_, i) => new Date().getFullYear() + 1 - i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Kilómetros */}
            <div>
              <label style={lbl}>Kilómetros <span style={{ color: "#dc2626" }}>*</span></label>
              <div style={{ position: "relative" }}>
                <input type="number" value={attrs.km ?? ""} onChange={e => setAttr("km", e.target.value)} placeholder="0" style={{ ...inp, paddingRight: "36px" }} />
                <span style={{ position: "absolute", right: "11px", top: "50%", transform: "translateY(-50%)", fontSize: "10px", color: "#94a3b8", fontWeight: 700 }}>km</span>
              </div>
            </div>

            {/* Combustible */}
            <div>
              <label style={lbl}>Combustible</label>
              <select value={attrs.fuel ?? ""} onChange={e => setAttr("fuel", e.target.value)} style={sel}>
                <option value="">Seleccionar...</option>
                {FUELS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>

            {/* Transmisión */}
            <div>
              <label style={lbl}>Transmisión</label>
              <select value={attrs.transmission ?? ""} onChange={e => setAttr("transmission", e.target.value)} style={sel}>
                <option value="">Seleccionar...</option>
                {TRANSMISIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            {/* Color */}
            <div>
              <label style={lbl}>Color</label>
              <input value={attrs.color ?? ""} onChange={e => setAttr("color", e.target.value)} placeholder="Gris plata..." style={inp} />
            </div>

            {/* Motor */}
            <div>
              <label style={lbl}>Motor</label>
              <input value={attrs.engine ?? ""} onChange={e => setAttr("engine", e.target.value)} placeholder="1.6, 2.0 TDI..." style={inp} />
            </div>

            {/* Patente */}
            <div>
              <label style={lbl}>Patente</label>
              <input
                value={attrs.patente ?? ""}
                onChange={e => setAttr("patente", e.target.value.toUpperCase())}
                placeholder="PDL187"
                maxLength={8}
                style={{ ...inp, letterSpacing: "2px", fontWeight: 700 }}
              />
              <label style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px", fontSize: "12px", color: "#94a3b8", cursor: "pointer" }}>
                <input type="checkbox" checked={attrs.show_patente ?? false} onChange={e => setAttr("show_patente", e.target.checked)} style={{ accentColor: "#6366f1" }} />
                Mostrar patente en la publicación
              </label>
            </div>

            {/* Provincia */}
            <div>
              <label style={lbl}>Provincia <span style={{ color: "#dc2626" }}>*</span></label>
              <select value={province} onChange={e => { setProvince(e.target.value); setAttr("zone", ""); }} style={sel}>
                <option value="">Seleccioná...</option>
                {Object.entries(RE_LOCATIONS).map(([k, p]) => <option key={k} value={k}>{p.label}</option>)}
              </select>
            </div>

            {/* Localidad */}
            <div>
              <label style={lbl}>Localidad <span style={{ color: "#dc2626" }}>*</span></label>
              <select value={attrs.zone ?? ""} onChange={e => setAttr("zone", e.target.value)} style={sel} disabled={!province}>
                <option value="">{province ? "Seleccioná..." : "Primero elegí provincia"}</option>
                {localityOptions.map(z => <option key={z.value} value={z.value}>{z.label}</option>)}
              </select>
            </div>

            {/* Estado */}
            <div>
              <label style={lbl}>Estado <span style={{ color: "#dc2626" }}>*</span></label>
              <select name="condition" defaultValue={listing.condition ?? ""} style={sel}>
                <option value="">Seleccioná...</option>
                {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            {/* Tipo de vendedor */}
            <div style={{ gridColumn: "span 2" }}>
              <label style={lbl}>Tipo de vendedor</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {[["particular","👤 Particular"],["concesionaria","🏢 Concesionaria"]].map(([v,l]) => (
                  <button key={v} type="button" onClick={() => setAttr("seller_type", v)} style={{
                    flex: 1, padding: "10px", borderRadius: "9px",
                    border: `1.5px solid ${attrs.seller_type === v ? "#2563eb" : "#e2e8f0"}`,
                    background: attrs.seller_type === v ? "#eff6ff" : "#fff",
                    color: attrs.seller_type === v ? "#2563eb" : "#64748b",
                    fontWeight: attrs.seller_type === v ? 700 : 400,
                    fontSize: "13px", cursor: "pointer", fontFamily: "inherit", transition: "all .1s",
                  }}>{l}</button>
                ))}
              </div>
            </div>

            {/* Datos adicionales — pills siempre visibles */}
            <div style={{ gridColumn: "span 2" }}>
              <label style={lbl}>Datos adicionales</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {[
                  ["financing","💳 Financiamiento"],
                  ["negotiable_price","💬 Precio negociable"],
                  ["first_owner","🔑 Único dueño"],
                  ["accepts_trade","🔄 Acepta permuta"],
                  ["has_gnc","⛽ Con GNC"],
                  ["has_alarm","🔒 Con alarma"],
                  ["has_service","🔧 Con service"],
                ].map(([k, l]) => (
                  <button key={k} type="button" onClick={() => setAttr(k, !attrs[k])} style={{
                    padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 600,
                    border: `1.5px solid ${attrs[k] ? "#2563eb" : "#e2e8f0"}`,
                    background: attrs[k] ? "#eff6ff" : "#fff",
                    color: attrs[k] ? "#2563eb" : "#94a3b8",
                    cursor: "pointer", fontFamily: "inherit", transition: "all .1s",
                  }}>{l}</button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── Real estate location ── */}
      {isRealEstate && (
        <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc", fontSize: "13px", fontWeight: 700, color: "#334155" }}>
            📍 Ubicación
          </div>
          <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={lbl}>Provincia <span style={{ color: "#dc2626" }}>*</span></label>
              <select value={province} onChange={e => { setProvince(e.target.value); setAttr("zone", ""); }} style={sel}>
                <option value="">Seleccioná...</option>
                {Object.entries(RE_LOCATIONS).map(([k, p]) => <option key={k} value={k}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Localidad <span style={{ color: "#dc2626" }}>*</span></label>
              <select value={attrs.zone ?? ""} onChange={e => setAttr("zone", e.target.value)} style={sel} disabled={!province}>
                <option value="">{province ? "Seleccioná..." : "Primero elegí provincia"}</option>
                {localityOptions.map(z => <option key={z.value} value={z.value}>{z.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ── NON-VEHICLE category fields ── */}
      {!isVehicle && catConfig && catConfig.fields.length > 0 && (
        <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc", fontSize: "13px", fontWeight: 700, color: "#334155" }}>
            {catConfig.icon} Detalles de {catConfig.name}
          </div>
          <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {catConfig.fields.map(field => (
              <div key={field.key} style={field.type === "checkbox" ? { display: "flex", alignItems: "center", gap: "8px" } : {}}>
                {field.type === "checkbox" ? (
                  <>
                    <input type="checkbox" id={field.key} checked={!!attrs[field.key]} onChange={e => setAttr(field.key, e.target.checked)} style={{ width: "16px", height: "16px", cursor: "pointer" }} />
                    <label htmlFor={field.key} style={{ fontSize: "13px", color: "#334155", cursor: "pointer" }}>{field.label}</label>
                  </>
                ) : field.type === "select" ? (
                  <>
                    <label style={lbl}>{field.label}{field.required && <span style={{ color: "#dc2626" }}> *</span>}</label>
                    <select value={attrs[field.key] ?? ""} onChange={e => setAttr(field.key, e.target.value)} style={sel}>
                      <option value="">Seleccionar...</option>
                      {field.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </>
                ) : field.type === "radio" ? (
                  <>
                    <label style={lbl}>{field.label}</label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {field.options?.map(o => (
                        <button key={o.value} type="button" onClick={() => setAttr(field.key, o.value)} style={{
                          flex: 1, padding: "8px", borderRadius: "8px", fontSize: "12px",
                          border: `1.5px solid ${attrs[field.key] === o.value ? "#2563eb" : "#e2e8f0"}`,
                          background: attrs[field.key] === o.value ? "#eff6ff" : "#fff",
                          color: attrs[field.key] === o.value ? "#2563eb" : "#64748b",
                          fontWeight: attrs[field.key] === o.value ? 700 : 400,
                          cursor: "pointer", fontFamily: "inherit",
                        }}>{o.label}</button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <label style={lbl}>{field.label}{field.unit ? ` (${field.unit})` : ""}</label>
                    <input type={field.type === "number" ? "number" : "text"} value={attrs[field.key] ?? ""} onChange={e => setAttr(field.key, e.target.value)} placeholder={field.placeholder ?? ""} style={inp} />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Actions (bottom) ── */}
      {actionButtons}
    </form>
  );
}
