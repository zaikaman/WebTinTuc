import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const normalize = (str) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();

async function runSearch(query) {
  const normalizedQuery = normalize(query);
  console.log("\nSearching for:", query);

  const { data: articles, error } = await supabaseAdmin
    .from('articles')
    .select('id, title, summary, categories(name)')
    .textSearch('search_vector', normalizedQuery, { type: 'plain', config: 'simple' })
    .eq('status', 'published')
    .is('deleted_at', null);

  if (error) {
    console.error(error);
    return;
  }

  const queryWords = normalizedQuery.split(/\s+/).filter(Boolean);

  const filtered = articles.filter(a => {
    const normTitle = normalize(a.title || "");
    const normSummary = normalize(a.summary || "");
    const normCategory = normalize(a.categories?.name || "");

    // 1. If category matches, always keep
    if (normCategory.includes(normalizedQuery) || normalizedQuery.includes(normCategory)) {
      return true;
    }

    // 2. If it's a single word, FTS is already sufficient
    if (queryWords.length <= 1) {
      return true;
    }

    // 3. For multi-word queries:
    // Check if the exact phrase is a substring of the title or summary
    if (normTitle.includes(normalizedQuery) || normSummary.includes(normalizedQuery)) {
      return true;
    }

    // Check if all query words are present as whole words in the title
    const allInTitle = queryWords.every(word => new RegExp(`\\b${word}\\b`).test(normTitle));
    if (allInTitle) return true;

    // Check if all query words are present as whole words in the summary
    const allInSummary = queryWords.every(word => new RegExp(`\\b${word}\\b`).test(normSummary));
    if (allInSummary) return true;

    return false;
  });

  console.log("Filtered matches:", filtered.map(a => a.title));
}

async function test() {
  await runSearch("ha noi");
  await runSearch("the thao");
  await runSearch("marathon 2026");
}

test();
