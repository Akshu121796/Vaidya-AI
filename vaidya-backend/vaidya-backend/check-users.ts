import { supabaseAdmin } from './src/config/supabase';

async function checkUsers() {
  console.log("Fetching users from Supabase...");
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('user_id, name, phone, email, role, is_active');
  
  if (error) {
    console.error("Error fetching users:", error);
    return;
  }
  
  console.log(`Found ${data?.length || 0} user(s):`);
  console.log(JSON.stringify(data, null, 2));
}

checkUsers();
