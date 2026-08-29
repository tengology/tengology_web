import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/lib/auth";
import { CATEGORY_KEYS, SUBCATEGORY_KEYS, UNCATEGORISED } from "@/lib/taxonomy";

const anthropic = new Anthropic();

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { description } = await request.json();

  if (!description?.trim()) {
    return NextResponse.json(
      { error: "Please provide a product description" },
      { status: 400 }
    );
  }

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are a product listing assistant for Tengology, a small handmade goods business based in the UK. They work in three materials — natural crystal, wool felt, and Indonesian batik fabric — making jewellery, hair accessories, brooches, and ornaments. Every piece is unique and handmade.

Write warm, engaging, and accurate product listings that appeal to customers looking for high-end handmade items. The tone should be elegant but approachable.

Generate a product listing based on this description:
"${description}"

Return ONLY valid JSON (no markdown, no backticks) with these fields:
{
  "title": "product title, max 80 characters",
  "shortDescription": "one-line summary, max 160 characters",
  "fullDescription": "2-3 paragraphs describing the item, its materials, craftsmanship, and how it can be worn/used",
  "tags": ["array of up to 13 relevant tags for Etsy SEO"],
  "materials": ["array of materials used"],
  "suggestedCategory": "the material family, one of: ${CATEGORY_KEYS.join(", ")}, or ${UNCATEGORISED} if none fit. A batik flower backed onto felt is BATIK — the batik is what the piece is about",
  "suggestedSubcategory": "what the piece is, one of: ${SUBCATEGORY_KEYS.join(", ")}",
  "metaTitle": "SEO title, max 60 characters",
  "metaDescription": "SEO description, max 160 characters",
  "focusKeyword": "primary SEO keyword"
}`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  try {
    const listing = JSON.parse(text);
    return NextResponse.json(listing);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse AI response", raw: text },
      { status: 500 }
    );
  }
}
