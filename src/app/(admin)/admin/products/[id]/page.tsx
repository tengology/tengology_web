import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";
import { ArrowLeft } from "lucide-react";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { sortOrder: "asc" } },
      seo: true,
      tags: { include: { tag: true } },
    },
  });

  if (!product) {
    notFound();
  }

  const initial = {
    title: product.title,
    shortDescription: product.shortDescription ?? "",
    fullDescription: product.fullDescription ?? "",
    category: product.category,
    subcategory: product.subcategory ?? "",
    materials: product.materials,
    tags: product.tags.map((pt) => pt.tag.name).join(", "),
    price: String(product.price),
    compareAtPrice:
      product.compareAtPrice != null ? String(product.compareAtPrice) : "",
    stockCount: String(product.stockCount),
    collection: product.collection ?? "",
    intention: product.intention ?? "",
    isPublished: product.isPublished,
    isFeatured: product.isFeatured,
    metaTitle: product.seo?.metaTitle ?? "",
    metaDescription: product.seo?.metaDescription ?? "",
    focusKeyword: product.seo?.focusKeyword ?? "",
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/products"
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-heading text-2xl font-light">Edit Product</h1>
      </div>

      <ProductForm initial={initial} productId={product.id} />
    </div>
  );
}
