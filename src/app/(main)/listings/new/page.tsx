"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { id: 1, name: "Electrónica" },
  { id: 2, name: "Vehículos" },
  { id: 3, name: "Inmuebles" },
  { id: 4, name: "Ropa y Calzado" },
  { id: 5, name: "Hogar y Jardín" },
  { id: 6, name: "Deportes" },
  { id: 7, name: "Herramientas" },
  { id: 8, name: "Libros" },
  { id: 9, name: "Mascotas" },
  { id: 10, name: "Otros" },
];

const CONDITIONS = [
  { value: "new", label: "Nuevo" },
  { value: "like_new", label: "Como nuevo" },
  { value: "very_good", label: "Muy bueno" },
  { value: "good", label: "Bueno" },
  { value: "fair", label: "Regular" },
  { value: "for_parts", label: "Para repuestos" },
];

type Step = "upload" | "analyzing" | "form" | "publishing" | "done";

interface PhotoItem {
  file: File;
  preview: string;
  uploading: boolean;
  url: string | null;
}

interface AIData {
  title: string;
  description: string;
  category: string;
  category_id: number;
  condition: string;
  confidence: number;
  price_suggested: number | null;
  price_min: number | null;
  price_max: number | null;
  price_avg: number | null;
  price_source: "comercia" | "mercadolibre" | "none";
  price_sample_size: number;
  ml_prices: {
    price_min: number;
    price_max: number;
    price_avg: number;
    price_suggested: number;
    price_sample_size: number;
  } | null;
}

export default function NewListingPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [aiData, setAiData] = useState<AIData | null>(null); // ✅ typed
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState<number>(10);
  const [condition, setCondition] = useState("good");
  const [neighborhood, setNeighborhood] = useState("");
  const [acceptsOffers, setAcceptsOffers] = useState(true);

  const MAX_PHOTOS = 8;

  // ─── Photo handling ──────────────────────────────────────────

  function handleFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    const valid = arr.filter((f) => f.type.startsWith("image/"));
    if (!valid.length) return;

    const current = photos.length;
    const slots = MAX_PHOTOS - current;
    const toAdd = valid.slice(0, slots);

    const newPhotos: PhotoItem[] = toAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      url: null,
    }));

    setPhotos((prev) => [...prev, ...newPhotos]);

    // Analyze first photo with AI only once
    if (current === 0 && newPhotos.length > 0) {
      analyzeWithAI(newPhotos[0].file);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) handleFiles(e.target.files);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    // If cover photo removed, clear AI data and form
    if (index === 0) {
      setAiData(null);
      setTitle("");
      setDescription("");
      setPrice("");
      setStep("upload");
    }
  }

  function movePhoto(from: number, to: number) {
    if (to < 0 || to >= photos.length) return;
    const updated = [...photos];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setPhotos(updated);
  }

  // ─── AI analysis ─────────────────────────────────────────────

  async function analyzeWithAI(file: File) {
    setStep("analyzing");
    setError("");
    try {
      const fd = new FormData();
      fd.append("photo", file);
      const res = await fetch("/api/ai/analyze-photo", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error();
      const data: AIData = await res.json();

      setAiData(data);
      setTitle(data.title ?? "");
      setDescription(data.description ?? "");
      setCategoryId(data.category_id ?? 10);
      setCondition(data.condition ?? "good");

      // ✅ Only set price if we have a real suggestion
      if (data.price_suggested && data.price_suggested > 0) {
        setPrice(String(data.price_suggested));
      } else {
        setPrice(""); // leave blank so user fills it in
      }

      setStep("form");
    } catch {
      setError(
        "No se pudo analizar la imagen. Completá el formulario manualmente.",
      );
      setStep("form");
    }
  }

  // ─── Upload ──────────────────────────────────────────────────

  async function uploadPhoto(
    item: PhotoItem,
    index: number,
  ): Promise<string | null> {
    if (item.url) return item.url;
    setPhotos((prev) =>
      prev.map((p, i) => (i === index ? { ...p, uploading: true } : p)),
    );
    try {
      const fd = new FormData();
      fd.append("file", item.file);
      const res = await fetch("/api/images/upload", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPhotos((prev) =>
        prev.map((p, i) =>
          i === index ? { ...p, uploading: false, url: data.url } : p,
        ),
      );
      return data.url;
    } catch {
      setPhotos((prev) =>
        prev.map((p, i) => (i === index ? { ...p, uploading: false } : p)),
      );
      return null;
    }
  }

  // ─── Submit ──────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !price) {
      setError("Completá todos los campos obligatorios.");
      return;
    }
    setStep("publishing");
    setError("");

    try {
      // Upload all photos in parallel
      const uploadedUrls: (string | null)[] = await Promise.all(
        photos.map((photo, i) => uploadPhoto(photo, i)),
      );
      const imageUrls = uploadedUrls.filter((u): u is string => !!u);

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price: parseFloat(price),
          category_id: categoryId,
          condition,
          neighborhood,
          accepts_offers: acceptsOffers,
          ai_generated: !!aiData,
          ai_title: aiData?.title ?? null,
          ai_description: aiData?.description ?? null,
          ai_price_min: aiData?.price_min ?? null,
          ai_price_max: aiData?.price_max ?? null,
          ai_confidence: aiData?.confidence ?? null,
          images: imageUrls,
        }),
      });

      if (!res.ok) throw new Error();
      setStep("done");
    } catch {
      setError("Error al publicar el aviso. Intentá de nuevo.");
      setStep("form");
    }
  }

  // ─── Styles ──────────────────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1px solid #ddd",
    borderRadius: "4px",
    padding: "10px 12px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    background: "#fff",
  };

  const numPrice = parseFloat(price) || 0;

  // ─── Render ──────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#333" }}>
          Publicar aviso
        </h1>
        <p style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>
          Subí fotos y la IA completa todo automáticamente ✨
        </p>
      </div>

      {/* ── ANALYZING ── */}
      {step === "analyzing" && (
        <div
          style={{
            background: "#fff",
            borderRadius: "8px",
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          {photos[0] && (
            <img
              src={photos[0].preview}
              alt="preview"
              style={{
                width: "140px",
                height: "140px",
                objectFit: "cover",
                borderRadius: "8px",
                marginBottom: "20px",
                display: "block",
                margin: "0 auto 20px",
              }}
            />
          )}
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🤖</div>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#333",
              marginBottom: "6px",
            }}
          >
            Analizando con IA...
          </h2>
          <p style={{ fontSize: "13px", color: "#888" }}>
            Identificando producto, consultando precios en MercadoLibre...
          </p>
        </div>
      )}

      {/* ── UPLOAD / FORM ── */}
      {(step === "upload" || step === "form") && (
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          {/* ── Photo uploader ── */}
          <div
            style={{ background: "#fff", borderRadius: "8px", padding: "20px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
              }}
            >
              <div>
                <div
                  style={{ fontSize: "14px", fontWeight: 700, color: "#333" }}
                >
                  Fotos del producto
                </div>
                <div style={{ fontSize: "12px", color: "#888" }}>
                  La primera foto es la portada · Máximo {MAX_PHOTOS} fotos
                </div>
              </div>
              <span
                style={{
                  fontSize: "12px",
                  color: photos.length >= MAX_PHOTOS ? "#dc2626" : "#888",
                }}
              >
                {photos.length}/{MAX_PHOTOS}
              </span>
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {/* Existing photos */}
              {photos.map((photo, i) => (
                <div
                  key={i}
                  style={{
                    position: "relative",
                    width: "100px",
                    height: "100px",
                  }}
                >
                  <img
                    src={photo.preview}
                    alt={`foto ${i + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "6px",
                      border: i === 0 ? "2px solid #3483fa" : "2px solid #eee",
                      opacity: photo.uploading ? 0.5 : 1,
                    }}
                  />
                  {i === 0 && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: "4px",
                        left: "4px",
                        background: "#3483fa",
                        color: "#fff",
                        fontSize: "9px",
                        fontWeight: 700,
                        padding: "2px 5px",
                        borderRadius: "3px",
                      }}
                    >
                      PORTADA
                    </span>
                  )}
                  {photo.uploading && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "6px",
                        background: "rgba(255,255,255,0.6)",
                      }}
                    >
                      <span style={{ fontSize: "20px" }}>⏳</span>
                    </div>
                  )}
                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    style={{
                      position: "absolute",
                      top: "-8px",
                      right: "-8px",
                      background: "#dc2626",
                      color: "#fff",
                      border: "none",
                      borderRadius: "50%",
                      width: "22px",
                      height: "22px",
                      cursor: "pointer",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    ✕
                  </button>
                  {/* Reorder */}
                  <div
                    style={{
                      position: "absolute",
                      top: "-8px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      display: "flex",
                      gap: "2px",
                    }}
                  >
                    {i > 0 && (
                      <button
                        type="button"
                        onClick={() => movePhoto(i, i - 1)}
                        style={{
                          background: "rgba(0,0,0,0.6)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "3px",
                          padding: "1px 5px",
                          cursor: "pointer",
                          fontSize: "10px",
                        }}
                      >
                        ←
                      </button>
                    )}
                    {i < photos.length - 1 && (
                      <button
                        type="button"
                        onClick={() => movePhoto(i, i + 1)}
                        style={{
                          background: "rgba(0,0,0,0.6)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "3px",
                          padding: "1px 5px",
                          cursor: "pointer",
                          fontSize: "10px",
                        }}
                      >
                        →
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Add more / drop zone */}
              {photos.length < MAX_PHOTOS && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  style={{
                    width: photos.length === 0 ? "100%" : "100px",
                    height: photos.length === 0 ? "140px" : "100px",
                    border: `2px dashed ${dragOver ? "#3483fa" : "#ddd"}`,
                    borderRadius: "6px",
                    background: dragOver ? "#eff6ff" : "#fafafa",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    transition: "all 0.15s",
                  }}
                >
                  <span
                    style={{ fontSize: photos.length === 0 ? "36px" : "22px" }}
                  >
                    📷
                  </span>
                  {photos.length === 0 ? (
                    <>
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#3483fa",
                        }}
                      >
                        Subir fotos
                      </span>
                      <span style={{ fontSize: "12px", color: "#888" }}>
                        o arrastrá acá
                      </span>
                    </>
                  ) : (
                    <span style={{ fontSize: "10px", color: "#888" }}>
                      Agregar
                    </span>
                  )}
                </button>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileInput}
              style={{ display: "none" }}
            />

            {photos.length === 0 && (
              <p
                style={{
                  fontSize: "12px",
                  color: "#bbb",
                  textAlign: "center",
                  marginTop: "10px",
                }}
              >
                La primera foto se analizará con IA automáticamente
              </p>
            )}
          </div>

          {/* ── FORM (only shown after AI analysis or manual skip) ── */}
          {step === "form" && (
            <>
              {/* AI banner */}
              {aiData && (
                <div
                  style={{
                    background: "linear-gradient(135deg,#eff6ff,#f5f3ff)",
                    border: "1px solid #c7d2fe",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span style={{ fontSize: "22px" }}>🤖</span>
                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#3730a3",
                      }}
                    >
                      IA completó el formulario automáticamente
                    </div>
                    <div style={{ fontSize: "12px", color: "#6366f1" }}>
                      Categoría:{" "}
                      {CATEGORIES.find((c) => c.id === categoryId)?.name} ·
                      Confianza: {Math.round((aiData.confidence ?? 0) * 100)}%
                      {aiData.price_suggested
                        ? ` · Precio sugerido: $${aiData.price_suggested.toLocaleString("es-AR")}`
                        : " · Ingresá el precio manualmente"}
                    </div>
                  </div>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: "11px",
                      color: "#888",
                    }}
                  >
                    Podés editar todo
                  </span>
                </div>
              )}

              {error && (
                <div
                  style={{
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "6px",
                    padding: "10px 14px",
                    fontSize: "13px",
                    color: "#dc2626",
                  }}
                >
                  ⚠️ {error}
                </div>
              )}

              {/* Title */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: "8px",
                  padding: "20px",
                }}
              >
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#333",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Título del aviso *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: iPhone 13 Pro 256GB Grafito"
                  maxLength={80}
                  required
                  style={inputStyle}
                />
                <div
                  style={{
                    fontSize: "11px",
                    color: "#bbb",
                    marginTop: "4px",
                    textAlign: "right",
                  }}
                >
                  {title.length}/80
                </div>
              </div>

              {/* Description */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: "8px",
                  padding: "20px",
                }}
              >
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#333",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Descripción *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describí el estado, características y cualquier detalle relevante..."
                  rows={4}
                  required
                  style={{ ...inputStyle, resize: "vertical" }}
                />
                <div
                  style={{
                    fontSize: "11px",
                    color: "#bbb",
                    marginTop: "4px",
                    textAlign: "right",
                  }}
                >
                  {description.length} caracteres
                </div>
              </div>

              {/* Price + Category + Condition */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: "8px",
                  padding: "20px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "16px",
                }}
              >
                {/* Price */}
                <div>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#333",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    Precio (ARS) *
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#666",
                        fontSize: "14px",
                      }}
                    >
                      $
                    </span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0"
                      min="0"
                      required
                      style={{ ...inputStyle, paddingLeft: "22px" }}
                    />
                  </div>

                  {/* ✅ comercIA prices */}
                  {aiData?.price_source === "comercia" && aiData.price_min && (
                    <div
                      style={{
                        marginTop: "8px",
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        borderRadius: "6px",
                        padding: "8px 10px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#16a34a",
                          marginBottom: "4px",
                        }}
                      >
                        📊 comercIA ({aiData.price_sample_size} avisos)
                      </div>
                      <div style={{ fontSize: "11px", color: "#555" }}>
                        ${aiData.price_min.toLocaleString("es-AR")} – $
                        {aiData.price_max?.toLocaleString("es-AR")}
                      </div>
                      {aiData.ml_prices && (
                        <div
                          style={{
                            fontSize: "10px",
                            color: "#888",
                            marginTop: "2px",
                          }}
                        >
                          ML: $
                          {aiData.ml_prices.price_min.toLocaleString("es-AR")} –
                          ${aiData.ml_prices.price_max.toLocaleString("es-AR")}
                        </div>
                      )}
                      {!price && aiData.price_suggested && (
                        <button
                          type="button"
                          onClick={() =>
                            setPrice(String(aiData.price_suggested))
                          }
                          style={{
                            marginTop: "5px",
                            background: "#16a34a",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            padding: "3px 8px",
                            fontSize: "10px",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Usar ${aiData.price_suggested.toLocaleString("es-AR")}
                        </button>
                      )}
                    </div>
                  )}

                  {/* ✅ MercadoLibre prices */}
                  {aiData?.price_source === "mercadolibre" &&
                    aiData.price_min && (
                      <div
                        style={{
                          marginTop: "8px",
                          background: "#fffbeb",
                          border: "1px solid #fde68a",
                          borderRadius: "6px",
                          padding: "8px 10px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "#d97706",
                            marginBottom: "4px",
                          }}
                        >
                          🛒 MercadoLibre ({aiData.price_sample_size} productos)
                        </div>
                        <div style={{ fontSize: "11px", color: "#555" }}>
                          ${aiData.price_min.toLocaleString("es-AR")} – $
                          {aiData.price_max?.toLocaleString("es-AR")}
                        </div>
                        <div
                          style={{
                            fontSize: "10px",
                            color: "#888",
                            marginTop: "2px",
                          }}
                        >
                          Promedio: ${aiData.price_avg?.toLocaleString("es-AR")}
                        </div>
                        {!price && aiData.price_suggested && (
                          <button
                            type="button"
                            onClick={() =>
                              setPrice(String(aiData.price_suggested))
                            }
                            style={{
                              marginTop: "5px",
                              background: "#d97706",
                              color: "#fff",
                              border: "none",
                              borderRadius: "4px",
                              padding: "3px 8px",
                              fontSize: "10px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Usar $
                            {aiData.price_suggested.toLocaleString("es-AR")}
                          </button>
                        )}
                      </div>
                    )}

                  {/* ✅ No data */}
                  {aiData?.price_source === "none" && (
                    <div
                      style={{
                        marginTop: "6px",
                        fontSize: "11px",
                        color: "#888",
                        background: "#fafafa",
                        border: "1px solid #eee",
                        borderRadius: "6px",
                        padding: "6px 8px",
                      }}
                    >
                      📭 Sin referencia de precios. Ingresalo manualmente.
                    </div>
                  )}

                  {/* Live price display */}
                  {numPrice > 0 && (
                    <div
                      style={{
                        marginTop: "5px",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#3483fa",
                      }}
                    >
                      = ${numPrice.toLocaleString("es-AR")}
                    </div>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#333",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    Categoría *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(parseInt(e.target.value))}
                    style={inputStyle}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Condition */}
                <div>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#333",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    Estado *
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    style={inputStyle}
                  >
                    {CONDITIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location + Offers */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: "8px",
                  padding: "20px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#333",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    Barrio / Zona
                  </label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="Ej: Rivadavia, Capital"
                    style={inputStyle}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    paddingTop: "24px",
                  }}
                >
                  <input
                    type="checkbox"
                    id="offers"
                    checked={acceptsOffers}
                    onChange={(e) => setAcceptsOffers(e.target.checked)}
                    style={{ width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  <label
                    htmlFor="offers"
                    style={{
                      fontSize: "14px",
                      color: "#333",
                      cursor: "pointer",
                    }}
                  >
                    Acepto ofertas / negociación
                  </label>
                </div>
              </div>

              {/* Submit */}
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => router.back()}
                  style={{
                    background: "#fff",
                    color: "#333",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    padding: "12px 24px",
                    fontWeight: 600,
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: "#3483fa",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    padding: "13px",
                    fontWeight: 800,
                    fontSize: "16px",
                    cursor: "pointer",
                  }}
                >
                  🚀 Publicar aviso
                  {photos.length > 0
                    ? ` (${photos.length} foto${photos.length > 1 ? "s" : ""})`
                    : ""}
                </button>
              </div>
            </>
          )}

          {/* Skip to manual */}
          {step === "upload" && photos.length === 0 && (
            <div style={{ textAlign: "center" }}>
              <button
                type="button"
                onClick={() => setStep("form")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#3483fa",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Preferís completar el formulario sin foto →
              </button>
            </div>
          )}
        </form>
      )}

      {/* ── PUBLISHING ── */}
      {step === "publishing" && (
        <div
          style={{
            background: "#fff",
            borderRadius: "8px",
            padding: "64px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚀</div>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#333",
              marginBottom: "8px",
            }}
          >
            Publicando tu aviso...
          </h2>
          <p style={{ fontSize: "13px", color: "#888" }}>
            Subiendo {photos.length} foto{photos.length !== 1 ? "s" : ""} y
            guardando el aviso
          </p>
        </div>
      )}

      {/* ── DONE ── */}
      {step === "done" && (
        <div
          style={{
            background: "#fff",
            borderRadius: "8px",
            padding: "64px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎉</div>
          <h2
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "#333",
              marginBottom: "8px",
            }}
          >
            ¡Aviso publicado!
          </h2>
          <p style={{ fontSize: "14px", color: "#666", marginBottom: "28px" }}>
            Tu aviso ya está visible para todos en San Juan.
          </p>
          <div
            style={{ display: "flex", gap: "12px", justifyContent: "center" }}
          >
            <button
              onClick={() => router.push("/my-listings")}
              style={{
                background: "#3483fa",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                padding: "12px 24px",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Ver mis avisos
            </button>
            <button
              onClick={() => {
                setStep("upload");
                setPhotos([]);
                setAiData(null);
                setTitle("");
                setDescription("");
                setPrice("");
              }}
              style={{
                background: "#fff",
                color: "#333",
                border: "1px solid #ddd",
                borderRadius: "4px",
                padding: "12px 24px",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Publicar otro
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
