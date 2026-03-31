"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CATEGORY_CONFIGS, getCategoryConfig } from "@/lib/category-config";
import { CategoryIcon, TechGroupIcon } from "@/components/ui/CategoryIcon";
import { CAR_BRANDS, getModels } from "@/lib/vehicle-data";
import { CAMION_BRANDS_LIST } from "@/data/modelos-vehiculos";
import { TIPOS_VEHICULO, MARCAS_POR_TIPO, NAUTICA_CATEGORIAS, OTROS_VEHICULOS_CATEGORIAS } from "@/data/vehiculos";
import { MOTO_BRANDS_LIST, CUATRI_BRANDS_LIST, UTV_BRANDS_LIST, MOTO_SUBTIPOS } from "@/data/modelos-motos";
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

const ARGENTINA_PROVINCES = [
  "Buenos Aires",
  "CABA",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
];

const LOCALITIES_BY_PROVINCE: Record<string, string[]> = {
  "Buenos Aires": [
    "La Plata","Mar del Plata","Bahía Blanca","Quilmes","Lanús","Lomas de Zamora","General San Martín",
    "Morón","Tres de Febrero","Tigre","San Isidro","Vicente López","Berazategui","Florencio Varela",
    "Almirante Brown","Esteban Echeverría","La Matanza","Merlo","Moreno","Hurlingham","Ituzaingó",
    "San Miguel","Malvinas Argentinas","José C. Paz","Avellaneda","Pergamino","Tandil","Junín",
    "Pilar","Campana","Zárate","San Nicolás de los Arroyos","Necochea","Olavarría","Azul","Luján",
    "Mercedes","San Antonio de Padua","Pacheco","Mar del Plata","Dolores","9 de Julio","Pehuajó",
    "Trenque Lauquen","General Pico","Coronel Suárez","Balcarce","Miramar","Villa Gesell",
    "Pinamar","Mar de Ajó","San Clemente del Tuyú","Otro",
  ],
  "CABA": [
    "Almagro","Balvanera","Barracas","Belgrano","Boedo","Caballito","Chacarita","Coghlan",
    "Colegiales","Constitución","Flores","Floresta","La Boca","La Paternal","Liniers","Mataderos",
    "Monte Castro","Montserrat","Nueva Pompeya","Núñez","Palermo","Parque Avellaneda",
    "Parque Chacabuco","Parque Chas","Parque Patricios","Puerto Madero","Recoleta","Retiro",
    "Saavedra","San Cristóbal","San Nicolás","San Telmo","Vélez Sársfield","Versalles",
    "Villa Crespo","Villa del Parque","Villa Devoto","Villa General Mitre","Villa Lugano",
    "Villa Luro","Villa Ortúzar","Villa Pueyrredón","Villa Real","Villa Riachuelo","Villa Santa Rita",
    "Villa Soldati","Villa Urquiza","Otro",
  ],
  "Catamarca": [
    "San Fernando del Valle de Catamarca","Andalgalá","Tinogasta","Belén","Santa María",
    "La Rioja","Recreo","San José","Fiambalá","Hualfín","Pomán","Otro",
  ],
  "Chaco": [
    "Resistencia","Presidencia Roque Sáenz Peña","Villa Ángela","Charata","Barranqueras",
    "Fontana","Juan José Castelli","Las Breñas","Quitilipi","Presidencia de la Plaza",
    "La Escondida","Machagai","Puerto Tirol","Otro",
  ],
  "Chubut": [
    "Rawson","Comodoro Rivadavia","Trelew","Puerto Madryn","Esquel","Rada Tilly",
    "Sarmiento","Camarones","Gaiman","Dolavon","28 de Julio","Alto Río Senguer","Otro",
  ],
  "Córdoba": [
    "Córdoba Capital","Villa Carlos Paz","Río Cuarto","San Francisco","Villa María","Río Tercero",
    "Alta Gracia","Cosquín","La Falda","Villa General Belgrano","Cruz del Eje","Deán Funes",
    "Jesús María","Oncativo","Arroyito","Marcos Juárez","Bell Ville","Laboulaye","Victorica",
    "Mina Clavero","Villa Dolores","Río Ceballos","Saldán","Mendiolaza","Unquillo","La Calera",
    "Malagueño","Pilar","Laguna Larga","Monte Buey","Otro",
  ],
  "Corrientes": [
    "Corrientes","Goya","Posadas","Paso de los Libres","Curuzú Cuatiá","Mercedes","Saladas",
    "Santo Tomé","Bella Vista","Esquina","Ituzaingó","Yapeyú","Monte Caseros","Otro",
  ],
  "Entre Ríos": [
    "Paraná","Concordia","Gualeguaychú","Concepción del Uruguay","Gualeguay","Villaguay",
    "Colón","San Salvador","Federal","La Paz","Crespo","Diamante","Victoria","Federación","Otro",
  ],
  "Formosa": [
    "Formosa","Clorinda","Pirané","El Colorado","Ingeniero Juárez","Las Lomitas",
    "General Enrique Mosconi","Comandante Fontana","Otro",
  ],
  "Jujuy": [
    "San Salvador de Jujuy","Palpalá","San Pedro de Jujuy","Libertador General San Martín",
    "Humahuaca","Tilcara","La Quiaca","Abra Pampa","El Carmen","Perico","Fraile Pintado","Otro",
  ],
  "La Pampa": [
    "Santa Rosa","General Pico","Toay","Realicó","General Acha","Eduardo Castex","Victorica",
    "Intendente Alvear","Guatraché","25 de Mayo","Bernardo Larroudé","Otro",
  ],
  "La Rioja": [
    "La Rioja","Chilecito","Aimogasta","Chamical","Chepes","Villa Unión","Vinchina",
    "Patquía","Famatina","Villa Castelli","Otro",
  ],
  "Mendoza": [
    "Mendoza Capital","Godoy Cruz","Guaymallén","Las Heras","Maipú","Luján de Cuyo",
    "San Rafael","Rivadavia","Junín","General Alvear","Malargüe","La Paz","San Martín",
    "Tunuyán","Tupungato","San Carlos","Ciudad","Rodeo del Medio","Otro",
  ],
  "Misiones": [
    "Posadas","Oberá","El Dorado","Eldorado","Apóstoles","Leandro N. Alem","Puerto Iguazú",
    "Aristóbulo del Valle","Montecarlo","San Vicente","Puerto Rico","Concepción de la Sierra","Otro",
  ],
  "Neuquén": [
    "Neuquén Capital","Cipolletti","Cutral Có","Plaza Huincul","Plottier","San Martín de los Andes",
    "Villa La Angostura","Zapala","Junín de los Andes","Las Lajas","Chos Malal","Rincón de los Sauces","Otro",
  ],
  "Río Negro": [
    "Viedma","Bariloche","General Roca","Cipolletti","Allen","Villa Regina","Lamarque",
    "Ingeniero Jacobacci","El Bolsón","Choele Choel","Las Grutas","Sierra Grande","Otro",
  ],
  "Salta": [
    "Salta Capital","San Ramón de la Nueva Orán","Tartagal","General Güemes","Cafayate",
    "Rosario de la Frontera","Metán","Joaquín V. González","Embarcación","Cerrillos","Otro",
  ],
  "San Juan": [
    "Capital","Rivadavia","Rawson","Santa Lucía","Chimbas","Pocito","Caucete",
    "25 de Mayo","Ullum","Zonda","Sarmiento","Angaco","Albardón","Jáchal","Otro",
  ],
  "San Luis": [
    "San Luis Capital","Villa Mercedes","Merlo","Quines","Justo Daract","La Toma",
    "Buena Esperanza","Arizona","Concarán","Naschel","Otro",
  ],
  "Santa Cruz": [
    "Río Gallegos","Caleta Olivia","Pico Truncado","Puerto Madryn","Los Antiguos",
    "Perito Moreno","Las Heras","El Calafate","Gobernador Gregores","Puerto Santa Cruz","Otro",
  ],
  "Santa Fe": [
    "Rosario","Santa Fe Capital","Rafaela","Venado Tuerto","Santo Tomé","Villa Constitución",
    "Reconquista","Avellaneda","Cañada de Gómez","Casilda","Esperanza","Las Rosas","Rufino",
    "San Lorenzo","Firmat","Villa Gobernador Gálvez","Pérez","Funes","Roldan","Otro",
  ],
  "Santiago del Estero": [
    "Santiago del Estero Capital","La Banda","Termas de Río Hondo","Añatuya","Frías",
    "Loreto","Fernández","Quimilí","Suncho Corral","Monte Quemado","Otro",
  ],
  "Tierra del Fuego": [
    "Ushuaia","Río Grande","Tolhuin","Otro",
  ],
  "Tucumán": [
    "San Miguel de Tucumán","Tafí Viejo","Banda del Río Salí","Yerba Buena","Concepción",
    "Monteros","Aguilares","Alderetes","Famaillá","Juan Bautista Alberdi","Simoca",
    "Bella Vista","Trancas","Otro",
  ],
};

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

const TECH_GROUPS: Record<string, { label: string; items: [string, string][] }> = {
  computacion: { label: "Computación",                items: [["notebook","Notebook / Laptop"],["pc","PC / Computadora de escritorio"],["tablet","Tablets y Accesorios"],["monitor","Monitores y Accesorios"],["componentes-pc","Componentes de PC"],["impresion","Impresión"],["conectividad","Conectividad y Redes"],["otro-comp","Otro"]] },
  camaras:     { label: "Cámaras y Accesorios",       items: [["camara","Cámaras Digitales"],["acc-camara","Accesorios para Cámaras"],["filmadora","Filmadoras y Cámaras de Acción"],["otro-camara","Otro"]] },
  consolas:    { label: "Consolas y Videojuegos",     items: [["videojuego","Videojuegos"],["consola-ps","Para PlayStation"],["consola-nintendo","Para Nintendo"],["consola","Otras consolas"],["otro-consola","Otro"]] },
  electronica: { label: "Electrónica, Audio y Video", items: [["audio","Audio / Parlantes"],["acc-audio-video","Accesorios para Audio y Video"],["componentes-electronicos","Componentes Electrónicos"],["drone","Drones y Accesorios"],["audio-vehiculo","Audio para Vehículos"],["otro-elec","Otro"]] },
  tv:          { label: "Televisores",                items: [["tv","Televisores"],["otro-tv","Otro"]] },
  otros:       { label: "Otros",                      items: [["otro","Otro"]] },
};

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
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderColor: C.slate200,
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
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderColor: C.slate200,
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
    borderRadius: "14px",
    border: `1px solid ${C.blue200}`,
    borderLeft: `3px solid ${C.blue}`,
    overflow: "hidden",
    marginBottom: "12px",
    boxShadow: "0 2px 8px rgba(37,99,235,.08)",
  },
  cardHead: {
    padding: "12px 18px",
    borderBottom: `1px solid ${C.blue100}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "linear-gradient(135deg, #eef4ff 0%, #f8fafc 100%)",
  },
  cardBody: { padding: "18px 20px" },
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
          width: "28px",
          height: "28px",
          borderRadius: "8px",
          background: "linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)",
          boxShadow: "0 2px 6px rgba(37,99,235,.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "13px",
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
  type,
  onChange,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange && type !== "number") {
      const v = e.target.value;
      const cap = v ? v.charAt(0).toUpperCase() + v.slice(1) : v;
      if (cap !== v) {
        onChange({ ...e, target: { ...e.target, value: cap } } as React.ChangeEvent<HTMLInputElement>);
        return;
      }
    }
    onChange?.(e);
  };
  return (
    <input
      {...rest}
      type={type}
      onChange={handleChange}
      autoCapitalize="sentences"
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

const CAT_ORDER = [2, 3, 21, 1, 22, 4, 5, 6, 7, 23, 8, 24, 25, 9, 26, 10];
const SORTED_CATS = [...CATEGORY_CONFIGS].sort(
  (a, b) => {
    const ai = CAT_ORDER.indexOf(a.id);
    const bi = CAT_ORDER.indexOf(b.id);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  }
);
const SLUG_BY_ID: Record<number, string> = {
  1: "electronics", 2: "vehicles", 3: "real-estate",
  4: "clothing", 5: "home-garden", 6: "sports",
  7: "tools", 8: "books", 9: "pets", 10: "other",
  21: "phones", 22: "appliances", 23: "babies", 24: "beauty-health",
  25: "toys", 26: "services",
};

function CategoryPicker({ value, onChange }: { value: number; onChange: (id: number) => void }) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const selected = SORTED_CATS.find(c => c.id === value);

  function handleOpen() {
    if (!open && btnRef.current) setRect(btnRef.current.getBoundingClientRect());
    setOpen(o => !o);
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (btnRef.current && !btnRef.current.closest("[data-catpicker]")?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div data-catpicker="1" style={{ position: "relative" }}>
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: "10px",
          borderWidth: "1.5px", borderStyle: "solid",
          borderColor: open ? C.blue : C.slate200,
          borderRadius: "8px", padding: "8px 12px",
          background: open ? C.white : C.slate50,
          cursor: "pointer", fontFamily: "inherit",
          boxShadow: open ? `0 0 0 3px rgba(37,99,235,.1)` : "none",
          transition: "all .15s",
        }}
      >
        {selected ? (
          <>
            <CategoryIcon slug={SLUG_BY_ID[selected.id]} size={22} />
            <span style={{ fontSize: "13.5px", fontWeight: 600, color: C.slate900, flex: 1, textAlign: "left" }}>
              {selected.name}
            </span>
          </>
        ) : (
          <>
            <span style={{ width: 22, height: 22, display: "inline-block" }} />
            <span style={{ fontSize: "13.5px", color: C.slate400, flex: 1, textAlign: "left" }}>Seleccioná...</span>
          </>
        )}
        <span style={{ fontSize: "10px", color: C.slate300 }}>▼</span>
      </button>

      {open && rect && (() => {
        const spaceBelow = window.innerHeight - rect.bottom - 8;
        const spaceAbove = rect.top - 8;
        const showAbove = spaceBelow < 200 && spaceAbove > spaceBelow;
        const maxH = Math.min(320, (showAbove ? spaceAbove : spaceBelow) - 4);
        return (
        <div style={{
          position: "fixed",
          top: showAbove ? undefined : rect.bottom + 4,
          bottom: showAbove ? window.innerHeight - rect.top + 4 : undefined,
          left: rect.left, width: rect.width,
          zIndex: 9999,
          background: C.white, borderRadius: "12px",
          border: `1.5px solid ${C.blue200}`,
          boxShadow: "0 8px 24px rgba(15,23,42,.15)",
          overflowY: "auto", maxHeight: maxH,
        }}>
          {SORTED_CATS.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => { onChange(c.id); setOpen(false); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: "10px",
                padding: "9px 14px", border: "none", cursor: "pointer",
                background: c.id === value ? C.blue50 : "transparent",
                fontFamily: "inherit", transition: "background .1s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = c.id === value ? C.blue50 : C.slate50)}
              onMouseLeave={e => (e.currentTarget.style.background = c.id === value ? C.blue50 : "transparent")}
            >
              <CategoryIcon slug={SLUG_BY_ID[c.id]} size={22} />
              <span style={{ fontSize: "13px", fontWeight: c.id === value ? 700 : 400, color: c.id === value ? C.blue : C.slate700 }}>
                {c.name}
              </span>
            </button>
          ))}
        </div>
        );
      })()}
    </div>
  );
}

function TechGroupPicker({ value, onChange }: { value: string; onChange: (key: string) => void }) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  function handleOpen() {
    if (!open && btnRef.current) setRect(btnRef.current.getBoundingClientRect());
    setOpen(o => !o);
  }

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (btnRef.current && !btnRef.current.closest("[data-tgpicker]")?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const entries = Object.entries(TECH_GROUPS);
  const selected = value ? TECH_GROUPS[value] : null;

  return (
    <div data-tgpicker="1" style={{ position: "relative" }}>
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: "10px",
          borderWidth: "1.5px", borderStyle: "solid",
          borderColor: open ? C.blue : C.slate200,
          borderRadius: "8px", padding: "8px 12px",
          background: open ? C.white : C.slate50,
          cursor: "pointer", fontFamily: "inherit",
          boxShadow: open ? `0 0 0 3px rgba(37,99,235,.1)` : "none",
          transition: "all .15s",
        }}
      >
        {selected ? (
          <>
            <TechGroupIcon group={value} size={22} />
            <span style={{ fontSize: "13.5px", fontWeight: 600, color: C.slate900, flex: 1, textAlign: "left" }}>
              {selected.label}
            </span>
          </>
        ) : (
          <>
            <span style={{ width: 22, height: 22, display: "inline-block" }} />
            <span style={{ fontSize: "13.5px", color: C.slate400, flex: 1, textAlign: "left" }}>Seleccioná...</span>
          </>
        )}
        <span style={{ fontSize: "10px", color: C.slate300 }}>▼</span>
      </button>

      {open && rect && (() => {
        const spaceBelow = window.innerHeight - rect.bottom - 8;
        const spaceAbove = rect.top - 8;
        const showAbove = spaceBelow < 200 && spaceAbove > spaceBelow;
        const maxH = Math.min(320, (showAbove ? spaceAbove : spaceBelow) - 4);
        return (
        <div style={{
          position: "fixed",
          top: showAbove ? undefined : rect.bottom + 4,
          bottom: showAbove ? window.innerHeight - rect.top + 4 : undefined,
          left: rect.left, width: rect.width,
          zIndex: 9999, background: C.white, borderRadius: "12px",
          border: `1.5px solid ${C.blue200}`,
          boxShadow: "0 8px 24px rgba(15,23,42,.15)",
          overflowY: "auto", maxHeight: maxH,
        }}>
          {entries.map(([key, g]) => (
            <button
              key={key}
              type="button"
              onClick={() => { onChange(key); setOpen(false); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: "10px",
                padding: "9px 14px", border: "none", cursor: "pointer",
                background: key === value ? C.blue50 : "transparent",
                fontFamily: "inherit", transition: "background .1s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = key === value ? C.blue50 : C.slate50)}
              onMouseLeave={e => (e.currentTarget.style.background = key === value ? C.blue50 : "transparent")}
            >
              <TechGroupIcon group={key} size={22} />
              <span style={{ fontSize: "13px", fontWeight: key === value ? 700 : 400, color: key === value ? C.blue : C.slate700 }}>
                {g.label}
              </span>
            </button>
          ))}
        </div>
        );
      })()}
    </div>
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
function StepBar({ current, formFilled }: { current: Step; formFilled?: boolean }) {
  const steps = [
    { n: "1", label: "Fotos", key: "upload" },
    { n: "2", label: "Detalles", key: "form" },
    { n: "3", label: "Publicar", key: "publishing" },
  ];
  const activeIdx =
    current === "upload" || current === "analyzing"
      ? 0
      : current === "form"
        ? 1
        : 2;

  return (
    <div
      style={{
        background: C.slate100,
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
                ? C.blue
                : done
                  ? C.blue
                  : C.slate400,
              background: active ? C.white : "transparent",
              boxShadow: active ? "0 1px 3px rgba(15,23,42,.08)" : "none",
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
                  ? C.blue
                  : done
                    ? C.blue100
                    : C.slate200,
                color: active
                  ? C.white
                  : done
                    ? C.blue
                    : C.slate400,
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
// IMAGE RESIZE UTILITY
// ════════════════════════════════════════════════════════════════
function resizeImage(file: File, maxDim: number, quality: number): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const { width, height } = img;
      // Skip if already small enough
      if (width <= maxDim && height <= maxDim) { resolve(file); return; }
      const ratio = Math.min(maxDim / width, maxDim / height);
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(width  * ratio);
      canvas.height = Math.round(height * ratio);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) { resolve(file); return; }
        resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
      }, "image/jpeg", quality);
    };
    img.onerror = () => resolve(file);
    img.src = url;
  });
}

// ════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════
export default function NewListingPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("form");
  const [analyzing, setAnalyzing] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [aiData, setAiData] = useState<any>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<"ARS" | "USD">("ARS");
  const [categoryId, setCategoryId] = useState(0);
  const [condition, setCondition] = useState("");
  const [zone, setZone] = useState("San Juan");
  const [locality, setLocality] = useState("");
  const [techGroup, setTechGroup] = useState("");
  const [attrs, setAttrs] = useState<Record<string, any>>({});
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [loadingPx, setLoadingPx] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneId, setDoneId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showExtraVehicle, setShowExtraVehicle] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[] | null>(null);
  const [userIsStore, setUserIsStore] = useState(false);
  const [modelosML, setModelosML] = useState<string[]>([]);
  const [loadingModelos, setLoadingModelos] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("profiles")
        .select("is_store")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.is_store) {
            setUserIsStore(true);
            setAttrs((prev) => ({ ...prev, seller_type: "concesionaria" }));
          }
        });
    });
  }, []);
  // Fetch models when brand or tipo changes
  useEffect(() => {
    const brand = attrs.brand;
    const tipo = attrs.sub_category;
    if (!brand || !tipo || !["auto", "camioneta", "moto", "cuatriciclo", "utv", "camion"].includes(tipo)) {
      setModelosML([]);
      return;
    }
    setLoadingModelos(true);
    setModelosML([]);
    fetch(`/api/vehiculos/modelos?brand=${brand}&tipo=${tipo}`)
      .then((r) => r.json())
      .then((data: string[]) => {
        setModelosML(data);
        setLoadingModelos(false);
        // Fuzzy-match AI-detected model against fetched list
        setAttrs((prev) => {
          const current = prev.model as string | undefined;
          if (!current || !data.length) return prev;

          const norm = (s: string) => s.toUpperCase().replace(/[\s\-]/g, "");
          const words = (s: string) => s.toUpperCase().split(/[\s\-]+/).filter(Boolean).sort().join("|");

          const needle = norm(current);
          const needleWords = words(current);

          // 1. Exact case-insensitive
          const exact = data.find((m) => m.toUpperCase() === current.toUpperCase());
          if (exact) return { ...prev, model: exact };

          // 2. Normalized exact (strip spaces/hyphens)
          const normExact = data.find((m) => norm(m) === needle);
          if (normExact) return { ...prev, model: normExact };

          // 3. Same words regardless of order — "CB 250 TWISTER" == "CB TWISTER 250"
          const wordMatch = data.find((m) => words(m) === needleWords);
          if (wordMatch) return { ...prev, model: wordMatch };

          // 4. Best prefix: needle starts with model (prefer longest)
          const prefixMatches = data.filter((m) => needle.startsWith(norm(m)));
          if (prefixMatches.length) {
            const best = prefixMatches.reduce((a, b) => a.length >= b.length ? a : b);
            return { ...prev, model: best };
          }

          return prev;
        });
      })
      .catch(() => setLoadingModelos(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attrs.brand, attrs.sub_category]);

  const [aiReveal, setAiReveal] = useState(false);
  const [aiRevealFields, setAiRevealFields] = useState<string[]>([]);

  const catConfig = getCategoryConfig(categoryId);
  const isVehicle = categoryId === 2;
  const isRealEstate = categoryId === 3;
  const isTechnology = categoryId === 1;
  const isPets = categoryId === 9;
  const isServices = categoryId === 26;
  const PET_ANIMAL_TYPES = ["perros", "gatos", "aves", "peces", "roedores", "reptiles", "caballos"];
  const PET_ANIMAL_FIELDS = ["breed", "age", "sex", "vaccinated", "pedigree", "is_adoption"];
  const isPetAnimal = isPets && PET_ANIMAL_TYPES.includes(attrs.sub_category ?? "");
  const isPetProduct = isPets && !!attrs.sub_category && !isPetAnimal;

  const vehicleModels = useMemo(() => getModels(attrs.brand ?? ""), [attrs.brand]);
  const marcasFiltradas = useMemo(() => {
    const tipo = attrs.sub_category;
    if (tipo === "auto" || tipo === "camioneta") {
      return CAR_BRANDS.filter((b) => MARCAS_POR_TIPO[tipo as "auto" | "camioneta"].has(b.value));
    }
    if (tipo === "moto") return MOTO_BRANDS_LIST;
    if (tipo === "cuatriciclo") return CUATRI_BRANDS_LIST;
    if (tipo === "utv") return UTV_BRANDS_LIST;
    if (tipo === "camion") return CAMION_BRANDS_LIST;
    return CAR_BRANDS;
  }, [attrs.sub_category]);

  // Quality checks
  const checks = [
    { ok: photos.length > 0, label: "Foto" },
    { ok: title.length > 5, label: "Título" },
    { ok: categoryId > 0, label: "Categoría" },
    { ok: isPets || isServices || !!condition, label: "Estado" },
    { ok: !!zone, label: "Zona" },
    { ok: description.length > 20, label: "Descripción" },
  ];
  const passed = checks.filter((c) => c.ok).length;
  const quality = passed >= 5 ? "ok" : passed >= 3 ? "partial" : "pending";
  const canPublish = !!(title.trim() && categoryId);

  // ── Photos ──────────────────────────────────────────────────
  const addPhotos = useCallback(
    async (files: File[]) => {
      const valid = files.filter((f) => f.type.startsWith("image/"));
      const toAdd = valid.slice(0, 8 - photos.length);
      if (!toAdd.length) return;
      // Resize to 1600px / 85% for storage — runs in parallel
      const resized = await Promise.all(toAdd.map((f) => resizeImage(f, 1600, 0.85)));
      const allPhotos = [...photos, ...resized];
      setPhotos(allPhotos);
      resized.forEach((f) => setPreviews((p) => [...p, URL.createObjectURL(f)]));
      analyzePhotos(allPhotos);
    },
    [photos],
  );

  const removePhoto = (i: number) => {
    const remaining = photos.filter((_, x) => x !== i);
    setPhotos(remaining);
    setPreviews((p) => p.filter((_, x) => x !== i));
    if (remaining.length === 0) {
      setAiData(null);
      setTitle("");
      setDescription("");
      setPrice("");
      setCategoryId(0);
      setCondition("");
      setAttrs({});
      setPriceData(null);
    }
    // No re-analizar al eliminar — evita costos innecesarios
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

  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const handlePhotoDrop = (toIdx: number) => {
    if (dragIdx === null || dragIdx === toIdx) return;
    const p2 = [...photos];
    const v2 = [...previews];
    const [pItem] = p2.splice(dragIdx, 1);
    const [vItem] = v2.splice(dragIdx, 1);
    p2.splice(toIdx, 0, pItem);
    v2.splice(toIdx, 0, vItem);
    setPhotos(p2);
    setPreviews(v2);
    setDragIdx(null);
    setDragOverIdx(null);
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
      } else setPriceData(null);
    } catch {
      setPriceData(null);
    }
    setLoadingPx(false);
  };

  const handleCategory = (id: number) => {
    setCategoryId(id);
    setAttrs({});
    setModelosML([]);
    fetchPrice(id);
  };
  const handleAttr = (k: string, v: any) => setAttrs((p) => ({ ...p, [k]: v }));

  // ── AI analysis ─────────────────────────────────────────────
  const analyzePhotos = async (files: File[]) => {
    if (!files.length) return;
    setAnalyzing(true);
    setError(null);
    try {
      // Resize to 1024px / 80% for AI — faster and cheaper API calls
      const aiFiles = await Promise.all(files.map((f) => resizeImage(f, 1024, 0.8)));
      const fd = new FormData();
      aiFiles.forEach((f) => fd.append("photos", f));
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

        // ── Normalize brand ──
        if (normalizedAttrs.brand) {
          const normalized = normalizedAttrs.brand.toLowerCase().replace(/[\s-]/g, "_");
          const tipo = normalizedAttrs.sub_category as string | undefined;
          const brandList =
            tipo === "moto" ? MOTO_BRANDS_LIST :
            tipo === "cuatriciclo" ? CUATRI_BRANDS_LIST :
            tipo === "utv" ? UTV_BRANDS_LIST :
            tipo === "camion" ? CAMION_BRANDS_LIST :
            CAR_BRANDS;
          const found = brandList.find((b) => b.value === normalized);
          normalizedAttrs.brand = found ? normalized : normalizedAttrs.brand;
        }

        // ── Normalize model: fuzzy-match against known models for this brand ──
        if (normalizedAttrs.brand && normalizedAttrs.model) {
          const knownModels = getModels(normalizedAttrs.brand);
          if (knownModels.length > 0) {
            const aiModel = normalizedAttrs.model.toLowerCase();
            // Exact match first
            const exactMatch = knownModels.find((m) => m.toLowerCase() === aiModel);
            if (exactMatch) {
              normalizedAttrs.model = exactMatch;
            } else {
              // Partial match: AI model starts with a known model name or vice versa
              const partial = knownModels.find(
                (m) => aiModel.startsWith(m.toLowerCase()) || m.toLowerCase().startsWith(aiModel)
              );
              if (partial) normalizedAttrs.model = partial;
              // If no match, keep original (user can correct)
            }
          }
        }

        // ── Normalize year: ensure it's a number matching the select range ──
        if (normalizedAttrs.year) {
          const y = Number(normalizedAttrs.year);
          const currentYear = new Date().getFullYear();
          if (!isNaN(y) && y >= 1930 && y <= currentYear) {
            normalizedAttrs.year = y;
          } else {
            delete normalizedAttrs.year; // out of range — don't pre-fill
          }
        }

        setAttrs(normalizedAttrs);
        if (data.attributes.currency) setCurrency(data.attributes.currency);
        // attrs.brand change will trigger model fetch via useEffect
      }
      // ── AI WOW moment ──
      const filledFields: string[] = [];
      if (data.title) filledFields.push("Título");
      if (data.description) filledFields.push("Descripción");
      if (data.category_id) filledFields.push("Categoría");
      if (data.condition) filledFields.push("Estado");
      if (data.attributes?.brand) filledFields.push("Marca");
      if (data.attributes?.model) filledFields.push("Modelo");
      if (data.attributes?.moto_subtipo) filledFields.push("Tipo de moto");
      if (data.attributes?.year) filledFields.push("Año");
      if (data.attributes?.km) filledFields.push("Kilómetros");
      if (data.attributes?.cilindrada) filledFields.push("Cilindrada");
      setAiRevealFields(filledFields);
      setAiReveal(true);
      setTimeout(() => setAiReveal(false), 3000);
    } catch (e: any) {
      setError(e.message);
    }
    setAnalyzing(false);
  };

  // ── Publish ─────────────────────────────────────────────────
  const handlePublish = async () => {
    if (!canPublish) {
      setError("Completá título y categoría.");
      return;
    }
    // Vehicle-specific required fields
    if (isVehicle) {
      const missing: string[] = [];
      if (!attrs.sub_category) missing.push("Tipo de vehículo");
      if (attrs.sub_category === "nautica") {
        if (!attrs.nautica_categoria) missing.push("Categoría náutica");
      } else if (attrs.sub_category === "otro") {
        if (!attrs.otros_categoria) missing.push("Categoría");
      } else {
        if (!attrs.brand) missing.push("Marca");
        if (!attrs.model) missing.push("Modelo");
      }
      if (missing.length > 0) {
        setValidationErrors(missing);
        return;
      }
    }
    // Technology-specific required fields
    if (isTechnology) {
      const missing: string[] = [];
      if (!techGroup) missing.push("Grupo");
      if (!attrs.sub_category) missing.push("Tipo");
      if (missing.length > 0) {
        setValidationErrors(missing);
        return;
      }
    }
    // Generic category required fields
    if (!isVehicle && !isRealEstate && catConfig) {
      const missing: string[] = [];
      for (const field of catConfig.fields) {
        if (field.required && !attrs[field.key]) missing.push(field.label);
      }
      if (missing.length > 0) {
        setValidationErrors(missing);
        return;
      }
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
          neighborhood: locality ? `${locality}, ${zone}` : zone,
          attributes: attrs,
          image_urls: urls,
          ai_generated: !!aiData,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al publicar");
      setDoneId(data.id);
      router.push(`/upgrade?listing_id=${data.id}`);
    } catch (e: any) {
      setError(e.message);
      setStep("form");
    }
  };

  const reset = () => {
    setStep("form");
    setAnalyzing(false);
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
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", position: "sticky", top: "68px" }}>
      <div style={{
        background: C.white, borderRadius: "16px",
        border: `1px solid ${C.blue200}`,
        boxShadow: "0 4px 16px rgba(37,99,235,.1)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%)",
          padding: "14px 18px", display: "flex", alignItems: "center", gap: "10px",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(99,179,237,.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff", letterSpacing: "-0.2px", lineHeight: 1.2 }}>Completá tu aviso</div>
            <div style={{ fontSize: "10px", color: "rgba(148,198,233,.7)", fontWeight: 500, marginTop: "1px" }}>
              {Math.round((passed / checks.length) * 100)}% completo
            </div>
          </div>
        </div>

        <div style={{ padding: "16px 18px" }}>
          {/* Publish button — dominant */}
          <button
            type="button"
            onClick={handlePublish}
            disabled={!canPublish}
            style={{
              width: "100%", padding: "16px",
              background: canPublish
                ? "linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)"
                : C.slate200,
              color: canPublish ? C.white : C.slate400,
              border: "none", borderRadius: "12px",
              fontSize: "16px", fontWeight: 800,
              cursor: canPublish ? "pointer" : "not-allowed",
              fontFamily: "inherit",
              boxShadow: canPublish ? "0 8px 24px rgba(37,99,235,.45)" : "none",
              transition: "all .15s", letterSpacing: ".2px",
              marginBottom: "14px",
            }}
          >
            ¡Publicar Aviso!
          </button>

          {/* Error */}
          {error && (
            <div style={{ background: C.redBg, border: `1px solid #fecaca`, borderRadius: "10px", padding: "10px 12px", marginBottom: "12px", fontSize: "12px", color: C.red, lineHeight: 1.4 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Progress bar */}
          <div style={{ marginBottom: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={{ fontSize: "11px", color: C.slate500, fontWeight: 500 }}>Completud del aviso</span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: passed >= 5 ? "#15803d" : C.blue }}>{Math.round((passed / checks.length) * 100)}%</span>
            </div>
            <div style={{ height: "5px", background: C.slate100, borderRadius: "100px", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: "100px",
                width: `${(passed / checks.length) * 100}%`,
                background: passed >= 5 ? "linear-gradient(90deg,#16a34a,#22c55e)" : `linear-gradient(90deg, ${C.blue}, ${C.blue300})`,
                transition: "width .4s ease",
              }} />
            </div>
          </div>

          {/* Compact checklist */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px", marginBottom: "12px" }}>
            {checks.map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ fontSize: "11px", color: item.ok ? "#16a34a" : C.slate300 }}>{item.ok ? "✓" : "○"}</span>
                <span style={{ fontSize: "11px", color: item.ok ? C.slate600 : C.slate400, fontWeight: item.ok ? 600 : 400 }}>{item.label}</span>
              </div>
            ))}
          </div>

          <p style={{ fontSize: "11px", color: C.slate400, textAlign: "center", lineHeight: 1.5, margin: "0" }}>
            Al publicar aceptás los{" "}
            <Link href="/terms" style={{ color: C.blue, textDecoration: "none", fontWeight: 600 }}>términos y condiciones</Link>.
          </p>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // (sidebarJSX is defined above as a plain JSX variable — NOT a component —
  //  to avoid React treating it as a new component type on every render,
  //  which would unmount/remount inputs and lose focus)
  // ═══════════════════════════════════════════════════════════
  return (
    <div style={{ fontFamily: "'Geist', 'DM Sans', -apple-system, sans-serif", marginTop: "-1rem" }}>

      {/* ════ VALIDATION MODAL ════ */}
      {validationErrors && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(15,23,42,0.55)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={() => setValidationErrors(null)}>
          <div
            style={{
              background: "#fff", borderRadius: "16px",
              padding: "28px 32px", maxWidth: "380px", width: "90%",
              boxShadow: "0 20px 60px rgba(15,23,42,.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: "32px", textAlign: "center", marginBottom: "12px" }}>⚠️</div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#1e293b", textAlign: "center", marginBottom: "6px" }}>
              Faltan datos obligatorios
            </div>
            <div style={{ fontSize: "13px", color: "#64748b", textAlign: "center", marginBottom: "20px" }}>
              Completá los siguientes campos antes de publicar:
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
              {validationErrors.map((err) => (
                <div key={err} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  background: "#fef2f2", borderRadius: "8px", padding: "10px 14px",
                  border: "1px solid #fecaca",
                }}>
                  <span style={{ color: "#dc2626", fontSize: "14px", flexShrink: 0 }}>✕</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#dc2626" }}>{err}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setValidationErrors(null)}
              style={{
                width: "100%", padding: "12px",
                background: "#2563eb", color: "#fff",
                border: "none", borderRadius: "10px",
                fontSize: "14px", fontWeight: 700, cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Entendido, voy a completarlos
            </button>
          </div>
        </div>
      )}



      {/* ════ AI REVEAL OVERLAY ════ */}
      {aiReveal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 2000,
          display: "flex", alignItems: "center", justifyContent: "center",
          pointerEvents: "none",
          animation: "aiRevealFade 3s ease forwards",
        }}>
          {/* Background flash */}
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse at center, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.08) 50%, transparent 75%)",
            animation: "aiRevealBg 3s ease forwards",
          }} />
          {/* Center card */}
          <div style={{
            position: "relative",
            background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)",
            borderRadius: "20px",
            padding: "32px 40px",
            textAlign: "center",
            boxShadow: "0 24px 80px rgba(99,102,241,0.5), 0 0 0 1px rgba(165,180,252,0.2)",
            animation: "aiRevealCard 3s ease forwards",
            maxWidth: "340px",
            width: "90%",
          }}>
            {/* Glow orbs */}
            <div style={{ position: "absolute", top: "-40px", left: "50%", transform: "translateX(-50%)", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)", pointerEvents: "none" }} />
            <div style={{ fontSize: "52px", lineHeight: 1, marginBottom: "12px", animation: "aiRevealStar 3s ease forwards" }}>✨</div>
            <div style={{ fontSize: "20px", fontWeight: 900, color: "#fff", marginBottom: "6px", letterSpacing: "-0.3px" }}>
              ¡IA completó tu aviso!
            </div>
            <div style={{ fontSize: "13px", color: "rgba(199,210,254,0.75)", marginBottom: "20px", lineHeight: 1.5 }}>
              Detectamos y completamos automáticamente:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center" }}>
              {aiRevealFields.map((f, i) => (
                <span key={f} style={{
                  background: "rgba(99,102,241,0.3)", border: "1px solid rgba(165,180,252,0.3)",
                  borderRadius: "20px", padding: "4px 12px",
                  fontSize: "12px", fontWeight: 700, color: "rgba(224,231,255,0.9)",
                  animation: `aiRevealPill 0.4s ease ${i * 0.1}s both`,
                }}>
                  ✓ {f}
                </span>
              ))}
            </div>
            <div style={{ marginTop: "18px", fontSize: "11px", color: "rgba(148,163,184,0.6)", fontWeight: 500 }}>
              Revisá y editá antes de publicar
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes aiRevealFade { 0%{opacity:0} 15%{opacity:1} 70%{opacity:1} 100%{opacity:0} }
        @keyframes aiRevealBg { 0%{opacity:0} 15%{opacity:1} 70%{opacity:1} 100%{opacity:0} }
        @keyframes aiRevealCard { 0%{opacity:0;transform:scale(0.85) translateY(20px)} 15%{opacity:1;transform:scale(1) translateY(0)} 70%{opacity:1;transform:scale(1) translateY(0)} 100%{opacity:0;transform:scale(0.95) translateY(-10px)} }
        @keyframes aiRevealStar { 0%{transform:scale(0) rotate(-30deg)} 20%{transform:scale(1.2) rotate(10deg)} 35%{transform:scale(1) rotate(0)} 100%{transform:scale(1) rotate(0)} }
        @keyframes aiRevealPill { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes aiFieldShimmer { 0%{box-shadow:none} 50%{box-shadow:0 0 0 3px rgba(99,102,241,0.35),inset 0 0 12px rgba(99,102,241,0.08)} 100%{box-shadow:none} }
      `}</style>

      {/* ════ FLOATING PUBLISH BUTTON ════ */}
      {step === "form" && scrolled && (
        <button
          type="button"
          onClick={handlePublish}
          disabled={!canPublish}
          style={{
            position: "fixed", bottom: "24px", right: "24px", zIndex: 200,
            padding: "14px 24px",
            background: canPublish
              ? "linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)"
              : C.slate300,
            color: C.white,
            border: "none", borderRadius: "100px",
            fontSize: "14px", fontWeight: 800,
            cursor: canPublish ? "pointer" : "not-allowed",
            fontFamily: "inherit",
            boxShadow: canPublish
              ? "0 8px 24px rgba(37,99,235,.45)"
              : "0 4px 12px rgba(0,0,0,.15)",
            display: "flex", alignItems: "center", gap: "8px",
            transition: "all .2s",
            animation: "floatIn .2s ease",
          }}
        >
          🚀 ¡Publicar Aviso!
        </button>
      )}
      <style>{`
        @keyframes floatIn { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        .mobile-publish-bar { display: none; }
        @media (max-width: 768px) {
          .mobile-publish-bar { display: flex; }
          .new-listing-grid { grid-template-columns: 1fr !important; }
          .new-listing-sidebar { display: none !important; }
        }
      `}</style>
      {/* ════ MOBILE STICKY PUBLISH BAR ════ */}
      {step === "form" && (
        <div className="mobile-publish-bar" style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 300,
          padding: "12px 16px", paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
          background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)",
          borderTop: `1px solid ${C.slate100}`,
          boxShadow: "0 -4px 20px rgba(15,23,42,.12)",
          alignItems: "center", gap: "12px",
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "11px", color: C.slate500, marginBottom: "3px" }}>
              Aviso <strong style={{ color: passed >= 5 ? "#16a34a" : C.blue }}>{Math.round((passed / checks.length) * 100)}% completo</strong>
            </div>
            <div style={{ height: "4px", background: C.slate100, borderRadius: "100px", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: "100px", width: `${(passed / checks.length) * 100}%`, background: `linear-gradient(90deg, ${C.blue}, ${C.blue300})`, transition: "width .4s ease" }} />
            </div>
          </div>
          <button
            type="button"
            onClick={handlePublish}
            disabled={!canPublish}
            style={{
              padding: "13px 24px", flexShrink: 0,
              background: canPublish ? "linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)" : C.slate200,
              color: canPublish ? C.white : C.slate400,
              border: "none", borderRadius: "10px",
              fontSize: "15px", fontWeight: 800,
              cursor: canPublish ? "pointer" : "not-allowed",
              fontFamily: "inherit",
              boxShadow: canPublish ? "0 4px 14px rgba(37,99,235,.4)" : "none",
            }}
          >
            Publicar
          </button>
        </div>
      )}

      {/* ════ FORM ════ */}
      {step === "form" && (
        <div
          style={{
            maxWidth: "920px",
            margin: "0 auto",
            padding: "20px 20px 80px",
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
                <CardTitle icon="📷" label="Subí tus fotos" />
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
                {/* ── Analyzing spinner ── */}
                {analyzing && (
                  <div style={{ textAlign: "center", padding: "28px 16px" }}>
                    <div style={{
                      width: "40px", height: "40px", margin: "0 auto 12px",
                      borderRadius: "50%", background: C.blue50,
                      border: `3px solid ${C.blue100}`, borderTopColor: C.blue,
                      animation: "spin 0.8s linear infinite",
                    }} />
                    <div style={{ fontSize: "13px", fontWeight: 600, color: C.slate700, marginBottom: "2px" }}>
                      Analizando imagen con IA...
                    </div>
                    <div style={{ fontSize: "12px", color: C.slate400 }}>
                      Completando los datos automáticamente
                    </div>
                    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                  </div>
                )}

                {/* ── Drop zone (no photos) ── */}
                {!analyzing && photos.length === 0 && (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    onClick={() => fileRef.current?.click()}
                    style={{
                      background: dragOver
                        ? "linear-gradient(135deg, #dbeafe 0%, #ede9fe 100%)"
                        : "linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #312e81 100%)",
                      border: `2px dashed ${dragOver ? C.blue : "rgba(99,179,237,.4)"}`,
                      borderRadius: "16px",
                      padding: "32px 24px 28px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all .2s",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Subtle glow orbs */}
                    <div style={{ position: "absolute", top: "-30px", left: "50%", transform: "translateX(-50%)", width: "160px", height: "160px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,.25) 0%, transparent 70%)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", bottom: "-20px", right: "20%", width: "100px", height: "100px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,.2) 0%, transparent 70%)", pointerEvents: "none" }} />

                    {/* AI badge */}
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "linear-gradient(135deg, rgba(99,102,241,.35), rgba(139,92,246,.35))", border: "1px solid rgba(165,180,252,.4)", borderRadius: "20px", padding: "4px 12px", marginBottom: "14px" }}>
                      <span style={{ fontSize: "11px" }}>✨</span>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "rgba(199,210,254,.95)", letterSpacing: "0.4px" }}>Análisis con IA incluido</span>
                    </div>

                    {/* Camera icon with glow */}
                    <div style={{ position: "relative", display: "inline-flex", marginBottom: "12px" }}>
                      <div style={{ position: "absolute", inset: "-8px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,.35) 0%, transparent 70%)" }} />
                      <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(99,102,241,.5)", position: "relative" }}>
                        <span style={{ fontSize: "26px", lineHeight: 1 }}>📷</span>
                      </div>
                    </div>

                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>
                      {dragOver ? "¡Soltá las fotos aquí!" : "Subí tus fotos"}
                    </div>
                    <div style={{ fontSize: "12px", color: "rgba(199,210,254,.75)", marginBottom: "6px" }}>
                      La IA detectará categoría, título y descripción automáticamente
                    </div>
                    <div style={{ fontSize: "11px", color: "rgba(148,163,184,.65)", marginBottom: "18px" }}>
                      Arrastrá o seleccioná desde tu dispositivo
                    </div>

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                      style={{
                        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                        color: "#fff", border: "none",
                        borderRadius: "10px", padding: "11px 32px",
                        fontSize: "13px", fontWeight: 700, cursor: "pointer",
                        boxShadow: "0 4px 16px rgba(99,102,241,.5)",
                        letterSpacing: "0.2px",
                      }}
                    >
                      📂 Elegir fotos
                    </button>

                    {/* Feature pills */}
                    <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginTop: "16px", flexWrap: "wrap" as const }}>
                      {["Gratis", "30 segundos", "Sin registro"].map(tag => (
                        <span key={tag} style={{ fontSize: "10px", fontWeight: 600, color: "rgba(148,163,184,.7)", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: "20px", padding: "3px 10px" }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Photo grid ── */}
                {!analyzing && photos.length > 0 && (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "10px" }}>
                      {previews.map((src, i) => (
                        <div
                          key={i}
                          draggable
                          onDragStart={() => setDragIdx(i)}
                          onDragOver={(e) => { e.preventDefault(); setDragOverIdx(i); }}
                          onDragLeave={() => setDragOverIdx(null)}
                          onDrop={(e) => { e.preventDefault(); handlePhotoDrop(i); }}
                          onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
                          style={{
                            aspectRatio: "4/3", position: "relative",
                            borderRadius: "10px", overflow: "hidden",
                            border: dragOverIdx === i
                              ? `2.5px solid ${C.blue}`
                              : `${i === 0 ? "2.5px" : "1.5px"} solid ${i === 0 ? C.blue : C.slate200}`,
                            boxShadow: dragOverIdx === i
                              ? `0 0 0 4px rgba(37,99,235,.25)`
                              : i === 0 ? `0 0 0 3px rgba(37,99,235,.15)` : "none",
                            opacity: dragIdx === i ? 0.45 : 1,
                            cursor: "grab",
                            transition: "opacity .15s, box-shadow .15s",
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
                          {i === 0 && (
                            <div style={{
                              position: "absolute", bottom: 0, left: 0, right: 0,
                              background: C.blue, color: C.white,
                              fontSize: "9px", fontWeight: 800, textAlign: "center",
                              padding: "3px", letterSpacing: ".5px",
                            }}>PORTADA</div>
                          )}
                          {/* Remove */}
                          <button type="button" onClick={() => removePhoto(i)} style={{
                            position: "absolute", top: "5px", right: "5px",
                            width: "22px", height: "22px", borderRadius: "50%",
                            background: "rgba(15,23,42,.75)", color: C.white,
                            border: "none", fontSize: "12px", fontWeight: 900,
                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          }}>×</button>
                          {/* Order badge */}
                          {i > 0 && (
                            <div style={{
                              position: "absolute", bottom: "5px", left: "5px",
                              background: "rgba(15,23,42,.6)", color: "rgba(255,255,255,.9)",
                              fontSize: "9px", fontWeight: 700, borderRadius: "6px",
                              padding: "2px 6px",
                            }}>{i + 1}</div>
                          )}
                        </div>
                      ))}
                      {/* Add more tile */}
                      {photos.length < 8 && (
                        <button type="button" onClick={() => fileRef.current?.click()} style={{
                          aspectRatio: "4/3",
                          borderRadius: "10px",
                          border: `1.5px dashed ${C.slate200}`, background: C.slate50,
                          cursor: "pointer", display: "flex", flexDirection: "column" as const,
                          alignItems: "center", justifyContent: "center", gap: "6px",
                          color: C.slate300,
                        }}>
                          <span style={{ fontSize: "28px", lineHeight: 1 }}>+</span>
                          <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: ".5px", color: C.slate300 }}>AGREGAR</span>
                        </button>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "10px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: 600, color: C.blue }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        {photos.length} foto{photos.length !== 1 ? "s" : ""}
                      </span>
                      <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: C.slate300, flexShrink: 0 }} />
                      <span style={{ fontSize: "12px", color: C.slate500, fontWeight: 500 }}>
                        La primera es la portada
                      </span>
                      <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: C.slate300, flexShrink: 0 }} />
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: C.slate400, fontWeight: 500 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="5 9 2 12 5 15"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
                        Arrastrá para reordenar
                      </span>
                    </div>

                    {/* AI analysis notice */}
                    {aiData && (
                      <div style={{
                        marginTop: "10px",
                        display: "flex", alignItems: "center", gap: "8px",
                        background: "linear-gradient(135deg, #eef4ff, #f5f3ff)",
                        border: `1px solid ${C.blue100}`,
                        borderRadius: "10px",
                        padding: "9px 14px",
                      }}>
                        <span style={{
                          fontSize: "9px", fontWeight: 800, letterSpacing: "0.8px",
                          textTransform: "uppercase" as const,
                          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                          color: "#fff", borderRadius: "20px", padding: "3px 8px",
                          flexShrink: 0,
                        }}>✦ IA</span>
                        <span style={{ fontSize: "12px", color: C.slate600, fontWeight: 500, lineHeight: 1.3 }}>
                          Datos completados automáticamente — revisá y editá antes de publicar
                        </span>
                      </div>
                    )}
                  </>
                )}


                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => addPhotos(Array.from(e.target.files ?? []))}
                />
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
                  status={(() => {
                    if (!categoryId) return "pending";
                    if (isVehicle) {
                      const ok = !!(attrs.sub_category && attrs.brand && attrs.model && attrs.year && zone);
                      const partial = !!(attrs.sub_category || attrs.brand || attrs.model || attrs.year || zone);
                      return ok ? "ok" : partial ? "partial" : "pending";
                    }
                    const ok = !!(categoryId && zone && (isServices || isPets || condition));
                    return ok ? "ok" : "partial";
                  })()}
                  label={(() => {
                    if (!categoryId) return "Pendiente";
                    if (isVehicle) {
                      const ok = !!(attrs.sub_category && attrs.brand && attrs.model && attrs.year && zone);
                      const partial = !!(attrs.sub_category || attrs.brand || attrs.model || attrs.year || zone);
                      return ok ? "Completo" : partial ? "Parcial" : "Pendiente";
                    }
                    const ok = !!(categoryId && zone && (isServices || isPets || condition));
                    return ok ? "Completo" : "Parcial";
                  })()}
                />
              </div>
              <div style={T.cardBody}>
                <div style={T.grid2}>
                  {/* Category + Condition (non-vehicle) */}
                  <Field label="Categoría" required>
                    <CategoryPicker value={categoryId} onChange={handleCategory} />
                  </Field>

                  {(photos.length > 0 || categoryId > 0) && (<>
                  {!isVehicle && !isRealEstate && !isServices && (!isPets || isPetProduct) && (
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
                      <Field label="Tipo" required>
                        <FocusSel
                          value={attrs.sub_category ?? ""}
                          onChange={(e) => {
                            if (attrs.sub_category !== e.target.value) {
                              handleAttr("sub_category", e.target.value);
                              handleAttr("brand", "");
                              handleAttr("model", "");
                              setModelosML([]);
                            }
                          }}
                        >
                          <option value="">Seleccionar...</option>
                          {TIPOS_VEHICULO.map((tipo) => (
                            <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                          ))}
                        </FocusSel>
                      </Field>

                      {attrs.sub_category && (<>

                      {/* Tipo de moto — solo para moto */}
                      {attrs.sub_category === "moto" && (
                        <Field label="Tipo de moto" required>
                          <FocusSel
                            value={attrs.moto_subtipo ?? ""}
                            onChange={(e) => handleAttr("moto_subtipo", e.target.value)}
                          >
                            <option value="">Seleccionar...</option>
                            {MOTO_SUBTIPOS.map((s) => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </FocusSel>
                        </Field>
                      )}

                      {/* ── Náutica: Categoría + Subcategoría + Marca (Motos de Agua) ── */}
                      {attrs.sub_category === "nautica" ? (<>
                        <Field label="Categoría" required>
                          <FocusSel
                            value={attrs.nautica_categoria ?? ""}
                            onChange={(e) => {
                              handleAttr("nautica_categoria", e.target.value);
                              handleAttr("nautica_subcategoria", "");
                              handleAttr("brand", "");
                            }}
                          >
                            <option value="">Seleccionar...</option>
                            {NAUTICA_CATEGORIAS.map((c) => (
                              <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                          </FocusSel>
                        </Field>

                        {attrs.nautica_categoria && (() => {
                          const cat = NAUTICA_CATEGORIAS.find((c) => c.value === attrs.nautica_categoria);
                          return cat ? (
                            <Field label="Subcategoría">
                              <FocusSel
                                value={attrs.nautica_subcategoria ?? ""}
                                onChange={(e) => handleAttr("nautica_subcategoria", e.target.value)}
                              >
                                <option value="">Seleccionar...</option>
                                {cat.subcategorias.map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </FocusSel>
                            </Field>
                          ) : null;
                        })()}

                        {attrs.nautica_categoria && (<>
                          {/* Marca: dropdown para Motos de Agua, texto libre para el resto */}
                          <Field label="Marca">
                            {attrs.nautica_categoria === "motos_de_agua" ? (
                              <FocusSel
                                value={attrs.brand ?? ""}
                                onChange={(e) => handleAttr("brand", e.target.value)}
                              >
                                <option value="">Seleccionar...</option>
                                {NAUTICA_CATEGORIAS.find((c) => c.value === "motos_de_agua")!.marcas!.map((m) => (
                                  <option key={m} value={m}>{m}</option>
                                ))}
                              </FocusSel>
                            ) : (
                              <FocusInp
                                value={attrs.brand ?? ""}
                                onChange={(e) => handleAttr("brand", e.target.value)}
                                placeholder="Marca..."
                              />
                            )}
                          </Field>

                          <Field label="Modelo">
                            <FocusInp
                              value={attrs.model ?? ""}
                              onChange={(e) => handleAttr("model", e.target.value)}
                              placeholder="Modelo..."
                            />
                          </Field>
                        </>)}
                      </>) : attrs.sub_category === "otro" ? (<>

                        {/* Otros Vehículos: Categoría + Subcategoría + Marca + Modelo libres */}
                        <Field label="Categoría" required>
                          <FocusSel
                            value={attrs.otros_categoria ?? ""}
                            onChange={(e) => {
                              handleAttr("otros_categoria", e.target.value);
                              handleAttr("otros_subcategoria", "");
                            }}
                          >
                            <option value="">Seleccionar...</option>
                            {OTROS_VEHICULOS_CATEGORIAS.map((c) => (
                              <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                          </FocusSel>
                        </Field>

                        {attrs.otros_categoria && (() => {
                          const cat = OTROS_VEHICULOS_CATEGORIAS.find((c) => c.value === attrs.otros_categoria);
                          return cat ? (
                            <Field label="Subcategoría">
                              <FocusSel
                                value={attrs.otros_subcategoria ?? ""}
                                onChange={(e) => handleAttr("otros_subcategoria", e.target.value)}
                              >
                                <option value="">Seleccionar...</option>
                                {cat.subcategorias.map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </FocusSel>
                            </Field>
                          ) : null;
                        })()}

                        <Field label="Marca">
                          <FocusInp
                            value={attrs.brand ?? ""}
                            onChange={(e) => handleAttr("brand", e.target.value)}
                            placeholder="Marca..."
                          />
                        </Field>

                        <Field label="Modelo">
                          <FocusInp
                            value={attrs.model ?? ""}
                            onChange={(e) => handleAttr("model", e.target.value)}
                            placeholder="Modelo..."
                          />
                        </Field>

                      </>) : (<>

                      {/* Marca */}
                      <Field label="Marca" required>
                        <FocusSel
                          value={attrs.brand ?? ""}
                          onChange={(e) => {
                            handleAttr("brand", e.target.value);
                            handleAttr("model", "");
                            setModelosML([]);
                          }}
                        >
                          <option value="">Seleccionar...</option>
                          {marcasFiltradas.map((b) => (
                            <option key={b.value} value={b.value}>
                              {b.label}
                            </option>
                          ))}
                          <option value="otro">Otro</option>
                        </FocusSel>
                      </Field>

                      {/* Modelo — ML models → static fallback → free text */}
                      <Field label="Modelo" required>
                        {loadingModelos ? (
                          <div style={{
                            padding: "8px 12px", fontSize: "13px", color: "#94a3b8",
                            border: "1.5px solid #e2e8f0", borderRadius: "6px",
                          }}>
                            Cargando modelos...
                          </div>
                        ) : modelosML.length > 0 && (!attrs.model || modelosML.includes(attrs.model as string) || attrs.model === "Otro") ? (
                          <FocusSel
                            value={attrs.model ?? ""}
                            onChange={(e) => handleAttr("model", e.target.value)}
                          >
                            <option value="">Seleccionar...</option>
                            {modelosML.map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                            <option value="Otro">Otro</option>
                          </FocusSel>
                        ) : !["auto", "camioneta", "moto", "cuatriciclo", "utv", "camion"].includes(attrs.sub_category ?? "") && vehicleModels.length > 0 ? (
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
                      </>)}

                      {/* Año — oculto para náutica de servicios/accesorios y cuando no hay categoría aún */}
                      {(attrs.sub_category !== "nautica" || (attrs.nautica_categoria && !["servicios", "accesorios_nauticos"].includes(attrs.nautica_categoria))) ? (
                      <Field label="Año" required>
                        <FocusSel
                          value={attrs.year ?? ""}
                          onChange={(e) =>
                            handleAttr("year", Number(e.target.value))
                          }
                        >
                          <option value="">Seleccionar...</option>
                          {Array.from(
                            { length: new Date().getFullYear() - 1929 },
                            (_, i) => new Date().getFullYear() - i,
                          ).map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </FocusSel>
                      </Field>
                      ) : null}

                      {/* Cilindrada — solo para moto/cuatriciclo/utv */}
                      {["moto", "cuatriciclo", "utv"].includes(attrs.sub_category ?? "") && (
                        <Field label="Cilindrada">
                          <div style={{ position: "relative" }}>
                            <FocusInp
                              type="number"
                              value={attrs.cilindrada ?? ""}
                              onChange={(e) => handleAttr("cilindrada", e.target.value)}
                              placeholder="125"
                              style={{ paddingRight: "36px" }}
                              min={0}
                            />
                            <span style={{ position: "absolute", right: "11px", top: "50%", transform: "translateY(-50%)", fontSize: "10px", color: C.slate300, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>cc</span>
                          </div>
                        </Field>
                      )}

                      {/* Km / Horas de uso */}
                      {(attrs.sub_category !== "nautica"
                        ? true
                        : !!attrs.nautica_categoria && !["servicios", "accesorios_nauticos", "inflables_recreacion"].includes(attrs.nautica_categoria)
                      ) && (
                      <Field label={attrs.sub_category === "nautica" ? "Horas de uso" : "Kilómetros"} required>
                        <div style={{ position: "relative" }}>
                          <FocusInp
                            type="number"
                            value={attrs.km ?? ""}
                            onChange={(e) => handleAttr("km", e.target.value)}
                            placeholder="0"
                            style={{ paddingRight: attrs.sub_category === "nautica" ? "44px" : "36px" }}
                          />
                          <span style={{ position: "absolute", right: "11px", top: "50%", transform: "translateY(-50%)", fontSize: "10px", color: C.slate300, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
                            {attrs.sub_category === "nautica" ? "hs" : "km"}
                          </span>
                        </div>
                      </Field>
                      )}

                      </>)}
                      {/* Provincia + Localidad + Estado — 3 cols en 1 fila */}
                      <div style={{ gridColumn: "span 2" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                          <Field label="Provincia" required>
                            <FocusSel value={zone} onChange={(e) => { setZone(e.target.value); setLocality(""); }}>
                              <option value="">Seleccioná...</option>
                              {ARGENTINA_PROVINCES.map((p) => (
                                <option key={p} value={p}>{p}</option>
                              ))}
                            </FocusSel>
                          </Field>
                          <Field label="Localidad">
                            {LOCALITIES_BY_PROVINCE[zone] ? (
                              <FocusSel value={locality} onChange={(e) => setLocality(e.target.value)}>
                                <option value="">Seleccioná...</option>
                                {[...LOCALITIES_BY_PROVINCE[zone]].sort((a, b) => a === "Otro" ? 1 : b === "Otro" ? -1 : a.localeCompare(b, "es")).map((l) => (
                                  <option key={l} value={l}>{l}</option>
                                ))}
                              </FocusSel>
                            ) : (
                              <FocusInp
                                value={locality}
                                onChange={(e) => setLocality(e.target.value)}
                                placeholder="Ciudad o localidad"
                                disabled={!zone}
                              />
                            )}
                          </Field>
                          <Field label="Estado" required>
                            <FocusSel value={condition} onChange={(e) => setCondition(e.target.value)}>
                              <option value="">Seleccioná...</option>
                              {CONDITIONS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                              ))}
                            </FocusSel>
                          </Field>
                        </div>
                      </div>

                      {/* ── Datos adicionales (colapsable) ── */}
                      <div style={{ gridColumn: "span 2" }}>
                        <button
                          type="button"
                          onClick={() => setShowExtraVehicle((v) => !v)}
                          style={{
                            width: "100%", display: "flex", alignItems: "center",
                            justifyContent: "space-between", padding: "10px 14px",
                            borderRadius: "10px", border: `1.5px solid ${C.slate200}`,
                            background: showExtraVehicle ? C.blue50 : C.white,
                            color: showExtraVehicle ? C.blue : C.slate500,
                            fontWeight: 600, fontSize: "13px", cursor: "pointer",
                            fontFamily: "inherit", transition: "all .15s",
                          }}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span>Datos adicionales</span>
                            {(attrs.version || attrs.fuel || attrs.transmission || attrs.color || attrs.engine || attrs.patente) && (
                              <span style={{ fontSize: "10px", background: C.blue, color: "#fff", borderRadius: "10px", padding: "1px 7px", fontWeight: 700 }}>
                                {[attrs.version, attrs.fuel, attrs.transmission, attrs.color, attrs.engine, attrs.patente].filter(Boolean).length} completados
                              </span>
                            )}
                          </span>
                          <span style={{ fontSize: "16px", lineHeight: 1 }}>{showExtraVehicle ? "▲" : "▼"}</span>
                        </button>

                        {showExtraVehicle && (
                          <div style={{
                            marginTop: "12px", display: "grid",
                            gridTemplateColumns: "1fr 1fr", gap: "12px",
                            padding: "16px", borderRadius: "10px",
                            border: `1px solid ${C.slate100}`, background: "#fafafa",
                          }}>
                            {/* Versión — no aplica para motos */}
                            {!["moto", "cuatriciclo", "utv"].includes(attrs.sub_category ?? "") && (
                              <Field label="Versión">
                                <FocusInp value={attrs.version ?? ""} onChange={(e) => handleAttr("version", e.target.value)} placeholder="Move, SR 4x4, Sport..." />
                              </Field>
                            )}

                            {/* Combustible — no aplica para motos */}
                            {!["moto", "cuatriciclo", "utv"].includes(attrs.sub_category ?? "") && (
                              <Field label="Combustible">
                                <FocusSel value={attrs.fuel ?? ""} onChange={(e) => handleAttr("fuel", e.target.value)}>
                                  <option value="">Seleccionar...</option>
                                  {FUELS.map((f) => <option key={f} value={f.toLowerCase()}>{f}</option>)}
                                </FocusSel>
                              </Field>
                            )}

                            {/* Transmisión — no aplica para motos */}
                            {!["moto", "cuatriciclo", "utv"].includes(attrs.sub_category ?? "") && (
                              <Field label="Transmisión">
                                <FocusSel value={attrs.transmission ?? ""} onChange={(e) => handleAttr("transmission", e.target.value)}>
                                  <option value="">Seleccionar...</option>
                                  {TRANSMISIONS.map((t) => <option key={t} value={t.toLowerCase()}>{t}</option>)}
                                </FocusSel>
                              </Field>
                            )}

                            {/* Color — no aplica para motos */}
                            {!["moto", "cuatriciclo", "utv"].includes(attrs.sub_category ?? "") && (
                              <Field label="Color">
                                <FocusInp value={attrs.color ?? ""} onChange={(e) => handleAttr("color", e.target.value)} placeholder="Gris plata..." />
                              </Field>
                            )}

                            {/* Motor — no aplica para motos */}
                            {!["moto", "cuatriciclo", "utv"].includes(attrs.sub_category ?? "") && (
                              <Field label="Motor">
                                <FocusInp value={attrs.engine ?? ""} onChange={(e) => handleAttr("engine", e.target.value)} placeholder="1.6, 2.0 TDI..." />
                              </Field>
                            )}

                            {/* Patente — no aplica para motos */}
                            {!["moto", "cuatriciclo", "utv"].includes(attrs.sub_category ?? "") && (
                              <Field label="Patente">
                                <FocusInp
                                  value={attrs.patente ?? ""}
                                  onChange={(e) => handleAttr("patente", e.target.value.toUpperCase())}
                                  placeholder="PDL187" maxLength={8}
                                  style={{ letterSpacing: "2px", fontWeight: 700 }}
                                />
                                <label style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px", fontSize: "12px", color: "#94a3b8", cursor: "pointer", userSelect: "none" as const }}>
                                  <input type="checkbox" checked={attrs.show_patente ?? false} onChange={(e) => handleAttr("show_patente", e.target.checked)} style={{ accentColor: "#6366f1", cursor: "pointer" }} />
                                  Mostrar patente en la publicación
                                </label>
                              </Field>
                            )}

                            {/* Tipo de vendedor */}
                            <div style={{ gridColumn: "span 2" }}>
                              <label style={T.lbl}>Tipo de vendedor</label>
                              <div style={{ display: "flex", gap: "8px" }}>
                                {[["particular", "👤 Particular"], ["concesionaria", "🏢 Tienda / Concesionaria"]].map(([v, l]) => {
                                  const isLocked = userIsStore && v === "particular";
                                  const isActive = attrs.seller_type === v;
                                  return (
                                    <button
                                      key={v}
                                      type="button"
                                      disabled={isLocked}
                                      onClick={() => !isLocked && handleAttr("seller_type", v)}
                                      title={isLocked ? "Tenés una tienda activa — no podés publicar como particular" : undefined}
                                      style={{
                                        flex: 1, padding: "10px", borderRadius: "9px",
                                        border: `1.5px solid ${isActive ? C.blue : isLocked ? C.slate100 : C.slate200}`,
                                        background: isActive ? C.blue50 : isLocked ? C.slate50 : C.white,
                                        color: isActive ? C.blue : isLocked ? C.slate300 : C.slate500,
                                        fontWeight: isActive ? 700 : 400,
                                        fontSize: "13px",
                                        cursor: isLocked ? "not-allowed" : "pointer",
                                        fontFamily: "inherit", transition: "all .1s",
                                        textDecoration: isLocked ? "line-through" : "none",
                                      }}
                                    >
                                      {l}
                                    </button>
                                  );
                                })}
                              </div>
                              {userIsStore && (
                                <div style={{ fontSize: "11px", color: C.slate400, marginTop: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                                  <span>🏪</span> Publicás como tienda — la opción "Particular" no está disponible
                                </div>
                              )}
                            </div>

                            {/* Características — pills seleccionables */}
                            <div style={{ gridColumn: "span 2", paddingTop: "8px", borderTop: `1px solid ${C.slate100}` }}>
                              <label style={{ ...T.lbl, display: "block", marginBottom: "10px" }}>Características</label>
                              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "8px" }}>
                                {[
                                  ["negotiable_price", "Precio negociable"],
                                  ["first_owner", "Único dueño"],
                                  ["financing", "Financiamiento"],
                                  ["accepts_trade", "Acepta permuta"],
                                  ["has_gnc", "Con GNC"],
                                  ["has_alarm", "Con alarma"],
                                  ["has_service", "Con service"],
                                ].filter(([k]) => k !== "has_gnc" || !["moto", "cuatriciclo", "utv"].includes(attrs.sub_category ?? ""))
                                .map(([k, l]) => {
                                  const active = !!attrs[k];
                                  return (
                                    <button
                                      key={k}
                                      type="button"
                                      onClick={() => handleAttr(k, !active)}
                                      style={{
                                        padding: "7px 14px", borderRadius: "20px",
                                        border: `1.5px solid ${active ? C.blue : C.slate200}`,
                                        background: active ? C.blue : C.white,
                                        color: active ? C.white : C.slate600,
                                        fontSize: "13px", fontWeight: active ? 700 : 400,
                                        cursor: "pointer", fontFamily: "inherit",
                                        transition: "all .12s",
                                        display: "flex", alignItems: "center", gap: "5px",
                                      }}
                                    >
                                      {active && <span style={{ fontSize: "10px" }}>●</span>}
                                      {l}
                                    </button>
                                  );
                                })}
                              </div>
                              <div style={{ fontSize: "11px", color: C.slate400, marginTop: "8px" }}>Tocá para activar o desactivar</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* ── TECHNOLOGY sub-category ── */}
                  {isTechnology && (
                    <>
                      <Field label="Grupo" required>
                        <TechGroupPicker
                          value={techGroup}
                          onChange={(key) => { setTechGroup(key); handleAttr("sub_category", ""); }}
                        />
                      </Field>
                      <Field label="Tipo" required>
                        <FocusSel
                          value={attrs.sub_category ?? ""}
                          onChange={(e) => handleAttr("sub_category", e.target.value)}
                          disabled={!techGroup}
                        >
                          <option value="">Seleccioná...</option>
                          {techGroup && TECH_GROUPS[techGroup]?.items.map(([v, l]) => (
                            <option key={v} value={v}>{l}</option>
                          ))}
                        </FocusSel>
                      </Field>
                    </>
                  )}

                  {/* ── GENERIC category fields (phones, appliances, babies, beauty, clothing, etc.) ── */}
                  {!isVehicle && !isRealEstate && !isTechnology && catConfig?.fields && (
                    <>
                      {catConfig.fields.filter(f => f.type !== "checkbox").filter(f => {
                        if (!isPets) return true;
                        if (PET_ANIMAL_FIELDS.includes(f.key)) return isPetAnimal;
                        return true;
                      }).map(field => (
                        <Field key={field.key} label={field.label} required={field.required}>
                          {field.type === "select" ? (
                            <FocusSel
                              value={attrs[field.key] ?? ""}
                              onChange={(e) => handleAttr(field.key, e.target.value)}
                            >
                              <option value="">Seleccioná...</option>
                              {field.options?.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </FocusSel>
                          ) : field.type === "radio" ? (
                            <div style={{ display: "flex", gap: "6px" }}>
                              {field.options?.map(opt => (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => handleAttr(field.key, opt.value)}
                                  style={{
                                    flex: 1, padding: "10px", borderRadius: "8px", fontSize: "12px",
                                    border: `1.5px solid ${attrs[field.key] === opt.value ? C.blue : C.slate200}`,
                                    background: attrs[field.key] === opt.value ? C.blue50 : C.white,
                                    color: attrs[field.key] === opt.value ? C.blue : C.slate500,
                                    fontWeight: attrs[field.key] === opt.value ? 700 : 400,
                                    cursor: "pointer", fontFamily: "inherit", transition: "all .1s",
                                  }}
                                >{opt.label}</button>
                              ))}
                            </div>
                          ) : (
                            <FocusInp
                              type={field.type === "number" ? "number" : "text"}
                              value={attrs[field.key] ?? ""}
                              onChange={(e) => handleAttr(field.key, e.target.value)}
                              placeholder={field.placeholder ?? ""}
                            />
                          )}
                          {field.hint && (
                            <div style={{ fontSize: "11px", color: C.slate400, marginTop: "4px" }}>{field.hint}</div>
                          )}
                        </Field>
                      ))}
                      {catConfig.fields.filter(f => f.type === "checkbox").filter(f => !isPets || PET_ANIMAL_FIELDS.includes(f.key) ? isPetAnimal : true).length > 0 && (
                        <div style={{ gridColumn: "span 2" }}>
                          <label style={{ ...T.lbl, display: "block", marginBottom: "10px" }}>Características</label>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                            {catConfig.fields.filter(f => f.type === "checkbox").filter(f => !isPets || PET_ANIMAL_FIELDS.includes(f.key) ? isPetAnimal : true).map(field => (
                              <CheckItem key={field.key} label={field.label} value={!!attrs[field.key]} onChange={(v) => handleAttr(field.key, v)} />
                            ))}
                          </div>
                        </div>
                      )}
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

                      {/* Provincia + Localidad */}
                      <Field label="Provincia" required>
                        <FocusSel value={zone} onChange={(e) => { setZone(e.target.value); setLocality(""); }}>
                          <option value="">Seleccioná...</option>
                          {ARGENTINA_PROVINCES.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </FocusSel>
                      </Field>
                      <Field label="Localidad">
                        {LOCALITIES_BY_PROVINCE[zone] ? (
                          <FocusSel value={locality} onChange={(e) => setLocality(e.target.value)}>
                            <option value="">Seleccioná...</option>
                            {[...LOCALITIES_BY_PROVINCE[zone]].sort((a, b) => a === "Otro" ? 1 : b === "Otro" ? -1 : a.localeCompare(b, "es")).map((l) => (
                              <option key={l} value={l}>{l}</option>
                            ))}
                          </FocusSel>
                        ) : (
                          <FocusInp value={locality} onChange={(e) => setLocality(e.target.value)} placeholder="Ciudad o localidad" disabled={!zone} />
                        )}
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

                  {/* Provincia + Localidad — non-vehicle, non-real-estate */}
                  {!isVehicle && !isRealEstate && (
                    <>
                      <div>
                        <Field label="Provincia" required>
                          <FocusSel value={zone} onChange={(e) => { setZone(e.target.value); setLocality(""); }}>
                            <option value="">Seleccioná...</option>
                            {ARGENTINA_PROVINCES.map((p) => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </FocusSel>
                        </Field>
                      </div>
                      <div>
                        <Field label="Localidad">
                          {LOCALITIES_BY_PROVINCE[zone] ? (
                            <FocusSel value={locality} onChange={(e) => setLocality(e.target.value)}>
                              <option value="">Seleccioná...</option>
                              {[...LOCALITIES_BY_PROVINCE[zone]].sort((a, b) => a === "Otro" ? 1 : b === "Otro" ? -1 : a.localeCompare(b, "es")).map((l) => (
                                <option key={l} value={l}>{l}</option>
                              ))}
                            </FocusSel>
                          ) : (
                            <FocusInp
                              value={locality}
                              onChange={(e) => setLocality(e.target.value)}
                              placeholder="Ciudad o localidad"
                              disabled={!zone}
                            />
                          )}
                        </Field>
                      </div>
                    </>
                  )}
                  </>)}
                </div>
              </div>
            </div>
            {/* ░░ 04 PRECIO ░░ */}
            <div style={T.card}>
              <div style={T.cardHead}>
                <CardTitle icon="💰" label="04 · Precio" />
                <Badge
                  status={price === "0" ? "partial" : price ? "ok" : "pending"}
                  label={price === "0" ? "Consultar" : price ? `${currency === "ARS" ? "$" : "U$S"} ${Number(price).toLocaleString("es-AR")}` : "Sin precio"}
                />
              </div>
              <div style={T.cardBody}>
                {/* Currency toggle */}
                <div style={{ display: "flex", gap: "4px", marginBottom: "14px", background: C.slate100, borderRadius: "10px", padding: "3px" }}>
                  {(["ARS", "USD"] as const).map((c) => (
                    <button key={c} type="button" onClick={() => setCurrency(c)} style={{
                      flex: 1, padding: "9px", borderRadius: "8px", border: "none",
                      fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                      background: currency === c ? C.white : "transparent",
                      color: currency === c ? C.slate800 : C.slate400,
                      boxShadow: currency === c ? "0 1px 3px rgba(15,23,42,.1)" : "none",
                      transition: "all .12s",
                    }}>
                      {c === "ARS" ? "$ Pesos argentinos" : "USD Dólares"}
                    </button>
                  ))}
                </div>

                {/* Price input — same style as other inputs */}
                <div style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  background: C.white, border: `1.5px solid ${C.slate200}`,
                  borderRadius: "8px", padding: "10px 14px",
                  transition: "border-color .15s",
                }}
                  onFocusCapture={(e) => (e.currentTarget.style.borderColor = C.blue)}
                  onBlurCapture={(e) => (e.currentTarget.style.borderColor = C.slate200)}
                >
                  <span style={{ fontSize: "20px", fontWeight: 700, color: C.slate400 }}>
                    {currency === "ARS" ? "$" : "U$S"}
                  </span>
                  <input
                    type="text" inputMode="numeric"
                    value={price ? Number(price).toLocaleString("es-AR") : ""}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\./g, "").replace(/[^0-9]/g, "");
                      setPrice(raw);
                    }}
                    placeholder="0"
                    style={{
                      flex: 1, background: "transparent", border: "none", outline: "none",
                      fontSize: "24px", fontWeight: 700, color: C.slate900,
                      fontFamily: "inherit", letterSpacing: "-0.5px",
                    }}
                  />
                </div>


                {/* Category price reference */}
                {!isVehicle && priceData && priceData.count >= 3 && (
                  <div style={{ marginTop: "12px", padding: "10px 14px", background: C.blue50, borderRadius: "10px", border: `1px solid ${C.blue100}` }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: C.blue, marginBottom: "3px" }}>Referencia en esta categoría</div>
                    <div style={{ fontSize: "12px", color: C.slate600 }}>
                      Promedio: <strong>${priceData.avg.toLocaleString("es-AR")}</strong> · Rango: ${priceData.min.toLocaleString("es-AR")} – ${priceData.max.toLocaleString("es-AR")}
                    </div>
                  </div>
                )}

                {/* Precio a consultar — opción prominente */}
                <div style={{ marginTop: "14px", borderTop: `1px solid ${C.slate100}`, paddingTop: "14px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: C.slate400, textTransform: "uppercase" as const, letterSpacing: "0.5px", marginBottom: "10px" }}>
                    ¿No querés mostrar el precio?
                  </div>
                  <button
                    type="button"
                    onClick={() => setPrice(price === "0" ? "" : "0")}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: "12px",
                      padding: "12px 16px", borderRadius: "10px", cursor: "pointer",
                      border: `1.5px solid ${price === "0" ? C.blue : C.slate200}`,
                      background: price === "0" ? C.blue : C.white,
                      fontFamily: "inherit", transition: "all .15s",
                      boxShadow: price === "0" ? "0 2px 8px rgba(37,99,235,.2)" : "none",
                    }}
                  >
                    <div style={{
                      width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0,
                      border: `2px solid ${price === "0" ? "rgba(255,255,255,.5)" : C.slate300}`,
                      background: price === "0" ? "rgba(255,255,255,.2)" : C.white,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all .12s",
                    }}>
                      {price === "0" && <span style={{ color: "#fff", fontSize: "11px", fontWeight: 900 }}>✓</span>}
                    </div>
                    <div style={{ textAlign: "left" as const, flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: price === "0" ? "#fff" : C.slate800 }}>
                        Precio a consultar
                      </div>
                      <div style={{ fontSize: "12px", color: price === "0" ? "rgba(255,255,255,.75)" : C.slate400, marginTop: "1px" }}>
                        El comprador te pregunta por el precio
                      </div>
                    </div>
                    {price === "0" && (
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,.9)", background: "rgba(255,255,255,.15)", borderRadius: "20px", padding: "3px 10px", flexShrink: 0 }}>
                        Activo
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* end left column */}

          {/* ── RIGHT SIDEBAR ── */}
          <div className="new-listing-sidebar">{sidebarJSX}</div>
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
              Subiendo fotos y guardando en ComerxIA
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
            {/* Esencial (bronze) */}
            {[
              {
                key: "bronze", badge: "⭐ ESTÁNDAR", name: "Esencial", price: "1.500",
                color: "#f97316", colorLight: "#fff7ed", colorBorder: "#fed7aa",
                gradient: "linear-gradient(135deg,#f97316,#fb923c)",
                shadow: "0 4px 24px rgba(249,115,22,0.18)",
                features: ["Aparece antes que los gratuitos","Badge ⭐ Esencial en tu publicación","Borde naranja destacado","Vigencia 7 días"],
                cta: "Activar Esencial",
              },
              {
                key: "silver", badge: "🚀 DESTACADO", name: "Destacado", price: "3.500",
                color: "#6366f1", colorLight: "#eef2ff", colorBorder: "#c7d2fe",
                gradient: "linear-gradient(135deg,#6366f1,#818cf8)",
                shadow: "0 4px 24px rgba(99,102,241,0.22)",
                features: ["Todo lo de Esencial","Badge 🚀 Destacado en tu publicación","Borde violeta llamativo","Posición preferencial en la categoría","Vigencia 15 días"],
                cta: "Activar Destacado",
                popular: true,
              },
              {
                key: "gold", badge: "👑 PREMIUM", name: "Premium", price: "6.000",
                color: "#d97706", colorLight: "#fffbeb", colorBorder: "#fde68a",
                gradient: "linear-gradient(135deg,#f59e0b,#fbbf24)",
                shadow: "0 4px 24px rgba(251,191,36,0.28)",
                features: ["Todo lo de Destacado","Badge 👑 Premium en tu publicación","Borde dorado exclusivo","Aparece en la sección Premium de la home","Primero en cualquier categoría","Vigencia 30 días"],
                cta: "Activar Premium",
              },
            ].map((plan) => (
              <div
                key={plan.key}
                style={{
                  background: "#fff", borderRadius: "16px",
                  border: `2px solid ${plan.colorBorder}`,
                  boxShadow: plan.shadow,
                  overflow: "hidden", position: "relative",
                }}
              >
                {plan.popular && (
                  <div style={{
                    position: "absolute", top: "-1px", left: "50%", transform: "translateX(-50%)",
                    background: plan.gradient, color: "#fff", fontSize: "10px", fontWeight: 800,
                    padding: "3px 12px", borderRadius: "0 0 8px 8px", whiteSpace: "nowrap" as const,
                  }}>
                    MÁS ELEGIDO
                  </div>
                )}
                {/* Header */}
                <div style={{ background: plan.colorLight, padding: "16px 16px 12px", borderBottom: `1px solid ${plan.colorBorder}` }}>
                  <div style={{
                    display: "inline-block", background: plan.gradient, color: "#fff",
                    borderRadius: "6px", padding: "3px 9px", fontSize: "11px", fontWeight: 800, marginBottom: "10px",
                  }}>
                    {plan.badge}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "4px" }}>
                    <div style={{ fontSize: "15px", fontWeight: 800, color: "#111" }}>{plan.name}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                      <span style={{ fontSize: "11px", color: "#888" }}>$</span>
                      <span style={{ fontSize: "22px", fontWeight: 900, color: plan.color, lineHeight: 1 }}>{plan.price}</span>
                      <span style={{ fontSize: "10px", color: "#aaa" }}>ARS</span>
                    </div>
                  </div>
                </div>
                {/* Features */}
                <div style={{ padding: "12px 16px" }}>
                  <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                    {plan.features.map(f => (
                      <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "6px", fontSize: "11px", color: "#444" }}>
                        <span style={{ color: plan.color, fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* CTA */}
                <div style={{ padding: "0 16px 16px" }}>
                  <button
                    type="button"
                    onClick={async () => {
                      if (doneId) await fetch(`/api/listings/${doneId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ featured_level: plan.key }) });
                      setStep("done");
                    }}
                    style={{
                      width: "100%", background: plan.gradient, color: "#fff",
                      border: "none", borderRadius: "10px", padding: "12px",
                      fontWeight: 700, fontSize: "13px", cursor: "pointer",
                      fontFamily: "inherit", boxShadow: plan.shadow,
                    }}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            ))}
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
              Tu aviso ya está visible en ComerxIA.
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
