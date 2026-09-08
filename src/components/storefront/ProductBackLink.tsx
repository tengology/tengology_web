"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function ProductBackLink({ href }: { href: string }) {
  const router = useRouter();

  return (
    <Link
      href={href}
      className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-sm px-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4"
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (window.history.length > 1) {
          event.preventDefault();
          router.back();
        }
      }}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Back
    </Link>
  );
}
