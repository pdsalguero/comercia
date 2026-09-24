"""Paso 1: lee el PDF de la tabla de valuación DNRPA y lo pasa a JSON (una fila por versión).

Uso:  python parsear_dnrpa.py [pdf] [salida.json]
      (por defecto datos/tabla-dnrpa.pdf → datos/dnrpa.json)

En vez de ordenar los caracteres por posición (lo que mezcla el modelo con el tipo cuando el texto
se desborda de su columna), se recorren en el orden en que el PDF los dibuja y se corta un campo
cada vez que el siguiente carácter salta hacia atrás o deja un hueco. Cada campo se asigna a la
columna donde empieza."""
import json, re, sys, os, collections
import pdfplumber

HERE = os.path.dirname(os.path.abspath(__file__))
P = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "datos", "tabla-dnrpa.pdf")
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "datos", "dnrpa.json")

def segments(chars):
    segs, cur = [], []
    for c in chars:
        if cur:
            prev = cur[-1]
            if c["x0"] < prev["x1"] - 1.5 or c["x0"] > prev["x1"] + 3 or abs(c["top"] - prev["top"]) > 3:
                segs.append(cur); cur = []
        cur.append(c)
    if cur: segs.append(cur)
    return [(s[0]["x0"], (s[0]["x0"] + s[-1]["x1"]) / 2, "".join(c["text"] for c in s).strip()) for s in segs]

rows_out, header_cols, vigencia = [], None, None
with pdfplumber.open(P) as pdf:
    for pg in pdf.pages:
        lines = collections.defaultdict(list)
        for c in pg.chars:  # orden del stream
            lines[round(c["top"])].append(c)
        for top in sorted(lines):
            segs = [s for s in segments(lines[top]) if s[2]]
            if not segs: continue
            first = segs[0][2]
            if first.startswith("Vigencia"):
                m = re.search(r"\d{2}/\d{2}/\d{4}", " ".join(s[2] for s in segs)); vigencia = m and m.group(0); continue
            if first.startswith("I/N"):
                header_cols = []
                for x0, xc, t in segs:
                    for tok in re.findall(r"0Km|\d{4}", t):
                        header_cols.append((tok, xc))
                # si varios años vinieron en un mismo segmento, recalcular con palabras
                if len(header_cols) < 5:
                    ws = pg.extract_words()
                    header_cols = [(w["text"], (w["x0"] + w["x1"]) / 2) for w in ws if abs(w["top"] - top) < 3 and re.fullmatch(r"0Km|\d{4}", w["text"])]
                continue
            if not header_cols or first[:1] not in ("I", "N"): continue
            first_val_x = header_cols[0][1] - 14
            rec = {"origen": first[0], "codigo": "", "tipo_veh": "", "marca": "", "modelo": "", "tipo": "", "valores": {}}
            parts = collections.defaultdict(list)
            for x0, xc, t in segs:
                if x0 >= first_val_x - 4 and re.fullmatch(r"[\d ]+", t):
                    for n in t.split():
                        label = min(header_cols, key=lambda h: abs(h[1] - xc))[0]
                        rec["valores"][label] = int(n)
                    continue
                col = ("origen" if x0 < 26 else "codigo" if x0 < 47 else "tipo_veh" if x0 < 56 else
                       "codigo2" if x0 < 95 else "marca" if x0 < 128 else "modelo" if x0 < 178 else "tipo")
                parts[col].append(t)
            o = " ".join(parts["origen"])
            if len(o) > 1: parts["codigo"].insert(0, o[1:].strip())
            for k in ("codigo", "tipo_veh", "marca", "modelo", "tipo"):
                rec[k] = re.sub(r"\s+", " ", " ".join(parts[k])).strip()
            rows_out.append(rec)

json.dump({"vigencia": vigencia, "rows": rows_out}, open(OUT, "w", encoding="utf-8"), ensure_ascii=False)
print("vigencia", vigencia, "filas", len(rows_out))
print("autos (A) / motos (M):", collections.Counter(r["tipo_veh"] for r in rows_out).most_common(3))
print("sin modelo", sum(1 for r in rows_out if not r["modelo"]), "sin valores", sum(1 for r in rows_out if not r["valores"]))
