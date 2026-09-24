# Catálogo de marcas y modelos de vehículos

Genera las listas de marcas y modelos que usan el formulario de publicar, la edición de avisos y el buscador del sitio:

- `src/data/catalogo/marcas.generated.ts`: marcas por tipo (auto, camioneta, moto, cuatriciclo, utv, camion).
- `src/data/catalogo/modelos.generated.ts`: modelos por tipo y marca. Los sirve `/api/vehiculos/modelos`.

**No edites esos archivos a mano.** Se regeneran con este script.

## Fuentes

El script une tres fuentes. Si un modelo aparece en más de una, se usa el nombre de la primera:

1. **`fuentes/lista-base.json`**: las listas que tenía el sitio al 2026-09-23. Son curadas a mano y tienen los nombres que ya usan los avisos.
2. **`fuentes/agregados-manuales.json`**: modelos que DNRPA no trae:
   - clásicos anteriores a 2002 (Fiat 128, Renault 12, Ford Falcon, VW Gacel, Rastrojero…);
   - lanzamientos que todavía no tienen valuación.
3. **Tabla de valuación de DNRPA**: el PDF mensual. Cubre modelos de 2002 en adelante.

Antes de unirse, los nombres de DNRPA pasan por **`fuentes/equivalencias.json`**:
- sirve para respetar el nombre que ya usa el sitio (por ejemplo, "SW4" pasa a ser "Hilux SW4");
- también sirve para descartar nombres que no son modelos, poniéndoles un valor vacío.

Las marcas conservan el slug que ya tenían, porque los avisos guardan `attributes.brand` con ese valor.

## Actualizar (una vez por mes)

Requiere Python 3 con `pdfplumber` (`pip install pdfplumber`).

1. **Descargar el PDF vigente.** Está enlazado en https://www.dnrpa.gov.ar/valuacion/cons_valuacion.php (link `informacion/DD-MM-AAAA.pdf`). Guardarlo como `datos/tabla-dnrpa.pdf`.
2. **Convertirlo a datos:** `python parsear_dnrpa.py`. Genera `datos/dnrpa.json` con unas 18.000 versiones.
3. **Armar el catálogo:** `python construir_catalogo.py`. Regenera los dos `.generated.ts`.
4. **Revisar (opcional):** `python pagina_revision.py`. Abrí `datos/catalogo-revision.html` para recorrer el catálogo marca por marca.
5. **Corregir errores**, si aparece un nombre mal armado:
   - agregá una equivalencia en `fuentes/equivalencias.json`;
   - o agregá el modelo en `fuentes/agregados-manuales.json`;
   - y volvé al paso 3.

La carpeta `datos/` no se sube al repo, porque todo lo que tiene se puede volver a generar.

## Cómo se arma el modelo a partir de DNRPA

- **Tipo de vehículo:** sale de la carrocería del registro:
  - sedán, rural y coupé son **auto**;
  - pick-up, todo terreno y furgón son **camioneta**;
  - motocicleta y scooter son **moto**;
  - cuatriciclo es **cuatriciclo**;
  - arenero es **utv**;
  - camión, chasis y tractor son **camión**.
- **Autos y camionetas:** DNRPA lista versiones, así que hay que sacar el modelo base. Por ejemplo, "COROLLA 2.0 XEI CVT" queda como "Corolla". Se prueba en este orden:
  1. el modelo más largo que ya existe en las fuentes 1 y 2;
  2. reglas por marca (BMW "320I" pasa a "Serie 3"; Mercedes "C 200" pasa a "Clase C");
  3. cortar en la primera palabra que es de la versión: cilindrada, XEI, 4X4, CVT, puertas…
- **SUV:** DNRPA no las separa de las rurales. Si el sitio ya tenía un modelo como camioneta, se respeta.
- **Motos:** se usan casi como vienen, porque la tabla ya está a nivel modelo. Se unen las variantes que solo difieren en espacios o guiones.
