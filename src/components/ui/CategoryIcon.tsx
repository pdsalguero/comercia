interface Props { size?: number }

// ── Vehículos ──────────────────────────────────────────────
function VehiclesIcon({ size = 28 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* cabin */}
      <path d="M6 17L9.5 10C10 8.8 11 8.5 12 8.5H20C21 8.5 22 8.8 22.5 10L26 17Z"
        fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.6" strokeLinejoin="round"/>
      {/* body */}
      <rect x="3" y="17" width="26" height="9" rx="3"
        fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.6"/>
      {/* window */}
      <path d="M11.5 17L13.5 11H18.5L20.5 17Z" fill="#93c5fd"/>
      {/* wheels */}
      <circle cx="10" cy="26" r="3.5" fill="white" stroke="#3b82f6" strokeWidth="2"/>
      <circle cx="22" cy="26" r="3.5" fill="white" stroke="#3b82f6" strokeWidth="2"/>
      <circle cx="10" cy="26" r="1.2" fill="#93c5fd"/>
      <circle cx="22" cy="26" r="1.2" fill="#93c5fd"/>
      {/* divider line */}
      <path d="M3 20.5h26" stroke="#3b82f6" strokeWidth="0.8"/>
    </svg>
  );
}

// ── Inmuebles ─────────────────────────────────────────────
function RealEstateIcon({ size = 28 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* walls */}
      <path d="M6 15V27a1 1 0 001 1h5v-7h8v7h5a1 1 0 001-1V15"
        fill="#dcfce7" stroke="#16a34a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      {/* roof */}
      <path d="M3 16L16 4L29 16"
        stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      {/* door */}
      <rect x="13.5" y="21" width="5" height="7" rx="1"
        fill="#86efac" stroke="#16a34a" strokeWidth="1.2"/>
      {/* window */}
      <rect x="7" y="17" width="5" height="4" rx="1"
        fill="#bbf7d0" stroke="#16a34a" strokeWidth="1.2"/>
    </svg>
  );
}

// ── Electrónica ───────────────────────────────────────────
function ElectronicsIcon({ size = 28 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* phone body */}
      <rect x="9" y="2" width="14" height="28" rx="4"
        fill="#ede9fe" stroke="#7c3aed" strokeWidth="1.7"/>
      {/* screen */}
      <rect x="11" y="7" width="10" height="16" rx="1.5"
        fill="#ddd6fe" stroke="#7c3aed" strokeWidth="1.2"/>
      {/* home button */}
      <circle cx="16" cy="27" r="1.5" fill="#7c3aed"/>
      {/* speaker */}
      <path d="M13 4.5h6" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round"/>
      {/* screen shine */}
      <path d="M13 9 L13 11" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// ── Ropa y Calzado ────────────────────────────────────────
function ClothingIcon({ size = 28 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* t-shirt silhouette */}
      <path d="M11.5 4C11.5 4 13 6 16 6C19 6 20.5 4 20.5 4L27 7.5L24 13L21 11V27H11V11L8 13L5 7.5Z"
        fill="#fce7f3" stroke="#db2777" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      {/* collar */}
      <path d="M13 4C13 5.7 14.3 6 16 6C17.7 6 19 5.7 19 4"
        stroke="#db2777" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

// ── Hogar y Jardín ────────────────────────────────────────
function HomeGardenIcon({ size = 28 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* sofa back */}
      <rect x="3" y="9" width="26" height="8" rx="3"
        fill="#ffedd5" stroke="#ea580c" strokeWidth="1.6"/>
      {/* sofa seat */}
      <rect x="6" y="17" width="20" height="7" rx="2"
        fill="#fed7aa" stroke="#ea580c" strokeWidth="1.6"/>
      {/* left arm */}
      <rect x="3" y="15" width="5" height="9" rx="2"
        fill="#fed7aa" stroke="#ea580c" strokeWidth="1.6"/>
      {/* right arm */}
      <rect x="24" y="15" width="5" height="9" rx="2"
        fill="#fed7aa" stroke="#ea580c" strokeWidth="1.6"/>
      {/* legs */}
      <path d="M8 24v3M24 24v3" stroke="#ea580c" strokeWidth="1.8" strokeLinecap="round"/>
      {/* cushion line */}
      <path d="M6 21h20" stroke="#ea580c" strokeWidth="0.8"/>
    </svg>
  );
}

// ── Deportes ──────────────────────────────────────────────
function SportsIcon({ size = 28 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* ball */}
      <circle cx="16" cy="16" r="12" fill="#f0fdfa" stroke="#0d9488" strokeWidth="1.7"/>
      {/* soccer pattern - center pentagon suggestion */}
      <path d="M16 9 L13 12 L14 16 L18 16 L19 12 Z" fill="#0d9488"/>
      {/* side patches */}
      <path d="M9 13 L11 11 L13 12 L12 16 L9 16 Z" fill="#99f6e4"/>
      <path d="M23 13 L21 11 L19 12 L20 16 L23 16 Z" fill="#99f6e4"/>
      <path d="M10 19 L12 16 L14 17 L13 20 L10 20 Z" fill="#99f6e4"/>
      <path d="M22 19 L20 16 L18 17 L19 20 L22 20 Z" fill="#99f6e4"/>
      <path d="M16 23 L14 21 L15 18 L17 18 L18 21 Z" fill="#99f6e4"/>
    </svg>
  );
}

// ── Herramientas ──────────────────────────────────────────
function ToolsIcon({ size = 28 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* wrench */}
      <path d="M22 4C18.7 4 16 6.7 16 10C16 10.8 16.2 11.6 16.5 12.3L6 23L7.5 26.5L11 28L22 17.5C22.7 17.8 23.4 18 24 18C27.3 18 30 15.3 30 12C30 11.3 29.8 10.6 29.5 10L26 13.5L24 11.5L27.5 8C26.9 5.7 24.7 4 22 4Z"
        fill="#fef3c7" stroke="#d97706" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      {/* screwdriver */}
      <path d="M4 7L9 12L12 9L7 4L4 7Z"
        fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M9 12L14 24" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

// ── Libros ────────────────────────────────────────────────
function BooksIcon({ size = 28 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* book 1 (back) */}
      <rect x="6" y="6" width="12" height="22" rx="2"
        fill="#e0e7ff" stroke="#4f46e5" strokeWidth="1.5"/>
      {/* spine */}
      <rect x="6" y="6" width="3" height="22" rx="1.5"
        fill="#c7d2fe"/>
      {/* book 2 (front, tilted suggestion) */}
      <rect x="14" y="8" width="12" height="20" rx="2"
        fill="#eef2ff" stroke="#4f46e5" strokeWidth="1.5"/>
      <rect x="14" y="8" width="3" height="20" rx="1.5"
        fill="#c7d2fe"/>
      {/* lines */}
      <path d="M19 13h5M19 16h5M19 19h3"
        stroke="#4f46e5" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

// ── Mascotas ──────────────────────────────────────────────
function PetsIcon({ size = 28 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* paw */}
      <ellipse cx="16" cy="20" rx="8" ry="7" fill="#fef9c3" stroke="#ca8a04" strokeWidth="1.6"/>
      {/* toe pads */}
      <ellipse cx="11" cy="12" rx="3" ry="3.5" fill="#fef9c3" stroke="#ca8a04" strokeWidth="1.5"/>
      <ellipse cx="16" cy="10" rx="3" ry="3.5" fill="#fef9c3" stroke="#ca8a04" strokeWidth="1.5"/>
      <ellipse cx="21" cy="12" rx="3" ry="3.5" fill="#fef9c3" stroke="#ca8a04" strokeWidth="1.5"/>
      {/* knuckle lines */}
      <path d="M13 20.5 C13 22 14 23 16 23 C18 23 19 22 19 20.5"
        stroke="#ca8a04" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

// ── Otros ─────────────────────────────────────────────────
function OtherIcon({ size = 28 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* box */}
      <rect x="4" y="12" width="24" height="16" rx="2"
        fill="#f1f5f9" stroke="#64748b" strokeWidth="1.6"/>
      {/* lid */}
      <path d="M2 12L8 7H24L30 12H2Z"
        fill="#e2e8f0" stroke="#64748b" strokeWidth="1.6" strokeLinejoin="round"/>
      {/* tape */}
      <rect x="13" y="7" width="6" height="5" fill="#cbd5e1"/>
      <rect x="13" y="12" width="6" height="8" fill="#cbd5e1"/>
    </svg>
  );
}

// ── Tech group icons ──────────────────────────────────────
function TechPhonesIcon({ size = 28 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="9" y="2" width="14" height="28" rx="4" fill="#ede9fe" stroke="#7c3aed" strokeWidth="1.7"/>
      <rect x="11" y="7" width="10" height="16" rx="1.5" fill="#ddd6fe" stroke="#7c3aed" strokeWidth="1.2"/>
      <circle cx="16" cy="27" r="1.5" fill="#7c3aed"/>
      <path d="M13 4.5h6" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function TechComputersIcon({ size = 28 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="3" y="6" width="26" height="17" rx="2.5" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.6"/>
      <rect x="6" y="9" width="20" height="11" rx="1" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="1.2"/>
      <path d="M10 27h12M16 23v4" stroke="#3b82f6" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}
function TechCamerasIcon({ size = 28 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="3" y="9" width="26" height="18" rx="3" fill="#fce7f3" stroke="#db2777" strokeWidth="1.6"/>
      <path d="M11 9V7a2 2 0 012-2h6a2 2 0 012 2v2" stroke="#db2777" strokeWidth="1.5"/>
      <circle cx="16" cy="18" r="5" fill="#fbcfe8" stroke="#db2777" strokeWidth="1.5"/>
      <circle cx="16" cy="18" r="2.5" fill="#db2777"/>
      <circle cx="25" cy="13" r="1.5" fill="#db2777"/>
    </svg>
  );
}
function TechGamingIcon({ size = 28 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="3" y="10" width="26" height="14" rx="5" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.6"/>
      <path d="M11 14v6M8 17h6" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="22" cy="15" r="1.5" fill="#16a34a"/>
      <circle cx="25" cy="18" r="1.5" fill="#16a34a"/>
      <circle cx="22" cy="21" r="1.5" fill="#16a34a"/>
      <circle cx="19" cy="18" r="1.5" fill="#16a34a"/>
    </svg>
  );
}
function TechAudioIcon({ size = 28 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="8" y="3" width="16" height="26" rx="4" fill="#fef3c7" stroke="#d97706" strokeWidth="1.6"/>
      <circle cx="16" cy="10" r="4" fill="#fde68a" stroke="#d97706" strokeWidth="1.4"/>
      <circle cx="16" cy="10" r="1.5" fill="#d97706"/>
      <circle cx="16" cy="21" r="5" fill="#fde68a" stroke="#d97706" strokeWidth="1.4"/>
      <circle cx="16" cy="21" r="2" fill="#d97706"/>
    </svg>
  );
}
function TechTVIcon({ size = 28 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="2" y="6" width="28" height="19" rx="3" fill="#e0e7ff" stroke="#4f46e5" strokeWidth="1.6"/>
      <rect x="5" y="9" width="22" height="13" rx="1.5" fill="#c7d2fe" stroke="#4f46e5" strokeWidth="1.2"/>
      <path d="M12 28h8M16 25v3" stroke="#4f46e5" strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="26" cy="13" r="1" fill="#4f46e5"/>
      <circle cx="26" cy="17" r="1" fill="#4f46e5"/>
    </svg>
  );
}

export function TechGroupIcon({ group, size = 28 }: { group: string; size?: number }) {
  switch (group) {
    case "celulares":   return <TechPhonesIcon size={size} />;
    case "computacion": return <TechComputersIcon size={size} />;
    case "camaras":     return <TechCamerasIcon size={size} />;
    case "consolas":    return <TechGamingIcon size={size} />;
    case "electronica": return <TechAudioIcon size={size} />;
    case "tv":          return <TechTVIcon size={size} />;
    default:            return <OtherIcon size={size} />;
  }
}

// ── All categories ────────────────────────────────────────
export function CategoryIcon({ slug, size = 28 }: { slug: string; size?: number }) {
  switch (slug) {
    case "vehicles":    return <VehiclesIcon size={size} />;
    case "real-estate": return <RealEstateIcon size={size} />;
    case "electronics": return <ElectronicsIcon size={size} />;
    case "clothing":    return <ClothingIcon size={size} />;
    case "home-garden": return <HomeGardenIcon size={size} />;
    case "sports":      return <SportsIcon size={size} />;
    case "tools":       return <ToolsIcon size={size} />;
    case "books":       return <BooksIcon size={size} />;
    case "pets":        return <PetsIcon size={size} />;
    case "other":       return <OtherIcon size={size} />;
    default:            return <OtherIcon size={size} />;
  }
}
