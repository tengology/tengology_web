-- Who a piece is for: "HER" or "HIM". A third axis alongside the material
-- family and the type, so it composes with both. Nullable, and no backfill:
-- an unclassified piece stays out of the gift filters rather than being
-- guessed at.
ALTER TABLE "Product" ADD COLUMN "audience" TEXT;

CREATE INDEX "Product_isPublished_subcategory_audience_idx"
  ON "Product"("isPublished", "subcategory", "audience");
