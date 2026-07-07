import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const query1 = "the thao";
  const query2 = "ha noi";
  const query3 = "marathon 2026";

  const runSearch = async (label, q, type) => {
    const { data, error } = await supabaseAdmin
      .from('articles')
      .select('id, title, categories(name)')
      .textSearch('search_vector', q, { type, config: 'simple' })
      .eq('status', 'published')
      .is('deleted_at', null)
      .limit(5);

    if (error) {
      console.error(`${label} error:`, error);
    } else {
      console.log(`${label} (${type}):`, data.map(a => a.title));
    }
  };

  await runSearch("Query: the thao", query1, "phrase");
  await runSearch("Query: the thao", query1, "plain");

  await runSearch("Query: ha noi", query2, "phrase");
  await runSearch("Query: ha noi", query2, "plain");

  await runSearch("Query: marathon 2026", query3, "phrase");
  await runSearch("Query: marathon 2026", query3, "plain");
}

test();
