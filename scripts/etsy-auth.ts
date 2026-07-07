import { config } from "dotenv";
import { createHash, randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  exchangeEtsyAuthorizationCode,
  writeEtsyTokenFile,
} from "@/lib/etsy";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

const STATE_FILE = path.resolve(process.cwd(), ".etsy-oauth-state.json");
const DEFAULT_SCOPES = "listings_r listings_w shops_r transactions_r";

type OAuthState = {
  state: string;
  codeVerifier: string;
  redirectUri: string;
  scopes: string;
  createdAt: string;
};

function usage() {
  console.log(`
Usage:
  npm run etsy:auth -- start
  npm run etsy:auth -- exchange "<full redirected URL>"
  npm run etsy:auth -- exchange --code <code> --state <state>

Required env:
  ETSY_KEYSTRING
  ETSY_REDIRECT_URI
`);
}

function requireEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function base64Url(buffer: Buffer) {
  return buffer.toString("base64url");
}

function createPkcePair() {
  const codeVerifier = base64Url(randomBytes(32));
  const codeChallenge = base64Url(createHash("sha256").update(codeVerifier).digest());
  return { codeVerifier, codeChallenge };
}

async function writeOAuthState(state: OAuthState) {
  await fs.writeFile(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`, {
    mode: 0o600,
  });
}

async function readOAuthState() {
  const raw = await fs.readFile(STATE_FILE, "utf8");
  return JSON.parse(raw) as OAuthState;
}

function parseFlags(args: string[]) {
  const flags = new Map<string, string | boolean>();
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = args[i + 1];
    if (next && !next.startsWith("--")) {
      flags.set(key, next);
      i += 1;
    } else {
      flags.set(key, true);
    }
  }
  return flags;
}

function parseRedirectInput(args: string[]) {
  const flags = parseFlags(args);
  const directUrl = args.find((arg) => !arg.startsWith("--"));

  if (directUrl?.startsWith("http")) {
    const url = new URL(directUrl);
    return {
      code: url.searchParams.get("code") ?? "",
      state: url.searchParams.get("state") ?? "",
    };
  }

  return {
    code: String(flags.get("code") ?? ""),
    state: String(flags.get("state") ?? ""),
  };
}

async function startAuth() {
  const clientId = requireEnv("ETSY_KEYSTRING");
  const redirectUri = requireEnv("ETSY_REDIRECT_URI");
  const scopes = process.env.ETSY_SCOPES?.trim() || DEFAULT_SCOPES;
  const state = base64Url(randomBytes(24));
  const { codeVerifier, codeChallenge } = createPkcePair();

  await writeOAuthState({
    state,
    codeVerifier,
    redirectUri,
    scopes,
    createdAt: new Date().toISOString(),
  });

  const url = new URL("https://www.etsy.com/oauth/connect");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", scopes);
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");

  console.log("Open this Etsy authorization URL:");
  console.log(url.toString());
  console.log("");
  console.log(`Saved PKCE state to ${STATE_FILE}`);
  console.log("After Etsy redirects, copy the full redirected URL into:");
  console.log('  npm run etsy:auth -- exchange "<redirected URL>"');
}

async function exchangeAuth(args: string[]) {
  const { code, state } = parseRedirectInput(args);
  if (!code) throw new Error("Missing OAuth code");

  const saved = await readOAuthState();
  if (state && state !== saved.state) {
    throw new Error("OAuth state does not match the saved request");
  }

  const tokenResponse = await exchangeEtsyAuthorizationCode({
    code,
    redirectUri: saved.redirectUri,
    codeVerifier: saved.codeVerifier,
  });

  await writeEtsyTokenFile(tokenResponse);
  await fs.rm(STATE_FILE, { force: true });

  console.log("Etsy OAuth tokens saved to .etsy-tokens.json");
  console.log("Tokens were not printed to the terminal.");
}

async function main() {
  const [command, ...args] = process.argv.slice(2);

  if (!command || command === "help" || command === "--help") {
    usage();
    return;
  }

  if (command === "start") {
    await startAuth();
    return;
  }

  if (command === "exchange") {
    await exchangeAuth(args);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
