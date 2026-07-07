import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function ownsAddress(id: string, userId: string) {
  const addr = await prisma.address.findUnique({ where: { id } });
  return addr && addr.userId === userId ? addr : null;
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/account/addresses/[id]">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const existing = await ownsAddress(id, session.user.id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();

  if (body.isDefault === true) {
    await prisma.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.update({
    where: { id },
    data: {
      label: body.label ?? existing.label,
      firstName: body.firstName ?? existing.firstName,
      lastName: body.lastName ?? existing.lastName,
      line1: body.line1 ?? existing.line1,
      line2: body.line2 ?? existing.line2,
      city: body.city ?? existing.city,
      county: body.county ?? existing.county,
      postcode: body.postcode ?? existing.postcode,
      country: body.country ?? existing.country,
      isDefault:
        typeof body.isDefault === "boolean"
          ? body.isDefault
          : existing.isDefault,
    },
  });

  return NextResponse.json({ address });
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/account/addresses/[id]">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const existing = await ownsAddress(id, session.user.id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.address.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
