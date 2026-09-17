/** Run with: NODE_OPTIONS=--conditions=react-server npx tsx prisma/test-square-sandbox.ts
 * Tests only the payment adapter, never creates shop orders or touches stock.
 * Sandbox credentials are read privately from the existing sandbox VPS container.
 */
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";

async function main() {
  const raw = execFileSync("ssh", ["-i", "/Users/sooktengvun/.ssh/tengology_uk", "-o", "BatchMode=yes", "root@130.94.78.227",
    "docker exec tengology-app printenv SQUARE_ENVIRONMENT SQUARE_ACCESS_TOKEN SQUARE_LOCATION_ID"], { encoding: "utf8" }).trim().split("\n");
  assert.equal(raw[0], "sandbox", "Refusing to test production");
  process.env.SQUARE_ENVIRONMENT = "sandbox";
  process.env.SQUARE_ACCESS_TOKEN = raw[1];
  process.env.SQUARE_LOCATION_ID = raw[2];
  const { createSquarePayment, getSquareClient } = await import("../src/lib/square");
  const square = getSquareClient();
  const locations = await square.locations.list();
  assert(locations.locations?.some(l => l.id === raw[2] && l.country === "GB" && l.currency === "GBP"), "Sandbox must be UK GBP");
  const base = { amount: 18, currency: "GBP", orderNumber: "SANDBOX-QA-NO-SHOP-ORDER", billingAddress: { country: "GB", postalCode: "OX1 1AA" } };
  const key = randomUUID();
  const paid = await createSquarePayment({ ...base, sourceId: "cnon:card-nonce-ok", idempotencyKey: key });
  assert(paid.ok && paid.status === "COMPLETED" && paid.amount === 18);
  console.log("PASS card success, GBP £18, UK postcode");
  const retry = await createSquarePayment({ ...base, sourceId: "cnon:card-nonce-ok", idempotencyKey: key });
  assert.equal(retry.paymentId, paid.paymentId);
  console.log("PASS same-key retry returns same payment");
  for (const [source, expected] of [["cnon:card-nonce-declined", "GENERIC_DECLINE"], ["cnon:card-nonce-rejected-cvv", "CVV_FAILURE"], ["cnon:card-nonce-rejected-postalcode", "ADDRESS_VERIFICATION_FAILURE"], ["wnon:afterpay-or-clearpay-declined", "GENERIC_DECLINE"]]) {
    const result = await createSquarePayment({ ...base, sourceId: source, idempotencyKey: randomUUID() });
    assert.equal(result.ok, false);
    assert.equal(result.errorCode, expected);
    assert(result.errorMessage);
    console.log(`PASS ${expected}: friendly error returned`);
  }
  const clearpay = await createSquarePayment({ ...base, sourceId: "wnon:afterpay-or-clearpay-ok", idempotencyKey: randomUUID() });
  assert(clearpay.ok && clearpay.status === "COMPLETED");
  console.log("PASS Clearpay success");
  console.log("Sandbox adapter tests complete. No live charges, customer emails, shop orders or stock changes.");
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Sandbox test failed"); process.exitCode = 1; });
