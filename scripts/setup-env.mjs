import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const examplePath = path.join(root, ".env.example");
const envPath = path.join(root, ".env.local");

if (existsSync(envPath)) {
  console.log(".env.local already exists — leaving it untouched.");
  process.exit(0);
}

let contents = readFileSync(examplePath, "utf8");

const secret = randomBytes(32).toString("base64url");
contents = contents.replace(
  /^AUTH_SECRET=.*$/m,
  `AUTH_SECRET="${secret}"`
);

// Blank the Square placeholders so the app correctly detects that
// payments are not configured yet.
for (const key of [
  "SQUARE_ACCESS_TOKEN",
  "SQUARE_LOCATION_ID",
  "NEXT_PUBLIC_SQUARE_APPLICATION_ID",
  "NEXT_PUBLIC_SQUARE_LOCATION_ID",
]) {
  contents = contents.replace(
    new RegExp(`^${key}=.*$`, "m"),
    `${key}=""`
  );
}

writeFileSync(envPath, contents);

console.log(`Created .env.local with a freshly generated AUTH_SECRET.

The site will run without payment credentials (checkout shows a
"payments not configured" message). To accept test payments, fill in
the Square sandbox values in .env.local:

  1. Go to https://developer.squareup.com → Developer Dashboard
  2. Create (or open) an application, switch to the **Sandbox** tab
  3. Copy the Sandbox Application ID  → NEXT_PUBLIC_SQUARE_APPLICATION_ID
     Copy the Sandbox Access Token    → SQUARE_ACCESS_TOKEN
  4. Open the sandbox test account's Locations (Applications → Locations
     tab) and copy the Default Location ID
       → SQUARE_LOCATION_ID and NEXT_PUBLIC_SQUARE_LOCATION_ID
  5. (Optional, for webhooks) Webhooks → Subscriptions → create a
     subscription pointing at a public tunnel URL, then copy its
     Signature Key → SQUARE_WEBHOOK_SIGNATURE_KEY

Optional integrations:
  - RESEND_API_KEY  — transactional emails (otherwise they are logged
    to the server console instead of sent)
  - EMAIL_FROM      — the From address for those emails
`);
