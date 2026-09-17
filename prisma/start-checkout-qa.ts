/** Isolated UK checkout QA. No production DB credentials reach the test app. */
import { execFileSync, spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { config } from "dotenv";
import { Client } from "pg";

async function main() {
  config({ path: ".env.local", quiet: true });
  const ssh = ["-i", "/Users/sooktengvun/.ssh/tengology_uk", "-o", "BatchMode=yes", "root@130.94.78.227"];
  const square = execFileSync("ssh", [...ssh, "docker exec tengology-app printenv SQUARE_ENVIRONMENT SQUARE_ACCESS_TOKEN SQUARE_LOCATION_ID NEXT_PUBLIC_SQUARE_APPLICATION_ID"], { encoding: "utf8" }).trim().split("\n");
  if (square[0] !== "sandbox" || !square[3]?.startsWith("sandbox-")) throw Error("Sandbox credentials required");
  if (!process.env.RESEND_API_KEY) throw Error("Resend is required for this test");
  const resume = process.argv.includes("--resume");
  const password = resume ? execFileSync("ssh", [...ssh, "docker exec tengology-checkout-qa-db printenv POSTGRES_PASSWORD"], { encoding: "utf8" }).trim() : randomBytes(24).toString("hex");
  if (!resume) execFileSync("ssh", [...ssh, "bash -s"], {
    input: `docker run -d --name tengology-checkout-qa-db -p 127.0.0.1:55432:5432 -e POSTGRES_USER=qa -e POSTGRES_DB=checkout_qa -e POSTGRES_PASSWORD=${password} postgres:16-alpine`,
    stdio: ["pipe", "ignore", "pipe"],
  });
  const tunnel = spawn("ssh", [...ssh.slice(0, -1), "-N", "-L", "127.0.0.1:55432:127.0.0.1:55432", "-o", "ExitOnForwardFailure=yes", ssh.at(-1)!], { stdio: "ignore" });
  const database = `postgresql://qa:${password}@127.0.0.1:55432/checkout_qa`;
  for (let i = 0; i < 30; i++) {
    const client = new Client({ connectionString: database });
    try { await client.connect(); await client.end(); break; }
    catch { await client.end().catch(() => {}); if (i === 29) throw Error("Test database unavailable"); await new Promise(r => setTimeout(r, 1000)); }
  }
  Object.assign(process.env, {
    DATABASE_URL: database, DIRECT_URL: database,
    SQUARE_ENVIRONMENT: "sandbox", NEXT_PUBLIC_SQUARE_ENVIRONMENT: "sandbox",
    SQUARE_ACCESS_TOKEN: square[1], SQUARE_LOCATION_ID: square[2],
    NEXT_PUBLIC_SQUARE_LOCATION_ID: square[2], NEXT_PUBLIC_SQUARE_APPLICATION_ID: square[3],
    NEXT_PUBLIC_SITE_URL: "http://localhost:3001", AUTH_URL: "http://localhost:3001",
    EMAIL_FROM: "Tengology <orders@tengology.com>", EMAIL_REPLY_TO: "tengology@gmail.com", ADMIN_EMAIL: "tengology@gmail.com",
    EMAIL_ASSET_URL: "https://tengology.com",
    SQUARE_WEBHOOK_SIGNATURE_KEY: "", SQUARE_WEBHOOK_URL: "",
  });
  execFileSync("node", ["node_modules/prisma/build/index.js", "db", "push"], { env: process.env, stdio: "pipe" });
  const { prisma } = await import("../src/lib/db");
  if (!resume) {
    await prisma.product.create({ data: { id: "qa-pumpkin", slug: "sandbox-pumpkin-test", title: "[TEST ONLY] Pumpkin Claw Clips — Pair", price: 18, stockCount: 10, isPublished: true, category: "FELT", shortDescription: "Sandbox test only. No real purchase or delivery." } });
    await prisma.shippingMethod.create({ data: { id: "qa-uk", name: "Royal Mail Tracked 48", price: 4, countries: "GB", minDays: 2, maxDays: 4 } });
    for (const [key, value] of Object.entries({ orderPrefix: "TEST", storeEmail: "tengology@gmail.com", supportEmail: "tengology@gmail.com" })) await prisma.setting.create({ data: { key, value } });
  }
  await prisma.$disconnect();
  console.log("Isolated database seeded. £18 test pair + £4 UK shipping. Sandbox only.");
  const server = spawn("node", ["node_modules/next/dist/bin/next", "dev", "--port", "3001", "--hostname", "127.0.0.1"], { env: process.env, stdio: "inherit" });
  process.on("SIGINT", () => { server.kill("SIGINT"); tunnel.kill(); });
  process.on("SIGTERM", () => { server.kill("SIGTERM"); tunnel.kill(); });
  server.on("exit", () => tunnel.kill());
}
main().catch(() => { console.error("QA startup failed; credentials suppressed. Inspect isolated resources before retrying."); process.exitCode = 1; });
