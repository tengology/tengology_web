import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.shippingZone.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const data: { name?: string; baseRate?: number; freeThreshold?: number | null } =
    {};

  if (body.name !== undefined) {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    data.name = name;
  }

  if (body.baseRate !== undefined) {
    const baseRate = Number(body.baseRate);
    if (!Number.isFinite(baseRate) || baseRate < 0) {
      return NextResponse.json(
        { error: "Base rate must be a number of 0 or more" },
        { status: 400 }
      );
    }
    data.baseRate = baseRate;
  }

  if ("freeThreshold" in body) {
    if (body.freeThreshold == null) {
      data.freeThreshold = null;
    } else {
      const freeThreshold = Number(body.freeThreshold);
      if (!Number.isFinite(freeThreshold) || freeThreshold < 0) {
        return NextResponse.json(
          { error: "Free shipping threshold must be empty or a number of 0 or more" },
          { status: 400 }
        );
      }
      data.freeThreshold = freeThreshold;
    }
  }

  const zone = await prisma.shippingZone.update({ where: { id }, data });

  return NextResponse.json(zone);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.shippingZone.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.shippingZone.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
