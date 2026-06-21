import { supabaseAdmin } from '../config/supabase';
import type { Patient, Prescription } from '../types/models';

export class PatientRepository {
  async create(input: {
    user_id: string;
    village_id?: string;
    blood_group?: string;
    date_of_birth?: string;
    gender?: string;
    allergies?: string[];
  }): Promise<Patient> {
    const { data, error } = await (supabaseAdmin
      .from('patients') as any)
      .insert([input])
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to create patient');
    }
    return data as Patient;
  }

  async findById(patientId: string): Promise<Patient | null> {
    const { data, error } = await (supabaseAdmin
      .from('patients') as any)
      .select('*')
      .eq('patient_id', patientId)
      .single();

    if (error || !data) return null;
    return data as Patient;
  }

  async findByUserId(userId: string): Promise<Patient | null> {
    const { data, error } = await (supabaseAdmin
      .from('patients') as any)
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;
    return data as Patient;
  }

  async findByQrToken(qrToken: string): Promise<Patient | null> {
    const { data, error } = await (supabaseAdmin
      .from('patients') as any)
      .select('*')
      .eq('qr_token', qrToken)
      .single();

    if (error || !data) return null;
    return data as Patient;
  }

  async update(
    patientId: string,
    input: {
      blood_group?: string;
      date_of_birth?: string;
      gender?: string;
      allergies?: string[];
      village_id?: string;
    }
  ): Promise<Patient> {
    const updateData: Record<string, unknown> = {};
    if (input.blood_group !== undefined) updateData['blood_group'] = input.blood_group;
    if (input.date_of_birth !== undefined) updateData['date_of_birth'] = input.date_of_birth;
    if (input.gender !== undefined) updateData['gender'] = input.gender;
    if (input.allergies !== undefined) updateData['allergies'] = input.allergies;
    if (input.village_id !== undefined) updateData['village_id'] = input.village_id;

    const { data, error } = await (supabaseAdmin
      .from('patients') as any)
      .update(updateData)
      .eq('patient_id', patientId)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to update patient');
    }
    return data as Patient;
  }

  async findPrescriptions(patientId: string): Promise<Prescription[]> {
    const { data, error } = await (supabaseAdmin
      .from('prescriptions') as any)
      .select(`
        *,
        doctors (
          doctor_id,
          users (name)
        )
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as Prescription[];
  }

  async findSymptomReports(patientId: string) {
    const { data, error } = await (supabaseAdmin
      .from('symptom_reports') as any)
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data;
  }
}

export const patientRepository = new PatientRepository();