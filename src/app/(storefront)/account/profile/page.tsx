import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProfileForm } from "./profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin?callbackUrl=/account/profile");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true, passwordHash: true },
  });

  return (
    <ProfileForm
      initial={{
        name: user?.name ?? "",
        email: user?.email ?? session.user.email,
        phone: user?.phone ?? "",
        hasPassword: Boolean(user?.passwordHash),
      }}
    />
  );
}
