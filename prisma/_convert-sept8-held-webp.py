"""Convert selected polished Sept-8 JPEGs to webp under public/products/sept8-2026/. No AI."""
from pathlib import Path
from PIL import Image, ImageOps

SRC = Path("/Users/sooktengvun/tengology_web/photo-batch-2026-09-08-web/web")
DST = Path("/Users/sooktengvun/tengology_web/tengology_web/public/products/sept8-2026")
DST.mkdir(parents=True, exist_ok=True)

# Held groups G07–G12 (+ a few G08 pair frames for gallery)
NUMS = [
  9626,  # G07 toadstool brooch single
  9628, 9629, 9630, 9631, 9632,  # G08 antler brooch
  9633, 9634, 9635,  # G09 cat-ear rose hair clips
  9636,  # G10 group
  9637, 9638, 9639, 9640, 9641, 9642, 9643,  # G10 individuals
  9650, 9657, 9664, 9671, 9678, 9685, 9688,  # G10 more colours / checks
  9692, 9693, 9694,  # G12 fidget (skip tiny 9691)
]

ok, skip, miss = [], [], []
for n in NUMS:
    src = SRC / f"IMG_{n}.jpeg"
    dst = DST / f"img_{n}.webp"
    if not src.exists():
        miss.append(n)
        continue
    if dst.exists() and dst.stat().st_size > 1000:
        skip.append(n)
        continue
    im = Image.open(src)
    im = ImageOps.exif_transpose(im).convert("RGB")
    # match prior sept8 web assets — max edge ~2000 already on web jpegs
    im.save(dst, "WEBP", quality=82, method=4)
    ok.append((n, dst.stat().st_size))
    print(f"converted {n} -> {dst.name} ({dst.stat().st_size} bytes)")

print(json_summary := {"converted": len(ok), "skipped_existing": len(skip), "missing": miss, "skip_nums": skip})
