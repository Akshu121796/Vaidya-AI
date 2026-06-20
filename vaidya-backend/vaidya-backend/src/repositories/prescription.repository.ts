import { supabaseAdmin } from '../config/supabase';
import type { Prescription } from '../types/models';

export class PrescriptionRepository {
  async create(input: {
    appointment_id?: string | null;
    patient_id: string;
    doctor_id: string;
    medicines: any[];
    notes?: string | null;
  }): Promise<Prescription> {
    const { data, error } = await (supabaseAdmin
      .from('prescriptions') as any)
      .insert([
        {
          appointment_id: input.appointment_id || null,
          patient_id: input.patient_id,
          doctor_id: input.doctor_id,
          medicines: input.medicines,
          notes: input.notes || null,
          is_dispensed: false,
        },
      ])
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to create prescription');
    }
    return data as Prescription;
  }

  async findById(prescriptionId: string): Promise<Prescription | null> {
    const { data, error } = await (supabaseAdmin
      .from('prescriptions') as any)
      .select(`
        *,
        doctors (
          doctor_id,
          users (name)
        ),
        patients (
          patient_id,
          users (name, phone)
        )
      `)
      .eq('prescription_id', prescriptionId)
      .single();

    if (error || !data) return null;
    return data as Prescription;
  }

  async findByPatientId(patientId: string): Promise<Prescription[]> {
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

  async markDispensed(prescriptionId: string): Promise<Prescription> {
    const { data, error } = await (supabaseAdmin
      .from('prescriptions') as any)
      .update({ is_dispensed: true })
      .eq('prescription_id', prescriptionId)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to dispense prescription');
    }
    return data as Prescription;
  }
}

export const prescriptionRepository = new PrescriptionRepository();
