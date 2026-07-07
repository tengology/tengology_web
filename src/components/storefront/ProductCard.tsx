import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  slug: string;
  title: string;
  price: number | string;
  compareAtPrice?: number | string | null;
  image?: string | null;
  category?: string;
}

export function ProductCard({
  slug,
  title,
  price,
  compareAtPrice,
  image,
}: ProductCardProps) {
  return (
    <Link href={`/product/${slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 [transition-timing-function:var(--ease-soft)] motion-safe:group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/30">
            <span className="font-heading text-4xl">T</span>
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3 border-t pt-3">
        <h3 className="font-heading text-lg leading-tight transition-colors duration-200 group-hover:text-moss">
          {title}
        </h3>
        <p className="shrink-0 text-sm">
          <span className={cn(compareAtPrice && "text-moss-dark")}>
            {formatPrice(price)}
          </span>
          {compareAtPrice && (
            <span className="ml-2 text-xs text-muted-foreground line-through">
              {formatPrice(compareAtPrice)}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
