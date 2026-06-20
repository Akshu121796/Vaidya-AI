import { supabaseAdmin } from '../config/supabase';

export class MedicineRepository {
  // Search medicines by name or generic name across all pharmacies
  async search(name: string, villageId?: string) {
    let query = (supabaseAdmin
      .from('medicines') as any)
      .select(`
        *,
        pharmacies (
          pharmacy_id,
          name,
          village_id,
          phone,
          latitude,
          longitude
        )
      `)
      .or(`name.ilike.%${name}%,generic_name.ilike.%${name}%`)
      .gt('quantity', 0) // only show medicines that are in stock
      .order('quantity', { ascending: false });

    const { data, error } = await query;

    if (error || !data) return [];
    return data;
  }

  async findByPharmacyId(pharmacyId: string) {
    const { data, error } = await (supabaseAdmin
      .from('medicines') as any)
      .select('*')
      .eq('pharmacy_id', pharmacyId)
      .order('name', { ascending: true });

    if (error || !data) return [];
    return data;
  }

  async findById(medicineId: string) {
    const { data, error } = await (supabaseAdmin
      .from('medicines') as any)
      .select('*')
      .eq('medicine_id', medicineId)
      .single();

    if (error || !data) return null;
    return data;
  }

  async create(input: {
    pharmacy_id: string;
    name: string;
    generic_name?: string;
    quantity: number;
    price?: number;
  }) {
    const { data, error } = await (supabaseAdmin
      .from('medicines') as any)
      .insert([input])
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to add medicine');
    }
    return data;
  }

  async update(
    medicineId: string,
    input: {
      quantity?: number;
      price?: number;
      generic_name?: string;
    }
  ) {
    const updateData: Record<string, unknown> = {};
    if (input.quantity !== undefined) updateData['quantity'] = input.quantity;
    if (input.price !== undefined) updateData['price'] = input.price;
    if (input.generic_name !== undefined) updateData['generic_name'] = input.generic_name;

    const { data, error } = await (supabaseAdmin
      .from('medicines') as any)
      .update(updateData)
      .eq('medicine_id', medicineId)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to update medicine');
    }
    return data;
  }

  // Find pharmacy linked to a user
  async findPharmacyByUserId(userId: string) {
    const { data, error } = await (supabaseAdmin
      .from('pharmacies') as any)
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;
    return data;
  }
}

export const medicineRepository = new MedicineRepository();