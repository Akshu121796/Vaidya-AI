import { syncBatchSchema, type SyncBatchInput, type SyncRecord } from '../schemas/sync.schema';
import { authService } from './auth.service';
import { triageService } from './triage.service';
import { patientRepository } from '../repositories/patient.repository';
import { appointmentRepository } from '../repositories/appointment.repository';
import { doctorRepository } from '../repositories/doctor.repository';
import { supabaseAdmin } from '../config/supabase';
import { logger } from '../utils/logger';

export interface SyncResult {
  offlineId: string;
  type: string;
  status: 'success' | 'failed' | 'skipped';
  error?: string;
  data?: any;
}

export class SyncService {
  async processBatch(
    input: SyncBatchInput,
    requestingUserId: string
  ): Promise<{
    processed: number;
    succeeded: number;
    failed: number;
    results: SyncResult[];
  }> {
    const results: SyncResult[] = [];

    // Process records sequentially — order matters
    // (patient must be created before their symptom report)
    for (const record of input.records) {
      const result = await this.processRecord(record, requestingUserId);
      results.push(result);
    }

    const succeeded = results.filter((r) => r.status === 'success').length;
    const failed = results.filter((r) => r.status === 'failed').length;

    logger.info(
      {
        total: results.length,
        succeeded,
        failed,
        ashaId: input.ashaId,
      },
      'Sync batch processed'
    );

    return {
      processed: results.length,
      succeeded,
      failed,
      results,
    };
  }

  private async processRecord(
    record: SyncRecord,
    requestingUserId: string
  ): Promise<SyncResult> {
    try {
      switch (record.type) {
        case 'PATIENT_REGISTRATION':
          return await this.processPatientRegistration(record);

        case 'SYMPTOM_REPORT':
          return await this.processSymptomReport(record, requestingUserId);

        case 'APPOINTMENT_BOOKING':
          return await this.processAppointmentBooking(record);

        default:
          return {
            offlineId: (record as any).offlineId,
            type: (record as any).type,
            status: 'skipped',
            error: 'Unknown record type',
          };
      }
    } catch (err: any) {
      logger.error(
        { offlineId: record.offlineId, type: record.type, err },
        'Sync record failed'
      );
      return {
        offlineId: record.offlineId,
        type: record.type,
        status: 'failed',
        error: err.message ?? 'Unknown error',
      };
    }
  }

  // ─── Patient Registration ──────────────────────────────────────
  private async processPatientRegistration(
    record: Extract<SyncRecord, { type: 'PATIENT_REGISTRATION' }>
  ): Promise<SyncResult> {
    // Check if patient already exists — idempotent
    const { data: existingUser } = await (supabaseAdmin
      .from('users') as any)
      .select('user_id')
      .eq('phone', record.payload.phone)
      .single();

    if (existingUser) {
      return {
        offlineId: record.offlineId,
        type: record.type,
        status: 'skipped',
        error: 'Patient already registered',
        data: { userId: existingUser.user_id },
      };
    }

    // Register patient using existing auth service
    const result = await authService.register({
      name: record.payload.name,
      phone: record.payload.phone,
      password: record.payload.password,
      role: 'patient',
      villageId: record.payload.villageId,
      bloodGroup: record.payload.bloodGroup,
      dateOfBirth: record.payload.dateOfBirth,
      gender: record.payload.gender,
      allergies: record.payload.allergies,
    });

    return {
      offlineId: record.offlineId,
      type: record.type,
      status: 'success',
      data: { userId: result.user.user_id },
    };
  }

  // ─── Symptom Report ───────────────────────────────────────────
  private async processSymptomReport(
    record: Extract<SyncRecord, { type: 'SYMPTOM_REPORT' }>,
    requestingUserId: string
  ): Promise<SyncResult> {
    // Find patient by phone
    const { data: user } = await (supabaseAdmin
      .from('users') as any)
      .select('user_id')
      .eq('phone', record.payload.patientPhone)
      .single();

    if (!user) {
      return {
        offlineId: record.offlineId,
        type: record.type,
        status: 'failed',
        error: `Patient with phone ${record.payload.patientPhone} not found`,
      };
    }

    // Run triage analysis
    const result = await triageService.triageText(
      {
        symptoms: record.payload.symptoms,
        language: record.payload.language,
        patientId: undefined,
      },
      user.user_id
    );

    return {
      offlineId: record.offlineId,
      type: record.type,
      status: 'success',
      data: {
        reportId: result.report_id,
        urgencyLevel: result.urgency_level,
      },
    };
  }

  // ─── Appointment Booking ──────────────────────────────────────
  private async processAppointmentBooking(
    record: Extract<SyncRecord, { type: 'APPOINTMENT_BOOKING' }>
  ): Promise<SyncResult> {
    // Find patient by phone
    const { data: user } = await (supabaseAdmin
      .from('users') as any)
      .select('user_id')
      .eq('phone', record.payload.patientPhone)
      .single();

    if (!user) {
      return {
        offlineId: record.offlineId,
        type: record.type,
        status: 'failed',
        error: `Patient with phone ${record.payload.patientPhone} not found`,
      };
    }

    const patient = await patientRepository.findByUserId(user.user_id);
    if (!patient) {
      return {
        offlineId: record.offlineId,
        type: record.type,
        status: 'failed',
        error: 'Patient profile not found',
      };
    }

    const doctor = await doctorRepository.findById(record.payload.doctorId);
    if (!doctor) {
      return {
        offlineId: record.offlineId,
        type: record.type,
        status: 'failed',
        error: 'Doctor not found',
      };
    }

    const appointment = await appointmentRepository.create({
      patient_id: patient.patient_id,
      doctor_id: record.payload.doctorId,
      scheduled_at: record.payload.scheduledAt,
      notes: record.payload.notes,
    });

    return {
      offlineId: record.offlineId,
      type: record.type,
      status: 'success',
      data: { appointmentId: appointment.appointment_id },
    };
  }
}

export const syncService = new SyncService();