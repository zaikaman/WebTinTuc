import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const queryText = "thể thao";
  const normalizedQuery = "the thao";

  console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

  // Test 1: Fetch matching categories
  const { data: categories, error: catError } = await supabaseAdmin
    .from('categories')
    .select('id, name')
    .is('deleted_at', null)
    .eq('status', 'active');

  if (catError) {
    console.error("Category fetch error:", catError);
    return;
  }

  const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().trim();
  const normQuery = normalize(queryText);
  const matchedCategoryIds = (categories ?? [])
    .filter(c => normalize(c.name).includes(normQuery) || normQuery.includes(normalize(c.name)))
    .map(c => c.id);

  console.log("Matched category IDs for 'thể thao':", matchedCategoryIds);

  // Test 2: Try .or() with plfts
  try {
    const { data: articles, error: artError } = await supabaseAdmin
      .from('articles')
      .select('id, title, category_id, categories(name)')
      .or(`search_vector.plfts.${normalizedQuery},category_id.in.(${matchedCategoryIds.join(',')})`)
      .eq('status', 'published')
      .is('deleted_at', null)
      .limit(5);

    if (artError) {
      console.error("Articles .or error:", artError);
    } else {
      console.log("Articles matched via .or:", articles?.map(a => ({ id: a.id, title: a.title, category: a.categories })));
    }
  } catch (e) {
    console.error("Exception in test 2:", e);
  }
}

test();
