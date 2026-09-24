"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useHomeProvince } from "./HomeProvinceContext";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import type { VehicleFacets, BrandOption } from "@/lib/hero-facets";
import { VEHICLE_TYPE_OPTIONS } from "@/lib/labels";
import { SmartSearchButton } from "./SmartSearchButton";
import { FOCUS_PROVINCES, FOCUS_REGION_LABEL, isFocusProvince } from "@/lib/region";
import { sanitizeRangeParams } from "@/lib/listing-filters";
import { vehiclesHref } from "@/lib/vehicle-landing";

const PROVINCES = [
  "Buenos Aires","CABA","Catamarca","Chaco","Chubut","Córdoba",
  "Corrientes","Entre Ríos","Formosa","Jujuy","La Pampa","La Rioja",
  "Mendoza","Misiones","Neuquén","Río Negro","Salta","San Juan",
  "San Luis","Santa Cruz","Santa Fe","Santiago del Estero",
  "Tierra del Fuego","Tucumán",
];

// Debajo de este total el botón no muestra el contador (evita el efecto "vidriera vacía").
const MIN_COUNT_TO_SHOW = 50;

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1959 }, (_, i) => CURRENT_YEAR - i);

// "Santiago del Estero" -> "santiago-del-estero" (misma convención que RE_LOCATIONS / v_province)
const slugify = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim().replace(/\s+/g, "-");

// Para comparar modelos del catálogo con los cargados en los avisos ("Corolla Cross" ~ "corolla-cross")
const normalizeModel = (m: string) => m.toLowerCase().replace(/[\s-]/g, "");

// Tipos en los que hay que buscar los modelos de una marca: el elegido o, si no hay, todos donde tiene avisos
const modelTypes = (facets: VehicleFacets, brand: string, type: string) =>
  type ? [type] : facets.typesByBrand[brand] ?? [];

interface Suggestion {
  id: string;
  title: string;
  price: number;
  currency: string;
}

interface HeroSearchProps {
  facets: VehicleFacets;
  totalCount: number;
}

export function HeroSearch({ facets, totalCount }: HeroSearchProps) {
  const { province, setProvince } = useHomeProvince();
  const router = useRouter();

  const [type, setType] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [query, setQuery] = useState("");
  const [condition, setCondition] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  // Filtros secundarios plegados por defecto: lo esencial es tipo, marca y modelo
  const [showMore, setShowMore] = useState(false);
  const moreCount = [condition, priceMin, priceMax, yearFrom, yearTo].filter(Boolean).length;

  const [catalogModels, setCatalogModels] = useState<Record<string, string[]>>({});

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputWrapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Catálogo de marcas del tipo elegido, con las que tienen avisos primero.
  // Un tipo sin catálogo no debe heredar las marcas de otros tipos.
  const brandOptions: BrandOption[] = useMemo(
    () => (type ? facets.brandsByType[type] ?? [] : facets.brandsByType[""] ?? []),
    [facets, type]
  );
  const brandsWithStock = useMemo(() => brandOptions.filter((b) => b.count > 0), [brandOptions]);
  const brandsWithoutStock = useMemo(() => brandOptions.filter((b) => b.count === 0), [brandOptions]);

  // Modelos: solo se ofrecen para marcas con avisos. Los que tienen stock van primero y el
  // resto del catálogo se pide al elegir la marca.
  const brandHasStock = brandsWithStock.some((b) => b.value === brand);
  const stockModels = useMemo(() => (brand ? facets.modelsByBrand[brand] ?? [] : []), [facets, brand]);
  const catalogKey = brand ? `${brand}|${modelTypes(facets, brand, type).join(",")}` : "";
  const otherModels = useMemo(() => {
    const inStock = new Set(stockModels.map(normalizeModel));
    return (catalogModels[catalogKey] ?? []).filter((m) => !inStock.has(normalizeModel(m)));
  }, [stockModels, catalogModels, catalogKey]);

  const onTypeChange = (value: string) => {
    setType(value);
    setBrand("");
    setModel("");
  };
  const onBrandChange = (value: string) => {
    setBrand(value);
    setModel("");
    if (!value || !brandsWithStock.some((b) => b.value === value)) return;
    const types = modelTypes(facets, value, type);
    const key = `${value}|${types.join(",")}`;
    if (catalogModels[key] || types.length === 0) return;
    Promise.all(
      types.map((t) =>
        fetch(`/api/vehiculos/modelos?brand=${encodeURIComponent(value)}&tipo=${t}`)
          .then((r) => (r.ok ? (r.json() as Promise<string[]>) : []))
          .catch(() => [] as string[])
      )
    ).then((lists) => setCatalogModels((prev) => ({ ...prev, [key]: [...new Set(lists.flat())] })));
  };

  useEffect(() => {
    if (showSuggestions && inputWrapRef.current) {
      setRect(inputWrapRef.current.getBoundingClientRect());
    }
  }, [showSuggestions, suggestions]);

  // Con menos de 2 caracteres no se sugiere nada (el dropdown se oculta por derivación, sin setState en el efecto)
  const canSuggest = query.trim().length >= 2;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!canSuggest) return;
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/listings/search-suggestions?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setSuggestions(data);
      setShowSuggestions(true);
    }, 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, canSuggest]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        searchRef.current && !searchRef.current.contains(e.target as Node) &&
        !(e.target as Element)?.closest?.("[data-hero-dropdown]")
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = () => {
    setShowSuggestions(false);
    const params = new URLSearchParams();
    if (type) params.set("type", type); // `type` es el parámetro canónico del tipo en /category
    if (brand) params.set("brand", brand);
    if (model) params.set("model", model);
    if (query.trim()) params.set("q", query.trim());
    if (condition) params.set("condition", condition);
    // Sin negativos ni "1e3"; si el mínimo supera al máximo se invierten (igual que en el servidor)
    const range = sanitizeRangeParams({ price_min: priceMin, price_max: priceMax, year_from: yearFrom, year_to: yearTo });
    if (range.price_min) params.set("price_min", range.price_min);
    if (range.price_max) params.set("price_max", range.price_max);
    if (range.year_from) params.set("year_from", range.year_from);
    if (range.year_to) params.set("year_to", range.year_to);
    if (province) params.set("v_province", slugify(province));
    router.push(vehiclesHref(params));
  };

  const onEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
    if (e.key === "Escape") setShowSuggestions(false);
  };

  const buttonLabel = totalCount >= MIN_COUNT_TO_SHOW
    ? `Buscar ${totalCount.toLocaleString("es-AR")} vehículos`
    : "Buscar vehículos";

  const dropdown = canSuggest && showSuggestions && suggestions.length > 0 && rect ? createPortal(
    <div
      data-hero-dropdown
      style={{
        position: "fixed",
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
        background: "#fff",
        border: "1.5px solid #cbd5e1",
        borderTop: "none",
        borderRadius: "0 0 10px 10px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        zIndex: 99999,
        overflow: "hidden",
      }}
    >
      {suggestions.map((s, i) => (
        <div
          key={s.id}
          onMouseDown={() => {
            setShowSuggestions(false);
            router.push(`/listings/${s.id}`);
          }}
          style={{
            padding: "10px 14px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            cursor: "pointer",
            borderTop: i > 0 ? "1px solid #f1f5f9" : "none",
            fontSize: "13px", color: "#0f172a",
          }}
          className="hover:bg-slate-50"
        >
          <span>{s.title}</span>
          <span style={{ color: "#1d6fb8", fontWeight: 700, fontSize: "12px", whiteSpace: "nowrap", marginLeft: "12px" }}>
            {s.currency === "USD" ? "U$D" : "$"} {s.price.toLocaleString("es-AR")}
          </span>
        </div>
      ))}
      <div
        onMouseDown={handleSearch}
        style={{
          padding: "9px 14px", fontSize: "12px",
          color: "#1d6fb8", fontWeight: 600, cursor: "pointer",
          borderTop: "1px solid #f1f5f9", background: "#f8faff", textAlign: "center",
        }}
        className="hover:bg-indigo-50"
      >
        Ver todos los resultados para &ldquo;{query}&rdquo;
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <div className="hero-panel">
        <div className="hero-panel-head">
          <h2 className="hero-panel-title">Buscá entre todos los vehículos publicados</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <SmartSearchButton />
            <Link href="/listings/new" className="hero-sell-link">
              ¿Querés vender? Publicá gratis →
            </Link>
          </div>
        </div>

        <div className="hero-row-1">
          <div className="hero-field">
            <label className="hero-label" htmlFor="hero-type">Tipo</label>
            <select id="hero-type" className="hero-control" value={type} onChange={(e) => onTypeChange(e.target.value)}>
              <option value="">Todos</option>
              {VEHICLE_TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className="hero-field">
            <label className="hero-label" htmlFor="hero-brand">Marca</label>
            <select id="hero-brand" className="hero-control" value={brand} onChange={(e) => onBrandChange(e.target.value)}>
              <option value="">Todas</option>
              {brandsWithStock.length > 0 && brandsWithoutStock.length > 0 ? (
                <>
                  <optgroup label="Con avisos publicados">
                    {brandsWithStock.map((b) => <option key={b.value} value={b.value}>{b.label} ({b.count})</option>)}
                  </optgroup>
                  <optgroup label="Otras marcas">
                    {brandsWithoutStock.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                  </optgroup>
                </>
              ) : (
                brandOptions.map((b) => (
                  <option key={b.value} value={b.value}>{b.count > 0 ? `${b.label} (${b.count})` : b.label}</option>
                ))
              )}
            </select>
          </div>

          <div className="hero-field">
            <label className="hero-label" htmlFor="hero-model" style={{ color: brandHasStock ? undefined : "#94a3b8" }}>Modelo</label>
            <select
              id="hero-model"
              className="hero-control"
              value={model}
              disabled={!brandHasStock}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="">{brand && !brandHasStock ? "Sin avisos todavía" : "Todos"}</option>
              {stockModels.length > 0 && (
                <optgroup label="Con avisos publicados">
                  {stockModels.map((m) => <option key={m} value={m}>{m}</option>)}
                </optgroup>
              )}
              {otherModels.length > 0 && (
                <optgroup label={stockModels.length > 0 ? "Otros modelos" : "Modelos"}>
                  {otherModels.map((m) => <option key={m} value={m}>{m}</option>)}
                </optgroup>
              )}
            </select>
          </div>

          <div className="hero-field">
            <label className="hero-label" htmlFor="hero-province">Provincia</label>
            <select id="hero-province" className="hero-control" value={province} onChange={(e) => setProvince(e.target.value)}>
              <option value="">Todo el país</option>
              <optgroup label={FOCUS_REGION_LABEL}>
                {FOCUS_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </optgroup>
              <optgroup label="Otras provincias">
                {PROVINCES.filter((p) => !isFocusProvince(p)).map((p) => <option key={p} value={p}>{p}</option>)}
              </optgroup>
            </select>
          </div>

          <div className="hero-field hero-field-keyword" ref={searchRef}>
            <label className="hero-label" htmlFor="hero-keyword">Palabra clave</label>
            <div ref={inputWrapRef}>
              <input
                id="hero-keyword"
                className="hero-control"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onEnter}
                onFocus={() => { if (canSuggest && suggestions.length > 0) setShowSuggestions(true); }}
                placeholder="Ej: Hilux 4x4"
                autoComplete="off"
              />
            </div>
          </div>

          <button type="button" onClick={handleSearch} className="hero-submit">
            {buttonLabel}
          </button>
        </div>

        <button
          type="button"
          className="hero-more-btn"
          onClick={() => setShowMore((v) => !v)}
          aria-expanded={showMore}
        >
          <SlidersHorizontal size={15} strokeWidth={2} />
          Más filtros
          {moreCount > 0 && <span className="hero-more-count">{moreCount}</span>}
          <ChevronDown size={14} style={{ transform: showMore ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
        </button>

        {showMore && (
        <div className="hero-row-2">
          <select aria-label="Condición" className="hero-control hero-control-sm" value={condition} onChange={(e) => setCondition(e.target.value)}>
            <option value="">Nuevo / usado</option>
            <option value="new">Nuevo</option>
            <option value="used">Usado</option>
          </select>

          <input
            aria-label="Precio mínimo"
            className="hero-control hero-control-sm"
            type="number" inputMode="numeric" min={0}
            value={priceMin} onChange={(e) => setPriceMin(e.target.value)} onKeyDown={onEnter}
            placeholder="Precio mín"
          />
          <input
            aria-label="Precio máximo"
            className="hero-control hero-control-sm"
            type="number" inputMode="numeric" min={0}
            value={priceMax} onChange={(e) => setPriceMax(e.target.value)} onKeyDown={onEnter}
            placeholder="Precio máx"
          />

          <select aria-label="Año mínimo" className="hero-control hero-control-sm" value={yearFrom} onChange={(e) => setYearFrom(e.target.value)}>
            <option value="">Año mín</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select aria-label="Año máximo" className="hero-control hero-control-sm" value={yearTo} onChange={(e) => setYearTo(e.target.value)}>
            <option value="">Año máx</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        )}
      </div>
      {dropdown}
    </>
  );
}
