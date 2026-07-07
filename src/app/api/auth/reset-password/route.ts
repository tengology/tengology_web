import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

function invalid() {
  return NextResponse.json(
    { error: "Invalid or expired reset link" },
    { status: 400 }
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const { email, token, password } = body ?? {};

  if (
    typeof email !== "string" ||
    typeof token !== "string" ||
    typeof password !== "string" ||
    password.length < 8
  ) {
    return invalid();
  }

  const normalizedEmail = email.trim().toLowerCase();
  const digest = crypto.createHash("sha256").update(token).digest("hex");

  const record = await prisma.verificationToken.findUnique({
    where: {
      identifier_token: { identifier: normalizedEmail, token: digest },
    },
  });

  if (!record || record.expires < new Date()) {
    return invalid();
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (!user) {
    return invalid();
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  // Single use: remove the token so the link cannot be replayed.
  await prisma.verificationToken.deleteMany({
    where: { identifier: normalizedEmail },
  });

  return NextResponse.json({ success: true });
}
