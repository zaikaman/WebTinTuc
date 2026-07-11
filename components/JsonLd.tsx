import { serializeJsonLd } from "@/lib/utils";

/**
 * Renders JSON-LD structured data safely for <script type="application/ld+json">.
 * Escapes `<` in the serialized payload to prevent script-tag breakout.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
