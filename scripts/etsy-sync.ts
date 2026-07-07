import { config } from "dotenv";
import {
  findProductForEtsySync,
  getEtsyAccessToken,
  getEtsySellerTaxonomyNodes,
  getEtsyShopSetup,
  syncAllProductsToEtsy,
  syncProductRecordToEtsy,
  type EtsySyncResult,
} from "@/lib/etsy";
import { prisma } from "@/lib/db";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

type Flags = {
  apply: boolean;
  images: boolean;
  publish: boolean;
  includeUnpublished: boolean;
  product?: string;
  limit?: number;
};

function usage() {
  console.log(`
Usage:
  npm run etsy:sync -- sync
  npm run etsy:sync -- sync --apply --images
  npm run etsy:sync -- sync --apply --product <product-id-or-slug>
  npm run etsy:sync -- inspect
  npm run etsy:sync -- taxonomy <search>
  npm run etsy:sync -- refresh-token

Notes:
  sync is a dry-run unless --apply is present.
  --publish tries to activate listings on Etsy. Without it, new listings stay drafts.
`);
}

function parseFlags(args: string[]): Flags {
  const flags: Flags = {
    apply: false,
    images: false,
    publish: false,
    includeUnpublished: false,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    switch (arg) {
      case "--apply":
        flags.apply = true;
        break;
      case "--images":
        flags.images = true;
        break;
      case "--publish":
        flags.publish = true;
        break;
      case "--include-unpublished":
        flags.includeUnpublished = true;
        break;
      case "--product":
        flags.product = args[i + 1];
        i += 1;
        break;
      case "--limit": {
        const limit = Number(args[i + 1]);
        if (!Number.isFinite(limit) || limit < 1) {
          throw new Error("--limit must be a positive number");
        }
        flags.limit = limit;
        i += 1;
        break;
      }
      default:
        if (arg.startsWith("--")) {
          throw new Error(`Unknown flag: ${arg}`);
        }
    }
  }

  return flags;
}

function printResults(results: EtsySyncResult[]) {
  const counts = results.reduce(
    (summary, result) => {
      summary[result.status] = (summary[result.status] ?? 0) + 1;
      return summary;
    },
    {} as Record<string, number>
  );

  for (const result of results) {
    const listing = result.listingId ? ` Etsy ${result.listingId}` : "";
    console.log(`[${result.status}] ${result.slug}${listing}: ${result.message}`);
  }

  console.log("");
  console.log(
    `Summary: ${Object.entries(counts)
      .map(([status, count]) => `${status}=${count}`)
      .join(" ")}`
  );
}

async function runSync(args: string[]) {
  const flags = parseFlags(args);
  const options = {
    dryRun: !flags.apply,
    syncImages: flags.images,
    publish: flags.publish,
    includeUnpublished: flags.includeUnpublished,
    limit: flags.limit,
  };

  if (flags.product) {
    const product = await findProductForEtsySync(flags.product);
    if (!product) throw new Error(`Product not found: ${flags.product}`);
    printResults([await syncProductRecordToEtsy(product, options)]);
    return;
  }

  printResults(await syncAllProductsToEtsy(options));
}

async function inspectShopSetup() {
  const setup = await getEtsyShopSetup();
  console.log(JSON.stringify(setup, null, 2));
}

async function refreshToken() {
  await getEtsyAccessToken({ forceRefresh: true });
  console.log("Etsy access token refreshed and saved to .etsy-tokens.json");
}

type TaxonomyNode = {
  id?: number;
  taxonomy_id?: number;
  name?: string;
  children?: TaxonomyNode[];
  child_taxonomy_nodes?: TaxonomyNode[];
};

function getTaxonomyResults(payload: unknown): TaxonomyNode[] {
  if (Array.isArray(payload)) return payload as TaxonomyNode[];
  if (payload && typeof payload === "object" && "results" in payload) {
    const results = (payload as { results?: unknown }).results;
    if (Array.isArray(results)) return results as TaxonomyNode[];
  }
  return [];
}

function flattenTaxonomy(nodes: TaxonomyNode[], parentPath = "") {
  const rows: Array<{ id: number; path: string }> = [];
  for (const node of nodes) {
    const id = node.id ?? node.taxonomy_id;
    const name = node.name?.trim();
    const nextPath = [parentPath, name].filter(Boolean).join(" > ");

    if (id && name) {
      rows.push({ id, path: nextPath });
    }

    const children = node.children ?? node.child_taxonomy_nodes ?? [];
    rows.push(...flattenTaxonomy(children, nextPath));
  }
  return rows;
}

async function printTaxonomy(args: string[]) {
  const search = args.join(" ").toLowerCase().trim();
  const payload = await getEtsySellerTaxonomyNodes();
  const rows = flattenTaxonomy(getTaxonomyResults(payload));
  const matches = search
    ? rows.filter((row) => row.path.toLowerCase().includes(search))
    : rows;

  for (const row of matches.slice(0, 80)) {
    console.log(`${row.id}\t${row.path}`);
  }

  if (matches.length > 80) {
    console.log(`... ${matches.length - 80} more matches`);
  }
}

async function main() {
  const [command = "sync", ...args] = process.argv.slice(2);

  if (command === "help" || command === "--help") {
    usage();
    return;
  }

  if (command === "sync") {
    await runSync(args);
    return;
  }

  if (command === "inspect") {
    await inspectShopSetup();
    return;
  }

  if (command === "taxonomy") {
    await printTaxonomy(args);
    return;
  }

  if (command === "refresh-token") {
    await refreshToken();
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
