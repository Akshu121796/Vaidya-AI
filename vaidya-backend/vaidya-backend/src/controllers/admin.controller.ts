import type { FastifyRequest, FastifyReply } from 'fastify';
import { successResponse } from '../utils/response';
import { supabaseAdmin } from '../config/supabase';

export class AdminController {
  async getStats(_request: FastifyRequest, reply: FastifyReply) {
    // Run all counts in parallel for speed
    const [
      usersResult,
      appointmentsResult,
      triageResult,
      doctorsResult,
      alertsResult,
    ] = await Promise.all([
      (supabaseAdmin.from('users') as any).select('role', { count: 'exact' }),
      (supabaseAdmin.from('appointments') as any).select('status', { count: 'exact' }),
      (supabaseAdmin.from('symptom_reports') as any).select('urgency_level', { count: 'exact' }),
      (supabaseAdmin.from('doctors') as any).select('is_available', { count: 'exact' }).eq('is_available', true),
      (supabaseAdmin.from('outbreak_alerts') as any).select('severity', { count: 'exact' }).eq('is_active', true),
    ]);

    const users = usersResult.data ?? [];
    const appointments = appointmentsResult.data ?? [];
    const triageReports = triageResult.data ?? [];

    return reply.send(successResponse({
      stats: {
        users: {
          total: users.length,
          patients: users.filter((u: any) => u.role === 'patient').length,
          doctors: users.filter((u: any) => u.role === 'doctor').length,
          pharmacies: users.filter((u: any) => u.role === 'pharmacy').length,
          asha: users.filter((u: any) => u.role === 'asha').length,
        },
        appointments: {
          total: appointments.length,
          pending: appointments.filter((a: any) => a.status === 'pending').length,
          confirmed: appointments.filter((a: any) => a.status === 'confirmed').length,
          completed: appointments.filter((a: any) => a.status === 'completed').length,
          cancelled: appointments.filter((a: any) => a.status === 'cancelled').length,
        },
        triage: {
          total: triageReports.length,
          emergency: triageReports.filter((t: any) => t.urgency_level === 'emergency').length,
          medium: triageReports.filter((t: any) => t.urgency_level === 'medium').length,
          low: triageReports.filter((t: any) => t.urgency_level === 'low').length,
        },
        doctors_available: doctorsResult.count ?? 0,
        active_outbreak_alerts: alertsResult.count ?? 0,
      },
    }));
  }

  async getVillages(_request: FastifyRequest, reply: FastifyReply) {
    const { data, error } = await (supabaseAdmin
      .from('villages') as any)
      .select(`
        *,
        patients (count),
        symptom_reports (count)
      `);

    if (error || !data) {
      return reply.send(successResponse({ villages: [] }));
    }

    return reply.send(successResponse({ villages: data }));
  }

  async getDoctorUtilization(_request: FastifyRequest, reply: FastifyReply) {
    const { data, error } = await (supabaseAdmin
      .from('doctors') as any)
      .select(`
        doctor_id,
        specialization,
        is_available,
        avg_wait_minutes,
        users (name),
        hospitals (name),
        appointments (count)
      `);

    if (error || !data) {
      return reply.send(successResponse({ doctors: [] }));
    }

    return reply.send(successResponse({ doctors: data }));
  }

  async getDiseaseTrends(_request: FastifyRequest, reply: FastifyReply) {
    const { data, error } = await (supabaseAdmin
      .from('symptom_reports') as any)
      .select('symptoms_raw, urgency_level, created_at');

    if (error || !data) {
      return reply.send(successResponse({ trends: [] }));
    }

    return reply.send(successResponse({ trends: data }));
  }
}

export const adminController = new AdminController();