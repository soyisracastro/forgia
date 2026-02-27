#!/usr/bin/env python3
"""
Optimiza imágenes para el blog de Forgia.
Convierte PNG/JPG a WebP optimizado (1200x675, 16:9) usando la API de Tinify.

Uso:
    python3 scripts/optimize-blog-image.py public/assets/blog/imagen.png

Requiere:
    pip install tinify
    export TINIFY_API_KEY=tu_api_key
"""

import os
import sys
from pathlib import Path

try:
    import tinify
except ImportError:
    print("Error: tinify no está instalado. Ejecuta: pip install tinify")
    sys.exit(1)

WIDTH = 1200
HEIGHT = 675


def optimize(input_path: str) -> None:
    path = Path(input_path)

    if not path.exists():
        print(f"Error: no se encontró el archivo '{path}'")
        sys.exit(1)

    if path.suffix.lower() not in (".png", ".jpg", ".jpeg"):
        print(f"Error: formato no soportado '{path.suffix}'. Usa PNG o JPG.")
        sys.exit(1)

    api_key = os.environ.get("TINIFY_API_KEY")
    if not api_key:
        print("Error: variable de entorno TINIFY_API_KEY no definida.")
        sys.exit(1)

    tinify.key = api_key

    output_path = path.with_suffix(".webp")

    original_size = path.stat().st_size / 1024
    print(f"Original: {path.name} ({original_size:.0f} KB)")
    print(f"Procesando: resize {WIDTH}x{HEIGHT} + WebP...")

    source = tinify.from_file(str(path))
    result = source.resize(method="cover", width=WIDTH, height=HEIGHT).convert(
        type="image/webp"
    )
    result.to_file(str(output_path))

    final_size = output_path.stat().st_size / 1024
    reduction = (1 - final_size / original_size) * 100

    path.unlink()

    print(f"Resultado: {output_path.name} ({final_size:.0f} KB)")
    print(f"Reducción: {reduction:.0f}%")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python3 scripts/optimize-blog-image.py <ruta-imagen>")
        sys.exit(1)

    optimize(sys.argv[1])
