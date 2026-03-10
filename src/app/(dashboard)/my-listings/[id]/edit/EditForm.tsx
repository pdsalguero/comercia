"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { getCategoryConfig } from "@/lib/category-config";

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

export function EditForm({ listing, images: initialImages, onSave, onDeleteImage, onAddImage }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [images, setImages] = useState(initialImages);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Category-specific fields
  const catConfig = getCategoryConfig(listing.category_id);
  const [attrs, setAttrs] = useState<Record<string, any>>(listing.attributes ?? {});

  function setAttr(key: string, value: any) {
    setAttrs(prev => ({ ...prev, [key]: value }));
  }

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
      } catch { /* ignore individual failures */ }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Error */}
      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "12px 16px", fontSize: "13px", color: "#dc2626" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Core fields */}
      <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc", fontSize: "13px", fontWeight: 700, color: "#334155" }}>
          📝 Información principal
        </div>
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>

          <div>
            <label style={lbl}>Título *</label>
            <input name="title" defaultValue={listing.title} required style={inp} placeholder="Título del aviso..." />
          </div>

          <div>
            <label style={lbl}>Descripción</label>
            <textarea
              name="description"
              defaultValue={listing.description ?? ""}
              rows={4}
              style={{ ...inp, resize: "vertical" }}
              placeholder="Describí tu producto con detalle..."
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={lbl}>Precio *</label>
              <input name="price" type="number" defaultValue={listing.price ?? ""} required min={0} style={inp} placeholder="0" />
            </div>
            <div>
              <label style={lbl}>Moneda</label>
              <select name="currency" defaultValue={listing.currency ?? "ARS"} style={{ ...inp, appearance: "none" }}>
                {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={lbl}>Condición</label>
              <select name="condition" defaultValue={listing.condition ?? ""} style={{ ...inp, appearance: "none" }}>
                <option value="">Sin especificar</option>
                {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Zona / Barrio</label>
              <input name="neighborhood" defaultValue={listing.neighborhood ?? ""} style={inp} placeholder="Ej: Rivadavia, Capital..." />
            </div>
          </div>
        </div>
      </div>

      {/* Category-specific attributes */}
      {catConfig && catConfig.fields.length > 0 && (
        <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc", fontSize: "13px", fontWeight: 700, color: "#334155" }}>
            {catConfig.icon} Detalles de {catConfig.name}
          </div>
          <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {catConfig.fields.map(field => (
              <div key={field.key} style={field.type === "checkbox" ? { display: "flex", alignItems: "center", gap: "8px", gridColumn: "span 1" } : {}}>
                {field.type === "checkbox" ? (
                  <>
                    <input
                      type="checkbox"
                      id={field.key}
                      checked={!!attrs[field.key]}
                      onChange={e => setAttr(field.key, e.target.checked)}
                      style={{ width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    <label htmlFor={field.key} style={{ fontSize: "13px", color: "#334155", cursor: "pointer" }}>{field.label}</label>
                  </>
                ) : field.type === "select" ? (
                  <>
                    <label style={lbl}>{field.label}{field.required && <span style={{ color: "#dc2626" }}> *</span>}</label>
                    <select
                      value={attrs[field.key] ?? ""}
                      onChange={e => setAttr(field.key, e.target.value)}
                      style={{ ...inp, appearance: "none" }}
                    >
                      <option value="">Seleccionar...</option>
                      {field.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </>
                ) : (
                  <>
                    <label style={lbl}>{field.label}{field.unit ? ` (${field.unit})` : ""}</label>
                    <input
                      type={field.type === "number" ? "number" : "text"}
                      value={attrs[field.key] ?? ""}
                      onChange={e => setAttr(field.key, e.target.value)}
                      placeholder={field.placeholder ?? ""}
                      style={inp}
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photos */}
      <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc", fontSize: "13px", fontWeight: 700, color: "#334155" }}>
          🖼️ Fotos ({images.length})
        </div>
        <div style={{ padding: "16px 20px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "flex-start" }}>
          {images.map(img => (
            <div key={img.id} style={{ position: "relative", width: "100px", height: "100px", flexShrink: 0 }}>
              <img
                src={img.url}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px", border: "1px solid #e2e8f0" }}
              />
              <button
                type="button"
                onClick={() => handleDeleteImage(img)}
                disabled={deletingId === img.id}
                style={{
                  position: "absolute", top: "4px", right: "4px",
                  width: "22px", height: "22px",
                  background: deletingId === img.id ? "#9ca3af" : "#dc2626",
                  color: "#fff", border: "none", borderRadius: "50%",
                  fontSize: "12px", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  lineHeight: 1,
                }}
              >
                {deletingId === img.id ? "…" : "×"}
              </button>
            </div>
          ))}

          {/* Upload tile */}
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            style={{
              width: "100px", height: "100px", flexShrink: 0,
              border: "2px dashed #cbd5e1", borderRadius: "8px",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: "4px",
              cursor: uploading ? "not-allowed" : "pointer",
              background: uploading ? "#f8fafc" : "#fafbfc",
              color: "#94a3b8", fontSize: "11px", fontWeight: 600,
              transition: "border-color 0.15s, background 0.15s",
            }}
            className="hover:border-blue-400 hover:bg-blue-50"
          >
            {uploading ? (
              <span style={{
                width: "20px", height: "20px",
                border: "2px solid #cbd5e1", borderTopColor: "#3483fa",
                borderRadius: "50%", animation: "spin 0.7s linear infinite",
                display: "inline-block",
              }} />
            ) : (
              <>
                <span style={{ fontSize: "22px", lineHeight: 1 }}>+</span>
                <span>Agregar</span>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={handleUploadFiles}
          />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            background: "#f1f5f9", color: "#475569",
            border: "1px solid #e2e8f0", borderRadius: "8px",
            padding: "11px 20px", fontSize: "14px",
            fontWeight: 700, cursor: "pointer",
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          style={{
            background: pending ? "#93c5fd" : "#3483fa",
            color: "#fff", border: "none", borderRadius: "8px",
            padding: "11px 28px", fontSize: "14px",
            fontWeight: 700, cursor: pending ? "not-allowed" : "pointer",
            minWidth: "140px",
          }}
        >
          {pending ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
