import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envContent = fs.readFileSync(path.resolve('.env.local'), 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
  if (match) {
    const key = match[1].trim();
    let val = match[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1);
    }
    env[key] = val;
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// Define selection fields mimicking ARTICLE_SELECT
const ARTICLE_SELECT = `
  id,
  title,
  slug,
  summary,
  thumbnail_key,
  published_at,
  created_at,
  category_id,
  categories (
    id,
    name,
    slug
  )
`;

async function searchArticles(queryText, page = 1, limit = 10) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  if (queryText.trim().length >= 2) {
    console.log(`Executing textSearch for "${queryText}"...`);
    const { data, error, count } = await supabase
      .from('articles')
      .select(ARTICLE_SELECT, { count: 'exact' })
      .textSearch('search_vector', queryText, { type: 'plain', config: 'simple' })
      .eq('status', 'published')
      .is('deleted_at', null)
      .range(from, to);

    if (error) {
      console.error("TextSearch Error:", error);
      return null;
    }
    return { items: data || [], count };
  }

  console.log(`Executing fallback ilike for "${queryText}"...`);
  const { data, error, count } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT, { count: 'exact' })
    .or(`title.ilike.%${queryText}%,summary.ilike.%${queryText}%`)
    .eq('status', 'published')
    .is('deleted_at', null)
    .range(from, to);

  if (error) {
    console.error("Fallback search Error:", error);
    return null;
  }
  return { items: data || [], count };
}

async function main() {
  const { data: allArticles } = await supabase.from('articles').select('id, title, search_vector');
  console.log("All Articles in database with search_vector:");
  allArticles.forEach(a => {
    console.log(`- [ID: ${a.id}] Title: "${a.title}" -> search_vector: ${JSON.stringify(a.search_vector)}`);
  });

  const query = "Đường";
  console.log(`\nSearching database for: "${query}"`);
  const res = await searchArticles(query);
  if (res) {
    console.log(`Found count: ${res.count}`);
    console.log("Items:");
    res.items.forEach(item => {
      console.log(`- [ID: ${item.id}] Title: "${item.title}"`);
    });
  }
}

main();
