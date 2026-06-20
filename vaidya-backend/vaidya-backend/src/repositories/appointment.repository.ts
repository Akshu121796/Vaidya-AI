import { supabaseAdmin } from '../config/supabase';
import type { Appointment } from '../types/models';

export class AppointmentRepository {
  async create(input: {
    patient_id: string;
    doctor_id: string;
    scheduled_at: string;
    notes?: string;
    telegram_chat_id?: string;
  }): Promise<Appointment> {
    const { data, error } = await (supabaseAdmin
      .from('appointments') as any)
      .insert([input])
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to create appointment');
    }
    return data as Appointment;
  }

  async findById(appointmentId: string): Promise<Appointment | null> {
    const { data, error } = await (supabaseAdmin
      .from('appointments') as any)
      .select(`
        *,
        patients (
          patient_id,
          qr_token,
          users (name, phone)
        ),
        doctors (
          doctor_id,
          specialization,
          avg_wait_minutes,
          telegram_chat_id,
          users (name, phone)
        )
      `)
      .eq('appointment_id', appointmentId)
      .single();

    if (error || !data) return null;
    return data as Appointment;
  }

  async findByPatientId(patientId: string): Promise<Appointment[]> {
    const { data, error } = await (supabaseAdmin
      .from('appointments') as any)
      .select(`
        *,
        doctors (
          doctor_id,
          specialization,
          avg_wait_minutes,
          users (name, phone)
        )
      `)
      .eq('patient_id', patientId)
      .order('scheduled_at', { ascending: true });

    if (error || !data) return [];
    return data as Appointment[];
  }

  async updateStatus(
    appointmentId: string,
    status: string
  ): Promise<Appointment> {
    const { data, error } = await (supabaseAdmin
      .from('appointments') as any)
      .update({ status })
      .eq('appointment_id', appointmentId)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to update appointment status');
    }
    return data as Appointment;
  }
}

export const appointmentRepository = new AppointmentRepository();