import { supabaseAdmin } from '../config/supabase';
import type { User } from '../types/models';

export class UserRepository {
  // Find a user by their phone number
  // Find a user by their phone number or email address
  // Used during login to fetch the user and verify password
  async findByPhone(phoneOrEmail: string): Promise<User | null> {
    const cleaned = phoneOrEmail.trim().toLowerCase();
    const { data, error } = await (supabaseAdmin
      .from('users') as any)
      .select('*')
      .or(`email.eq.${cleaned},phone.eq.${cleaned}`)
      .single();

    if (error || !data) return null;
    return data as User;
  }

  // Find a user by their UUID
  // Used by the /me endpoint and middleware
  async findById(userId: string): Promise<User | null> {
    const { data, error } = await (supabaseAdmin
      .from('users') as any)
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;
    return data as User;
  }

  // Create a new user row
  // Returns the created user including the generated user_id
 async create(input: {
  name: string;
  phone: string;
  email?: string;
  password_hash: string;
  role: string;
}): Promise<User> {
  const { data, error } = await (supabaseAdmin
    .from('users') as any)
    .insert([input] as any)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to create user');
  }
  return data as User;
}

  // Check if a phone number already exists
  // Used during registration to prevent duplicates
  async existsByPhone(phone: string): Promise<boolean> {
    const { count, error } = await (supabaseAdmin
      .from('users') as any)
      .select('*', { count: 'exact', head: true })
      .eq('phone', phone);

    if (error) return false;
    return (count ?? 0) > 0;
  }
}

// Export a singleton instance
// Every service that needs user DB access imports this one instance
export const userRepository = new UserRepository();