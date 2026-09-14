/**
 * Clip/brooch wrong-back QA fixes (Sept 8 batch) + confident missing clip attaches.
 *
 * Dry-run (default):  npx tsx prisma/fix-clip-brooch-backs-sept8.ts
 * Apply:              npx tsx prisma/fix-clip-brooch-backs-sept8.ts --apply
 *
 * Scope lock:
 * - Do: bumblebee barrette remove pin 9587; sunflower barrette remove brooch-front;
 *       peach-hibiscus brooch remove clip-looking brooch-2; attach confident clip singles.
 * - Hold: strawberry-cluster-hair-pin naming/gallery; pink-sakura / hydrangea-* swaps.
 * - Never overwrite september-2026 jade; never AI regenerate; skip fidget;
 *   do not publish unpublished drafts (blush/purple antler clips).
 */
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
config({ quiet: true });

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const APPLY = process.argv.includes("--apply");
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const PUBLIC = resolve(__dirname, "../public");

type Attach = {
  slug: string;
  url: string;
  altText: string;
  setPrimary?: boolean;
};

type Report = {
  apply: boolean;
  fixed: Record<string, string[]>;
  attached: Record<string, string[]>;
  skippedExisting: Record<string, string[]>;
  ambiguous: string[];
  held: string[];
  assetChecks: { path: string; exists: boolean }[];
};

function assetPath(url: string) {
  if (!url.startsWith("/")) throw new Error(`bad url ${url}`);
  return resolve(PUBLIC, url.slice(1));
}

function assertSept8(url: string) {
  if (url.includes("september-2026")) {
    throw new Error(`Jade collision path forbidden: ${url}`);
  }
}

async function deleteUrl(productId: string, url: string, log: string[]) {
  const row = await prisma.productImage.findFirst({ where: { productId, url } });
  if (!row) {
    log.push(`delete-skip (not present): ${url}`);
    return;
  }
  if (APPLY) {
    await prisma.productImage.delete({ where: { id: row.id } });
  }
  log.push(`${APPLY ? "deleted" : "would-delete"}: ${url}`);
}

async function ensureUrl(
  productId: string,
  url: string,
  altText: string,
  log: string[],
  opts: { isPrimary?: boolean; sortOrder?: number } = {},
) {
  const existing = await prisma.productImage.findFirst({ where: { productId, url } });
  if (existing) {
    log.push(`ensure-ok (already present): ${url}`);
    return existing;
  }
  const maxSort = await prisma.productImage.aggregate({
    where: { productId },
    _max: { sortOrder: true },
  });
  const sortOrder =
    opts.sortOrder ??
    (maxSort._max.sortOrder == null ? 0 : maxSort._max.sortOrder + 1);
  if (APPLY) {
    if (opts.isPrimary) {
      await prisma.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      });
    }
    const created = await prisma.productImage.create({
      data: {
        productId,
        url,
        altText,
        sortOrder,
        isPrimary: !!opts.isPrimary,
      },
    });
    log.push(`created: ${url}`);
    return created;
  }
  log.push(`would-create: ${url}`);
  return null;
}

async function setPrimary(productId: string, url: string, log: string[]) {
  const target = await prisma.productImage.findFirst({ where: { productId, url } });
  if (!target) {
    log.push(`primary-miss: ${url} not on product`);
    return;
  }
  if (APPLY) {
    await prisma.productImage.updateMany({
      where: { productId },
      data: { isPrimary: false },
    });
    await prisma.productImage.update({
      where: { id: target.id },
      data: { isPrimary: true, sortOrder: 0 },
    });
    // bump others up if needed so primary is sort 0; keep relative order otherwise
    const others = await prisma.productImage.findMany({
      where: { productId, id: { not: target.id } },
      orderBy: { sortOrder: "asc" },
    });
    let i = 1;
    for (const o of others) {
      await prisma.productImage.update({
        where: { id: o.id },
        data: { sortOrder: i++ },
      });
    }
  }
  log.push(`${APPLY ? "set-primary" : "would-set-primary"}: ${url}`);
}

async function reorderDemoteShared(
  productId: string,
  primaryUrl: string,
  demoteIfPrimary: string[],
  log: string[],
) {
  const images = await prisma.productImage.findMany({
    where: { productId },
    orderBy: { sortOrder: "asc" },
  });
  const primary = images.find((i) => i.url === primaryUrl);
  if (!primary) {
    log.push(`reorder-miss primary candidate ${primaryUrl}`);
    return;
  }
  const currentPrimary = images.find((i) => i.isPrimary);
  if (
    currentPrimary &&
    demoteIfPrimary.includes(currentPrimary.url) &&
    currentPrimary.url !== primaryUrl
  ) {
    log.push(`demoting shared primary ${currentPrimary.url}`);
  }
  await setPrimary(productId, primaryUrl, log);
}

async function attachMany(attaches: Attach[], report: Report) {
  for (const a of attaches) {
    assertSept8(a.url);
    const product = await prisma.product.findUnique({
      where: { slug: a.slug },
      include: { images: true },
    });
    if (!product) {
      report.ambiguous.push(`MISSING_PRODUCT ${a.slug} for ${a.url}`);
      continue;
    }
    if (product.images.some((i) => i.url === a.url)) {
      (report.skippedExisting[a.slug] ??= []).push(a.url);
      continue;
    }
    const abs = assetPath(a.url);
    if (!existsSync(abs)) {
      report.ambiguous.push(`ASSET_MISSING ${a.url} (skip attach to ${a.slug})`);
      continue;
    }
    const log: string[] = [];
    await ensureUrl(product.id, a.url, a.altText, log, {
      isPrimary: !!a.setPrimary,
    });
    if (a.setPrimary) {
      // re-fetch and set primary after create in dry-run path ensureUrl doesn't persist
      if (APPLY) await setPrimary(product.id, a.url, log);
      else log.push(`would-set-primary: ${a.url}`);
    }
    (report.attached[a.slug] ??= []).push(...log);
  }
}

async function main() {
  const report: Report = {
    apply: APPLY,
    fixed: {},
    attached: {},
    skippedExisting: {},
    ambiguous: [
      "IMG_9484 — purple antler pair (not sunflower); skipped for sunflower-felt-hair-clip",
      "IMG_9515 — boundary frame; vision ambiguous (poppy vs antler); skipped",
      "IMG_9644 / 9646 / 9648 — pin/brooch backs in layered-flower range; not attached to clip SKU",
      "IMG_9599–9604 — strawberry faux-fur claw (not single clip); left for claw listing / not single-strawberry",
      "IMG_9605 / 9613 — strawberry headband frames; not clip",
      "IMG_9618 / 9623 — strawberry cluster (3-berry); HOLD strawberry-cluster-hair-pin gallery strategy",
      "IMG_9620 — strawberry cluster with brooch pin back; not attached to any clip",
      "IMG_9624–9625 — woodland toadstool brooch/barrette; out of clip attach scope",
      "single-strawberry-hair-clip — no confident unused single-berry alligator singles found in 9598–9625 missing set",
      "strawberry-felt-hair-clip-pair — no clear unused pair/back beyond cluster cards; skipped",
      "pink-sakura / hydrangea-* asset swaps — HOLD per Teng",
      "blush/purple antler clip drafts — left unpublished; no publish",
      "fidget 9691–9694 — skipped",
    ],
    held: [
      "strawberry-cluster-hair-pin (naming + gallery strategy)",
      "pink-sakura / hydrangea-* asset swaps",
    ],
    assetChecks: [],
  };

  // ── A1 bumblebee barrette / brooch ─────────────────────────────
  {
    const barrette = await prisma.product.findUniqueOrThrow({
      where: { slug: "bumblebee-blossom-felt-barrette" },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });
    const brooch = await prisma.product.findUniqueOrThrow({
      where: { slug: "bumblebee-blossom-felt-brooch" },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });
    const log: string[] = [];
    const pinUrl = "/products/sept8-2026/img_9587.webp";
    assertSept8(pinUrl);
    report.assetChecks.push({
      path: pinUrl,
      exists: existsSync(assetPath(pinUrl)),
    });
    await deleteUrl(barrette.id, pinUrl, log);
    await ensureUrl(
      brooch.id,
      pinUrl,
      "Bumblebee blossom felt brooch — pin-back reverse",
      log,
    );
    // Prefer clear alligator clip shot as primary; demote shared september flat
    const preferPrimary = "/products/sept8-2026/img_9582.webp";
    const altPrimary = "/products/sept8-2026/img_9577.webp";
    const hasPrefer = (await prisma.productImage.findFirst({
      where: { productId: barrette.id, url: preferPrimary },
    })) || barrette.images.some((i) => i.url === preferPrimary);
    const primaryUrl = hasPrefer ? preferPrimary : altPrimary;
    await reorderDemoteShared(
      barrette.id,
      primaryUrl,
      ["/products/september-2026/img_3361.webp"],
      log,
    );
    report.fixed["bumblebee-blossom-felt-barrette"] = log.filter(
      (l) => !l.includes("brooch"),
    );
    report.fixed["bumblebee-blossom-felt-brooch"] = log.filter((l) =>
      l.includes("9587") || l.includes("brooch") || l.includes("ensure") || l.includes("create"),
    );
  }

  // ── A2 sunflower barrette ──────────────────────────────────────
  {
    const product = await prisma.product.findUniqueOrThrow({
      where: { slug: "sunflower-felt-barrette-clip" },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });
    const log: string[] = [];
    await deleteUrl(
      product.id,
      "/products/sunflower/sunflower-brooch-front-v2.jpeg",
      log,
    );
    await setPrimary(
      product.id,
      "/products/sunflower/sunflower-barrette-front-v2.jpeg",
      log,
    );
    // ensure barrette-back remains
    const back = product.images.find(
      (i) => i.url === "/products/sunflower/sunflower-barrette-back-v2.jpeg",
    );
    log.push(
      back
        ? "keep: /products/sunflower/sunflower-barrette-back-v2.jpeg"
        : "WARN missing barrette-back",
    );
    report.fixed["sunflower-felt-barrette-clip"] = log;
  }

  // ── A3 peach hibiscus brooch ───────────────────────────────────
  {
    const product = await prisma.product.findUniqueOrThrow({
      where: { slug: "peach-hibiscus-felt-brooch" },
      include: { images: true },
    });
    const log: string[] = [];
    await deleteUrl(
      product.id,
      "/products/cottage-garden/peach-hibiscus-brooch-2.jpg",
      log,
    );
    // ensure hero remains primary
    await setPrimary(
      product.id,
      "/products/cottage-garden/peach-hibiscus-brooch-hero.jpg",
      log,
    );
    log.push("did-not-auto-add brooch-2 to peach-hibiscus-felt-hair-clip");
    report.fixed["peach-hibiscus-felt-brooch"] = log;
  }

  // ── B confident attaches ───────────────────────────────────────
  const attaches: Attach[] = [
    // sunflower hair clip
    {
      slug: "sunflower-felt-hair-clip",
      url: "/products/sept8-2026/img_9476.webp",
      altText: "Sunflower felt hair clip — front single",
    },
    {
      slug: "sunflower-felt-hair-clip",
      url: "/products/sept8-2026/img_9478.webp",
      altText: "Sunflower felt hair clip — alligator back",
    },
    {
      slug: "sunflower-felt-hair-clip",
      url: "/products/sept8-2026/img_9483.webp",
      altText: "Sunflower felt hair clip — ribbon alligator reverse",
    },
    // reindeer antler red (published parent)
    {
      slug: "reindeer-antler-rose-hair-clips",
      url: "/products/sept8-2026/img_9506.webp",
      altText: "Reindeer antler & red rose hair clips — pair front",
    },
    {
      slug: "reindeer-antler-rose-hair-clips",
      url: "/products/sept8-2026/img_9511.webp",
      altText: "Reindeer antler & red rose hair clip — alligator open",
    },
    {
      slug: "reindeer-antler-rose-hair-clips",
      url: "/products/sept8-2026/img_9512.webp",
      altText: "Reindeer antler & red rose hair clip — alligator held",
    },
    // poppy hair clip
    {
      slug: "remembrance-poppy-felt-hair-clip",
      url: "/products/sept8-2026/img_9526.webp",
      altText: "Remembrance poppy felt hair clip — alligator on card",
    },
    {
      slug: "remembrance-poppy-felt-hair-clip",
      url: "/products/sept8-2026/img_9527.webp",
      altText: "Remembrance poppy felt hair clip — alligator side",
    },
    {
      slug: "remembrance-poppy-felt-hair-clip",
      url: "/products/sept8-2026/img_9528.webp",
      altText: "Remembrance poppy felt hair clip — alligator ribbon",
    },
    // bumblebee barrette alligator adds
    {
      slug: "bumblebee-blossom-felt-barrette",
      url: "/products/sept8-2026/img_9583.webp",
      altText: "Bumblebee blossom felt barrette — alligator open side",
    },
    {
      slug: "bumblebee-blossom-felt-barrette",
      url: "/products/sept8-2026/img_9584.webp",
      altText: "Bumblebee blossom felt barrette — alligator open detail",
    },
    {
      slug: "bumblebee-blossom-felt-barrette",
      url: "/products/sept8-2026/img_9578.webp",
      altText: "Bumblebee blossom felt barrettes — carded trio",
    },
    // layered flower colourway / alligator
    {
      slug: "layered-felt-flower-hair-clip",
      url: "/products/sept8-2026/img_9658.webp",
      altText: "Layered felt flower hair clip — lavender alligator open",
    },
    {
      slug: "layered-felt-flower-hair-clip",
      url: "/products/sept8-2026/img_9672.webp",
      altText: "Layered felt flower hair clip — pink/lavender with alligator",
    },
    {
      slug: "layered-felt-flower-hair-clip",
      url: "/products/sept8-2026/img_9679.webp",
      altText: "Layered felt flower hair clip — yellow bud alligator open",
    },
    {
      slug: "layered-felt-flower-hair-clip",
      url: "/products/sept8-2026/img_9680.webp",
      altText: "Layered felt flower hair clip — lilac with alligator tip",
    },
    {
      slug: "layered-felt-flower-hair-clip",
      url: "/products/sept8-2026/img_9686.webp",
      altText: "Layered felt flower hair clip — blue/cream with alligator",
    },
  ];

  for (const a of attaches) {
    report.assetChecks.push({
      path: a.url,
      exists: existsSync(assetPath(a.url)),
    });
  }

  await attachMany(attaches, report);

  // For single-strawberry: if current primary is only flat-lay and we had
  // confident attaches we'd set primary — none found → note only.
  const single = await prisma.product.findUnique({
    where: { slug: "single-strawberry-hair-clip" },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  if (single) {
    const primary = single.images.find((i) => i.isPrimary) ?? single.images[0];
    report.ambiguous.push(
      `single-strawberry-hair-clip current primary remains ${primary?.url ?? "(none)"} (flat-lay); no confident sept8 single-clip attach this pass`,
    );
  }

  console.log(JSON.stringify(report, null, 2));
  if (!APPLY) {
    console.log("\nDry-run only. Re-run with --apply to write.");
  } else {
    // verify primaries
    const slugs = [
      "bumblebee-blossom-felt-barrette",
      "bumblebee-blossom-felt-brooch",
      "sunflower-felt-barrette-clip",
      "peach-hibiscus-felt-brooch",
      "sunflower-felt-hair-clip",
      "reindeer-antler-rose-hair-clips",
      "remembrance-poppy-felt-hair-clip",
      "layered-felt-flower-hair-clip",
    ];
    for (const slug of slugs) {
      const p = await prisma.product.findUniqueOrThrow({
        where: { slug },
        include: { images: { orderBy: { sortOrder: "asc" } } },
      });
      const primaries = p.images.filter((i) => i.isPrimary);
      if (primaries.length !== 1) {
        throw new Error(`${slug} has ${primaries.length} primaries`);
      }
      console.log(
        `OK ${slug}: primary=${primaries[0].url} count=${p.images.length}`,
      );
    }
    console.log("\nApplied.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
