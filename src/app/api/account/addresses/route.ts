import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { label: "asc" }],
  });

  return NextResponse.json({ addresses });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const body = await request.json();
  const {
    label = "Home",
    firstName,
    lastName,
    line1,
    line2,
    city,
    county,
    postcode,
    country = "GB",
    isDefault = false,
  } = body;

  if (!firstName || !lastName || !line1 || !city || !postcode) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId: session.user.id,
      label,
      firstName,
      lastName,
      line1,
      line2: line2 || null,
      city,
      county: county || null,
      postcode,
      country,
      isDefault: Boolean(isDefault),
    },
  });

  return NextResponse.json({ address }, { status: 201 });
}
