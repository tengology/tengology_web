import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/format";

const fullInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  variants: { orderBy: { sortOrder: "asc" as const } },
  seo: true,
  tags: { include: { tag: true } },
};

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: fullInclude,
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const body = await request.json();

  const {
    title,
    shortDescription,
    fullDescription,
    category,
    subcategory,
    materials,
    tags,
    price,
    compareAtPrice,
    stockCount,
    collection,
    intention,
    isPublished,
    isFeatured,
    metaTitle,
    metaDescription,
    focusKeyword,
    images,
    variants,
  } = body;

  if (!title || !price) {
    return NextResponse.json(
      { error: "Title and price are required" },
      { status: 400 }
    );
  }

  // Regenerate slug only if the title changed and the new slug is free
  let slug = existing.slug;
  if (title !== existing.title) {
    const newSlug = slugify(title);
    if (newSlug && newSlug !== existing.slug) {
      const taken = await prisma.product.findUnique({
        where: { slug: newSlug },
      });
      if (!taken || taken.id === id) {
        slug = newSlug;
      }
    }
  }

  await prisma.product.update({
    where: { id },
    data: {
      slug,
      title,
      shortDescription: shortDescription || null,
      fullDescription: fullDescription || null,
      category: category || "OTHER",
      subcategory: subcategory || null,
      materials: Array.isArray(materials)
        ? materials.join(", ")
        : materials || "",
      price,
      compareAtPrice: compareAtPrice || null,
      stockCount: stockCount || 0,
      collection: collection || null,
      intention: intention || null,
      isPublished: isPublished || false,
      isFeatured: isFeatured || false,
      seo: {
        upsert: {
          create: {
            metaTitle: metaTitle || null,
            metaDescription: metaDescription || null,
            focusKeyword: focusKeyword || null,
          },
          update: {
            metaTitle: metaTitle || null,
            metaDescription: metaDescription || null,
            focusKeyword: focusKeyword || null,
          },
        },
      },
    },
  });

  // Reconcile tags: clear then re-link by name (mirrors the POST route)
  await prisma.productTag.deleteMany({ where: { productId: id } });
  if (Array.isArray(tags) && tags.length) {
    for (const tagName of tags) {
      const tagSlug = slugify(tagName);
      if (!tagSlug) continue;

      const tag = await prisma.tag.upsert({
        where: { slug: tagSlug },
        create: { name: tagName, slug: tagSlug },
        update: {},
      });

      await prisma.productTag.create({
        data: { productId: id, tagId: tag.id },
      });
    }
  }

  // Reconcile images only when the payload includes them
  if (Array.isArray(images)) {
    await prisma.productImage.deleteMany({ where: { productId: id } });
    for (const [index, image] of images.entries()) {
      if (!image?.url) continue;
      await prisma.productImage.create({
        data: {
          productId: id,
          url: image.url,
          altText: image.altText || null,
          sortOrder: image.sortOrder ?? index,
          isPrimary: image.isPrimary ?? index === 0,
          cloudinaryId: image.cloudinaryId || null,
        },
      });
    }
  }

  // Reconcile variants only when the payload includes them
  if (Array.isArray(variants)) {
    await prisma.productVariant.deleteMany({ where: { productId: id } });
    for (const [index, variant] of variants.entries()) {
      if (!variant?.name) continue;
      await prisma.productVariant.create({
        data: {
          productId: id,
          name: variant.name,
          sortOrder: variant.sortOrder ?? index,
          stockCount: variant.stockCount ?? 1,
          imageUrl: variant.imageUrl || null,
        },
      });
    }
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: fullInclude,
  });

  return NextResponse.json(product);
}

export async function DELETE(
  _request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { _count: { select: { orderItems: true } } },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (product._count.orderItems > 0) {
    // Products referenced by orders cannot be hard-deleted; archive instead
    await prisma.product.update({
      where: { id },
      data: { isArchived: true, isPublished: false },
    });
    return NextResponse.json({ archived: true });
  }

  await prisma.product.delete({ where: { id } });

  return NextResponse.json({ deleted: true });
}
