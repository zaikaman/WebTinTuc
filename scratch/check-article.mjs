import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabaseAdmin
    .from('articles')
    .select('id, title, summary, search_vector')
    .ilike('title', '%Đầu tư hạ tầng Logistics%');

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log("Matched article:", JSON.stringify(data, null, 2));
}

check();
