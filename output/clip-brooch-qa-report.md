# Tengology clip/brooch photo QA — apply + redeploy report

**When:** 2026-09-11 ~01:43 Europe/London (BST)  
**Machine:** Sooks-iMac (`6451d298-1ddf-4825-b82e-464cf976a2b1`)  
**Checkout:** `/Users/sooktengvun/tengology_web/tengology_web`  
**Script:** `prisma/fix-clip-brooch-backs-sept8.ts --apply`  
**Assets source:** `/Users/sooktengvun/tengology_web/photo-batch-2026-09-08-web-v2/web/` → `public/products/sept8-2026/img_XXXX.webp`  
**Deploy tag:** `tengology:20260911-014345` live at https://tengology.com  

## Scope lock (honoured)

- **Done:** three confirmed wrong-back/wrong-type fixes + confident missing clip singles only.
- **Held:** `strawberry-cluster-hair-pin` naming/gallery strategy; pink-sakura / hydrangea-* asset swaps (await Teng).
- **Guards:** no overwrite of `september-2026/img_95xx` jade; no AI regenerate; fidget skipped; blush/purple antler drafts left unpublished.

---

## A) Confirmed fixes

### 1. https://tengology.com/product/bumblebee-blossom-felt-barrette
- **Deleted** pin-back `/products/sept8-2026/img_9587.webp` from barrette gallery.
- **Primary set** to alligator/clip shot `/products/sept8-2026/img_9582.webp` (demoted shared `/products/september-2026/img_3361.webp` from primary).
- **Attached** confident alligator/carded barrette shots: `img_9583.webp`, `img_9584.webp`, `img_9578.webp`.

### 1b. https://tengology.com/product/bumblebee-blossom-felt-brooch
- **Created** `/products/sept8-2026/img_9587.webp` on brooch (was missing). Primary unchanged (`img_3361.webp`).

### 2. https://tengology.com/product/sunflower-felt-barrette-clip
- **Removed** `/products/sunflower/sunflower-brooch-front-v2.jpeg`.
- **Primary set** to `/products/sunflower/sunflower-barrette-front-v2.jpeg`.
- **Kept** `/products/sunflower/sunflower-barrette-back-v2.jpeg`.

### 3. https://tengology.com/product/peach-hibiscus-felt-brooch
- **Removed** `/products/cottage-garden/peach-hibiscus-brooch-2.jpg` (alligator/clip-looking).
- **Hero kept** as sole/primary: `/products/cottage-garden/peach-hibiscus-brooch-hero.jpg`.
- Did **not** auto-add brooch-2 to the hair-clip listing.

---

## B) Newly attached image paths (confident only)

Converted polished v2 JPEGs → `public/products/sept8-2026/img_XXXX.webp` (~2000px webp, quality 82), then DB-attached:

| Product URL | New paths |
|---|---|
| https://tengology.com/product/sunflower-felt-hair-clip | `/products/sept8-2026/img_9476.webp`, `img_9478.webp`, `img_9483.webp` |
| https://tengology.com/product/reindeer-antler-rose-hair-clips | `/products/sept8-2026/img_9506.webp`, `img_9511.webp`, `img_9512.webp` |
| https://tengology.com/product/remembrance-poppy-felt-hair-clip | `/products/sept8-2026/img_9526.webp`, `img_9527.webp`, `img_9528.webp` |
| https://tengology.com/product/bumblebee-blossom-felt-barrette | `/products/sept8-2026/img_9583.webp`, `img_9584.webp`, `img_9578.webp` |
| https://tengology.com/product/layered-felt-flower-hair-clip | `/products/sept8-2026/img_9658.webp`, `img_9672.webp`, `img_9679.webp`, `img_9680.webp`, `img_9686.webp` |

Sunflower hero remains a sept8 single (`img_9480.webp`).  
`IMG_9484` was **not** attached to sunflower (visually purple antler pair).

---

## Still ambiguous / for Teng

1. **IMG_9484** — purple antler pair; not sunflower.
2. **IMG_9515** — boundary frame; clasp/product ambiguous (skip).
3. **IMG_9644 / 9646 / 9648** — pin/brooch backs inside layered-flower numeric range; not attached to clip SKU.
4. **IMG_9599–9604** — strawberry faux-fur claw; not single clip.
5. **IMG_9605 / 9613** — strawberry headband frames.
6. **IMG_9618 / 9623** — strawberry **cluster** (3-berry); held per scope (no cluster gallery strategy change).
7. **IMG_9620** — strawberry cluster with **brooch pin** back.
8. **IMG_9624–9625** — woodland toadstool brooch/barrette; out of this pass.
9. **`single-strawberry-hair-clip`** — no confident unused single-berry alligator singles in 9598–9625 missing set; primary remains flat-lay `/products/strawberries/flat-lay-angle-2.jpg`.
10. **`strawberry-felt-hair-clip-pair`** — no clear unused pair/back beyond cluster cards; skipped.
11. **pink-sakura / hydrangea-*** asset swaps — HOLD awaiting Teng.
12. **blush / purple antler clip drafts** — left unpublished.
13. **Fidget 9691–9694** — skipped.

---

## Deploy

- **Tag:** `20260911-014345`
- **Site:** https://tengology.com (HTTP 200 `/` and `/shop`)
- **Prior parked rollback:** `tengology-app-prev-20260911-014345`

## Success checklist

- [x] DB wrong-back fixes applied
- [x] New sept8 webp assets written (17 files)
- [x] Confident clip singles attached
- [x] Held items untouched
- [x] Site redeployed
- [x] Report written to `/Users/sooktengvun/tengology_web/clip-brooch-qa-report.md`
