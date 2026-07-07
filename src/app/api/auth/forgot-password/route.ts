import { NextResponse, after } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/email";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email) {
    // Never reveal whether an account exists.
    return NextResponse.json({ ok: true });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

  // Two limits: the ip|email key is a first line of defence, but the IP is
  // spoofable, so a per-email key caps sends regardless of header rotation.
  // Both fail into the same silent 200 so the limiter is not an enumeration
  // oracle and cannot be used to confirm an account exists.
  const ipAllowed = rateLimit(`forgot:${ip}|${email}`, 3, 15 * 60_000);
  const emailAllowed = rateLimit(`forgot:email:${email}`, 3, 15 * 60_000);

  if (!ipAllowed || !emailAllowed) {
    return NextResponse.json({ ok: true });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    // Defer token writes and the email send until after the response has
    // been sent, so response timing is near-identical for both paths and
    // cannot be used for account enumeration.
    after(async () => {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const digest = crypto.createHash("sha256").update(rawToken).digest("hex");

      await prisma.verificationToken.deleteMany({ where: { identifier: email } });
      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token: digest,
          expires: new Date(Date.now() + TOKEN_TTL_MS),
        },
      });

      const baseUrl = process.env.AUTH_URL ?? "http://localhost:3001";
      await sendPasswordResetEmail({
        to: email,
        resetUrl: `${baseUrl}/auth/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`,
      });
    });
  }

  return NextResponse.json({ ok: true });
}
