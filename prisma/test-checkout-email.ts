/** Tests the real checkout server action, Square Sandbox, DB and Resend.
 * Requires start-checkout-qa.ts. Does not claim browser tokenisation coverage.
 */
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";

const ssh = ["-i", "/Users/sooktengvun/.ssh/tengology_uk", "-o", "BatchMode=yes", "root@130.94.78.227"];
function sql(query: string) {
  return execFileSync("ssh", [...ssh, "docker exec -i tengology-checkout-qa-db psql -U qa -d checkout_qa -tA"], { input: query, encoding: "utf8" }).trim();
}
async function main() {
  assert.equal(sql('SELECT count(*) FROM "Order";'), "0", "Run only once on fresh isolated QA data");
  const page = await fetch("http://localhost:3001/product/sandbox-pumpkin-test").then(r => r.text());
  assert(page.includes("[TEST ONLY] Pumpkin"), "Refusing a non-QA store");
  const checkout = await fetch("http://localhost:3001/checkout").then(r => r.text());
  assert(checkout.includes('sandbox'), "Sandbox config required");
  const manifest = JSON.parse(readFileSync(".next/dev/server/server-reference-manifest.json", "utf8"));
  const entry = Object.entries(manifest.node).find(([, v]) => (v as { exportedName?: string }).exportedName === "placeOrder");
  assert(entry, "Checkout action must have been compiled");
  const response = await fetch("http://localhost:3001/checkout", {
    method: "POST", headers: { "Next-Action": entry[0], "Content-Type": "text/plain;charset=UTF-8", Origin: "http://localhost:3001" },
    body: JSON.stringify([{
      items: [{ productId: "qa-pumpkin", quantity: 1 }], email: "tengology@gmail.com",
      shippingAddress: { firstName: "Sandbox", lastName: "Test", line1: "1 Test Street", city: "Oxford", postcode: "OX1 1AA", country: "GB" },
      shippingMethodId: "qa-uk", billingSameAsShipping: true,
      sourceId: "cnon:card-nonce-ok", notes: "TEST ONLY — do not dispatch. No real payment.",
    }]),
  });
  const body = await response.text();
  assert(response.ok && body.includes('"ok":true'), "Checkout did not return success");
  assert.equal(sql('SELECT "paymentStatus" FROM "Order";'), "PAID");
  assert.equal(sql('SELECT total FROM "Order";'), "22");
  assert.equal(sql('SELECT "stockCount" FROM "Product" WHERE id=\'qa-pumpkin\';'), "9");
  assert.equal(sql('SELECT status FROM "Payment";'), "COMPLETED");
  assert.equal(sql('SELECT status FROM "EmailLog" WHERE template=\'order-confirmation\';'), "SENT");
  console.log("PASS real checkout action → £22 Sandbox payment → PAID order → stock claimed once → Resend accepted confirmation");
  console.log(sql('SELECT "orderNumber" FROM "Order";'));
  console.log(sql('SELECT "providerId" FROM "EmailLog" WHERE template=\'order-confirmation\';'));
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
