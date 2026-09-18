# Crysprout garden backgrounds

Only the eleven Crysprout product listings / ten distinct photos are in scope.
Original `public/products/crysprout/img_*.webp` files remain untouched.
The matching `img_*-garden.webp` files are the lossless composite deliverables.

Product pixels come from the existing listing photos, not image generation.
Apple Vision produces a foreground mask; the original RGB is copied for opaque
foreground, and only the narrow mask boundary is blended into the new background.
`verification.json` records zero changed RGB channels in opaque foreground for
every output after WebP decoding. Original dimensions are retained (mostly
768 × 1024; IMG_5994 is 772 × 1016). No artificial upscaling is used.

Background-only asset: `garden-background.png`. Generated with built-in imagegen,
not the CLI. Prompt used:

> Use case: precise-object-edit. Create an EMPTY background plate from the attached garden photograph. Remove the ENTIRE crystal, clay figure, wood-slice pedestal, intention card, and Tengology text. Leave no products, no card, no pedestal, no letters or logos at all. Reconstruct just weathered natural wood tabletop across bottom 65% of the image, with a soft transition to defocused green garden and tiny white and pale pink daisy flowers across top 35%. Same lovely gentle natural daylight, mellow exposure, garden bokeh colour palette. Portrait 3:4. Empty central and lower tabletop is essential for later pixel-preserving product compositing. No flowers crossing the foreground/tabletop work area. Background only, no product rendering.

`scripts/crysprout-mask.swift` creates masks. `scripts/crysprout-composite.cjs`
composites and validates them. `prisma/apply-crysprout-garden.ts` is a dry run by
default; `--apply` changes only the eleven Crysprout product-image URLs and saves
the previous URLs for rollback. It does not change prices, stock or descriptions.

Deployment is assets-only: new assets are uploaded to the VPS shared asset
directory, the running app's public directory, and its current release source.
Existing image URLs remain available. No environment/payment settings change.
