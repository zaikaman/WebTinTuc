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

function hasAccents(str) {
  return normalize(str) !== str.toLowerCase();
}

function matchesTitleStrict(title, query) {
  const normTitle = normalize(title);
  const normQuery = normalize(query);

  if (!normTitle.includes(normQuery)) {
    return false;
  }

  if (hasAccents(query)) {
    // If the query has accents, the title must contain the query accent-sensitively
    return title.toLowerCase().includes(query.toLowerCase());
  }

  return true;
}

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

  const filtered = articles.filter(a => {
    // 1. If category matches, always keep
    const normCategory = normalize(a.categories?.name || "");
    if (normCategory.includes(normalizedQuery) || normalizedQuery.includes(normCategory)) {
      return true;
    }

    // 2. Strict matching on Title only
    return matchesTitleStrict(a.title || "", query);
  });

  console.log("Filtered matches (Title only & contiguous):", filtered.map(a => a.title));
}

async function test() {
  await runSearch("kết");
  await runSearch("giải");
  await runSearch("hà nội");
}

test();
