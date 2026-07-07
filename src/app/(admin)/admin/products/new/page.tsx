import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { ArrowLeft } from "lucide-react";

export default function NewProductPage() {
  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/products"
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-heading text-2xl font-light">New Product</h1>
      </div>

      <ProductForm />
    </div>
  );
}
