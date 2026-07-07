import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, image: true },
  });

  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { name, phone } = await request.json();

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: typeof name === "string" ? name.trim() || null : undefined,
      phone: typeof phone === "string" ? phone.trim() || null : undefined,
    },
    select: { id: true, name: true, email: true, phone: true },
  });

  return NextResponse.json({ user });
}
