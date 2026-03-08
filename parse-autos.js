const fs = require('fs');
const text = fs.readFileSync('Autos-text.txt', 'utf8');
const lines = text.split('\n');

// Header/footer lines to skip
const isHeaderFooter = (line) => {
  const t = line.trim();
  return t.includes('Autos - Pick Ups') ||
    t.includes('Visite Nuestro Sitio') ||
    t.includes('0 Km 2025') ||
    t.includes('===PAGE_BREAK===') ||
    /[A-Z0-9\s]+ 0KM EN US\$/.test(t) ||
    /[A-Z0-9\s]+ 0KM EN PESOS/.test(t) ||
    /^[A-Z]+ EN US\$/.test(t) ||
    /^JMEV/.test(t) ||  // spurious brand in KIA section
    t === '';
};

// Strip trailing price numbers from a line
// Prices: 4+ digit numbers or numbers like "101,800" "70,050" (thousands separator comma)
// Engine sizes: "1,4" "2,0" "3,2" (only 1-2 digits before comma)
// Years: 2012-2026 range (4 digits)
const stripPrices = (line) => {
  // A "price token" is one of:
  //   - A 4+ digit integer: \d{4,}
  //   - A number with comma thousands: \d{1,3},\d{3}  (like 101,800 or 70,050)
  //   - A float price like 64638,8 (digit block + comma + 1-2 digits when total digits > 4)
  // We strip trailing clusters of these
  let result = line.trim();
  // Repeatedly strip trailing price tokens
  const priceToken = /(\s+(?:\d{1,3},\d{3}(?:[,\.]\d+)?|\d{4,}(?:[,\.]\d+)?))+\s*$/;
  result = result.replace(priceToken, '').trim();
  return result;
};

// Version line starters (lines that are version descriptions of a model)
// These start with body type / configuration descriptors
const VERSION_STARTERS = [
  /^(\d+P\s)/i,      // 3P, 4P, 5P, 2P ...
  /^(C\/S\s)/i,       // C/S (cabina simple)
  /^(C\/C\s)/i,       // C/C (cabina y cuarto)
  /^(D\/C\s)/i,       // D/C (doble cabina)
  /^(COUPE\s)/i,
  /^(CABRIO\s)/i,
  /^(CONV\s)/i,
  /^(ROADSTER\s)/i,
  /^(BERLINA\s)/i,
  /^(FAMILIAR\s)/i,
  /^(CC\s)/i,
  /^(SW\s)/i,
  /^(SUV\s)/i,
  /^(CREW\s)/i,
  /^(SIMPLE\s)/i,
  /^(DOBLE\s)/i,
  /^(EXTRA\s)/i,
  /^(VAN\s)/i,
  /^(FURGON\s\d)/i,    // FURGON followed by displacement (1,6 etc.) - version; FURGON L3H2 = model
  /^(CHASIS\s)/i,
  /^(BOX\s)/i,
  /^(SEDAN\s)/i,
  /^(BREAK\s)/i,
  /^(MIXTO\s)/i,
  /^(MINIBUS\s)/i,
  /^(BUS\s)/i,
  /^(COMBI\s)/i,
  /^(MICROBUS\s)/i,
  /^(SPORTBACK\s)/i,
  /^(AVANT\s)/i,
  /^(GRAN COUPE\s)/i,
  /^(GRAN TURISMO\s)/i,
  /^(SPYDER\s)/i,
  /^(KOUP\s)/i,
  /^(TARGA\s)/i,
  /^(TOURING\s)/i,
  /^(ALLROAD\s)/i,
  /^(A-COUPE\s)/i,
  /^(C\/D\s)/i,
  /^(C\/EXTEN\.\s)/i,
  /^(C\/PLUS\s)/i,
  /^(C\/EXT\.\s)/i,
  /^(COMBINATO\s)/i,
  /^(WAGON\s)/i,
  /^(COMMUTER\s)/i,
  /^(MICROVAN\s)/i,
  /^(\d+\s+\d+[,\.]\d)/,  // "110 2,0..." - number + engine
  /^(\d+[,\.]\d)/,         // engine displacement "2,0 TDI..."
  /^(\d{3}\s+[A-Z])/,      // 3-digit number + letter "110 SW..."
  /^(\d{2}\s+[A-Z0-9]{2})/, // "90 4X4..."
];

const isVersionLine = (line) => {
  const t = line.trim();
  return VERSION_STARTERS.some(re => re.test(t));
};

// A brand/model line: reasonably uppercase, not a version, not a header/footer
// Allow some lowercase (for names like "eDELIVER", "MiTo") but mostly uppercase
const isBrandOrModel = (line) => {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (isHeaderFooter(trimmed)) return false;
  if (isVersionLine(trimmed)) return false;
  // Must not contain typical version patterns embedded (engine displacement mid-string)
  // Allow letters (both cases), digits, spaces, hyphens, slashes, dots, parens, exclamations, commas, ampersands
  if (!/^[A-Za-záéíóúñüÁÉÍÓÚÑÜ0-9\s\-\/\.\!\(\)\,\&]+$/.test(trimmed)) return false;
  // Filter out lines that are mostly lowercase (likely non-model text)
  const uppercaseCount = (trimmed.match(/[A-Z]/g) || []).length;
  const lowercaseCount = (trimmed.match(/[a-z]/g) || []).length;
  if (lowercaseCount > uppercaseCount) return false;
  return true;
};

// Known top-level BRANDS only
const KNOWN_BRANDS = new Set([
  'AGRALE', 'ALFA ROMEO', 'AUDI', 'BAJAJ', 'BMW', 'BYD', 'CHERY', 'CHEVROLET',
  'CHRYSLER', 'CITROEN', 'CITROËN', 'DACIA', 'DODGE', 'DS', 'FIAT', 'FORD',
  'FOTON', 'GAC', 'GREAT WALL', 'GWM', 'HONDA', 'HYUNDAI', 'IVECO', 'JAC',
  'JAGUAR', 'JEEP', 'KIA', 'LAND ROVER', 'LEXUS', 'LINCOLN', 'MASERATI',
  'MAZDA', 'MERCEDES BENZ', 'MERCEDES-BENZ', 'MG', 'MINI', 'MITSUBISHI',
  'NISSAN', 'PEUGEOT', 'PORSCHE', 'RAM', 'RENAULT', 'SEAT', 'SKODA', 'SUBARU',
  'SUZUKI', 'TESLA', 'TOYOTA', 'VOLKSWAGEN', 'VOLVO', 'CHANGAN', 'OMODA',
  'JETOUR', 'HAVAL', 'TANK', 'DFSK', 'GEELY', 'SAIC', 'SSANGYONG', 'DAEWOO',
  'LIFAN', 'BRILLIANCE', 'DONGFENG', 'MAXUS', 'ISUZU', 'HINO',
  'LADA', 'PONTIAC', 'BUICK', 'GMC', 'OLDSMOBILE', 'SATURN', 'SMART',
  'ACURA', 'INFINITI', 'SCION', 'DAIHATSU', 'LOTUS', 'MCLAREN', 'FERRARI',
  'LAMBORGHINI', 'BENTLEY', 'ROLLS ROYCE', 'ASTON MARTIN', 'GENESIS',
  'LYNK', 'EXEED', 'BAIC', 'ZEEKR', 'NIO', 'XPENG', 'LI AUTO', 'AVATR',
  'VOYAH', 'AEOLUS', 'WULING', 'LEAPMOTOR', 'NETA', 'SERES', 'AION',
  'GAC TRUMPCHI', 'POLESTAR', 'LYNK & CO', 'HONGQI', 'ROEWE',
  'BESTUNE', 'WELTMEISTER', 'ORA', 'DEEPAL',
]);

// Process lines to extract brands, models, versions
const result = {};
let currentBrand = null;
let currentModel = null;

const cleanedLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  if (isHeaderFooter(line)) continue;
  cleanedLines.push(line);
}

// Now classify each cleaned line
for (let i = 0; i < cleanedLines.length; i++) {
  const line = cleanedLines[i];

  if (isVersionLine(line)) {
    // Strip trailing prices to get clean version name
    let versionName = stripPrices(line);
    if (!versionName) versionName = line.trim();

    if (currentBrand && currentModel) {
      if (!result[currentBrand]) result[currentBrand] = {};
      if (!result[currentBrand][currentModel]) result[currentBrand][currentModel] = [];
      if (!result[currentBrand][currentModel].includes(versionName)) {
        result[currentBrand][currentModel].push(versionName);
      }
    }
  } else if (isBrandOrModel(line)) {
    // Strip any prices from the line to get clean model name
    const cleanLine = stripPrices(line);
    const checkLine = cleanLine || line;

    if (KNOWN_BRANDS.has(checkLine.toUpperCase()) || KNOWN_BRANDS.has(checkLine)) {
      currentBrand = checkLine;
      currentModel = null;
    } else {
      // It's a model under the current brand
      currentModel = cleanLine || line;
    }
  }
}

// Output as TypeScript
const output = [];
output.push('// Vehicle versions extracted from CCA Autos.pdf (Febrero 2026)');
output.push('// Source: https://www.cca.org.ar/descargas/precios/Autos.pdf');
output.push('');
output.push('export const vehicleVersions = {');

for (const [brand, models] of Object.entries(result)) {
  const brandKey = brand.toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
  output.push(`  // ${brand}`);
  output.push(`  ${JSON.stringify(brandKey)}: {`);
  for (const [model, versions] of Object.entries(models)) {
    output.push(`    ${JSON.stringify(model)}: [`);
    for (const v of versions) {
      output.push(`      ${JSON.stringify(v)},`);
    }
    output.push(`    ],`);
  }
  output.push(`  },`);
}
output.push('} as const;');

fs.writeFileSync('Autos-versions.ts', output.join('\n'));

// Also output JSON
fs.writeFileSync('Autos-versions.json', JSON.stringify(result, null, 2));

// Summary
console.log('=== SUMMARY ===');
let totalModels = 0;
let totalVersions = 0;
for (const [brand, models] of Object.entries(result)) {
  let brandTotal = 0;
  for (const [model, versions] of Object.entries(models)) {
    brandTotal += versions.length;
  }
  totalVersions += brandTotal;
  totalModels += Object.keys(models).length;
  console.log(`${brand}: ${Object.keys(models).length} models, ${brandTotal} versions`);
}
console.log(`\nTOTAL: ${Object.keys(result).length} brands, ${totalModels} models, ${totalVersions} versions`);
console.log('\nFiles written: Autos-versions.ts, Autos-versions.json');
