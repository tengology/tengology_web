import { promises as fs } from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/db";

const ETSY_API_BASE_URL = "https://api.etsy.com/v3/application";
const ETSY_TOKEN_URL = "https://api.etsy.com/v3/public/oauth/token";
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

type EtsyTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
};

type StoredEtsyTokens = {
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  token_type?: string;
};

type EtsySyncProduct = Awaited<ReturnType<typeof getProductForEtsySync>>;

export type EtsySyncResult = {
  productId: string;
  slug: string;
  title: string;
  action: "create" | "update" | "skip" | "dry-run";
  listingId?: string;
  status: "SYNCED" | "FAILED" | "SKIPPED" | "DRY_RUN";
  message: string;
};

export type EtsySyncOptions = {
  dryRun?: boolean;
  syncImages?: boolean;
  publish?: boolean;
};

export type EtsySyncAllOptions = EtsySyncOptions & {
  includeUnpublished?: boolean;
  limit?: number;
};

type EtsyRequestOptions = RequestInit & {
  auth?: boolean;
  retryOnUnauthorized?: boolean;
};

function tokenFilePath() {
  return path.resolve(process.cwd(), process.env.ETSY_TOKEN_FILE ?? ".etsy-tokens.json");
}

function requireEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required for Etsy sync`);
  }
  return value;
}

function getEtsyApiKeyHeader() {
  return `${requireEnv("ETSY_KEYSTRING")}:${requireEnv("ETSY_SHARED_SECRET")}`;
}

function getShopId() {
  return requireEnv("ETSY_SHOP_ID");
}

function getOptionalShopId() {
  return process.env.ETSY_SHOP_ID?.trim();
}

function parseBoolean(value: string | undefined, fallback = false) {
  if (value == null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function parseNumberEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) return undefined;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    throw new Error(`${name} must be a number`);
  }
  return numeric;
}

function getDefaultListingConfig(productCategory: string) {
  const categoryKey = `ETSY_TAXONOMY_ID_${productCategory}`;
  const taxonomyId = parseNumberEnv(categoryKey) ?? parseNumberEnv("ETSY_DEFAULT_TAXONOMY_ID");
  const shippingProfileId = parseNumberEnv("ETSY_SHIPPING_PROFILE_ID");
  const readinessStateId = parseNumberEnv("ETSY_READINESS_STATE_ID");

  if (!taxonomyId) {
    throw new Error(
      `${categoryKey} or ETSY_DEFAULT_TAXONOMY_ID is required for Etsy listing creation`
    );
  }
  if (!shippingProfileId) {
    throw new Error("ETSY_SHIPPING_PROFILE_ID is required for physical Etsy listings");
  }
  if (!readinessStateId) {
    throw new Error("ETSY_READINESS_STATE_ID is required for physical Etsy listings");
  }

  return {
    taxonomyId,
    shippingProfileId,
    readinessStateId,
    whoMade: process.env.ETSY_WHO_MADE?.trim() || "i_did",
    whenMade: process.env.ETSY_WHEN_MADE?.trim() || "2020_2026",
    shouldAutoRenew: parseBoolean(process.env.ETSY_SHOULD_AUTO_RENEW, false),
  };
}

async function readTokenFile(): Promise<StoredEtsyTokens | null> {
  try {
    const raw = await fs.readFile(tokenFilePath(), "utf8");
    return JSON.parse(raw) as StoredEtsyTokens;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

export async function writeEtsyTokenFile(tokenResponse: EtsyTokenResponse) {
  const tokens: StoredEtsyTokens = {
    access_token: tokenResponse.access_token,
    refresh_token: tokenResponse.refresh_token,
    expires_at: Date.now() + tokenResponse.expires_in * 1000,
    token_type: tokenResponse.token_type,
  };

  await fs.writeFile(tokenFilePath(), `${JSON.stringify(tokens, null, 2)}\n`, {
    mode: 0o600,
  });

  return tokens;
}

async function getStoredOrEnvTokens(): Promise<StoredEtsyTokens> {
  const stored = await readTokenFile();
  if (stored?.access_token || stored?.refresh_token) return stored;

  return {
    access_token: process.env.ETSY_ACCESS_TOKEN,
    refresh_token: process.env.ETSY_REFRESH_TOKEN,
    token_type: "Bearer",
  };
}

export async function exchangeEtsyAuthorizationCode({
  code,
  redirectUri,
  codeVerifier,
}: {
  code: string;
  redirectUri: string;
  codeVerifier: string;
}) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: requireEnv("ETSY_KEYSTRING"),
    redirect_uri: redirectUri,
    code,
    code_verifier: codeVerifier,
  });

  const response = await fetch(ETSY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
  });

  if (!response.ok) {
    throw new Error(await etsyErrorMessage(response));
  }

  return (await response.json()) as EtsyTokenResponse;
}

async function refreshEtsyToken(refreshToken: string) {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: requireEnv("ETSY_KEYSTRING"),
    refresh_token: refreshToken,
  });

  const response = await fetch(ETSY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
  });

  if (!response.ok) {
    throw new Error(await etsyErrorMessage(response));
  }

  return (await response.json()) as EtsyTokenResponse;
}

export async function getEtsyAccessToken({ forceRefresh = false } = {}): Promise<string> {
  const tokens = await getStoredOrEnvTokens();
  const hasFreshAccessToken =
    tokens.access_token &&
    tokens.expires_at &&
    tokens.expires_at > Date.now() + TOKEN_REFRESH_BUFFER_MS;

  if (
    !forceRefresh &&
    tokens.access_token &&
    (hasFreshAccessToken || !tokens.refresh_token)
  ) {
    return tokens.access_token;
  }

  if (!tokens.refresh_token) {
    throw new Error("ETSY_REFRESH_TOKEN or a fresh ETSY_ACCESS_TOKEN is required");
  }

  const refreshed = await refreshEtsyToken(tokens.refresh_token);
  await writeEtsyTokenFile(refreshed);
  return refreshed.access_token;
}

async function getEtsyUserIdFromToken() {
  const accessToken = await getEtsyAccessToken();
  const [userId] = accessToken.split(".");
  if (!userId) {
    throw new Error("Could not read Etsy user id from the OAuth access token");
  }
  return userId;
}

async function etsyRequest<T>(pathOrUrl: string, options: EtsyRequestOptions = {}): Promise<T> {
  const { auth = true, retryOnUnauthorized = true, headers, ...rest } = options;
  const url = pathOrUrl.startsWith("http")
    ? pathOrUrl
    : `${ETSY_API_BASE_URL}${pathOrUrl}`;

  const requestHeaders = new Headers(headers);
  requestHeaders.set("x-api-key", getEtsyApiKeyHeader());
  requestHeaders.set("Accept", "application/json");

  if (auth) {
    requestHeaders.set("Authorization", `Bearer ${await getEtsyAccessToken()}`);
  }

  const response = await fetch(url, {
    ...rest,
    headers: requestHeaders,
  });

  if (response.status === 401 && auth && retryOnUnauthorized) {
    requestHeaders.set("Authorization", `Bearer ${await getEtsyAccessToken({ forceRefresh: true })}`);
    const retryResponse = await fetch(url, {
      ...rest,
      headers: requestHeaders,
    });
    if (!retryResponse.ok) {
      throw new Error(await etsyErrorMessage(retryResponse));
    }
    return readEtsyResponse<T>(retryResponse);
  }

  if (!response.ok) {
    throw new Error(await etsyErrorMessage(response));
  }

  return readEtsyResponse<T>(response);
}

async function readEtsyResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

async function etsyErrorMessage(response: Response) {
  const text = await response.text().catch(() => "");
  return `Etsy API ${response.status} ${response.statusText}${text ? `: ${text}` : ""}`;
}

function appendFormValue(
  form: URLSearchParams,
  key: string,
  value: string | number | boolean | Array<string | number | boolean> | null | undefined
) {
  if (value == null || value === "") return;
  if (Array.isArray(value)) {
    value.forEach((item) => appendFormValue(form, key, item));
    return;
  }
  form.append(key, String(value));
}

function toFormBody(
  values: Record<
    string,
    string | number | boolean | Array<string | number | boolean> | null | undefined
  >
) {
  const form = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    appendFormValue(form, key, value);
  }
  return form;
}

function asPrice(value: number) {
  return Number(value).toFixed(2);
}

function cleanMaterial(value: string) {
  return value.replace(/[^\p{L}\p{Nd}\p{Zs}]/gu, " ").replace(/\s+/g, " ").trim();
}

function cleanTag(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{Nd}\p{Zs}-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 20);
}

function parseMaterials(materials: string | null | undefined) {
  return (materials ?? "")
    .split(",")
    .map(cleanMaterial)
    .filter(Boolean)
    .slice(0, 13);
}

function getProductTags(product: NonNullable<EtsySyncProduct>) {
  return product.tags
    .map((productTag) => cleanTag(productTag.tag.name))
    .filter(Boolean)
    .slice(0, 13);
}

function getTotalStock(product: NonNullable<EtsySyncProduct>) {
  if (product.variants.length > 0) {
    return product.variants.reduce((total, variant) => total + variant.stockCount, 0);
  }
  return product.stockCount;
}

function getSku(product: NonNullable<EtsySyncProduct>) {
  return `TENGOLOGY-${product.slug}`
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "-")
    .slice(0, 64);
}

function getListingDescription(product: NonNullable<EtsySyncProduct>) {
  const description =
    product.fullDescription || product.shortDescription || product.title;
  return `${description}\n\nTengology product ID: ${product.slug}`;
}

function buildListingForm(product: NonNullable<EtsySyncProduct>) {
  const config = getDefaultListingConfig(product.category);
  const totalStock = getTotalStock(product);

  return toFormBody({
    quantity: Math.max(totalStock, 1),
    title: product.title,
    description: getListingDescription(product),
    price: asPrice(Number(product.price)),
    who_made: config.whoMade,
    when_made: config.whenMade,
    taxonomy_id: config.taxonomyId,
    shipping_profile_id: config.shippingProfileId,
    readiness_state_id: config.readinessStateId,
    is_supply: false,
    should_auto_renew: config.shouldAutoRenew,
    type: "physical",
    materials: parseMaterials(product.materials),
    tags: getProductTags(product),
  });
}

function buildListingPatchForm(product: NonNullable<EtsySyncProduct>) {
  const config = getDefaultListingConfig(product.category);

  return toFormBody({
    title: product.title,
    description: getListingDescription(product),
    who_made: config.whoMade,
    when_made: config.whenMade,
    taxonomy_id: config.taxonomyId,
    shipping_profile_id: config.shippingProfileId,
    is_supply: false,
    should_auto_renew: config.shouldAutoRenew,
    type: "physical",
    materials: parseMaterials(product.materials),
    tags: getProductTags(product),
  });
}

function buildInventoryPayload(product: NonNullable<EtsySyncProduct>) {
  const config = getDefaultListingConfig(product.category);
  const totalStock = getTotalStock(product);

  return {
    products: [
      {
        sku: getSku(product),
        offerings: [
          {
            price: Number(asPrice(Number(product.price))),
            quantity: Math.max(totalStock, 0),
            is_enabled: true,
            readiness_state_id: config.readinessStateId,
          },
        ],
        property_values: [],
      },
    ],
    price_on_property: [],
    quantity_on_property: [],
    sku_on_property: [],
    readiness_state_on_property: [],
  };
}

function extractListingId(response: unknown) {
  if (response && typeof response === "object" && "listing_id" in response) {
    return String((response as { listing_id: string | number }).listing_id);
  }
  throw new Error("Etsy did not return a listing_id");
}

function extractListingUrl(response: unknown, listingId: string) {
  if (response && typeof response === "object" && "url" in response) {
    const url = (response as { url?: unknown }).url;
    if (typeof url === "string" && url) return url;
  }
  return `https://www.etsy.com/listing/${listingId}`;
}

async function getProductForEtsySync(productId: string) {
  return prisma.product.findUnique({
    where: { id: productId },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { sortOrder: "asc" } },
      tags: { include: { tag: true } },
      etsySync: true,
    },
  });
}

export async function findProductForEtsySync(productRef: string) {
  const byId = await getProductForEtsySync(productRef);
  if (byId) return byId;

  return prisma.product.findUnique({
    where: { slug: productRef },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { sortOrder: "asc" } },
      tags: { include: { tag: true } },
      etsySync: true,
    },
  });
}

async function markEtsySyncFailure(productId: string, error: unknown) {
  const existing = await prisma.etsySync.findUnique({ where: { productId } });
  if (!existing) return;

  await prisma.etsySync.update({
    where: { productId },
    data: {
      syncStatus: "FAILED",
      lastError: error instanceof Error ? error.message : String(error),
    },
  });
}

export async function syncProductToEtsy(productId: string, options: EtsySyncOptions = {}) {
  const product = await getProductForEtsySync(productId);
  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }

  return syncProductRecordToEtsy(product, options);
}

export async function syncProductRecordToEtsy(
  product: NonNullable<EtsySyncProduct>,
  options: EtsySyncOptions = {}
): Promise<EtsySyncResult> {
  const dryRun = options.dryRun ?? true;
  const existingListingId = product.etsySync?.etsyListingId;
  const action = existingListingId ? "update" : "create";
  const stock = getTotalStock(product);

  try {
    buildListingForm(product);
    buildInventoryPayload(product);

    if (dryRun) {
      return {
        productId: product.id,
        slug: product.slug,
        title: product.title,
        action: "dry-run",
        listingId: existingListingId,
        status: "DRY_RUN",
        message: `${action} Etsy listing, stock ${stock}, price GBP ${asPrice(Number(product.price))}`,
      };
    }

    if (existingListingId) {
      await updateEtsyListing(existingListingId, product, options);
      return {
        productId: product.id,
        slug: product.slug,
        title: product.title,
        action: "update",
        listingId: existingListingId,
        status: "SYNCED",
        message: `Updated Etsy listing ${existingListingId}`,
      };
    }

    const created = await createEtsyListing(product, options);
    return {
      productId: product.id,
      slug: product.slug,
      title: product.title,
      action: "create",
      listingId: created.listingId,
      status: "SYNCED",
      message: `Created Etsy draft ${created.listingId}`,
    };
  } catch (error) {
    await markEtsySyncFailure(product.id, error);
    return {
      productId: product.id,
      slug: product.slug,
      title: product.title,
      action,
      listingId: existingListingId,
      status: "FAILED",
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

async function createEtsyListing(product: NonNullable<EtsySyncProduct>, options: EtsySyncOptions) {
  const shopId = getShopId();
  const response = await etsyRequest<unknown>(`/shops/${shopId}/listings?legacy=false`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: buildListingForm(product),
  });

  const listingId = extractListingId(response);
  const etsyUrl = extractListingUrl(response, listingId);

  await prisma.etsySync.upsert({
    where: { productId: product.id },
    create: {
      productId: product.id,
      etsyListingId: listingId,
      etsyUrl,
      lastSyncedAt: new Date(),
      syncStatus: "SYNCED",
      lastError: null,
    },
    update: {
      etsyListingId: listingId,
      etsyUrl,
      lastSyncedAt: new Date(),
      syncStatus: "SYNCED",
      lastError: null,
    },
  });

  await updateEtsyInventory(listingId, product);

  if (options.syncImages ?? true) {
    await uploadEtsyImages(listingId, product, { overwrite: false });
  }

  if (options.publish) {
    await publishEtsyListing(listingId, product);
  }

  return { listingId, etsyUrl };
}

async function updateEtsyListing(
  listingId: string,
  product: NonNullable<EtsySyncProduct>,
  options: EtsySyncOptions
) {
  const shopId = getShopId();
  await etsyRequest<unknown>(`/shops/${shopId}/listings/${listingId}?legacy=false`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: buildListingPatchForm(product),
  });

  await updateEtsyInventory(listingId, product);

  if (options.syncImages) {
    await uploadEtsyImages(listingId, product, { overwrite: true });
  }

  if (options.publish) {
    await publishEtsyListing(listingId, product);
  }

  await prisma.etsySync.update({
    where: { productId: product.id },
    data: {
      lastSyncedAt: new Date(),
      syncStatus: "SYNCED",
      lastError: null,
    },
  });
}

async function updateEtsyInventory(listingId: string, product: NonNullable<EtsySyncProduct>) {
  await etsyRequest<unknown>(`/listings/${listingId}/inventory?legacy=false`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildInventoryPayload(product)),
  });
}

async function publishEtsyListing(listingId: string, product: NonNullable<EtsySyncProduct>) {
  if (product.images.length === 0) {
    throw new Error("Cannot publish Etsy listing without at least one product image");
  }

  const shopId = getShopId();
  await etsyRequest<unknown>(`/shops/${shopId}/listings/${listingId}?legacy=false`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: toFormBody({ state: "active" }),
  });
}

function imageMimeType(fileName: string) {
  switch (path.extname(fileName).toLowerCase()) {
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".jpg":
    case ".jpeg":
    default:
      return "image/jpeg";
  }
}

async function imageToBlob(imageUrl: string) {
  if (/^https?:\/\//i.test(imageUrl)) {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image ${imageUrl}: ${response.status}`);
    }
    const blob = await response.blob();
    const name = path.basename(new URL(imageUrl).pathname) || "product-image.jpg";
    return { blob, name };
  }

  const cleanPath = imageUrl.split("?")[0]?.replace(/^\//, "");
  if (!cleanPath) {
    throw new Error(`Invalid local image path: ${imageUrl}`);
  }

  const filePath = path.join(process.cwd(), "public", cleanPath);
  const buffer = await fs.readFile(filePath);
  const name = path.basename(filePath);
  const blob = new Blob([buffer], { type: imageMimeType(name) });
  return { blob, name };
}

async function uploadEtsyImages(
  listingId: string,
  product: NonNullable<EtsySyncProduct>,
  { overwrite }: { overwrite: boolean }
) {
  const shopId = getShopId();
  const images = product.images.slice(0, 10);

  for (const [index, image] of images.entries()) {
    const { blob, name } = await imageToBlob(image.url);
    const form = new FormData();
    form.append("image", blob, name);
    form.append("rank", String(index + 1));
    form.append("overwrite", String(overwrite));
    if (image.altText) {
      form.append("alt_text", image.altText.slice(0, 500));
    }

    await etsyRequest<unknown>(`/shops/${shopId}/listings/${listingId}/images`, {
      method: "POST",
      body: form,
    });
  }
}

export async function syncAllProductsToEtsy(options: EtsySyncAllOptions = {}) {
  const products = await prisma.product.findMany({
    where: options.includeUnpublished ? undefined : { isPublished: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { sortOrder: "asc" } },
      tags: { include: { tag: true } },
      etsySync: true,
    },
    orderBy: { createdAt: "asc" },
    take: options.limit,
  });

  const results: EtsySyncResult[] = [];
  for (const product of products) {
    results.push(await syncProductRecordToEtsy(product, options));
  }

  return results;
}

export async function getEtsyShopSetup() {
  const ownedShops = await etsyRequest<unknown>(
    `/users/${await getEtsyUserIdFromToken()}/shops`
  );
  const shopId = getOptionalShopId();

  if (!shopId) {
    return {
      ownedShops,
      message: "Set ETSY_SHOP_ID to inspect shipping and readiness profiles.",
    };
  }

  const [shop, shippingProfiles, readinessStates] = await Promise.all([
    etsyRequest<unknown>(`/shops/${shopId}`),
    etsyRequest<unknown>(`/shops/${shopId}/shipping-profiles`),
    etsyRequest<unknown>(`/shops/${shopId}/readiness-state-definitions`),
  ]);

  return { ownedShops, shop, shippingProfiles, readinessStates };
}

export async function getEtsySellerTaxonomyNodes() {
  return etsyRequest<unknown>("/seller-taxonomy/nodes", { auth: false });
}
