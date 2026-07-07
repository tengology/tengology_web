import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const zones = await prisma.shippingZone.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json(zones);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const baseRate = Number(body.baseRate);
  if (!Number.isFinite(baseRate) || baseRate < 0) {
    return NextResponse.json(
      { error: "Base rate must be a number of 0 or more" },
      { status: 400 }
    );
  }

  let freeThreshold: number | null = null;
  if (body.freeThreshold != null) {
    freeThreshold = Number(body.freeThreshold);
    if (!Number.isFinite(freeThreshold) || freeThreshold < 0) {
      return NextResponse.json(
        { error: "Free shipping threshold must be empty or a number of 0 or more" },
        { status: 400 }
      );
    }
  }

  const zone = await prisma.shippingZone.create({
    data: { name, baseRate, freeThreshold },
  });

  return NextResponse.json(zone, { status: 201 });
}
