"""Paso 2: arma el catálogo de marcas y modelos del sitio y genera los archivos TypeScript.

Uso:  python construir_catalogo.py

Une tres fuentes, en este orden de prioridad (la primera que trae un modelo define cómo se escribe):
  1. fuentes/lista-base.json          listas que tenía el sitio al 2026-09-23 (curadas a mano)
  2. fuentes/agregados-manuales.json  clásicos anteriores a 2002 y lanzamientos sin valuación todavía
  3. datos/dnrpa.json                 tabla de valuación DNRPA (sale de parsear_dnrpa.py)
Los nombres de DNRPA pasan antes por fuentes/equivalencias.json ("SW4" → "Hilux SW4").

Genera:
  src/data/catalogo/marcas.generated.ts   marcas por tipo (liviano, lo usan los formularios)
  src/data/catalogo/modelos.generated.ts  modelos por tipo y marca (lo sirve /api/vehiculos/modelos)
  datos/catalogo-revision.json            insumo de la página de revisión (pagina_revision.py)

Los slugs de marca que ya existían se conservan: los avisos guardan attributes.brand con ese slug."""
import json, re, os, collections as C

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
TIPOS = ["auto", "camioneta", "moto", "cuatriciclo", "utv", "camion"]

def load(*parts): return json.load(open(os.path.join(HERE, *parts), encoding="utf8"))
dnrpa = load("datos", "dnrpa.json")
base = load("fuentes", "lista-base.json")
manual = load("fuentes", "agregados-manuales.json")
equiv = load("fuentes", "equivalencias.json")["marcas"]
ROWS = dnrpa["rows"]

def norm(s): return re.sub(r"[^A-Z0-9]", "", s.upper().replace("Ë", "E").replace("É", "E"))

# ─── Marcas ───────────────────────────────────────────────────────────────────
UPPER_BRANDS = {"BMW", "BYD", "KTM", "MG", "JAC", "DFSK", "BAIC", "GMC", "DS", "RAM", "SEAT", "MINI", "TVS",
                "CFMOTO", "QJMOTOR", "BRP", "AKT", "SYM", "UM", "DFAC", "FAW", "JMC", "JMEV", "HAOJUE", "IVECO"}
BRAND_LABEL_OVERRIDE = {"CFMOTO": "CFMoto", "QJMOTOR": "QJ Motor", "GASGAS": "GasGas", "MERCEDESBENZ": "Mercedes-Benz",
                        "CANAM": "Can-Am", "HARLEYDAVIDSON": "Harley-Davidson", "ROYALENFIELD": "Royal Enfield",
                        "LANDROVER": "Land Rover", "ALFAROMEO": "Alfa Romeo", "CITROEN": "Citroën", "MINI": "Mini",
                        "SEAT": "SEAT", "DONGFENG": "Dongfeng"}
def canon_brand(b):
    b = b.upper().split("/")[0].strip()  # "MERCEDES BENZ/MARCOPOLO" (carrocero) → Mercedes Benz
    return {"FIAT IVECO": "IVECO", "DFAC DONGFENG": "DONGFENG"}.get(b, b)
def brand_key(b): return norm(canon_brand(b))
def brand_label(b):
    k = brand_key(b)
    if k in BRAND_LABEL_OVERRIDE: return BRAND_LABEL_OVERRIDE[k]
    return " ".join(w if w in UPPER_BRANDS or len(w) <= 2 else w.capitalize() for w in canon_brand(b).split())
def new_slug(label): return re.sub(r"[^a-z0-9]+", "_", label.lower().replace("ë", "e")).strip("_")

# slug y nombre de cada marca ya conocida (base y manual), por clave normalizada
SLUG_BY_KEY, LABEL_BY_SLUG = {}, {}
for src in (base, manual):
    for tipo, brands in src["tipos"].items():
        for slug, b in brands.items():
            SLUG_BY_KEY.setdefault(norm(slug), slug)
            SLUG_BY_KEY.setdefault(brand_key(b["label"]), slug)
            LABEL_BY_SLUG.setdefault(slug, b["label"])

def slug_for_dnrpa(marca):
    k = brand_key(marca)
    if k in SLUG_BY_KEY: return SLUG_BY_KEY[k]
    lab = brand_label(marca)
    s = new_slug(lab)
    SLUG_BY_KEY[k] = s
    LABEL_BY_SLUG.setdefault(s, lab)
    return s

# ─── DNRPA: tipo del sitio y modelo base ──────────────────────────────────────
KNOWN_TIPOS = sorted({r["tipo"] for r in ROWS if r["tipo"] and not re.search(r"\d{4}", r["tipo"])}, key=len, reverse=True)

def split_glued(modelo, tipo):
    """Separa 'COROLLA CROSS XLI 2.0 CVTRURAL 5 PUERTAS' cuando el tipo quedó pegado al modelo."""
    tipo = re.sub(r"\s*[\d,.E+ ]{5,}$", "", tipo).strip()  # números de valuación pegados
    if not tipo:
        for t in KNOWN_TIPOS:
            if len(t) >= 5 and modelo.endswith(t) and len(modelo) > len(t):
                return modelo[: -len(t)].strip(), t
    return modelo, tipo

def site_type(tipo, tipo_veh):
    t = tipo.upper()
    if re.search(r"MOTOCICLETA|SCOOTER|MOTONETA|CICLOMOTOR|TRICICLO", t): return "moto"
    if re.search(r"CUATRIC|CUADRICICLO", t): return "cuatriciclo"
    if "ARENERO" in t: return "utv"
    if re.search(r"CAMION|CHASIS|TRACTOR|PASAJEROS|BUS|OMNIBUS", t): return "camion"
    if re.search(r"PICK-?UP|TODO TERRENO|^TERRENO|FURGON|UTILITARIO|CABINA", t): return "camioneta"
    if re.search(r"SEDAN|COUPE|DESCAPOTABLE|CONVERTIBLE|FAMILIAR|RURAL|PUERTAS", t): return "auto"
    return "moto" if tipo_veh == "M" else None  # sin especificación: se decide por el resto de las versiones

# Modelos conocidos (base + manual) por marca, para reconocerlos al principio de la versión DNRPA
KNOWN = C.defaultdict(list)  # brand_key → [(norm, nombre)]
for src in (base, manual):
    for tipo in ("auto", "camioneta", "camion"):
        for slug, b in src["tipos"].get(tipo, {}).items():
            for m in b["modelos"]:
                n = norm(m)
                if len(n) >= 2: KNOWN[norm(slug)].append((n, m)); KNOWN[brand_key(b["label"])].append((n, m))
for k in KNOWN: KNOWN[k].sort(key=lambda t: len(t[0]), reverse=True)

def starts_with_model(version, n):
    """True si la versión empieza con el modelo `n` (normalizado) y termina en borde de palabra."""
    got, i = "", 0
    while i < len(version) and len(got) < len(n):
        if version[i].isalnum(): got += version[i]
        i += 1
    return got == n and (i >= len(version) or not version[i].isalnum())

PREFIX_NOISE = re.compile(r"^(ALL NEW|THE NEW|NEW|NUEVA|NUEVO|THE)\s+")
MB_CLASS = r"(CLA|CLC|CLK|CLS|SLK|SLC|SL|GLA|GLB|GLC|GLE|GLK|GLS|GL|ML|EQA|EQB|EQC|EQE|EQS|A|B|C|E|S|G|V|X|R)"
# Casos puntuales por marca (clave normalizada): (regex sobre la versión, modelo | None = se arma con el grupo)
ALIASES = {
    "VOLKSWAGEN": [(r"^(BLACK|WHITE|HIGH|MOVE|TAKE|CROSS|PEPPER|RED|CUP)?\s*UP\b!?", "Up"),
                   (r"^CROSS\s?FOX", "CrossFox"), (r"^PARA\s?TI", "Parati")],
    "PEUGEOT":    [(r"^PAR(\b|[A-Z])", "Partner"), (r"^(\d{3,4})[A-Z]", None)],
    "TOYOTA":     [(r"^(HILUX )?SW\s?4", "SW4"), (r"^4\s?RUNNER", "4Runner"), (r"^SR\s?5", "Hilux"), (r"^GR\s?86", "GR86"),
                   (r"^GR YARIS", "GR Yaris"), (r"^GR COROLLA", "GR Corolla"), (r"^LAND CRU[IS]+ER", "Land Cruiser"), (r"^RAV\s?4", "RAV4")],
    "RENAULT":    [(r"^R[- ]?19\b", "19"), (r"^VEL SATIS", "Vel Satis")],
    "CHEVROLET":  [(r"^(GMT |C 1500 |K 1500 )?SILVERADO", "Silverado"), (r"^G\. ?VITARA", "Grand Vitara"),
                   (r"^GEO TRACKER", "Tracker"), (r"^TRAIL ?BLAZER", "Trailblazer"), (r"^PICK-UP C10", "C-10"),
                   (r"^([CK])\s?(1500|2500|10|20)\b", None)],
    "FORD":       [(r"^E[ -]TRANSIT", "E-Transit"), (r"^F\s?-?\s?(\d{3})\b", None)],
    "NISSAN":     [(r"^X[ -]?TERRA", "X-Terra"), (r"^X[ -]?TRAIL", "X-Trail")],
    "JEEP":       [(r"^GR(AND|\.)\s?CHEROKEE", "Grand Cherokee"), (r"^CHEROK+E+", "Cherokee")],
    "HYUNDAI":    [(r"^GRAND I ?10", "Grand i10"), (r"^I ?10\b", "i10"), (r"^I ?30\b", "i30"), (r"^(EURO|PRO) ACCENT", "Accent"),
                   (r"^GRAND SANTA FE", "Grand Santa Fe"), (r"^H[ -]?1\b", "H-1"), (r"^H[ -]?100\b", "H100")],
    "SUZUKI":     [(r"^G(RAND|\.)\s?VITARA", "Grand Vitara")],
    "CITROEN":    [(r"^BER", "Berlingo"), (r"^C[- .]*ELYS", "C-Elysée"), (r"^C[ .]?15", "C15"), (r"^DS ?(\d)", None)],
    "BMW":        [(r"^M?\s?(\d)\d{2}[A-Z]{0,3}\b", None), (r"^(M\d|X\d|Z\d|I\d|IX\d?)\b", None)],
    "MERCEDESBENZ": [(r"^(?:MERCEDES(?:-AMG|-BENZ)?\s+)?" + MB_CLASS + r"[ -]?\d{2,3}", None),
                     (r"^(?:MERCEDES(?:-AMG|-BENZ)?\s+)?AMG GT", "AMG GT")],
}
def alias_model(bkey, v):
    for pat, label in ALIASES.get(bkey, []):
        m = re.match(pat, v)
        if not m: continue
        if label: return label
        g = m.group(1)
        if bkey == "PEUGEOT": return g
        if bkey == "CITROEN": return f"DS{g}"
        if bkey == "CHEVROLET": return f"{m.group(1)}{m.group(2)}" if m.group(2) in ("1500", "2500") else f"{m.group(1)}-{m.group(2)}"
        if bkey == "FORD": return f"F-{g}"
        if bkey == "BMW": return f"Serie {g}" if g.isdigit() else (g.replace("IX", "iX").replace("I", "i") if g.startswith("I") else g)
        if bkey == "MERCEDESBENZ": return f"Clase {g}" if len(g) == 1 else g
    return None

# Palabras que marcan el comienzo de la versión (a partir de ahí se corta el modelo)
VERSION_TOKEN = re.compile(
    r"^(\d\.\d.*|\d,\d.*|\d{3,4}CC|\d+CV|\d+HP|\(.*|/.*|A/T|M/T|AT\d*|MT\d*|CVT|E?CVT|DSG|TIPTRONIC|AUTOMATIC[OA]?|AUT\.?|"
    r"4X2|4X4|AWD|4WD|2WD|TDI|TSI|TFSI|FSI|HDI|THP|VTI|JTD|MJT|CRDI?|TD|TDCI|D|DIESEL|NAFTA|GNC|TURBO|T|HEV|HV|PHEV|EV|MHEV|"
    r"[2-5]P\.?|[2-5]PTAS\.?|[2-5]DR|PTAS\.?|PUERTAS|P\.?|WAGON|\d+V|16V|8V|MPI|SPI|FLEX|"
    r"XEI|XLI|SEG|XEI-S|GL|GLS|GLX|GX|GR-S|GR-SPORT|SR|SRV|SRX|SW|LT|LTZ|LS|RS|ST|SE|SEL|SX|EX|EXL|LX|DX|XL|XLS|XLT|XR|"
    r"LIMITED|TITANIUM|HIGHLINE|COMFORTLINE|TRENDLINE|STARTLINE|PREMIUM|CONFORT|COMFORT|PRIVILEGE|EXPRESSION|DYNAMIQUE|"
    r"INTENS|ZEN|LIFE|ICONIC|ALLURE|ACTIVE|FELINE|GRIFFE|FEEL|SHINE|DRIVE|PRECISION|ATTRACTIVE|ESSENCE|TREKKING|"
    r"SPORT|SPORTLINE|PLATINUM|EXCLUSIVE|ELITE|BASE|FULL|PACK|PLUS\+|CABINA|DOBLE|SIMPLE|C/D|C/S|DC|CD|CS|CAB)$")
JOIN_FIRST = {"GRAND", "LAND", "RANGE", "SANTA", "SERIE", "CLASE", "GRAN", "TOWN", "MODEL", "GR", "VEL", "ALFA"}
KEEP_SECOND = re.compile(r"^(\d{1,3}|CROSS|PLUS|PRO|MAX|MINI|CACTUS|EVOQUE|SPORT|VELAR|FE|X|L|C|EV|ONE|HR-V|CROSSWAY|GT)$")

def model_label(tokens):
    return " ".join(w if re.search(r"\d", w) or len(w) <= 3 or ("-" in w and len(w) <= 5) else w.capitalize() for w in tokens)

def base_car_model(bkey, version):
    """'COROLLA 2.0 XEI CVT' → 'Corolla'. Devuelve None si la fila no trae el nombre del modelo."""
    v = PREFIX_NOISE.sub("", version.upper()).strip()
    v = re.sub(r"\bC O ROLLA\b", "COROLLA", v)
    for bw in (canon_brand(bkey), bkey, "MERCEDES-BENZ", "MERCEDES BENZ", "MERCEDES-AMG", "MERCEDES"):
        if v.startswith(bw + " "): v = v[len(bw) + 1:]  # "CHEVROLET TRACKER ..." → "TRACKER ..."
    a = alias_model(bkey, v)
    if a: return a
    for n, lab in KNOWN.get(bkey, []):
        if starts_with_model(v, n): return lab
    toks = v.split()
    if not toks: return None
    toks[0] = re.split(r"/|(?<=[A-Z])(?=\d\.\d)", toks[0])[0] or toks[0]  # "TRANSIT2.2L", "F-100/88"
    if toks[0].startswith("(") or VERSION_TOKEN.match(toks[0]): return None  # "CABINA DOBLE 2.5 DIESEL"
    model = [toks[0]]
    if len(toks) > 1:
        if re.fullmatch(r"[A-Z]\.?", toks[0]) and re.match(r"^[A-Z0-9-]+$", toks[1]) and not VERSION_TOKEN.match(toks[1]):
            return model_label([toks[0].rstrip(".") + toks[1]])  # "N 300", "L 200": una letra sola no es modelo
        doors_next = len(toks) > 2 and re.match(r"^(P\.?|PTAS\.?|PUERTAS|DR)$", toks[2])
        # número suelto después del modelo: "TIGGO 4" sí; "A4 40" (potencia) o "BOXER 350" (carga) no
        numeric_ok = not re.match(r"^\d+$", toks[1]) or (len(toks[1]) <= 2 and not re.search(r"\d", toks[0]))
        if toks[0] in JOIN_FIRST or (KEEP_SECOND.match(toks[1]) and numeric_ok and not VERSION_TOKEN.match(toks[1]) and not doors_next):
            model.append(toks[1])
    return model_label(model)

def clean_moto_model(version):
    v = re.sub(r"\s+", " ", version.upper()).strip()
    v = re.sub(r"\s*\((?:[^)]*)\)\s*$", "", v)  # "(2P)" y similares al final
    return re.sub(r"^(MOTO|MOTOCICLETA|CICLOMOTOR|CICL\.)\s*", "", v)

# dn[tipo][slug][modelo] = {"years": set, "versions": int}
dn = C.defaultdict(lambda: C.defaultdict(lambda: C.defaultdict(lambda: {"years": set(), "versions": 0})))
stats = C.Counter()
pending = []
def add_dn(st, slug, bkey, modelo, years):
    if st in ("auto", "camioneta", "camion"):
        m = base_car_model(bkey, modelo)
        if not m: stats["sin modelo identificable"] += 1; return
        m = equiv.get(slug, {}).get(m, m)
        if not m: stats["descartado por equivalencias"] += 1; return
    else:
        if re.match(r"^CUATRICICLO\s", modelo.upper()):
            st, modelo = "cuatriciclo", re.sub(r"^CUATRICICLO\s+", "", modelo.upper())
        m = clean_moto_model(modelo)
    e = dn[st][slug][m]; e["years"] |= years; e["versions"] += 1
    stats[st] += 1

for r in ROWS:
    if not r["marca"] or not r["modelo"]: stats["sin marca/modelo"] += 1; continue
    modelo, tipo = split_glued(r["modelo"], r["tipo"])
    st = site_type(tipo, r["tipo_veh"])
    slug, bkey = slug_for_dnrpa(r["marca"]), brand_key(r["marca"])
    years = {int(y) for y in r["valores"] if y != "0Km"} | ({2026} if "0Km" in r["valores"] else set())
    if st is None: pending.append((slug, bkey, modelo, years)); continue
    add_dn(st, slug, bkey, modelo, years)
for slug, bkey, modelo, years in pending:  # "SIN ESPECIFICACION": al tipo donde ya está ese modelo, o auto
    m = base_car_model(bkey, modelo)
    st = next((t for t in ("auto", "camioneta", "camion") if m and m in dn[t].get(slug, {})), "auto")
    add_dn(st, slug, bkey, modelo, years)

# ─── Unión ────────────────────────────────────────────────────────────────────
# cat[tipo][slug] = {"label", "modelos": {norm: {"nombre", "origen", "desde", "hasta", "versiones"}}}
cat = {t: {} for t in TIPOS}
def put(tipo, slug, label, nombre, origen, years=None, versions=0):
    b = cat[tipo].setdefault(slug, {"label": LABEL_BY_SLUG.get(slug, label), "modelos": {}})
    k = norm(nombre)
    if not k: return
    if k in b["modelos"]:
        e = b["modelos"][k]
        if years: e["desde"] = min(filter(None, [e["desde"], min(years)])); e["hasta"] = max(filter(None, [e["hasta"], max(years)]))
        e["versiones"] += versions
        return
    b["modelos"][k] = {"nombre": nombre, "origen": origen, "desde": min(years) if years else None,
                       "hasta": max(years) if years else None, "versiones": versions}

for src, origen in ((base, "sitio"), (manual, "manual")):
    for tipo, brands in src["tipos"].items():
        for slug, b in brands.items():
            cat[tipo].setdefault(slug, {"label": LABEL_BY_SLUG.get(slug, b["label"]), "modelos": {}})
            for m in b["modelos"]: put(tipo, slug, b["label"], m, origen)

# Autos y camionetas: un modelo que el sitio ya tiene en el otro tipo no se duplica (DNRPA pone muchas
# SUV como "RURAL"); sí se completan sus años.
curated = {t: {s: set(b["modelos"]) for s, b in cat[t].items()} for t in ("auto", "camioneta")}
for tipo in TIPOS:
    for slug, models in dn[tipo].items():
        for m, e in models.items():
            k = norm(m)
            if tipo in ("auto", "camioneta"):
                other = "camioneta" if tipo == "auto" else "auto"
                if k in curated[other].get(slug, set()) and k not in curated[tipo].get(slug, set()):
                    put(other, slug, LABEL_BY_SLUG[slug], m, "dnrpa", e["years"], e["versions"]); continue
            put(tipo, slug, LABEL_BY_SLUG[slug], m, "dnrpa", e["years"], e["versions"])

def natural(s): return [(0, int(t), "") if t.isdigit() else (1, 0, t) for t in re.findall(r"\d+|\D+", s.lower())]

# ─── Salida TypeScript ────────────────────────────────────────────────────────
out_dir = os.path.join(ROOT, "src", "data", "catalogo")
os.makedirs(out_dir, exist_ok=True)
HEADER = (f"// GENERADO por tools/catalogo-vehiculos/construir_catalogo.py — no editar a mano.\n"
          f"// Fuentes: listas previas del sitio + agregados manuales + tabla de valuación DNRPA vigente desde {dnrpa['vigencia']}.\n"
          f"// Para cambiar un modelo: editar tools/catalogo-vehiculos/fuentes/*.json y volver a correr el script.\n")
marcas = {t: sorted(({"value": s, "label": b["label"]} for s, b in cat[t].items()), key=lambda x: x["label"].lower()) for t in TIPOS}
modelos = {t: {s: sorted((e["nombre"] for e in b["modelos"].values()), key=natural) for s, b in sorted(cat[t].items()) if b["modelos"]} for t in TIPOS}
j = lambda o: json.dumps(o, ensure_ascii=False, indent=1)
open(os.path.join(out_dir, "marcas.generated.ts"), "w", encoding="utf8", newline="\n").write(
    HEADER + "\nexport type TipoCatalogo = \"auto\" | \"camioneta\" | \"moto\" | \"cuatriciclo\" | \"utv\" | \"camion\";\n\n"
    f"export const CATALOGO_VIGENCIA_DNRPA = \"{dnrpa['vigencia']}\";\n\n"
    "export const MARCAS_CATALOGO: Record<TipoCatalogo, { value: string; label: string }[]> = " + j(marcas) + ";\n")
open(os.path.join(out_dir, "modelos.generated.ts"), "w", encoding="utf8", newline="\n").write(
    HEADER + "\nimport type { TipoCatalogo } from \"./marcas.generated\";\n\n"
    "export const MODELOS_CATALOGO: Record<TipoCatalogo, Record<string, string[]>> = " + json.dumps(modelos, ensure_ascii=False, separators=(",", ":")) + ";\n")

# ─── Insumo de la página de revisión ──────────────────────────────────────────
rev = {"vigencia": dnrpa["vigencia"], "tipos": {}, "resumen": {}}
for t in TIPOS:
    rev["tipos"][t] = [{"s": s, "l": b["label"],
                        "m": [[e["nombre"], e["desde"], e["hasta"], e["origen"], e["versiones"]] for e in sorted(b["modelos"].values(), key=lambda e: natural(e["nombre"]))]}
                       for s, b in sorted(cat[t].items(), key=lambda kv: kv[1]["label"].lower()) if b["modelos"]]
    orig = C.Counter(e["origen"] for b in cat[t].values() for e in b["modelos"].values())
    rev["resumen"][t] = {"marcas": len(rev["tipos"][t]), "modelos": sum(orig.values()), **orig}
json.dump(rev, open(os.path.join(HERE, "datos", "catalogo-revision.json"), "w", encoding="utf8"), ensure_ascii=False)

print("DNRPA:", dict(stats))
for t in TIPOS: print(f"{t:12} {rev['resumen'][t]}")
