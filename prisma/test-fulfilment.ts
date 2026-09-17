/** Sandbox fulfilment examples using actual cart encoding and checkout action. */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { config } from "dotenv";
import bcrypt from "bcryptjs";
import { encodeDesign } from "../src/features/designer/engine/serialize";
import { createDesignSnapshot, beadPickList } from "../src/lib/design-snapshot";
import { buildOrderLines } from "../src/store/cart";

async function main() {
  config({ path: ".env.local", quiet: true });
  const password = execFileSync("ssh", ["-i", "/Users/sooktengvun/.ssh/tengology_uk", "-o", "BatchMode=yes", "root@130.94.78.227", "docker exec tengology-checkout-qa-db printenv POSTGRES_PASSWORD"], { encoding: "utf8" }).trim();
  process.env.DATABASE_URL = `postgresql://qa:${password}@127.0.0.1:55432/checkout_qa`;
  const { prisma } = await import("../src/lib/db");
  await prisma.user.upsert({ where: { email: "qa-admin@tengology.test" }, update: {}, create: { email: "qa-admin@tengology.test", name: "Sandbox shop owner", role: "ADMIN", passwordHash: await bcrypt.hash("Sandbox-Only-2026!", 10) } });
  const anchor = await prisma.product.upsert({ where: { slug: "bespoke-crystal-design" }, update: {}, create: { slug: "bespoke-crystal-design", title: "Bespoke Crystal Design", price: 0, stockCount: 0, isPublished: false } });
  const encoded = encodeDesign({ version: 1, kind: "bracelet", originIndex: 2, sizing: { kind: "bracelet", wristMm: 160 }, findings: { kind: "bracelet", band: "elastic" }, beads: Array.from({ length: 24 }, (_, i) => ({ id: `test-bead-${i}`, crystalSlug: i % 3 === 0 ? "howlite" : "clear-quartz", sizeMm: 8, variantIndex: 0 })) });
  const snapshot = createDesignSnapshot(encoded);
  assert.equal(snapshot.beads[0].slug, "clear-quartz");
  assert.equal(beadPickList(snapshot, 2).reduce((n,b) => n+b.count,0),48);
  assert.throws(() => createDesignSnapshot("invalid"));
  const items = buildOrderLines([{ productId: anchor.id, title: "DIY test", price: 0.01, quantity: 1, design: { encoded, kind: "bracelet", beadCount: 24 } }]);
  assert.equal(items[0].designEncoded, encoded);
  await fetch("http://localhost:3001/checkout");
  const manifest = JSON.parse(readFileSync(".next/dev/server/server-reference-manifest.json", "utf8"));
  const action = Object.entries(manifest.node).find(([,v]) => (v as {exportedName?:string}).exportedName === "placeOrder")?.[0];
  assert(action);
  for (const [kind, lines] of [["regular", [{ productId: "qa-pumpkin", quantity: 1 }]], ["DIY", items]] as const) {
    const notes = `FULFILMENT DEMO ${kind} — Sandbox only, do not dispatch.`;
    assert.equal(await prisma.order.count({ where: { notes } }), 0, "Demo already exists — do not send duplicate emails");
    const response = await fetch("http://localhost:3001/checkout", { method: "POST", headers: { "Next-Action": action, "Content-Type": "text/plain;charset=UTF-8", Origin: "http://localhost:3001" }, body: JSON.stringify([{ items: lines, email: "tengology@gmail.com", shippingAddress: { firstName: "Sandbox", lastName: kind === "DIY" ? "Bracelet Customer" : "Customer", line1: "1 Test Street", city: "Oxford", postcode: "OX1 1AA", country: "GB" }, shippingMethodId: "qa-uk", billingSameAsShipping: true, sourceId: "cnon:card-nonce-ok", notes, giftMessage: kind === "regular" ? "Happy birthday! — TEST gift message" : "" }]) });
    assert((await response.text()).includes('"ok":true'), `${kind} checkout failed`);
    const order = await prisma.order.findFirstOrThrow({ where: { notes }, include: { items: true } });
    assert.equal(order.paymentStatus, "PAID");
    if (kind === "DIY") { assert.equal(order.items[0].designSnapshot, JSON.stringify(snapshot)); assert.equal(order.items[0].unitPrice, snapshot.unitPrice); assert.equal((await prisma.product.findUniqueOrThrow({ where: { id: anchor.id } })).stockCount, 0); }
    const emails = await prisma.emailLog.findMany({ where: { orderId: order.id } });
    assert(emails.some(e => e.template === "order-confirmation" && e.status === "SENT"));
    assert(emails.some(e => e.template === "admin-new-order" && e.to === "tengology@gmail.com" && e.status === "SENT"));
    console.log(`${kind}: ${order.orderNumber} · GBP ${order.total} · customer + owner emails accepted`);
    console.log(`Packing list: http://localhost:3001/admin/orders/${order.id}/packing-slip`);
  }
  console.log("PASS frozen design, bead totals, rotated sequence, server pricing, no anchor stock decrement, order + owner/customer email logs.");
  await prisma.$disconnect();
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
