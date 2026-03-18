"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CATEGORY_CONFIGS, getCategoryConfig } from "@/lib/category-config";
import { CategoryIcon, TechGroupIcon } from "@/components/ui/CategoryIcon";
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

const CAT_ORDER = [2, 3, 21, 1, 22, 4, 5, 6, 7, 23, 8, 24, 9, 10];
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
    { n: "2", label: "Datos", key: "form" },
    { n: "3", label: "Precio", key: "price" },
    { n: "4", label: "Publicar", key: "publishing" },
  ];
  const activeIdx =
    current === "upload" || current === "analyzing"
      ? 0
      : current === "form"
        ? formFilled ? 2 : 1
        : current === "publishing"
          ? 3
          : 3;

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
    { ok: isPets || isServices || !!condition, label: "Estado" },
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
      const allPhotos = [...photos, ...toAdd];
      setPhotos(allPhotos);
      toAdd.forEach((f) => setPreviews((p) => [...p, URL.createObjectURL(f)]));
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
    fetchPrice(id);
  };
  const handleAttr = (k: string, v: any) => setAttrs((p) => ({ ...p, [k]: v }));

  // ── AI analysis ─────────────────────────────────────────────
  const analyzePhotos = async (files: File[]) => {
    if (!files.length) return;
    setAnalyzing(true);
    setError(null);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("photos", f));
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
      if (!attrs.brand) missing.push("Marca");
      if (!attrs.model) missing.push("Modelo");
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
      setStep("promo");
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

      {/* ── Price card ── */}
      <div style={{
        background: C.white, borderRadius: "16px",
        border: `1px solid ${C.blue200}`,
        boxShadow: "0 4px 16px rgba(37,99,235,.1)",
        overflow: "hidden",
      }}>
        {/* Header banner */}
        <div style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%)",
          padding: "14px 18px",
          display: "flex", alignItems: "center", gap: "10px",
        }}>
          {/* Tag icon SVG */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(99,179,237,.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2H7a2 2 0 0 0-2 2v5l9.5 9.5a2 2 0 0 0 2.83 0l3.17-3.17a2 2 0 0 0 0-2.83L12 2z"/>
            <circle cx="7.5" cy="7.5" r="1" fill="rgba(99,179,237,.9)" stroke="none"/>
          </svg>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff", letterSpacing: "-0.2px", lineHeight: 1.2 }}>
              Precio
            </div>
            <div style={{ fontSize: "10px", color: "rgba(148,198,233,.7)", fontWeight: 500, marginTop: "1px" }}>
              Definí cuánto vale tu producto
            </div>
          </div>
        </div>

        <div style={{ padding: "16px 18px" }}>
          {/* Currency toggle */}
          <div style={{
            display: "flex", gap: "4px", marginBottom: "12px",
            background: C.slate100, borderRadius: "10px", padding: "3px",
          }}>
            {(["ARS", "USD"] as const).map((c) => (
              <button key={c} type="button" onClick={() => setCurrency(c)} style={{
                flex: 1, padding: "8px", borderRadius: "8px", border: "none",
                fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                background: currency === c ? C.white : "transparent",
                color: currency === c ? C.slate800 : C.slate400,
                boxShadow: currency === c ? "0 1px 3px rgba(15,23,42,.1)" : "none",
                transition: "all .12s",
              }}>
                {c === "ARS" ? "$ Pesos" : "USD Dólares"}
              </button>
            ))}
          </div>

          {/* Price input */}
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: C.white, border: `1.5px solid ${C.slate200}`,
            borderRadius: "10px", padding: "10px 14px", marginBottom: "14px",
          }}>
            <span style={{ fontSize: "20px", fontWeight: 700, color: C.slate400 }}>
              {currency === "ARS" ? "$" : "U$S"}
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
                flex: 1, background: "transparent", border: "none", outline: "none",
                fontSize: "24px", fontWeight: 700, color: C.slate900,
                fontFamily: "inherit", letterSpacing: "-0.5px",
              }}
            />
          </div>

          {/* Completion */}
          <div style={{ borderTop: `1px solid ${C.slate100}`, paddingTop: "14px", marginBottom: "14px" }}>
            <div style={{ fontSize: "13px", color: C.slate600, marginBottom: "8px" }}>
              Tu aviso está{" "}
              <span style={{ color: C.blue, fontWeight: 800 }}>
                {Math.round((passed / checks.length) * 100)}% completo
              </span>
            </div>
            <div style={{ height: "6px", background: C.slate100, borderRadius: "100px", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: "100px",
                width: `${(passed / checks.length) * 100}%`,
                background: `linear-gradient(90deg, ${C.blue}, ${C.blue300})`,
                transition: "width .4s ease",
              }} />
            </div>
          </div>

          {/* IA tips */}
          <div style={{ borderTop: `1px solid ${C.slate100}`, paddingTop: "14px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: C.slate400, textTransform: "uppercase" as const, letterSpacing: "0.6px", marginBottom: "10px" }}>
              Potenciado con IA:
            </div>
            {[
              {
                title: title.length > 5 ? "¡Buen título!" : "Buen título",
                subtitle: "Describí el artículo con detalle",
                ok: title.length > 5,
                loading: analyzing,
              },
              {
                title: (categoryId > 0 && !!condition && !!zone) ? "¡Detalles completos!" : "Detalles completos",
                subtitle: "Contá sobre zona, estado, categoría",
                ok: categoryId > 0 && !!condition && !!zone,
                loading: false,
              },
            ].map((item) => (
              <div key={item.title} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
                <div style={{
                  width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0,
                  marginTop: "1px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "11px",
                  background: item.ok ? "#dcfce7" : item.loading ? "#fef9c3" : C.blue50,
                  color: item.ok ? "#15803d" : item.loading ? "#a16207" : C.blue,
                  border: `1.5px solid ${item.ok ? "#bbf7d0" : item.loading ? "#fde68a" : C.blue100}`,
                }}>
                  {item.ok ? "✓" : item.loading ? "·" : "+"}
                </div>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: item.ok ? C.slate800 : C.slate500 }}>{item.title}</div>
                  <div style={{ fontSize: "11px", color: C.slate400, lineHeight: 1.3 }}>{item.subtitle}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: C.redBg, border: `1px solid #fecaca`,
              borderRadius: "10px", padding: "10px 12px", marginBottom: "12px",
              fontSize: "12px", color: C.red, lineHeight: 1.4,
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Publish button */}
          <button
            type="button"
            onClick={handlePublish}
            disabled={!canPublish}
            style={{
              width: "100%", padding: "15px",
              background: canPublish
                ? "linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)"
                : C.slate200,
              color: canPublish ? C.white : C.slate400,
              border: "none", borderRadius: "12px",
              fontSize: "15px", fontWeight: 800,
              cursor: canPublish ? "pointer" : "not-allowed",
              fontFamily: "inherit",
              boxShadow: canPublish ? "0 6px 20px rgba(37,99,235,.4)" : "none",
              transition: "all .15s", letterSpacing: ".2px",
            }}
          >
            ¡Publicar Aviso!
          </button>

          {/* Terms */}
          <p style={{ fontSize: "11px", color: C.slate400, textAlign: "center", lineHeight: 1.5, margin: "10px 0 0" }}>
            Al publicar aceptás los{" "}
            <Link href="/terms" style={{ color: C.blue, textDecoration: "none", fontWeight: 600 }}>
              términos y condiciones
            </Link>
            .
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
      <style>{`@keyframes floatIn { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }`}</style>

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

                      {/* Provincia + Localidad */}
                      <div style={{ gridColumn: "span 2" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
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
                        </div>
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
