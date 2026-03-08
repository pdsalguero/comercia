// src/lib/utils/patente-year.ts
// Fuentes: iProfesional + rangos RNPA Argentina

const MERCOSUR_RANGES: {
  prefix: string;
  minNum: number;
  year: number;
  period: string;
}[] = [
  { prefix: "AG", minNum: 450, year: 2024, period: "ene-2024" },
  { prefix: "AG", minNum: 300, year: 2023, period: "oct-2023" },
  { prefix: "AG", minNum: 0, year: 2023, period: "may-2023" },
  { prefix: "AF", minNum: 770, year: 2023, period: "ene-2023" },
  { prefix: "AF", minNum: 600, year: 2022, period: "oct-2022" },
  { prefix: "AF", minNum: 0, year: 2021, period: "ago-2021" },
  { prefix: "AE", minNum: 600, year: 2021, period: "ene-2021" },
  { prefix: "AE", minNum: 100, year: 2020, period: "ene-2020" },
  { prefix: "AE", minNum: 0, year: 2019, period: "oct-2019" },
  { prefix: "AD", minNum: 400, year: 2019, period: "ene-2019" },
  { prefix: "AD", minNum: 0, year: 2018, period: "jul-2018" },
  { prefix: "AC", minNum: 200, year: 2018, period: "ene-2018" },
  { prefix: "AC", minNum: 0, year: 2017, period: "nov-2017" },
  { prefix: "AB", minNum: 0, year: 2017, period: "feb-2017" },
  { prefix: "AA", minNum: 900, year: 2017, period: "ene-2017" },
  { prefix: "AA", minNum: 0, year: 2016, period: "abr-2016" },
];

// Primeras 2 letras exactas (tabla iProfesional)
const OLD_2LETTER_EXACT: Record<string, number> = {
  AA: 1995,
  AP: 1996,
  BD: 1997,
  BU: 1998,
  CM: 1999,
  DC: 2000,
  DO: 2001,
  DX: 2002,
  ED: 2003,
  EI: 2004,
  ET: 2005,
  FI: 2006,
  GB: 2007,
  GV: 2008,
  HT: 2009,
  IM: 2010,
  JN: 2011,
  KU: 2012,
  MB: 2013,
  NM: 2014,
  ON: 2015,
  PM: 2016,
};

// Rangos por primera letra (fallback)
// AAA-DZZ=1995-2000 | EAA-HZZ=2001-2006 | IAA-LZZ=2007-2010 | MAA-NZZ=2011-2014 | OAA-PZZ=2015-2016
const FIRST_LETTER_RANGES: {
  from: string;
  to: string;
  yearFrom: number;
  yearTo: number;
}[] = [
  { from: "A", to: "D", yearFrom: 1995, yearTo: 2000 },
  { from: "E", to: "H", yearFrom: 2001, yearTo: 2006 },
  { from: "I", to: "L", yearFrom: 2007, yearTo: 2010 },
  { from: "M", to: "N", yearFrom: 2011, yearTo: 2014 },
  { from: "O", to: "P", yearFrom: 2015, yearTo: 2016 },
];

export interface PatenteInfo {
  year: number | null;
  yearTo?: number;
  format: "mercosur" | "old" | "pre1995" | "unknown";
  period: string;
  confidence: "high" | "medium" | "low";
  raw: string;
}

export function getYearFromPatente(rawPatente: string): PatenteInfo {
  const p = rawPatente
    .toUpperCase()
    .replace(/[\s\-\.]/g, "")
    .trim();

  if (!p || p.length < 5) {
    return {
      year: null,
      format: "unknown",
      period: "desconocido",
      confidence: "low",
      raw: rawPatente,
    };
  }

  // ── Formato Mercosur: 2L + 3N + 2L (ej: AB123CD) ─────────────
  const mercosurMatch = p.match(/^([A-Z]{2})(\d{3})[A-Z]{2}$/);
  if (mercosurMatch) {
    const prefix = mercosurMatch[1];
    const num = parseInt(mercosurMatch[2], 10);

    for (const range of MERCOSUR_RANGES) {
      if (prefix > range.prefix) {
        return {
          year: 2024,
          format: "mercosur",
          period: "2024+",
          confidence: "medium",
          raw: rawPatente,
        };
      }
      if (prefix === range.prefix && num >= range.minNum) {
        return {
          year: range.year,
          format: "mercosur",
          period: range.period,
          confidence: "high",
          raw: rawPatente,
        };
      }
    }
    return {
      year: 2016,
      format: "mercosur",
      period: "abr-2016",
      confidence: "medium",
      raw: rawPatente,
    };
  }

  // ── Formato viejo: 3L + 3N (ej: PDL187, GVX456) ─────────────
  const oldMatch = p.match(/^([A-Z]{3})(\d{3})$/);
  if (oldMatch) {
    const letters3 = oldMatch[1];
    const letters2 = letters3.slice(0, 2);

    // Intento 1: 2 letras exactas (mayor precisión)
    const exactYear = OLD_2LETTER_EXACT[letters2];
    if (exactYear) {
      return {
        year: exactYear,
        format: "old",
        period: String(exactYear),
        confidence: "high",
        raw: rawPatente,
      };
    }

    // Intento 2: primera letra en rangos
    const firstLetter = letters3[0];
    for (const range of FIRST_LETTER_RANGES) {
      if (firstLetter >= range.from && firstLetter <= range.to) {
        return {
          year: range.yearFrom,
          yearTo: range.yearTo !== range.yearFrom ? range.yearTo : undefined,
          format: "old",
          period:
            range.yearFrom === range.yearTo
              ? String(range.yearFrom)
              : `${range.yearFrom}-${range.yearTo}`,
          confidence: "medium",
          raw: rawPatente,
        };
      }
    }

    return {
      year: null,
      format: "old",
      period: "1995-2016",
      confidence: "low",
      raw: rawPatente,
    };
  }

  // ── Pre-1995: 1L + 6N ────────────────────────────────────────
  if (p.match(/^[A-Z]\d{6,7}$/)) {
    return {
      year: null,
      format: "pre1995",
      period: "antes de 1995",
      confidence: "high",
      raw: rawPatente,
    };
  }

  return {
    year: null,
    format: "unknown",
    period: "desconocido",
    confidence: "low",
    raw: rawPatente,
  };
}
