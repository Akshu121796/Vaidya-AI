import { supabaseAdmin } from './src/config/supabase';
import bcrypt from 'bcryptjs';

const CREDENTIALS: Record<string, { email: string; password: string }> = {
  "9876543210": { email: "patient@vaidya.ai", password: "patient123" },
  "9876543250": { email: "patient2@vaidya.ai", password: "patient123" },
  "9876543211": { email: "doctor@vaidya.ai", password: "doctor123" },
  "9876543212": { email: "pharmacy@vaidya.ai", password: "pharmacy123" },
  "9876543298": { email: "asha@vaidya.ai", password: "asha123" },
  "9876543299": { email: "admin@vaidya.ai", password: "admin123" },
  "9999999999": { email: "admin2@vaidya.ai", password: "admin123" }
};

async function resetPasswords() {
  console.log("Fetching users from database...");
  const { data: users, error } = await supabaseAdmin
    .from('users')
    .select('user_id, phone, role');

  if (error || !users) {
    console.error("Error fetching users:", error);
    return;
  }

  console.log(`Found ${users.length} users. Resetting emails and passwords...`);

  for (const user of users) {
    const creds = CREDENTIALS[user.phone];
    if (creds) {
      const password_hash = await bcrypt.hash(creds.password, 10);
      const email = creds.email;

      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ email, password_hash } as any)
        .eq('user_id', user.user_id);

      if (updateError) {
        console.error(`Failed to update user ${user.phone}:`, updateError);
      } else {
        console.log(`Updated ${user.phone} (${user.role}) -> Email: "${email}", Password: "${creds.password}"`);
      }
    } else {
      console.log(`No credentials defined for phone number: ${user.phone} - skipping.`);
    }
  }

  console.log("Credentials sync complete!");
}

resetPasswords();
