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

// Check if a string has diacritics/accents
function hasAccents(str) {
  return normalize(str) !== str.toLowerCase();
}

function wordMatches(queryWord, docWord) {
  const qw = queryWord.toLowerCase();
  const dw = docWord.toLowerCase();

  if (hasAccents(queryWord)) {
    // Accent-sensitive match
    return qw === dw;
  } else {
    // Accent-insensitive match
    return normalize(qw) === normalize(dw);
  }
}

function matchesTextStrict(text, query) {
  const normText = normalize(text);
  const normQuery = normalize(query);

  if (!normText.includes(normQuery)) {
    return false;
  }

  // Tokenize original text and query into words (preserving case/accents)
  const queryWords = query.split(/\s+/).filter(Boolean);
  const docWords = text.split(/[\s,.:;!?"()\-–—_]+/);

  // We want to verify that for each word in the query, there is a matching word in the document at the correct matched position
  // Or simply, that every word in the query matches at least one word in the document under our matching rules.
  return queryWords.every(qw => {
    return docWords.some(dw => wordMatches(qw, dw));
  });
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

  const queryWords = query.split(/\s+/).filter(Boolean);

  const filtered = articles.filter(a => {
    // 1. If category matches, always keep
    const normCategory = normalize(a.categories?.name || "");
    if (normCategory.includes(normalizedQuery) || normalizedQuery.includes(normCategory)) {
      return true;
    }

    // 2. Strict matching on Title or Summary
    const titleMatches = queryWords.every(qw => {
      const docWords = (a.title || "").split(/[\s,.:;!?"()\-–—_]+/);
      return docWords.some(dw => wordMatches(qw, dw));
    });

    const summaryMatches = queryWords.every(qw => {
      const docWords = (a.summary || "").split(/[\s,.:;!?"()\-–—_]+/);
      return docWords.some(dw => wordMatches(qw, dw));
    });

    return titleMatches || summaryMatches;
  });

  console.log("Filtered matches (accent-aware & word-boundary):", filtered.map(a => a.title));
}

async function test() {
  await runSearch("giải");
  await runSearch("giai");
  await runSearch("hà nội");
}

test();
