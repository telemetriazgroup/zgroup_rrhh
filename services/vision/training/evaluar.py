"""Mide nombre, apellido y DNI contra un conjunto etiquetado.

No entrena pesos. Sirve para comparar el motor activo con las fotos que se
agreguen en training/dataset. El algoritmo que se entrene debe implementar
ModelExtractor.extract y superarse en este reporte.
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.extractor import build_extractor  # noqa: E402
from app.images import InvalidImage, inspect_image  # noqa: E402


def main() -> None:
    dataset = Path(__file__).resolve().parent / "dataset"
    labels = dataset / "labels.jsonl"
    if not labels.exists():
        raise SystemExit(
            "Falta training/dataset/labels.jsonl. Copie labels.example.jsonl y "
            "agregue las fotos en training/dataset/images."
        )

    rows = [json.loads(line) for line in labels.read_text(encoding="utf-8").splitlines() if line.strip()]
    if not rows:
        raise SystemExit("labels.jsonl no tiene casos.")

    extractor = build_extractor()
    totals = {"nombre": 0, "apellido": 0, "dni": 0}
    correct = {"nombre": 0, "apellido": 0, "dni": 0}

    for row in rows:
        image_path = dataset / "images" / row["archivo"]
        image = image_path.read_bytes()
        try:
            inspect_image(image)
        except InvalidImage as error:
            print(f"{row['archivo']}: imagen rechazada ({error})")
            continue
        result = extractor.extract(image, row.get("tipoDocumento", "dni"))
        for field in totals:
            totals[field] += 1
            expected = _norm(row.get(field))
            got = _norm(getattr(result, field))
            if expected and expected == got:
                correct[field] += 1
            print(f"{row['archivo']} {field}: esperado={expected or '-'} obtenido={got or '-'}")

    print(f"motor={extractor.motor}")
    for field in totals:
        if totals[field] == 0:
            continue
        ratio = correct[field] / totals[field]
        print(f"acierto {field}: {correct[field]}/{totals[field]} ({ratio:.0%})")
    if extractor.motor != "model":
        print("Este reporte no es un modelo entrenado. VISION_ENGINE=model usa ModelExtractor.")


def _norm(value: object) -> str:
    if value is None:
        return ""
    return " ".join(str(value).strip().upper().split())


if __name__ == "__main__":
    os.environ.setdefault("VISION_ENGINE", os.getenv("VISION_ENGINE", "unconfigured"))
    main()
