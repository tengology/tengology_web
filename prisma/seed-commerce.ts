import "dotenv/config";
import { prisma } from "../src/lib/db";

/**
 * Seeds the commercial configuration a storefront needs before it can take an
 * order: delivery options, store settings, and a starter discount code.
 * Safe to re-run — everything is upserted.
 */

/**
 * Every delivery price is Royal Mail's online price from 5 October 2026,
 * rounded up to the next whole pound: a small parcel up to 2kg in the UK, up
 * and up to 1kg abroad. Special Delivery is quoted case by case — not a flat checkout rate.
 */

const IRELAND = { zone: "europe", minDays: 3, maxDays: 7 };
const EUROPE = { zone: "europe", minDays: 5, maxDays: 10 };
const WORLD = { zone: "world", minDays: 7, maxDays: 21 };

/**
 * International Tracked, priced country by country. Zones follow
 * royalmail.com/world-zones. Countries at the same price share one delivery
 * option so the admin list stays short; the Delivery page still lists each
 * country with its own price.
 */
const INTERNATIONAL_BANDS = [
  { price: 9, ...IRELAND, countries: ["IE"] }, // £8.80
  { price: 10, ...EUROPE, countries: ["DE"] }, // £9.95
  { price: 11, ...EUROPE, countries: ["DK", "NL", "MC"] }, // £10.95, £10.85, Zone 1 £10.95
  { price: 12, ...EUROPE, countries: ["FR", "BE", "IT", "SE", "PL", "ES"] }, // £11.15–£12.00
  {
    price: 13, // Europe Zone 2, £12.10
    ...EUROPE,
    countries: ["AT", "BG", "HR", "CY", "CZ", "EE", "FI", "GR", "HU", "LV", "LT", "LU", "MT", "PT", "SK", "SI"],
  },
  { price: 14, ...EUROPE, countries: ["CH"] }, // £13.20
  { price: 15, ...EUROPE, countries: ["NO"] }, // £14.05
  { price: 16, ...EUROPE, countries: ["TR"] }, // £15.65
  { price: 17, ...EUROPE, countries: ["RO", "IS", "LI"] }, // £16.30, Zone 3 £16.15
  { price: 14, ...WORLD, countries: ["CN"] }, // £13.15
  { price: 18, ...WORLD, countries: ["US"] }, // £17.53
  { price: 20, ...WORLD, countries: ["AU", "HK"] }, // £19.40, £19.90
  { price: 21, ...WORLD, countries: ["CA", "TH", "NZ"] }, // £20.27, £20.10, £20.25
  { price: 22, ...WORLD, countries: ["JP", "IN"] }, // £21.45
  { price: 23, ...WORLD, countries: ["BR"] }, // £22.30
  {
    price: 25, // World Zone 1, £24.65
    ...WORLD,
    countries: [
      "MX", "KR", "TW", "MY", "PH", "ID", "VN",
      "AE", "SA", "QA", "KW", "BH", "IL", "ZA", "NG", "KE", "GH", "EG", "MU",
      "AR", "CL", "CO", "PE", "UY", "CR", "PA", "JM",
    ],
  },
  { price: 28, ...WORLD, countries: ["SG", "MO"] }, // World Zone 2, £27.90
];

const INTERNATIONAL_METHODS = INTERNATIONAL_BANDS.map((band, index) => ({
  id: `intl-${band.zone}-${band.price}`,
  name: "International Tracked",
  description: "Royal Mail",
  carrier: "ROYAL_MAIL",
  price: band.price,
  freeThreshold: null,
  minDays: band.minDays,
  maxDays: band.maxDays,
  countries: band.countries.join(","),
  sortOrder: 10 + index,
}));

const SHIPPING_METHODS = [
  // Ids predate the Royal Mail names; they stay so existing rows and orders
  // keep pointing at the same methods.
  {
    id: "standard-uk",
    name: "Tracked 48",
    description: "Royal Mail, tracked",
    carrier: "ROYAL_MAIL",
    price: 4, // £3.75
    freeThreshold: 50,
    minDays: 2,
    maxDays: 4,
    countries: "GB",
    sortOrder: 0,
  },
  {
    id: "express-uk",
    name: "Tracked 24",
    description: "Royal Mail, tracked",
    carrier: "ROYAL_MAIL",
    price: 5, // £4.80
    freeThreshold: null,
    minDays: 1,
    maxDays: 2,
    countries: "GB",
    sortOrder: 1,
  },
  ...INTERNATIONAL_METHODS,
  {
    // Catch-all for anywhere not priced above, at the dearest band so an
    // unlisted destination can never cost more to post than it is charged.
    id: "international",
    name: "International Tracked",
    description: "Royal Mail",
    carrier: "ROYAL_MAIL",
    price: 28,
    freeThreshold: null,
    minDays: 7,
    maxDays: 21,
    countries: "*",
    sortOrder: 99,
  },
];

/**
 * Methods an earlier seed created. Left active they would still name their
 * countries and be offered alongside the per-country rates above.
 */
const RETIRED_METHOD_IDS = ["ireland", "europe", "special-delivery-uk"];

const SETTINGS = {
  storeName: "Tengology",
  storeEmail: "orders@tengology.com",
  supportEmail: "hello@tengology.com",
  freeShippingThreshold: "50",
  taxRatePercent: "0",
  taxIncludedInPrice: "true",
  allowGuestCheckout: "true",
  lowStockThreshold: "3",
  orderPrefix: "TNG",
};

async function main() {
  for (const method of SHIPPING_METHODS) {
    const { id, ...data } = method;
    await prisma.shippingMethod.upsert({
      where: { id },
      create: { id, ...data },
      update: data,
    });
  }
  console.log(`✓ ${SHIPPING_METHODS.length} shipping methods`);

  // Deactivate rather than delete: past orders still reference these ids.
  const retired = await prisma.shippingMethod.updateMany({
    where: { id: { in: RETIRED_METHOD_IDS }, isActive: true },
    data: { isActive: false },
  });
  if (retired.count > 0) console.log(`✓ retired ${retired.count} old shipping methods`);

  for (const [key, value] of Object.entries(SETTINGS)) {
    await prisma.setting.upsert({
      where: { key },
      create: { key, value },
      update: {}, // never clobber a value the owner has changed in the admin
    });
  }
  console.log(`✓ ${Object.keys(SETTINGS).length} store settings`);

  await prisma.discountCode.upsert({
    where: { code: "WELCOME10" },
    create: {
      code: "WELCOME10",
      description: "10% off your first order",
      type: "PERCENT",
      value: 10,
      minSubtotal: 20,
      perCustomerLimit: 1,
      isActive: true,
    },
    update: {},
  });
  console.log("✓ starter discount code WELCOME10");

  // The order counter drives order numbers; start it past any existing orders.
  const orderCount = await prisma.order.count();
  await prisma.setting.upsert({
    where: { key: "orderSeq" },
    create: { key: "orderSeq", value: String(orderCount) },
    update: {},
  });
  console.log(`✓ order sequence primed at ${orderCount}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
