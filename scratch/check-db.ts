import { supabaseAdmin } from '../lib/supabase/admin';

async function run() {
  console.log("Checking profiles table...");
  try {
    const { data, error } = await supabaseAdmin.from('profiles').select('*').limit(5);
    if (error) {
      console.error("Error querying profiles:", error);
    } else {
      console.log("Profiles data:", JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error("Exception querying profiles:", err);
  }

  console.log("Checking auth.users...");
  try {
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    if (usersError) {
      console.error("Error listing users:", usersError);
    } else {
      console.log("Users listing count:", users.users.length);
      console.log("Sample users:", JSON.stringify(users.users.slice(0, 2).map(u => ({ id: u.id, email: u.email, user_metadata: u.user_metadata })), null, 2));
    }
  } catch (err) {
    console.error("Exception listing users:", err);
  }
}

run();
