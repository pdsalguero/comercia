"use client";

import { useState, useRef, useEffect } from "react";

const ARGENTINA_LOCATIONS = [
  // Buenos Aires
  "Buenos Aires",
  "La Plata, Buenos Aires",
  "Mar del Plata, Buenos Aires",
  "Quilmes, Buenos Aires",
  "Lanús, Buenos Aires",
  "Lomas de Zamora, Buenos Aires",
  "Almirante Brown, Buenos Aires",
  "Merlo, Buenos Aires",
  "Moreno, Buenos Aires",
  "Tigre, Buenos Aires",
  "San Isidro, Buenos Aires",
  "Vicente López, Buenos Aires",
  "Tres de Febrero, Buenos Aires",
  "Morón, Buenos Aires",
  "Ituzaingó, Buenos Aires",
  "Hurlingham, Buenos Aires",
  "Bahía Blanca, Buenos Aires",
  "Tandil, Buenos Aires",
  "Zárate, Buenos Aires",
  "Campana, Buenos Aires",
  "Pilar, Buenos Aires",
  "Escobar, Buenos Aires",
  "San Martín, Buenos Aires",
  "Berazategui, Buenos Aires",
  "Florencio Varela, Buenos Aires",
  "Avellaneda, Buenos Aires",
  "San Fernando, Buenos Aires",
  "Luján, Buenos Aires",
  "Olavarría, Buenos Aires",
  "Necochea, Buenos Aires",
  "Pergamino, Buenos Aires",
  "San Nicolás, Buenos Aires",
  "Junín, Buenos Aires",
  "Azul, Buenos Aires",
  // Ciudad Autónoma de Buenos Aires
  "CABA",
  "Palermo, CABA",
  "Caballito, CABA",
  "Belgrano, CABA",
  "Recoleta, CABA",
  "Villa Urquiza, CABA",
  "Flores, CABA",
  "Boedo, CABA",
  "Almagro, CABA",
  "Balvanera, CABA",
  "San Telmo, CABA",
  "Barracas, CABA",
  "Mataderos, CABA",
  "Liniers, CABA",
  // Córdoba
  "Córdoba",
  "Río Cuarto, Córdoba",
  "San Francisco, Córdoba",
  "Villa María, Córdoba",
  "Bell Ville, Córdoba",
  "Alta Gracia, Córdoba",
  "Carlos Paz, Córdoba",
  "Cosquín, Córdoba",
  "La Falda, Córdoba",
  "Jesús María, Córdoba",
  "Río Tercero, Córdoba",
  // Santa Fe
  "Rosario, Santa Fe",
  "Santa Fe",
  "Rafaela, Santa Fe",
  "Santo Tomé, Santa Fe",
  "Reconquista, Santa Fe",
  "Venado Tuerto, Santa Fe",
  "Esperanza, Santa Fe",
  "Casilda, Santa Fe",
  // Mendoza
  "Mendoza",
  "Godoy Cruz, Mendoza",
  "Guaymallén, Mendoza",
  "Las Heras, Mendoza",
  "San Rafael, Mendoza",
  "Luján de Cuyo, Mendoza",
  "Maipú, Mendoza",
  "Rivadavia, Mendoza",
  // San Juan
  "San Juan",
  "Rawson, San Juan",
  "Rivadavia, San Juan",
  "Pocito, San Juan",
  "Caucete, San Juan",
  "Chimbas, San Juan",
  "Santa Lucía, San Juan",
  "Albardón, San Juan",
  "Angaco, San Juan",
  "Calingasta, San Juan",
  "Iglesia, San Juan",
  "Jáchal, San Juan",
  "9 de Julio, San Juan",
  "Sarmiento, San Juan",
  "Ullum, San Juan",
  "Valle Fértil, San Juan",
  "25 de Mayo, San Juan",
  "Zonda, San Juan",
  // Tucumán
  "San Miguel de Tucumán",
  "Yerba Buena, Tucumán",
  "Banda del Río Salí, Tucumán",
  "Concepción, Tucumán",
  "Monteros, Tucumán",
  "Aguilares, Tucumán",
  // Salta
  "Salta",
  "Tartagal, Salta",
  "Orán, Salta",
  "General Güemes, Salta",
  "Cafayate, Salta",
  // Jujuy
  "San Salvador de Jujuy",
  "Palpalá, Jujuy",
  "Perico, Jujuy",
  "Humahuaca, Jujuy",
  "Tilcara, Jujuy",
  "Libertador Gral. San Martín, Jujuy",
  // Misiones
  "Posadas, Misiones",
  "Oberá, Misiones",
  "Eldorado, Misiones",
  "Puerto Iguazú, Misiones",
  // Chaco
  "Resistencia, Chaco",
  "Barranqueras, Chaco",
  "Charata, Chaco",
  "Villa Ángela, Chaco",
  // Entre Ríos
  "Paraná, Entre Ríos",
  "Concordia, Entre Ríos",
  "Gualeguaychú, Entre Ríos",
  "Concepción del Uruguay, Entre Ríos",
  // Corrientes
  "Corrientes",
  "Goya, Corrientes",
  "Paso de los Libres, Corrientes",
  "Mercedes, Corrientes",
  // Neuquén
  "Neuquén",
  "San Martín de los Andes, Neuquén",
  "Zapala, Neuquén",
  "Plottier, Neuquén",
  // Río Negro
  "Bariloche, Río Negro",
  "Viedma, Río Negro",
  "Cipolletti, Río Negro",
  "General Roca, Río Negro",
  "Allen, Río Negro",
  // Chubut
  "Rawson, Chubut",
  "Comodoro Rivadavia, Chubut",
  "Puerto Madryn, Chubut",
  "Trelew, Chubut",
  "Esquel, Chubut",
  // Santa Cruz
  "Río Gallegos, Santa Cruz",
  "Caleta Olivia, Santa Cruz",
  "El Calafate, Santa Cruz",
  // Tierra del Fuego
  "Ushuaia, Tierra del Fuego",
  "Río Grande, Tierra del Fuego",
  // La Pampa
  "Santa Rosa, La Pampa",
  "General Pico, La Pampa",
  // San Luis
  "San Luis",
  "Villa Mercedes, San Luis",
  // Santiago del Estero
  "Santiago del Estero",
  "La Banda, Santiago del Estero",
  "Termas de Río Hondo, Santiago del Estero",
  // La Rioja
  "La Rioja",
  "Chilecito, La Rioja",
  // Catamarca
  "San Fernando del Valle de Catamarca",
  // Formosa
  "Formosa",
  "Clorinda, Formosa",
];

interface Props {
  defaultValue?: string;
}

export function LocationInput({ defaultValue }: Props) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function getSuggestions(input: string): string[] {
    if (!input.trim()) return [];
    const lower = input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return ARGENTINA_LOCATIONS
      .filter((loc) => {
        const locNorm = loc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return locNorm.includes(lower);
      })
      .slice(0, 8);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setValue(v);
    const s = getSuggestions(v);
    setSuggestions(s);
    setOpen(s.length > 0);
    setActiveIndex(-1);
  }

  function handleSelect(loc: string) {
    setValue(loc);
    setSuggestions([]);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} style={{ flex: 1, position: "relative" }}>
      {/* Input wrapper */}
      <div style={{
        display: "flex", alignItems: "center", gap: "8px",
        border: "1.5px solid #e2e8f0", borderRadius: "10px",
        padding: "0 14px", background: "#fafafa",
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        <input
          ref={inputRef}
          name="location"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            const s = getSuggestions(value);
            if (s.length > 0) { setSuggestions(s); setOpen(true); }
          }}
          placeholder="Ubicación"
          autoComplete="off"
          style={{
            flex: 1, border: "none", outline: "none", fontSize: "14px",
            background: "transparent", padding: "11px 0", color: "#333",
          }}
        />
        {value && (
          <button
            type="button"
            onClick={() => { setValue(""); setSuggestions([]); setOpen(false); inputRef.current?.focus(); }}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "0", color: "#94a3b8", fontSize: "16px", lineHeight: 1 }}
          >
            ×
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#fff", borderRadius: "10px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          zIndex: 100, overflow: "hidden",
        }}>
          {suggestions.map((loc, i) => {
            const parts = loc.split(", ");
            const city = parts[0];
            const province = parts[1];
            return (
              <div
                key={loc}
                onMouseDown={() => handleSelect(loc)}
                style={{
                  padding: "9px 14px",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", gap: "10px",
                  background: i === activeIndex ? "#f0f7ff" : "transparent",
                  borderBottom: i < suggestions.length - 1 ? "1px solid #f8fafc" : "none",
                }}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(-1)}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <div>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>{city}</span>
                  {province && (
                    <span style={{ fontSize: "12px", color: "#94a3b8", marginLeft: "6px" }}>{province}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
