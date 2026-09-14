import { config } from "dotenv";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

config({ path: ".env.local", quiet: true });
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  await prisma.$transaction(async (tx) => {
    const cat = await tx.product.findUniqueOrThrow({ where: { slug: "heart-rose-plush-hair-clip" }, include: { images: true } });
    for (const img of cat.images) {
      if (/\/products\/cat-ear-rose\/img_\d+\.webp$/.test(img.url)) {
        await tx.productImage.update({ where: { id: img.id }, data: { url: img.url.replace(".webp", "-full.webp") } });
      }
    }
    const brooch = await tx.product.update({
      where: { slug: "woodland-toadstool-felt-brooch" },
      data: {
        shortDescription: "A handmade woodland brooch with spotted toadstools, a daisy, acorns and pinecones. Felt-ball colours vary and are selected at random.",
        fullDescription: "A little woodland scene to pin to your coat, scarf or bag: red spotted toadstools, a white daisy, felt-filled acorn caps, tiny pinecones and layered leaves, finished with a brooch pin.\n\nEach brooch has its own mix of felt-ball colours, so the piece you receive may differ from the photographs. Colours are selected at random when your order is packed.\n\nIf you have a colour preference, please contact us before ordering. We will do our best to help, but requests depend on availability and cannot be guaranteed.\n\nPrice is for one brooch. Handmade in Oxford.",
      },
      include: { images: true },
    });
    let nextOrder = Math.max(-1, ...brooch.images.map((img) => img.sortOrder)) + 1;
    for (const [number, altText] of [
      [9624, "Three woodland toadstool felt brooches showing different felt-ball and acorn colours"],
      [9625, "Close-up of a woodland toadstool felt brooch with a daisy and felt-filled acorn caps"],
    ] as const) {
      const existing = brooch.images.find((img) => img.url.includes(`img_${number}`));
      const url = `/products/sept8-2026/img_${number}-full.webp`;
      if (existing) await tx.productImage.update({ where: { id: existing.id }, data: { url, altText } });
      else await tx.productImage.create({ data: { productId: brooch.id, url, altText, sortOrder: nextOrder++, isPrimary: false } });
    }
  });
  for (const slug of ["heart-rose-plush-hair-clip", "woodland-toadstool-felt-brooch"]) {
    console.log(JSON.stringify(await prisma.product.findUnique({ where: { slug }, select: { title: true, fullDescription: true, images: { orderBy: { sortOrder: "asc" }, select: { url: true, isPrimary: true } } } }), null, 2));
  }
}
main().finally(() => prisma.$disconnect());
