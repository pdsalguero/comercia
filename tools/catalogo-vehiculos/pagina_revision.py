"""Paso 3 (opcional): arma una página HTML para revisar el catálogo marca por marca.

Uso:  python pagina_revision.py   → datos/catalogo-revision.html (abrir en el navegador)
Necesita datos/catalogo-revision.json, que genera construir_catalogo.py."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
data = json.load(open(os.path.join(HERE, "datos", "catalogo-revision.json"), encoding="utf8"))
tpl = open(os.path.join(HERE, "revision.tpl.html"), encoding="utf8").read()
html = tpl.replace("/*__DATA__*/null", json.dumps(data, ensure_ascii=False, separators=(",", ":")))
out = os.path.join(HERE, "datos", "catalogo-revision.html")
open(out, "w", encoding="utf8").write(html)
print("ok", out)
