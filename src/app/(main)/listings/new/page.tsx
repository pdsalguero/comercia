"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CATEGORY_CONFIGS, getCategoryConfig } from "@/lib/category-config";
import { CAR_BRANDS, getModels, getModelPriceRef, getVersions } from "@/lib/vehicle-data";
import { PropertyLocation } from "@/components/listings/PropertyLocation";

// ─── Types ──────────────────────────────────────────────────────
type Step = "upload" | "analyzing" | "form" | "publishing" | "promo" | "done";

interface PriceData {
  count: number;
  min: number;
  max: number;
  avg: number;
  suggested: number;
}

// ─── Constants ─────────────────────────────────────────────────
const CONDITIONS = [
  { value: "new", label: "Nuevo" },
  { value: "like_new", label: "Como nuevo" },
  { value: "very_good", label: "Muy bueno" },
  { value: "good", label: "Bueno" },
  { value: "fair", label: "Regular" },
  { value: "for_parts", label: "Para repuestos" },
];

const SAN_JUAN_ZONES = [
  "Capital",
  "Rivadavia",
  "Rawson",
  "Santa Lucía",
  "Chimbas",
  "Pocito",
  "Caucete",
  "25 de Mayo",
  "Ullum",
  "Zonda",
  "Sarmiento",
  "Angaco",
  "Albardón",
  "Jáchal",
  "Otro",
];

const FUELS = [
  "Nafta",
  "Diésel",
  "GNC",
  "Nafta + GNC",
  "Eléctrico",
  "Híbrido",
  "GLP",
];
const TRANSMISIONS = ["Manual", "Automática", "CVT"];

// ─── Cloud Design Tokens ────────────────────────────────────────
// Palette
const C = {
  blue: "#2563EB",
  blue50: "#EFF6FF",
  blue100: "#DBEAFE",
  blue200: "#BFDBFE",
  blue300: "#93C5FD",
  blue600: "#2563EB",
  blue700: "#1D4ED8",
  slate50: "#F8FAFC",
  slate100: "#F1F5F9",
  slate200: "#E2E8F0",
  slate300: "#CBD5E1",
  slate400: "#94A3B8",
  slate500: "#64748B",
  slate600: "#475569",
  slate700: "#334155",
  slate800: "#1E293B",
  slate900: "#0F172A",
  green: "#15803D",
  greenBg: "#F0FDF4",
  amber: "#B45309",
  amberBg: "#FFFBEB",
  red: "#DC2626",
  redBg: "#FEF2F2",
  white: "#FFFFFF",
} as const;

const T = {
  // Labels
  lbl: {
    fontSize: "10px",
    fontWeight: 700,
    color: C.slate400,
    textTransform: "uppercase" as const,
    letterSpacing: "0.6px",
    display: "block",
    marginBottom: "4px",
    fontFamily: "'DM Mono', 'IBM Plex Mono', monospace",
  },
  // Inputs
  inp: {
    width: "100%",
    border: `1.5px solid ${C.slate200}`,
    borderRadius: "8px",
    padding: "9px 12px",
    fontSize: "13.5px",
    color: C.slate900,
    fontFamily: "inherit",
    background: C.slate50,
    outline: "none",
    transition: "border-color .15s, box-shadow .15s",
  },
  sel: {
    width: "100%",
    border: `1.5px solid ${C.slate200}`,
    borderRadius: "8px",
    padding: "9px 30px 9px 12px",
    fontSize: "13.5px",
    color: C.slate900,
    fontFamily: "inherit",
    background: C.slate50,
    appearance: "none" as const,
    cursor: "pointer",
    outline: "none",
  },
  // Card
  card: {
    background: C.white,
    borderRadius: "12px",
    border: `1px solid ${C.slate200}`,
    overflow: "hidden",
    marginBottom: "10px",
    boxShadow: "0 1px 3px rgba(15,23,42,.06)",
  },
  cardHead: {
    padding: "11px 18px",
    borderBottom: `1px solid ${C.slate100}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: C.slate50,
  },
  cardBody: { padding: "16px 18px" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
};

// ─── Small UI components ────────────────────────────────────────
function SelectWrap({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: "relative" }}>
      {children}
      <span
        style={{
          position: "absolute",
          right: "11px",
          top: "50%",
          transform: "translateY(-50%)",
          color: C.slate300,
          fontSize: "10px",
          pointerEvents: "none",
        }}
      >
        ▾
      </span>
    </div>
  );
}

function Field({
  label,
  required,
  full,
  half,
  children,
}: {
  label: string;
  required?: boolean;
  full?: boolean;
  half?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={full ? { gridColumn: "span 2" } : half ? {} : {}}>
      <label style={T.lbl}>
        {label}
        {required && <span style={{ color: C.red, marginLeft: "2px" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function CardTitle({ icon, label }: { icon: string; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "10px",
        fontWeight: 700,
        color: C.slate400,
        textTransform: "uppercase" as const,
        letterSpacing: "0.8px",
        fontFamily: "'DM Mono', monospace",
      }}
    >
      <div
        style={{
          width: "26px",
          height: "26px",
          borderRadius: "7px",
          background: C.blue50,
          border: `1px solid ${C.blue100}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      {label}
    </div>
  );
}

function Badge({
  status,
  label,
}: {
  status: "ok" | "partial" | "pending";
  label: string;
}) {
  const map = {
    ok: { bg: C.greenBg, color: C.green, border: "rgba(21,128,61,.2)" },
    partial: { bg: C.amberBg, color: C.amber, border: "rgba(180,83,9,.2)" },
    pending: { bg: C.slate50, color: C.slate300, border: C.slate200 },
  };
  const s = map[status];
  return (
    <span
      style={{
        fontSize: "10px",
        fontWeight: 700,
        padding: "3px 9px",
        borderRadius: "20px",
        letterSpacing: ".2px",
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      {label}
    </span>
  );
}

function FocusInp({
  style,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...rest}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...T.inp,
        ...(focused
          ? {
              borderColor: C.blue,
              background: C.white,
              boxShadow: `0 0 0 3px rgba(37,99,235,.1)`,
            }
          : {}),
        ...style,
      }}
    />
  );
}

function FocusSel({
  style,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <SelectWrap>
      <select
        {...rest}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...T.sel,
          ...(focused
            ? {
                borderColor: C.blue,
                background: C.white,
                boxShadow: `0 0 0 3px rgba(37,99,235,.1)`,
              }
            : {}),
          ...style,
        }}
      >
        {children}
      </select>
    </SelectWrap>
  );
}

function CheckItem({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "7px",
        cursor: "pointer",
        fontSize: "12px",
        color: value ? C.slate700 : C.slate400,
        fontWeight: value ? 600 : 400,
      }}
    >
      <div
        onClick={() => onChange(!value)}
        style={{
          width: "17px",
          height: "17px",
          borderRadius: "4px",
          flexShrink: 0,
          background: value ? C.blue : C.white,
          border: `2px solid ${value ? C.blue : C.slate200}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all .12s",
        }}
      >
        {value && (
          <span style={{ color: C.white, fontSize: "9px", fontWeight: 900 }}>
            ✓
          </span>
        )}
      </div>
      {label}
    </label>
  );
}

// ─── Step indicator ─────────────────────────────────────────────
function StepBar({ current }: { current: Step }) {
  const steps = [
    { n: "✓", label: "Fotos", key: "upload" },
    { n: "2", label: "Datos", key: "form" },
    { n: "3", label: "Precio", key: "price" },
    { n: "4", label: "Publicar", key: "publishing" },
  ];
  const activeIdx =
    current === "upload" || current === "analyzing"
      ? 0
      : current === "form"
        ? 1
        : current === "publishing"
          ? 3
          : 3;

  return (
    <div
      style={{
        background: "rgba(255,255,255,.06)",
        borderRadius: "100px",
        padding: "3px",
        display: "flex",
        gap: "2px",
      }}
    >
      {steps.map((s, i) => {
        const done = i < activeIdx;
        const active = i === activeIdx;
        return (
          <div
            key={s.key}
            style={{
              padding: "5px 13px",
              borderRadius: "100px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "11px",
              fontWeight: active ? 700 : 500,
              color: active
                ? C.blue300
                : done
                  ? "rgba(37,99,235,.45)"
                  : "rgba(255,255,255,.2)",
              background: active ? "rgba(37,99,235,.15)" : "transparent",
              transition: "all .2s",
            }}
          >
            <div
              style={{
                width: "17px",
                height: "17px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "8px",
                fontWeight: 800,
                background: active
                  ? "rgba(37,99,235,.3)"
                  : done
                    ? "transparent"
                    : "rgba(255,255,255,.06)",
                color: active
                  ? C.blue300
                  : done
                    ? C.blue300
                    : "rgba(255,255,255,.25)",
              }}
            >
              {done ? "✓" : s.n}
            </div>
            <span style={{ whiteSpace: "nowrap" }}>{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════
export default function NewListingPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [aiData, setAiData] = useState<any>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<"ARS" | "USD">("ARS");
  const [categoryId, setCategoryId] = useState(0);
  const [condition, setCondition] = useState("");
  const [zone, setZone] = useState("");
  const [attrs, setAttrs] = useState<Record<string, any>>({});
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [loadingPx, setLoadingPx] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneId, setDoneId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showExtraVehicle, setShowExtraVehicle] = useState(false);

  const catConfig = getCategoryConfig(categoryId);
  const isVehicle = categoryId === 2;
  const isRealEstate = categoryId === 3;

  const vehicleModels = useMemo(() => getModels(attrs.brand ?? ""), [attrs.brand]);
  const vehicleVersions = useMemo(
    () => getVersions(attrs.brand ?? "", attrs.model ?? ""),
    [attrs.brand, attrs.model],
  );
  const vehiclePriceRef = useMemo(() => {
    if (!isVehicle || !attrs.brand || !attrs.year) return null;
    return getModelPriceRef(attrs.brand, attrs.model ?? "", Number(attrs.year));
  }, [isVehicle, attrs.brand, attrs.model, attrs.year]);

  // Quality checks
  const checks = [
    { ok: photos.length > 0, label: "Foto" },
    { ok: title.length > 5, label: "Título" },
    { ok: categoryId > 0, label: "Categoría" },
    { ok: !!condition, label: "Estado" },
    { ok: !!zone, label: "Zona" },
    { ok: description.length > 20, label: "Descripción" },
  ];
  const passed = checks.filter((c) => c.ok).length;
  const quality = passed >= 5 ? "ok" : passed >= 3 ? "partial" : "pending";
  const canPublish = !!(title.trim() && categoryId);

  // ── Photos ──────────────────────────────────────────────────
  const addPhotos = useCallback(
    (files: File[]) => {
      const valid = files.filter((f) => f.type.startsWith("image/"));
      const toAdd = valid.slice(0, 8 - photos.length);
      if (!toAdd.length) return;
      setPhotos((p) => [...p, ...toAdd]);
      toAdd.forEach((f) => setPreviews((p) => [...p, URL.createObjectURL(f)]));
      if (photos.length === 0 && toAdd[0]) analyzePhoto(toAdd[0]);
    },
    [photos],
  );

  const removePhoto = (i: number) => {
    setPhotos((p) => p.filter((_, x) => x !== i));
    setPreviews((p) => p.filter((_, x) => x !== i));
    if (i === 0) {
      setAiData(null);
      setTitle("");
      setDescription("");
      setPrice("");
      setCategoryId(0);
      setCondition("");
      setAttrs({});
      setPriceData(null);
      setStep("upload");
    }
  };

  const movePhoto = (i: number, dir: -1 | 1) => {
    const ni = i + dir;
    if (ni < 0 || ni >= photos.length) return;
    const p2 = [...photos];
    [p2[i], p2[ni]] = [p2[ni], p2[i]];
    const v2 = [...previews];
    [v2[i], v2[ni]] = [v2[ni], v2[i]];
    setPhotos(p2);
    setPreviews(v2);
  };

  // ── Fetch price ─────────────────────────────────────────────
  const fetchPrice = async (catId: number) => {
    if (!catId) return;
    setLoadingPx(true);
    try {
      const res = await fetch(
        `/api/listings/price-suggestion?category_id=${catId}`,
      );
      const data = await res.json();
      if (res.ok && data.count >= 3) {
        setPriceData(data);
        if (!price) setPrice(String(data.suggested));
      } else setPriceData(null);
    } catch {
      setPriceData(null);
    }
    setLoadingPx(false);
  };

  const handleCategory = (id: number) => {
    setCategoryId(id);
    setAttrs({});
    fetchPrice(id);
  };
  const handleAttr = (k: string, v: any) => setAttrs((p) => ({ ...p, [k]: v }));

  // ── AI analysis ─────────────────────────────────────────────
  const analyzePhoto = async (file: File) => {
    setStep("analyzing");
    setError(null);
    try {
      const fd = new FormData();
      fd.append("photo", file);
      const res = await fetch("/api/ai/analyze-photo", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al analizar");
      setAiData(data);
      if (data.title) setTitle(data.title);
      if (data.description) setDescription(data.description);
      if (data.category_id) {
        setCategoryId(data.category_id);
        fetchPrice(data.category_id);
      }
      if (data.condition) setCondition(data.condition);
      if (data.attributes) {
        const normalizedAttrs = { ...data.attributes };
        if (normalizedAttrs.brand) {
          const normalized = normalizedAttrs.brand.toLowerCase().replace(/[\s-]/g, "_");
          const found = CAR_BRANDS.find((b) => b.value === normalized);
          normalizedAttrs.brand = found ? normalized : normalizedAttrs.brand;
        }
        setAttrs(normalizedAttrs);
        if (data.attributes.currency) setCurrency(data.attributes.currency);
      }
      if (data.price_suggested > 0 && !price)
        setPrice(String(data.price_suggested));
      setStep("form");
    } catch (e: any) {
      setError(e.message);
      setStep("form");
    }
  };

  // ── Publish ─────────────────────────────────────────────────
  const handlePublish = async () => {
    if (!canPublish) {
      setError("Completá título y categoría.");
      return;
    }
    setStep("publishing");
    setError(null);
    try {
      const urls: string[] = [];
      for (const file of photos) {
        const fd = new FormData();
        fd.append("file", file);
        const r = await fetch("/api/images/upload", {
          method: "POST",
          body: fd,
        });
        const d = await r.json();
        if (!r.ok) throw new Error(`Error al subir imagen: ${d.error ?? r.statusText}`);
        if (d.url) urls.push(d.url);
      }
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price: Number(price),
          currency,
          category_id: categoryId,
          condition,
          neighborhood: zone,
          attributes: attrs,
          image_urls: urls,
          ai_generated: !!aiData,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al publicar");
      setDoneId(data.id);
      setStep("promo");
    } catch (e: any) {
      setError(e.message);
      setStep("form");
    }
  };

  const reset = () => {
    setStep("upload");
    setPhotos([]);
    setPreviews([]);
    setTitle("");
    setDescription("");
    setPrice("");
    setCategoryId(0);
    setCondition("");
    setAttrs({});
    setAiData(null);
    setPriceData(null);
    setDoneId(null);
    setError(null);
  };

  // ─── Drag & Drop ─────────────────────────────────────────────
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    addPhotos(files);
  };

  // ═══════════════════════════════════════════════════════════
  // SIDEBAR
  // ═══════════════════════════════════════════════════════════
  const sidebarJSX = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        position: "sticky",
        top: "68px",
      }}
    >
      {/* ── Price card ── */}
      <div
        style={{
          background: C.white,
          borderRadius: "14px",
          border: `1px solid ${C.slate200}`,
          padding: "18px 20px",
          boxShadow: "0 1px 4px rgba(15,23,42,.06)",
        }}
      >
        <label
          style={{
            display: "block",
            fontSize: "11px",
            fontWeight: 700,
            color: C.slate400,
            textTransform: "uppercase" as const,
            letterSpacing: "0.8px",
            marginBottom: "14px",
          }}
        >
          Precio
        </label>

        {/* Currency toggle */}
        <div
          style={{
            display: "flex",
            gap: "6px",
            marginBottom: "16px",
            background: C.slate100,
            borderRadius: "9px",
            padding: "3px",
          }}
        >
          {(["ARS", "USD"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCurrency(c)}
              style={{
                flex: 1,
                padding: "7px 8px",
                borderRadius: "7px",
                border: "none",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all .12s",
                background: currency === c ? C.white : "transparent",
                color: currency === c ? C.slate800 : C.slate400,
                boxShadow: currency === c ? "0 1px 3px rgba(15,23,42,.1)" : "none",
              }}
            >
              {c === "ARS" ? "$ Pesos" : "U$D Dólares"}
            </button>
          ))}
        </div>

        {/* Amount input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: C.slate50,
            border: `1.5px solid ${C.slate200}`,
            borderRadius: "10px",
            padding: "10px 14px",
            marginBottom: "12px",
          }}
        >
          <span style={{ fontSize: "18px", fontWeight: 700, color: C.slate400 }}>
            {currency === "ARS" ? "$" : "U$D"}
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={price ? Number(price).toLocaleString("es-AR") : ""}
            onChange={(e) => {
              const raw = e.target.value.replace(/\./g, "").replace(/[^0-9]/g, "");
              setPrice(raw);
            }}
            placeholder="0"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: "22px",
              fontWeight: 700,
              color: C.slate900,
              fontFamily: "inherit",
              letterSpacing: "-0.5px",
            }}
          />
        </div>

        {/* Price refs */}
        {loadingPx && (
          <p style={{ fontSize: "11px", color: C.slate400, margin: 0, textAlign: "center" }}>
            Buscando precios similares...
          </p>
        )}
        {!loadingPx && priceData && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderTop: `1px solid ${C.slate100}`,
              }}
            >
              {[
                { l: "Mín", v: priceData.min },
                { l: "Prom", v: priceData.avg, hi: true },
                { l: "Máx", v: priceData.max },
              ].map((r) => (
                <div key={r.l} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "10px", color: C.slate400, marginBottom: "2px" }}>{r.l}</div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: r.hi ? C.blue : C.slate600,
                    }}
                  >
                    ${r.v.toLocaleString("es-AR")}
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPrice(String(priceData.suggested))}
              style={{
                width: "100%",
                marginTop: "10px",
                background: C.blue50,
                border: `1px solid ${C.blue100}`,
                borderRadius: "8px",
                padding: "8px",
                fontSize: "12px",
                color: C.blue,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "background .12s",
              }}
            >
              Usar precio promedio
            </button>
          </div>
        )}
        {!loadingPx && !priceData && categoryId > 0 && (
          <p style={{ fontSize: "11px", color: C.slate300, margin: 0, textAlign: "center" }}>
            Sin avisos similares aún
          </p>
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <div
          style={{
            background: C.redBg,
            border: `1px solid #fecaca`,
            borderRadius: "10px",
            padding: "10px 12px",
            fontSize: "12px",
            color: C.red,
            lineHeight: 1.4,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* ── Publish button ── */}
      <button
        type="button"
        onClick={handlePublish}
        disabled={!canPublish}
        style={{
          width: "100%",
          padding: "14px",
          background: canPublish ? C.blue : C.slate200,
          color: canPublish ? C.white : C.slate400,
          border: "none",
          borderRadius: "10px",
          fontSize: "14px",
          fontWeight: 700,
          cursor: canPublish ? "pointer" : "not-allowed",
          fontFamily: "inherit",
          boxShadow: canPublish ? "0 4px 14px rgba(37,99,235,.3)" : "none",
          transition: "all .15s",
          letterSpacing: ".2px",
        }}
      >
        Publicar aviso →
      </button>

      {/* ── Quality ── */}
      <div
        style={{
          background: C.white,
          border: `1px solid ${C.slate200}`,
          borderRadius: "12px",
          padding: "14px 16px",
          boxShadow: "0 1px 3px rgba(15,23,42,.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <span
            style={{
              fontSize: "9px",
              fontWeight: 700,
              color: C.slate400,
              textTransform: "uppercase" as const,
              letterSpacing: "1.5px",
              fontFamily: "'DM Mono', monospace",
            }}
          >
            Calidad del aviso
          </span>
          <span
            style={{
              fontSize: "13px",
              fontWeight: 800,
              color:
                quality === "ok"
                  ? C.green
                  : quality === "partial"
                    ? C.amber
                    : C.slate300,
              fontFamily: "'DM Mono', monospace",
            }}
          >
            {passed}/7
          </span>
        </div>
        <div
          style={{
            height: "3px",
            background: C.slate100,
            borderRadius: "100px",
            marginBottom: "12px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: "100px",
              width: `${(passed / 7) * 100}%`,
              background: `linear-gradient(90deg, ${C.blue}, ${C.blue300})`,
              transition: "width .4s ease",
            }}
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "6px",
          }}
        >
          {checks.map((c) => (
            <div
              key={c.label}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <div
                style={{
                  width: "9px",
                  height: "9px",
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: c.ok ? C.blue : C.slate100,
                  border: c.ok ? "none" : `1.5px solid ${C.slate200}`,
                  boxShadow: c.ok ? `0 0 0 3px ${C.blue50}` : "none",
                  transition: "all .2s",
                }}
              />
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: c.ok ? 600 : 400,
                  color: c.ok ? C.slate700 : C.slate300,
                }}
              >
                {c.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Terms ── */}
      <p
        style={{
          fontSize: "11px",
          color: C.slate400,
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        Al publicar aceptás los{" "}
        <Link
          href="/terms"
          style={{ color: C.blue, textDecoration: "none", fontWeight: 600 }}
        >
          términos y condiciones
        </Link>
        .
      </p>
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // (sidebarJSX is defined above as a plain JSX variable — NOT a component —
  //  to avoid React treating it as a new component type on every render,
  //  which would unmount/remount inputs and lose focus)
  // ═══════════════════════════════════════════════════════════
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.slate100,
        fontFamily: "'Geist', 'DM Sans', -apple-system, sans-serif",
      }}
    >
      {/* ════ HEADER ════ */}
      <header
        style={{
          background: C.slate900,
          height: "54px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: `1px solid ${C.slate800}`,
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: "19px",
            fontWeight: 800,
            letterSpacing: "-0.5px",
            textDecoration: "none",
            color: C.white,
          }}
        >
          comerc
          <span
            style={{
              background: `linear-gradient(135deg, ${C.blue300}, #60A5FA)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            IA
          </span>
        </Link>

        <StepBar current={step} />

        <Link
          href="/"
          style={{
            fontSize: "11px",
            color: C.slate500,
            textDecoration: "none",
            fontWeight: 500,
            letterSpacing: ".2px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          ← Inicio
        </Link>
      </header>

      {/* ════ AI BAR ════ */}
      {step === "form" && aiData && (
        <div
          style={{
            background: C.blue50,
            borderBottom: `1px solid ${C.blue100}`,
            padding: "8px 28px",
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "9px",
              fontWeight: 800,
              padding: "2px 8px",
              borderRadius: "20px",
              letterSpacing: "1px",
              textTransform: "uppercase" as const,
              background: C.blue,
              color: C.white,
            }}
          >
            ✦ IA
          </span>
          <span
            style={{ fontSize: "12px", color: C.slate500, fontWeight: 500 }}
          >
            Datos completados automáticamente — revisá y editá antes de publicar
          </span>
        </div>
      )}

      {/* ════ UPLOAD ════ */}
      {(step === "upload" || step === "analyzing") && (
        <div
          style={{
            maxWidth: "540px",
            margin: "0 auto",
            padding: "48px 24px 80px",
          }}
        >
          {/* Title */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: C.blue50,
                border: `1px solid ${C.blue100}`,
                borderRadius: "20px",
                padding: "5px 14px",
                fontSize: "12px",
                fontWeight: 600,
                color: C.blue,
                marginBottom: "16px",
              }}
            >
              ✦ IA activa
            </div>
            <h1
              style={{
                fontSize: "26px",
                fontWeight: 800,
                color: C.slate900,
                letterSpacing: "-0.5px",
                marginBottom: "8px",
              }}
            >
              Publicá tu aviso
            </h1>
            <p style={{ fontSize: "14px", color: C.slate400, lineHeight: 1.5 }}>
              Subí una foto y la IA completará los datos automáticamente
            </p>
          </div>

          {/* Drop zone */}
          {step === "upload" && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              style={{
                background: dragOver ? C.blue50 : C.white,
                border: `2px dashed ${dragOver ? C.blue : C.slate200}`,
                borderRadius: "16px",
                padding: "56px 32px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all .15s",
                boxShadow: dragOver
                  ? `0 0 0 4px rgba(37,99,235,.1)`
                  : "0 1px 3px rgba(15,23,42,.06)",
              }}
            >
              <div
                style={{
                  fontSize: "44px",
                  marginBottom: "14px",
                  lineHeight: 1,
                }}
              >
                📸
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "15px",
                  color: C.slate700,
                  marginBottom: "6px",
                }}
              >
                {dragOver
                  ? "Soltá la imagen aquí"
                  : "Arrastrá o hacé clic para subir"}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: C.slate400,
                  marginBottom: "20px",
                }}
              >
                JPG, PNG, WEBP · Hasta 8 fotos
              </div>
              <div
                style={{
                  display: "inline-block",
                  padding: "10px 24px",
                  background: C.blue,
                  color: C.white,
                  borderRadius: "9px",
                  fontSize: "13px",
                  fontWeight: 700,
                  boxShadow: "0 4px 12px rgba(37,99,235,.3)",
                }}
              >
                Seleccionar fotos
              </div>
            </div>
          )}

          {/* Analyzing state */}
          {step === "analyzing" && (
            <div
              style={{
                background: C.white,
                borderRadius: "16px",
                border: `1px solid ${C.slate200}`,
                padding: "56px 32px",
                textAlign: "center",
                boxShadow: "0 1px 3px rgba(15,23,42,.06)",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  margin: "0 auto 18px",
                  borderRadius: "50%",
                  background: C.blue50,
                  border: `3px solid ${C.blue100}`,
                  borderTopColor: C.blue,
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "16px",
                  color: C.slate900,
                  marginBottom: "6px",
                }}
              >
                Analizando imagen...
              </div>
              <div style={{ fontSize: "13px", color: C.slate400 }}>
                La IA está identificando el artículo y completando los datos
              </div>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => addPhotos(Array.from(e.target.files ?? []))}
          />

          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {/* ════ FORM ════ */}
      {step === "form" && (
        <div
          style={{
            maxWidth: "920px",
            margin: "0 auto",
            padding: "20px 20px 60px",
            display: "grid",
            gridTemplateColumns: "1fr 252px",
            gap: "14px",
            alignItems: "start",
          }}
        >
          {/* ── LEFT COLUMN ── */}
          <div>
            {/* ░░ 01 PHOTOS ░░ */}
            <div style={T.card}>
              <div style={T.cardHead}>
                <CardTitle icon="📸" label="01 · Fotos" />
                <Badge
                  status={
                    photos.length >= 3
                      ? "ok"
                      : photos.length > 0
                        ? "partial"
                        : "pending"
                  }
                  label={
                    photos.length >= 3
                      ? `${photos.length} fotos`
                      : photos.length > 0
                        ? `${photos.length} foto`
                        : "sin fotos"
                  }
                />
              </div>
              <div style={T.cardBody}>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap" as const,
                  }}
                >
                  {previews.map((src, i) => (
                    <div
                      key={i}
                      style={{
                        width: "72px",
                        height: "72px",
                        position: "relative",
                        borderRadius: "10px",
                        overflow: "hidden",
                        border: `${i === 0 ? "2px" : "1.5px"} solid ${i === 0 ? C.blue : C.slate200}`,
                        flexShrink: 0,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      {i === 0 && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: C.blue,
                            color: C.white,
                            fontSize: "7px",
                            fontWeight: 800,
                            textAlign: "center",
                            padding: "2px",
                            letterSpacing: ".5px",
                          }}
                        >
                          portada
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        style={{
                          position: "absolute",
                          top: "3px",
                          right: "3px",
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          background: "rgba(15,23,42,.7)",
                          color: C.white,
                          border: "none",
                          fontSize: "10px",
                          fontWeight: 900,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                      {i > 0 && (
                        <button
                          type="button"
                          onClick={() => movePhoto(i, -1)}
                          style={{
                            position: "absolute",
                            top: "3px",
                            left: "3px",
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            background: "rgba(15,23,42,.7)",
                            color: C.white,
                            border: "none",
                            fontSize: "9px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          ←
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Add more */}
                  {photos.length < 8 && (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      style={{
                        width: "72px",
                        height: "72px",
                        borderRadius: "10px",
                        border: `1.5px dashed ${C.slate200}`,
                        background: C.slate50,
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column" as const,
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px",
                        color: C.slate300,
                        fontSize: "22px",
                        transition: "all .12s",
                        flexShrink: 0,
                      }}
                    >
                      <span>+</span>
                      <span
                        style={{
                          fontSize: "8px",
                          fontWeight: 700,
                          letterSpacing: ".5px",
                          color: C.slate300,
                        }}
                      >
                        FOTO
                      </span>
                    </button>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => addPhotos(Array.from(e.target.files ?? []))}
                />

                {photos.length > 0 && (
                  <p
                    style={{
                      fontSize: "11px",
                      color: C.slate400,
                      marginTop: "10px",
                      lineHeight: 1.4,
                    }}
                  >
                    La primera foto es la portada. Arrastrá para reordenar.
                  </p>
                )}
              </div>
            </div>

            {/* ░░ 02 BASIC DATA ░░ */}
            <div style={T.card}>
              <div style={T.cardHead}>
                <CardTitle icon="📝" label="02 · Datos básicos" />
                <Badge
                  status={
                    title.length > 5 && description.length > 20
                      ? "ok"
                      : title.length > 0
                        ? "partial"
                        : "pending"
                  }
                  label={
                    title.length > 5 && description.length > 20
                      ? "Completo"
                      : title.length > 0
                        ? "Parcial"
                        : "Pendiente"
                  }
                />
              </div>
              <div style={T.cardBody}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "13px",
                  }}
                >
                  <Field label="Título del aviso" required>
                    <FocusInp
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Describí brevemente lo que vendés..."
                      maxLength={120}
                    />
                    <div
                      style={{
                        fontSize: "10px",
                        color: C.slate300,
                        textAlign: "right",
                        marginTop: "3px",
                      }}
                    >
                      {title.length}/120
                    </div>
                  </Field>
                  <Field label="Descripción">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      placeholder="Contá el estado, características, motivo de venta..."
                      style={{
                        ...T.inp,
                        resize: "vertical",
                        lineHeight: "1.5",
                        minHeight: "80px",
                      }}
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* ░░ 03 DETAILS ░░ */}
            <div style={T.card}>
              <div style={T.cardHead}>
                <CardTitle
                  icon={catConfig?.icon ?? "📋"}
                  label={`03 · Detalles ${catConfig?.name?.toLowerCase() ?? "del artículo"}`}
                />
                <Badge
                  status={
                    categoryId > 0 && condition && zone
                      ? "ok"
                      : categoryId > 0 || condition || zone
                        ? "partial"
                        : "pending"
                  }
                  label={
                    categoryId > 0 && condition && zone
                      ? "Completo"
                      : categoryId > 0 || condition || zone
                        ? "Parcial"
                        : "Pendiente"
                  }
                />
              </div>
              <div style={T.cardBody}>
                <div style={T.grid2}>
                  {/* Category + Condition (non-vehicle) */}
                  <Field label="Categoría" required>
                    <FocusSel
                      value={categoryId}
                      onChange={(e) => handleCategory(Number(e.target.value))}
                    >
                      <option value={0}>Seleccioná...</option>
                      {CATEGORY_CONFIGS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.icon} {c.name}
                        </option>
                      ))}
                    </FocusSel>
                  </Field>
                  {!isVehicle && !isRealEstate && (
                    <Field label="Estado" required>
                      <FocusSel
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                      >
                        <option value="">Seleccioná...</option>
                        {CONDITIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </FocusSel>
                    </Field>
                  )}

                  {/* ── VEHICLE fields ── */}
                  {isVehicle && (
                    <>

                      {/* Tipo */}
                      <Field label="Tipo">
                        <FocusSel
                          value={attrs.sub_category ?? ""}
                          onChange={(e) =>
                            handleAttr("sub_category", e.target.value)
                          }
                        >
                          <option value="">Seleccionar...</option>
                          <option value="auto">Auto</option>
                          <option value="camioneta">Camioneta / SUV</option>
                          <option value="moto">Moto</option>
                          <option value="camion">Camión</option>
                          <option value="nautica">Náutica</option>
                          <option value="otro">Otro</option>
                        </FocusSel>
                      </Field>

                      {/* Marca */}
                      <Field label="Marca" required>
                        <FocusSel
                          value={attrs.brand ?? ""}
                          onChange={(e) => {
                            handleAttr("brand", e.target.value);
                            handleAttr("model", "");
                          }}
                        >
                          <option value="">Seleccionar...</option>
                          {CAR_BRANDS.map((b) => (
                            <option key={b.value} value={b.value}>
                              {b.label}
                            </option>
                          ))}
                        </FocusSel>
                      </Field>

                      {/* Modelo */}
                      <Field label="Modelo" required>
                        {vehicleModels.length > 0 ? (
                          <FocusSel
                            value={attrs.model ?? ""}
                            onChange={(e) => handleAttr("model", e.target.value)}
                          >
                            <option value="">Seleccionar...</option>
                            {vehicleModels.map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                            <option value="Otro">Otro</option>
                          </FocusSel>
                        ) : (
                          <FocusInp
                            value={attrs.model ?? ""}
                            onChange={(e) => handleAttr("model", e.target.value)}
                            placeholder="Up!, Hilux, Corolla..."
                          />
                        )}
                      </Field>

                      {/* Versión */}
                      <Field label="Versión">
                        {vehicleVersions.length > 0 ? (
                          <FocusSel
                            value={attrs.version ?? ""}
                            onChange={(e) => handleAttr("version", e.target.value)}
                          >
                            <option value="">Sin especificar</option>
                            {vehicleVersions.map((v) => (
                              <option key={v} value={v}>{v}</option>
                            ))}
                          </FocusSel>
                        ) : (
                          <FocusInp
                            value={attrs.version ?? ""}
                            onChange={(e) => handleAttr("version", e.target.value)}
                            placeholder="Move, SR 4x4..."
                          />
                        )}
                      </Field>

                      {/* Año */}
                      <Field label="Año" required>
                        <FocusSel
                          value={attrs.year ?? ""}
                          onChange={(e) =>
                            handleAttr("year", Number(e.target.value))
                          }
                        >
                          <option value="">Seleccionar...</option>
                          {Array.from(
                            { length: 40 },
                            (_, i) => new Date().getFullYear() + 1 - i,
                          ).map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </FocusSel>
                      </Field>

                      {/* Precio de referencia CCA */}
                      {vehiclePriceRef && (
                        <div style={{ gridColumn: "span 2" }}>
                          <div style={{
                            background: "#f0f9ff",
                            border: "1.5px solid #bae6fd",
                            borderRadius: "9px",
                            padding: "10px 14px",
                            fontSize: "12px",
                            color: "#0369a1",
                          }}>
                            <span style={{ fontWeight: 700 }}>Ref. CCA</span>
                            {" — "}
                            Mín: U$D {vehiclePriceRef.min.toLocaleString("es-AR")}
                            {" · "}
                            <span style={{ fontWeight: 700 }}>Prom: U$D {vehiclePriceRef.avg.toLocaleString("es-AR")}</span>
                            {" · "}
                            Máx: U$D {vehiclePriceRef.max.toLocaleString("es-AR")}
                          </div>
                        </div>
                      )}

                      {/* Km */}
                      <Field label="Kilómetros" required>
                        <div style={{ position: "relative" }}>
                          <FocusInp
                            type="number"
                            value={attrs.km ?? ""}
                            onChange={(e) => handleAttr("km", e.target.value)}
                            placeholder="0"
                            style={{ paddingRight: "36px" }}
                          />
                          <span
                            style={{
                              position: "absolute",
                              right: "11px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              fontSize: "10px",
                              color: C.slate300,
                              fontWeight: 700,
                              fontFamily: "'DM Mono', monospace",
                            }}
                          >
                            km
                          </span>
                        </div>
                      </Field>

                      {/* Combustible */}
                      <Field label="Combustible">
                        <FocusSel
                          value={attrs.fuel ?? ""}
                          onChange={(e) => handleAttr("fuel", e.target.value)}
                        >
                          <option value="">Seleccionar...</option>
                          {FUELS.map((f) => (
                            <option key={f} value={f.toLowerCase()}>
                              {f}
                            </option>
                          ))}
                        </FocusSel>
                      </Field>

                      {/* Transmisión */}
                      <Field label="Transmisión">
                        <FocusSel
                          value={attrs.transmission ?? ""}
                          onChange={(e) =>
                            handleAttr("transmission", e.target.value)
                          }
                        >
                          <option value="">Seleccionar...</option>
                          {TRANSMISIONS.map((t) => (
                            <option key={t} value={t.toLowerCase()}>
                              {t}
                            </option>
                          ))}
                        </FocusSel>
                      </Field>

                      {/* Color */}
                      <Field label="Color">
                        <FocusInp
                          value={attrs.color ?? ""}
                          onChange={(e) => handleAttr("color", e.target.value)}
                          placeholder="Gris plata..."
                        />
                      </Field>

                      {/* Motor */}
                      <Field label="Motor">
                        <FocusInp
                          value={attrs.engine ?? ""}
                          onChange={(e) => handleAttr("engine", e.target.value)}
                          placeholder="1.6, 2.0 TDI..."
                        />
                      </Field>

                      {/* Patente */}
                      <Field label="Patente">
                        <FocusInp
                          value={attrs.patente ?? ""}
                          onChange={(e) =>
                            handleAttr("patente", e.target.value.toUpperCase())
                          }
                          placeholder="PDL187"
                          maxLength={8}
                          style={{ letterSpacing: "2px", fontWeight: 700 }}
                        />
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            marginTop: "8px",
                            fontSize: "12px",
                            color: "#94a3b8",
                            cursor: "pointer",
                            userSelect: "none",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={attrs.show_patente ?? false}
                            onChange={(e) =>
                              handleAttr("show_patente", e.target.checked)
                            }
                            style={{ accentColor: "#6366f1", cursor: "pointer" }}
                          />
                          Mostrar patente en la publicación
                        </label>
                      </Field>

                      {/* Zona / Departamento */}
                      <div style={{ gridColumn: "span 2" }}>
                        <Field label="Zona / Departamento" required>
                          <FocusSel
                            value={zone}
                            onChange={(e) => setZone(e.target.value)}
                          >
                            <option value="">Seleccioná...</option>
                            {SAN_JUAN_ZONES.map((z) => (
                              <option key={z} value={z}>
                                {z}
                              </option>
                            ))}
                          </FocusSel>
                        </Field>
                      </div>

                      {/* Estado */}
                      <div style={{ gridColumn: "span 2" }}>
                        <Field label="Estado" required>
                          <FocusSel
                            value={condition}
                            onChange={(e) => setCondition(e.target.value)}
                          >
                            <option value="">Seleccioná...</option>
                            {CONDITIONS.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </FocusSel>
                        </Field>
                      </div>

                      {/* Tipo de vendedor */}
                      <div style={{ gridColumn: "span 2" }}>
                        <label style={T.lbl}>Tipo de vendedor</label>
                        <div style={{ display: "flex", gap: "8px" }}>
                          {[
                            ["particular", "👤 Particular"],
                            ["concesionaria", "🏢 Concesionaria"],
                          ].map(([v, l]) => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => handleAttr("seller_type", v)}
                              style={{
                                flex: 1,
                                padding: "10px",
                                borderRadius: "9px",
                                border: `1.5px solid ${attrs.seller_type === v ? C.blue : C.slate200}`,
                                background: attrs.seller_type === v ? C.blue50 : C.white,
                                color: attrs.seller_type === v ? C.blue : C.slate500,
                                fontWeight: attrs.seller_type === v ? 700 : 400,
                                fontSize: "13px",
                                cursor: "pointer",
                                fontFamily: "inherit",
                                transition: "all .1s",
                              }}
                            >
                              {l}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* ── Datos adicionales (colapsable) ── */}
                      <div style={{ gridColumn: "span 2" }}>
                        <button
                          type="button"
                          onClick={() => setShowExtraVehicle((v) => !v)}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 14px",
                            borderRadius: "10px",
                            border: `1.5px solid ${C.slate200}`,
                            background: showExtraVehicle ? C.blue50 : C.white,
                            color: showExtraVehicle ? C.blue : C.slate500,
                            fontWeight: 600,
                            fontSize: "13px",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            transition: "all .15s",
                          }}
                        >
                          <span>Datos adicionales</span>
                          <span style={{ fontSize: "16px", lineHeight: 1 }}>
                            {showExtraVehicle ? "▲" : "▼"}
                          </span>
                        </button>

                        {showExtraVehicle && (
                          <div
                            style={{
                              marginTop: "12px",
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "12px",
                              padding: "14px",
                              borderRadius: "10px",
                              border: `1px solid ${C.slate100}`,
                              background: "#fafafa",
                            }}
                          >
                            {/* Checkboxes */}
                            <div
                              style={{
                                gridColumn: "span 2",
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr 1fr",
                                gap: "10px",
                              }}
                            >
                              {[
                                ["financing", "Financiamiento"],
                                ["negotiable_price", "Precio negociable"],
                                ["first_owner", "Único dueño"],
                                ["accepts_trade", "Acepta permuta"],
                                ["has_gnc", "Con GNC"],
                                ["has_alarm", "Con alarma"],
                                ["has_service", "Con service"],
                              ].map(([k, l]) => (
                                <CheckItem
                                  key={k}
                                  label={l}
                                  value={!!attrs[k]}
                                  onChange={(v) => handleAttr(k, v)}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* ── REAL ESTATE fields ── */}
                  {isRealEstate && (
                    <>
                      {/* Tipo + Operación */}
                      <Field label="Tipo de propiedad" required>
                        <FocusSel value={attrs.sub_category ?? ""} onChange={(e) => handleAttr("sub_category", e.target.value)}>
                          <option value="">Seleccioná...</option>
                          {[["casa","Casa"],["departamento","Departamento"],["terreno","Terreno / Lote"],["finca","Finca / Campo"],["local","Local / Oficina"],["galpon","Galpón / Depósito"],["cochera","Cochera"],["otro","Otro"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                        </FocusSel>
                      </Field>

                      <Field label="Operación" required>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {[["venta","Venta"],["alquiler","Alquiler"],["alquiler-temporal","Temporal"]].map(([v,l]) => (
                            <button key={v} type="button" onClick={() => handleAttr("operation", v)} style={{ flex: 1, padding: "10px 4px", borderRadius: "8px", fontSize: "12px", border: `1.5px solid ${attrs.operation === v ? C.blue : C.slate200}`, background: attrs.operation === v ? C.blue50 : C.white, color: attrs.operation === v ? C.blue : C.slate500, fontWeight: attrs.operation === v ? 700 : 400, cursor: "pointer", fontFamily: "inherit", transition: "all .1s" }}>{l}</button>
                          ))}
                        </div>
                      </Field>

                      <Field label="Estado" required>
                        <FocusSel value={condition} onChange={(e) => setCondition(e.target.value)}>
                          <option value="">Seleccioná...</option>
                          <option value="new">A estrenar</option>
                          <option value="like_new">Excelente estado</option>
                          <option value="good">Buen estado</option>
                          <option value="fair">A refaccionar</option>
                        </FocusSel>
                      </Field>

                      <Field label="Moneda">
                        <div style={{ display: "flex", gap: "6px" }}>
                          {[["ARS","$ Pesos"],["USD","U$S Dólares"]].map(([v,l]) => (
                            <button key={v} type="button" onClick={() => setCurrency(v as "ARS" | "USD")} style={{ flex: 1, padding: "10px", borderRadius: "8px", fontSize: "12px", border: `1.5px solid ${currency === v ? C.blue : C.slate200}`, background: currency === v ? C.blue50 : C.white, color: currency === v ? C.blue : C.slate500, fontWeight: currency === v ? 700 : 400, cursor: "pointer", fontFamily: "inherit" }}>{l}</button>
                          ))}
                        </div>
                      </Field>

                      {/* Dimensiones */}
                      <Field label="Ambientes">
                        <FocusSel value={attrs.rooms ?? ""} onChange={(e) => handleAttr("rooms", e.target.value)}>
                          <option value="">Seleccioná...</option>
                          {["1","2","3","4","5+"].map(v => <option key={v} value={v}>{v === "5+" ? "5 o más" : `${v} ambiente${v==="1"?"":"s"}`}</option>)}
                        </FocusSel>
                      </Field>

                      <Field label="Dormitorios">
                        <FocusSel value={attrs.bedrooms ?? ""} onChange={(e) => handleAttr("bedrooms", e.target.value)}>
                          <option value="">Seleccioná...</option>
                          <option value="monoambiente">Monoambiente</option>
                          {["1","2","3","4"].map(v => <option key={v} value={v}>{v} dormitorio{v==="1"?"":"s"}</option>)}
                          <option value="5+">5 o más</option>
                        </FocusSel>
                      </Field>

                      <Field label="Baños">
                        <FocusSel value={attrs.bathrooms ?? ""} onChange={(e) => handleAttr("bathrooms", e.target.value)}>
                          <option value="">Seleccioná...</option>
                          {["1","2","3"].map(v => <option key={v} value={v}>{v} baño{v==="1"?"":"s"}</option>)}
                          <option value="4+">4 o más</option>
                        </FocusSel>
                      </Field>

                      {attrs.sub_category === "departamento" && (
                        <Field label="Piso">
                          <FocusSel value={attrs.floor ?? ""} onChange={(e) => handleAttr("floor", e.target.value)}>
                            <option value="">Seleccioná...</option>
                            <option value="pb">Planta baja</option>
                            {[1,2,3,4,5,6,7,8,9,10].map(f => <option key={f} value={String(f)}>{f}° piso</option>)}
                            <option value="11+">11° o superior</option>
                          </FocusSel>
                        </Field>
                      )}

                      <Field label="Sup. cubierta">
                        <div style={{ position: "relative" }}>
                          <FocusInp type="number" value={attrs.m2_covered ?? ""} onChange={(e) => handleAttr("m2_covered", e.target.value)} placeholder="80" style={{ paddingRight: "36px" }}/>
                          <span style={{ position: "absolute", right: "11px", top: "50%", transform: "translateY(-50%)", fontSize: "10px", color: C.slate300, fontWeight: 700 }}>m²</span>
                        </div>
                      </Field>

                      <Field label="Sup. total">
                        <div style={{ position: "relative" }}>
                          <FocusInp type="number" value={attrs.m2_total ?? ""} onChange={(e) => handleAttr("m2_total", e.target.value)} placeholder="200" style={{ paddingRight: "36px" }}/>
                          <span style={{ position: "absolute", right: "11px", top: "50%", transform: "translateY(-50%)", fontSize: "10px", color: C.slate300, fontWeight: 700 }}>m²</span>
                        </div>
                      </Field>

                      <Field label="Antigüedad">
                        <FocusSel value={attrs.age ?? ""} onChange={(e) => handleAttr("age", e.target.value)}>
                          <option value="">Seleccioná...</option>
                          <option value="estrenar">A estrenar</option>
                          <option value="0-5">Menos de 5 años</option>
                          <option value="5-10">5 a 10 años</option>
                          <option value="10-20">10 a 20 años</option>
                          <option value="20-30">20 a 30 años</option>
                          <option value="30+">Más de 30 años</option>
                        </FocusSel>
                      </Field>

                      <Field label="Orientación">
                        <FocusSel value={attrs.orientation ?? ""} onChange={(e) => handleAttr("orientation", e.target.value)}>
                          <option value="">Seleccioná...</option>
                          {["Norte","Sur","Este","Oeste","Noreste","Noroeste","Sureste","Suroeste"].map(o => <option key={o} value={o.toLowerCase()}>{o}</option>)}
                        </FocusSel>
                      </Field>

                      <Field label="Calefacción">
                        <FocusSel value={attrs.heating ?? ""} onChange={(e) => handleAttr("heating", e.target.value)}>
                          <option value="">Seleccioná...</option>
                          <option value="central">Central</option>
                          <option value="radiadores">Radiadores</option>
                          <option value="split">Split / A/A</option>
                          <option value="losa">Losa radiante</option>
                          <option value="estufa">Estufa</option>
                          <option value="ninguna">Sin calefacción</option>
                        </FocusSel>
                      </Field>

                      {(attrs.sub_category === "departamento" || attrs.operation === "alquiler") && (
                        <Field label="Expensas mensuales">
                          <div style={{ position: "relative" }}>
                            <FocusInp type="number" value={attrs.expenses ?? ""} onChange={(e) => handleAttr("expenses", e.target.value)} placeholder="0" style={{ paddingLeft: "28px" }}/>
                            <span style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", fontSize: "11px", color: C.slate400, fontWeight: 700 }}>$</span>
                          </div>
                        </Field>
                      )}

                      {/* Zona */}
                      <Field label="Departamento / Zona" required>
                        <FocusSel value={zone} onChange={(e) => setZone(e.target.value)}>
                          <option value="">Seleccioná...</option>
                          {SAN_JUAN_ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                        </FocusSel>
                      </Field>

                      {/* Características */}
                      <div style={{ gridColumn: "span 2" }}>
                        <label style={{ ...T.lbl, display: "block", marginBottom: "10px" }}>Características</label>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                          {[
                            ["garage","🚗 Cochera"],
                            ["pool","🏊 Pileta"],
                            ["elevator","🛗 Ascensor"],
                            ["private_complex","🏘️ Barrio privado"],
                            ["credit_eligible","🏦 Apto crédito"],
                            ["furnished","🛋️ Amoblado"],
                            ["pets_allowed","🐾 Mascotas OK"],
                            ["air_conditioning","❄️ Aire acondicionado"],
                            ["laundry","👕 Lavadero"],
                            ["storage","📦 Baulera"],
                            ["grill","🔥 Parrilla"],
                            ["security","🔒 Seguridad 24hs"],
                          ].map(([k,l]) => (
                            <CheckItem key={k} label={l} value={!!attrs[k]} onChange={(v) => handleAttr(k, v)} />
                          ))}
                        </div>
                      </div>

                      {/* Vendido por */}
                      <div style={{ gridColumn: "span 2" }}>
                        <label style={T.lbl}>Publicado por</label>
                        <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                          {[["particular","👤 Dueño directo"],["inmobiliaria","🏢 Inmobiliaria"]].map(([v,l]) => (
                            <button key={v} type="button" onClick={() => handleAttr("seller_type", v)} style={{ flex: 1, padding: "10px", borderRadius: "9px", fontSize: "13px", border: `1.5px solid ${attrs.seller_type === v ? C.blue : C.slate200}`, background: attrs.seller_type === v ? C.blue50 : C.white, color: attrs.seller_type === v ? C.blue : C.slate500, fontWeight: attrs.seller_type === v ? 700 : 400, cursor: "pointer", fontFamily: "inherit", transition: "all .1s" }}>{l}</button>
                          ))}
                        </div>
                      </div>

                      {/* Geolocalización */}
                      <div style={{ gridColumn: "span 2" }}>
                        <label style={{ ...T.lbl, display: "block", marginBottom: "8px" }}>
                          Ubicación exacta
                          <span style={{ fontSize: "11px", color: C.slate400, fontWeight: 400, marginLeft: "8px" }}>Solo visible para interesados</span>
                        </label>
                        <PropertyLocation
                          lat={attrs.lat ? Number(attrs.lat) : undefined}
                          lng={attrs.lng ? Number(attrs.lng) : undefined}
                          addressStr={attrs.address_str}
                          onChange={(lat, lng, addr) => {
                            handleAttr("lat", lat);
                            handleAttr("lng", lng);
                            handleAttr("address_str", addr);
                          }}
                        />
                      </div>
                    </>
                  )}

                  {/* Zona — non-vehicle, non-real-estate */}
                  {!isVehicle && !isRealEstate && (
                    <div style={{ gridColumn: "span 2" }}>
                      <Field label="Zona / Departamento" required>
                        <FocusSel
                          value={zone}
                          onChange={(e) => setZone(e.target.value)}
                        >
                          <option value="">Seleccioná...</option>
                          {SAN_JUAN_ZONES.map((z) => (
                            <option key={z} value={z}>
                              {z}
                            </option>
                          ))}
                        </FocusSel>
                      </Field>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* end left column */}

          {/* ── RIGHT SIDEBAR ── */}
          {sidebarJSX}
        </div>
      )}

      {/* ════ PUBLISHING ════ */}
      {step === "publishing" && (
        <div
          style={{
            maxWidth: "480px",
            margin: "80px auto",
            padding: "0 20px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              background: C.white,
              borderRadius: "18px",
              border: `1px solid ${C.slate200}`,
              padding: "60px 40px",
              boxShadow: "0 4px 24px rgba(15,23,42,.08)",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                margin: "0 auto 18px",
                borderRadius: "50%",
                background: C.blue50,
                border: `3px solid ${C.blue100}`,
                borderTopColor: C.blue,
                animation: "spin 0.8s linear infinite",
              }}
            />
            <div
              style={{
                fontWeight: 800,
                fontSize: "17px",
                color: C.slate900,
                marginBottom: "6px",
              }}
            >
              Publicando tu aviso...
            </div>
            <div style={{ fontSize: "13px", color: C.slate400 }}>
              Subiendo fotos y guardando en comercIA
            </div>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {/* ════ PROMO ════ */}
      {step === "promo" && (
        <div style={{ maxWidth: "680px", margin: "60px auto", padding: "0 20px" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{
              width: "60px", height: "60px", margin: "0 auto 16px",
              borderRadius: "50%", background: C.blue50,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px",
            }}>🎉</div>
            <div style={{ fontWeight: 900, fontSize: "22px", color: C.slate900, marginBottom: "8px" }}>
              ¡Aviso publicado!
            </div>
            <div style={{ fontSize: "14px", color: C.slate500 }}>
              ¿Querés destacarlo para que más personas lo vean?
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "16px" }}>
            {/* Básico */}
            <div style={{
              background: C.white, border: `1.5px solid ${C.slate200}`,
              borderRadius: "14px", padding: "24px 16px", textAlign: "center",
              boxShadow: "0 2px 10px rgba(15,23,42,.06)",
            }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>⭐</div>
              <div style={{ fontWeight: 800, fontSize: "15px", color: C.slate900, marginBottom: "4px" }}>Básico</div>
              <div style={{ fontWeight: 900, fontSize: "22px", color: C.blue, marginBottom: "12px" }}>$1.500</div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", fontSize: "12px", color: C.slate600, lineHeight: 1.8 }}>
                <li>✓ Destacado 7 días</li>
                <li>✓ Aparece primero en búsquedas</li>
                <li>✓ Badge "Destacado"</li>
              </ul>
              <button
                type="button"
                onClick={async () => {
                  if (doneId) await fetch(`/api/listings/${doneId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ featured_level: "bronze" }) });
                  setStep("done");
                }}
                style={{
                  width: "100%", background: C.blue, color: C.white,
                  border: "none", borderRadius: "8px", padding: "10px",
                  fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Probar Básico [TEST]
              </button>
            </div>

            {/* Destacado */}
            <div style={{
              background: C.blue, border: `1.5px solid ${C.blue}`,
              borderRadius: "14px", padding: "24px 16px", textAlign: "center",
              boxShadow: "0 4px 20px rgba(37,99,235,.3)",
              position: "relative",
            }}>
              <div style={{
                position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)",
                background: "#f59e0b", color: "#fff", fontSize: "11px", fontWeight: 800,
                padding: "3px 12px", borderRadius: "20px", whiteSpace: "nowrap" as const,
              }}>
                MÁS POPULAR
              </div>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>🚀</div>
              <div style={{ fontWeight: 800, fontSize: "15px", color: "#fff", marginBottom: "4px" }}>Destacado</div>
              <div style={{ fontWeight: 900, fontSize: "22px", color: "#fff", marginBottom: "12px" }}>$3.500</div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", fontSize: "12px", color: "rgba(255,255,255,.85)", lineHeight: 1.8 }}>
                <li>✓ Destacado 15 días</li>
                <li>✓ Posición premium en búsquedas</li>
                <li>✓ Badge "Super Destacado"</li>
              </ul>
              <button
                type="button"
                onClick={async () => {
                  if (doneId) await fetch(`/api/listings/${doneId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ featured_level: "gold" }) });
                  setStep("done");
                }}
                style={{
                  width: "100%", background: "#fff", color: C.blue,
                  border: "none", borderRadius: "8px", padding: "10px",
                  fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Probar Destacado [TEST]
              </button>
            </div>

            {/* Premium */}
            <div style={{
              background: C.white, border: `1.5px solid ${C.slate200}`,
              borderRadius: "14px", padding: "24px 16px", textAlign: "center",
              boxShadow: "0 2px 10px rgba(15,23,42,.06)",
            }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>👑</div>
              <div style={{ fontWeight: 800, fontSize: "15px", color: C.slate900, marginBottom: "4px" }}>Premium</div>
              <div style={{ fontWeight: 900, fontSize: "22px", color: C.blue, marginBottom: "12px" }}>$6.000</div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", fontSize: "12px", color: C.slate600, lineHeight: 1.8 }}>
                <li>✓ Destacado 30 días</li>
                <li>✓ Primer resultado garantizado</li>
                <li>✓ Badge "Premium" + foto grande</li>
              </ul>
              <button
                type="button"
                onClick={async () => {
                  if (doneId) await fetch(`/api/listings/${doneId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ featured_level: "gold" }) });
                  setStep("done");
                }}
                style={{
                  width: "100%", background: C.blue, color: C.white,
                  border: "none", borderRadius: "8px", padding: "10px",
                  fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Probar Premium [TEST]
              </button>
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <button
              type="button"
              onClick={() => setStep("done")}
              style={{
                background: "none", border: "none", color: C.slate500,
                fontSize: "13px", cursor: "pointer", textDecoration: "underline", fontFamily: "inherit",
              }}
            >
              No destacar por ahora (gratis)
            </button>
          </div>
        </div>
      )}

      {/* ════ DONE ════ */}
      {step === "done" && (
        <div
          style={{
            maxWidth: "480px",
            margin: "80px auto",
            padding: "0 20px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              background: C.white,
              borderRadius: "18px",
              border: `1px solid ${C.slate200}`,
              padding: "60px 40px",
              boxShadow: "0 4px 24px rgba(15,23,42,.08)",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                margin: "0 auto 18px",
                borderRadius: "50%",
                background: C.blue50,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
              }}
            >
              🎉
            </div>
            <div
              style={{
                fontWeight: 900,
                fontSize: "20px",
                color: C.slate900,
                marginBottom: "8px",
              }}
            >
              ¡Aviso publicado!
            </div>
            <div
              style={{
                fontSize: "14px",
                color: C.slate500,
                marginBottom: "28px",
                lineHeight: 1.5,
              }}
            >
              Tu aviso ya está visible en San Juan.
            </div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
                flexWrap: "wrap" as const,
              }}
            >
              {doneId && (
                <button
                  type="button"
                  onClick={() => router.push(`/listings/${doneId}`)}
                  style={{
                    background: C.blue,
                    color: C.white,
                    border: "none",
                    borderRadius: "10px",
                    padding: "12px 22px",
                    fontWeight: 800,
                    fontSize: "14px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    boxShadow: "0 4px 14px rgba(37,99,235,.3)",
                  }}
                >
                  Ver mi aviso
                </button>
              )}
              <button
                type="button"
                onClick={reset}
                style={{
                  background: C.slate100,
                  color: C.slate700,
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px 18px",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Publicar otro
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                style={{
                  background: C.white,
                  color: C.blue,
                  border: `1.5px solid ${C.blue100}`,
                  borderRadius: "10px",
                  padding: "12px 18px",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
