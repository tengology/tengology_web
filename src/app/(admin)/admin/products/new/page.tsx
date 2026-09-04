"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AiListingAssistant } from "@/components/admin/AiListingAssistant";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  AUDIENCE_KEYS,
  AUDIENCE_LABELS,
  CATEGORIES,
  CATEGORY_LIST,
  INTENTIONS,
  SUBCATEGORY_LABELS,
  UNCATEGORISED,
  isCategoryKey,
  isSubcategoryKey,
} from "@/lib/taxonomy";

// Material family, then product type — the same two levels the shop navigates.
const categories = [
  ...CATEGORY_LIST.map((c) => ({ value: c.key, label: c.label })),
  { value: UNCATEGORISED, label: "Other (hidden from shop)" },
];

const intentions = INTENTIONS;

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    shortDescription: "",
    fullDescription: "",
    category: UNCATEGORISED,
    subcategory: "",
    materials: "",
    tags: "",
    price: "",
    compareAtPrice: "",
    stockCount: "0",
    collection: "",
    intention: "",
    audience: "",
    isPublished: false,
    isFeatured: false,
    metaTitle: "",
    metaDescription: "",
    focusKeyword: "",
  });

  const update = (field: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  /** Types and intentions are family-specific, so both reset when it changes. */
  const updateCategory = (value: string) =>
    setForm((f) => ({ ...f, category: value, subcategory: "", intention: "" }));

  const family = isCategoryKey(form.category) ? CATEGORIES[form.category] : null;

  const handleAiGenerated = (data: {
    title: string;
    shortDescription: string;
    fullDescription: string;
    tags: string[];
    materials: string[];
    suggestedCategory: string;
    suggestedSubcategory?: string;
    metaTitle: string;
    metaDescription: string;
    focusKeyword: string;
  }) => {
    // The model is asked for taxonomy keys but is not bound to them, so an
    // unrecognised suggestion is dropped rather than written into the product.
    const suggestedCategory = isCategoryKey(data.suggestedCategory)
      ? data.suggestedCategory
      : null;
    const suggestedSubcategory =
      suggestedCategory &&
      isSubcategoryKey(data.suggestedSubcategory) &&
      CATEGORIES[suggestedCategory].subcategories.includes(data.suggestedSubcategory)
        ? data.suggestedSubcategory
        : null;

    setForm((f) => ({
      ...f,
      title: data.title || f.title,
      shortDescription: data.shortDescription || f.shortDescription,
      fullDescription: data.fullDescription || f.fullDescription,
      category: suggestedCategory ?? f.category,
      subcategory: suggestedSubcategory ?? (suggestedCategory ? "" : f.subcategory),
      materials: data.materials?.join(", ") || f.materials,
      tags: data.tags?.join(", ") || f.tags,
      metaTitle: data.metaTitle || f.metaTitle,
      metaDescription: data.metaDescription || f.metaDescription,
      focusKeyword: data.focusKeyword || f.focusKeyword,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          subcategory: form.subcategory || null,
          intention: form.intention || null,
          audience: form.audience || null,
          price: parseFloat(form.price),
          compareAtPrice: form.compareAtPrice
            ? parseFloat(form.compareAtPrice)
            : null,
          stockCount: parseInt(form.stockCount),
          materials: form.materials
            .split(",")
            .map((m) => m.trim())
            .filter(Boolean),
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      const { id } = await res.json();
      router.push(`/admin/products/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
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
        <h1 className="font-heading text-2xl font-light">New Product</h1>
      </div>

      {/* AI Assistant */}
      <div className="mb-8">
        <AiListingAssistant onGenerated={handleAiGenerated} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Basic info */}
        <div className="space-y-4">
          <h2 className="text-xs tracking-[0.15em] uppercase font-medium">
            Product Details
          </h2>

          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              required
              maxLength={80}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {form.title.length}/80
            </p>
          </div>

          <div>
            <Label htmlFor="shortDescription">Short Description</Label>
            <Input
              id="shortDescription"
              value={form.shortDescription}
              onChange={(e) => update("shortDescription", e.target.value)}
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {form.shortDescription.length}/160
            </p>
          </div>

          <div>
            <Label htmlFor="fullDescription">Full Description</Label>
            <Textarea
              id="fullDescription"
              value={form.fullDescription}
              onChange={(e) => update("fullDescription", e.target.value)}
              rows={6}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Material</Label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => updateCategory(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="collection">Collection (optional)</Label>
              <Input
                id="collection"
                value={form.collection}
                onChange={(e) => update("collection", e.target.value)}
                placeholder="e.g. Bloom & Blossom"
              />
            </div>
          </div>

          {family && (
            <div>
              <Label htmlFor="subcategory">Type</Label>
              <select
                id="subcategory"
                value={form.subcategory}
                onChange={(e) => update("subcategory", e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
              >
                <option value="">Select type...</option>
                {family.subcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {SUBCATEGORY_LABELS[sub]}
                  </option>
                ))}
              </select>
            </div>
          )}

          {form.subcategory === "JEWELLERY" && (
            <div>
              <Label htmlFor="audience">Shopping for (optional)</Label>
              <select
                id="audience"
                value={form.audience}
                onChange={(e) => update("audience", e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
              >
                <option value="">Not classified</option>
                {AUDIENCE_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {AUDIENCE_LABELS[key]}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                Drives the For Her / For Him filter. Left blank, the piece shows
                under &ldquo;Everyone&rdquo; but under neither side of the split.
              </p>
            </div>
          )}

          {family?.hasIntentions && (
            <div>
              <Label htmlFor="intention">Intention (optional)</Label>
              <select
                id="intention"
                value={form.intention}
                onChange={(e) => update("intention", e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
              >
                <option value="">Select intention...</option>
                {intentions.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <Label htmlFor="materials">
              Materials (comma-separated)
            </Label>
            <Input
              id="materials"
              value={form.materials}
              onChange={(e) => update("materials", e.target.value)}
              placeholder="e.g. wool felt, wood, metal clip"
            />
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Textarea
              id="tags"
              value={form.tags}
              onChange={(e) => update("tags", e.target.value)}
              rows={2}
              placeholder="e.g. hair clip, handmade, wool felt, kids accessories"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {form.tags.split(",").filter((t) => t.trim()).length}/13 tags
            </p>
          </div>
        </div>

        {/* Pricing & stock */}
        <div className="space-y-4 border-t pt-6">
          <h2 className="text-xs tracking-[0.15em] uppercase font-medium">
            Pricing & Stock
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">Price (&pound;)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="compareAtPrice">
                Compare at Price (&pound;)
              </Label>
              <Input
                id="compareAtPrice"
                type="number"
                step="0.01"
                min="0"
                value={form.compareAtPrice}
                onChange={(e) => update("compareAtPrice", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="stockCount">Stock Count</Label>
              <Input
                id="stockCount"
                type="number"
                min="0"
                value={form.stockCount}
                onChange={(e) => update("stockCount", e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="space-y-4 border-t pt-6">
          <h2 className="text-xs tracking-[0.15em] uppercase font-medium">
            SEO
          </h2>
          <div>
            <Label htmlFor="metaTitle">Meta Title</Label>
            <Input
              id="metaTitle"
              value={form.metaTitle}
              onChange={(e) => update("metaTitle", e.target.value)}
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {form.metaTitle.length}/60
            </p>
          </div>
          <div>
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea
              id="metaDescription"
              value={form.metaDescription}
              onChange={(e) => update("metaDescription", e.target.value)}
              maxLength={160}
              rows={2}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {form.metaDescription.length}/160
            </p>
          </div>
          <div>
            <Label htmlFor="focusKeyword">Focus Keyword</Label>
            <Input
              id="focusKeyword"
              value={form.focusKeyword}
              onChange={(e) => update("focusKeyword", e.target.value)}
            />
          </div>
        </div>

        {/* Publish options */}
        <div className="space-y-3 border-t pt-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => update("isPublished", e.target.checked)}
              className="rounded border-input"
            />
            <span className="text-sm">Publish to storefront</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => update("isFeatured", e.target.checked)}
              className="rounded border-input"
            />
            <span className="text-sm">Feature on homepage</span>
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={saving}
            className="text-xs tracking-[0.1em] uppercase"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Product"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
