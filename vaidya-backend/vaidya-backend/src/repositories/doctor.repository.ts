import { supabaseAdmin } from '../config/supabase';
import type { Doctor } from '../types/models';

export class DoctorRepository {
  async create(input: {
  user_id: string;
  specialization: string;
  hospital_id?: string;
  qualification?: string;
}): Promise<Doctor> {
  const { data, error } = await (supabaseAdmin
    .from('doctors') as any)
    .insert([input])
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to create doctor');
  }
  return data as Doctor;
}

  async findById(doctorId: string): Promise<Doctor | null> {
    const { data, error } = await (supabaseAdmin
      .from('doctors') as any)
      .select(`
        *,
        users (name, phone, email),
        hospitals (name, address, village_id)
      `)
      .eq('doctor_id', doctorId)
      .single();

    if (error || !data) return null;
    return data as unknown as Doctor;
  }

  async findByUserId(userId: string): Promise<Doctor | null> {
    const { data, error } = await (supabaseAdmin
      .from('doctors') as any)
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;
    return data as Doctor;
  }

  async findAll(filters: {
    specialization?: string;
    available?: boolean;
    villageId?: string;
  }): Promise<Doctor[]> {
    let query = (supabaseAdmin
      .from('doctors') as any)
      .select(`
        *,
        users (name, phone),
        hospitals (name, address, village_id)
      `);

    if (filters.specialization) {
      query = query.ilike('specialization', `%${filters.specialization}%`);
    }

    if (filters.available !== undefined) {
      query = query.eq('is_available', filters.available);
    }

    const { data, error } = await query.order('is_available', {
      ascending: false,
    });

    if (error || !data) return [];
    return data as unknown as Doctor[];
  }

  async updateAvailability(
  doctorId: string,
  isAvailable: boolean,
  avgWaitMinutes?: number
): Promise<Doctor> {
  const updateData: Record<string, unknown> = {};
  updateData['is_available'] = isAvailable;
  if (avgWaitMinutes !== undefined) {
    updateData['avg_wait_minutes'] = avgWaitMinutes;
  }

  const { data, error } = await (supabaseAdmin
    .from('doctors') as any)
    .update(updateData)
    .eq('doctor_id', doctorId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to update availability');
  }
  return data as Doctor;
}

  async findAppointments(doctorId: string) {
    const { data, error } = await (supabaseAdmin
      .from('appointments') as any)
      .select(`
        *,
        patients (
          patient_id,
          qr_token,
          gender,
          date_of_birth,
          users (name, phone)
        )
      `)
      .eq('doctor_id', doctorId)
      .order('scheduled_at', { ascending: true });

    if (error || !data) return [];
    return data;
  }
}

export const doctorRepository = new DoctorRepository();