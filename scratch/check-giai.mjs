import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabaseAdmin
    .from('articles')
    .select('id, title, summary, search_vector')
    .or('title.ilike.%đường sắt%,title.ilike.%vi xử lý%');

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log("Matched articles:", JSON.stringify(data, null, 2));
}

check();
