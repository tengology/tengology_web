# Launch stub unpublish — 11 Sep 2026 (BST)

## Before → After
| Slug | Before | After | URL |
|---|---|---|---|
| `autumn-pumpkin-felt-headband` | published=True stock=0 imgs=4 | published=False | https://tengology.com/product/autumn-pumpkin-felt-headband |

Rows updated: **1**

## Redeploy
- Needed: **False**
- DB-only isPublished flip on shared Neon. Storefront queries isPublished at request time; live Cache-Control is no-store. No image/asset rebuild required.

## Already hidden (no action)
- BATIK empties already unpublished:
  - `garden-bloom-batik-flower-brooch` published=False imgs=0
  - `golden-amber-batik-flower-brooch` published=False imgs=0
  - `plum-blossom-batik-flower-brooch` published=False imgs=0
  - `golden-leaf-batik-bead-embroidered-earrings` published=False imgs=0
  - `sunset-lotus-batik-statement-brooch` published=False imgs=0
- GLASS: none in catalog

## Do-not-touch / held (left as-is)
- `pink-sakura-felt-brooch` still published=True — https://tengology.com/product/pink-sakura-felt-brooch
- `pink-sakura-felt-headband` still published=True — https://tengology.com/product/pink-sakura-felt-headband
- `pink-sakura-pearl-claw-clip` still published=True — https://tengology.com/product/pink-sakura-pearl-claw-clip
- `strawberry-cluster-hair-pin` still published=True — https://tengology.com/product/strawberry-cluster-hair-pin
- `pink-sakura-felt-hair-clip` still published=True — https://tengology.com/product/pink-sakura-felt-hair-clip
- fidget + blush/purple antler drafts already unpublished (untouched)

## Ambiguous (left published for Teng)
- `hetian-jade-beaded-ring` stock=1 imgs=1 — https://tengology.com/product/hetian-jade-beaded-ring
  - Thin gallery (≤1 image) but stocked with real copy — unsure unfinished vs intentionally shown; left published
- `hetian-jade-bear-necklace-earring-set` stock=1 imgs=1 — https://tengology.com/product/hetian-jade-bear-necklace-earring-set
  - Thin gallery (≤1 image) but stocked with real copy — unsure unfinished vs intentionally shown; left published
- `hetian-jade-butterfly-bracelet-earring-set` stock=1 imgs=1 — https://tengology.com/product/hetian-jade-butterfly-bracelet-earring-set
  - Thin gallery (≤1 image) but stocked with real copy — unsure unfinished vs intentionally shown; left published
- `holly-rose-faux-fur-claw-clip` stock=1 imgs=1 — https://tengology.com/product/holly-rose-faux-fur-claw-clip
  - Thin gallery (≤1 image) but stocked with real copy — unsure unfinished vs intentionally shown; left published
- `orange-pumpkin-felt-brooch` stock=1 imgs=1 — https://tengology.com/product/orange-pumpkin-felt-brooch
  - Thin gallery (≤1 image) but stocked with real copy — unsure unfinished vs intentionally shown; left published
- `pastel-blossom-statement-headband` stock=1 imgs=1 — https://tengology.com/product/pastel-blossom-statement-headband
  - Thin gallery (≤1 image) but stocked with real copy — unsure unfinished vs intentionally shown; left published
- `peach-hibiscus-felt-brooch` stock=1 imgs=1 — https://tengology.com/product/peach-hibiscus-felt-brooch
  - Thin gallery (≤1 image) but stocked with real copy — unsure unfinished vs intentionally shown; left published
- `pink-pumpkin-felt-brooch` stock=1 imgs=1 — https://tengology.com/product/pink-pumpkin-felt-brooch
  - Thin gallery (≤1 image) but stocked with real copy — unsure unfinished vs intentionally shown; left published
- `pumpkin-felt-hair-clip` stock=1 imgs=1 — https://tengology.com/product/pumpkin-felt-hair-clip
  - Thin gallery (≤1 image) but stocked with real copy — unsure unfinished vs intentionally shown; left published
- `pumpkin-patch-faux-fur-claw-clip` stock=1 imgs=1 — https://tengology.com/product/pumpkin-patch-faux-fur-claw-clip
  - Thin gallery (≤1 image) but stocked with real copy — unsure unfinished vs intentionally shown; left published
- `white-hetian-jade-jewellery-set` stock=1 imgs=1 — https://tengology.com/product/white-hetian-jade-jewellery-set
  - Thin gallery (≤1 image) but stocked with real copy — unsure unfinished vs intentionally shown; left published
- `woodland-toadstool-felt-brooch` stock=1 imgs=1 — https://tengology.com/product/woodland-toadstool-felt-brooch
  - Thin gallery (≤1 image) but stocked with real copy — unsure unfinished vs intentionally shown; left published
