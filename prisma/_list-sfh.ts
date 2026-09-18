import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
config({ quiet: true });
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const p = await prisma.product.findUnique({
    where: { slug: "single-flower-headband" },
    include: { images: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
  });
  if (!p) {
    console.log("MISSING");
    return;
  }
  console.log("id", p.id, "title", p.title, "published", p.isPublished);
  p.images.forEach((im, i) => {
    console.log(
      String(i + 1).padStart(2),
      im.isPrimary ? "*" : " ",
      "sort=" + im.sortOrder,
      im.url,
      "|",
      (im.altText || "").slice(0, 60),
    );
  });
  console.log("count", p.images.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
