import { appointmentRepository } from '../repositories/appointment.repository';
import { patientRepository } from '../repositories/patient.repository';
import { doctorRepository } from '../repositories/doctor.repository';
import { notificationQueue } from '../jobs/queues';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors';
import type { BookAppointmentInput, UpdateAppointmentStatusInput } from '../schemas/appointment.schema';
import type { Appointment } from '../types/models';

export class AppointmentService {
  async bookAppointment(
    input: BookAppointmentInput,
    requestingUserId: string
  ): Promise<Appointment> {
    // 1. Verify patient exists for this user
    const patient = await patientRepository.findByUserId(requestingUserId);
    if (!patient) {
      throw new NotFoundError('Patient profile');
    }

    // 2. Verify doctor exists and is available
    const doctor = await doctorRepository.findById(input.doctorId);
    if (!doctor) {
      throw new NotFoundError('Doctor');
    }
    if (!doctor.is_available) {
      throw new ValidationError('Doctor is not currently available');
    }

    // 3. Create appointment in DB
    const appointment = await appointmentRepository.create({
      patient_id: patient.patient_id,
      doctor_id: input.doctorId,
      scheduled_at: input.scheduledAt,
      notes: input.notes,
      telegram_chat_id: input.telegramChatId,
    });

    // 4. Queue Telegram notification — fire and forget
    // Even if queue fails, appointment is already saved
    try {
      const doctorUser = (doctor as any).users;
      const patientUser = (patient as any).users ?? { name: 'Patient' };

      await notificationQueue.add(
  'APPOINTMENT_BOOKED',
  {
    type: 'APPOINTMENT_BOOKED',
    appointmentId: appointment.appointment_id,
    doctorTelegramChatId: doctor.telegram_chat_id ?? null,
    doctorName: (doctor as any).users?.name ?? 'Doctor',
    patientName: (patient as any).users?.name ?? 'Patient',
    scheduledAt: input.scheduledAt,
    notes: input.notes,
  }
);
    } catch (err) {
      // Log but don't fail the request — appointment is booked regardless
      console.error('Failed to queue notification:', err);
    }

    return appointment;
  }

  async getAppointmentById(
    appointmentId: string,
    requestingUserId: string,
    requestingRole: string
  ): Promise<Appointment> {
    const appointment = await appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundError('Appointment');
    }

    // Patients can only see their own appointments
    if (requestingRole === 'patient') {
      const patient = await patientRepository.findByUserId(requestingUserId);
      if (!patient || (appointment as any).patient_id !== patient.patient_id) {
        throw new ForbiddenError('You can only view your own appointments');
      }
    }

    return appointment;
  }

  async updateStatus(
    appointmentId: string,
    input: UpdateAppointmentStatusInput,
    requestingUserId: string,
    requestingRole: string
  ): Promise<Appointment> {
    const appointment = await appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundError('Appointment');
    }

    // Only the doctor assigned or admin can update status. Patients can only cancel their own.
    if (requestingRole === 'doctor') {
      const doctor = await doctorRepository.findByUserId(requestingUserId);
      if (!doctor || (appointment as any).doctor_id !== doctor.doctor_id) {
        throw new ForbiddenError('You can only update your own appointments');
      }
    } else if (requestingRole === 'patient') {
      const patient = await patientRepository.findByUserId(requestingUserId);
      if (!patient || (appointment as any).patient_id !== patient.patient_id) {
        throw new ForbiddenError('You can only update your own appointments');
      }
      if (input.status !== 'cancelled') {
        throw new ForbiddenError('Patients can only cancel appointments');
      }
    }

    return await appointmentRepository.updateStatus(appointmentId, input.status);
  }

  async getPatientAppointments(
    patientId: string,
    requestingUserId: string,
    requestingRole: string
  ): Promise<Appointment[]> {
    // Patients can only see their own
    if (requestingRole === 'patient') {
      const patient = await patientRepository.findByUserId(requestingUserId);
      if (!patient || patient.patient_id !== patientId) {
        throw new ForbiddenError('You can only view your own appointments');
      }
    }

    return await appointmentRepository.findByPatientId(patientId);
  }
}

export const appointmentService = new AppointmentService();
