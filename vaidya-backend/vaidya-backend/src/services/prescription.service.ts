import { prescriptionRepository } from '../repositories/prescription.repository';
import { patientRepository } from '../repositories/patient.repository';
import { doctorRepository } from '../repositories/doctor.repository';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import type { CreatePrescriptionInput } from '../schemas/prescription.schema';
import type { Prescription } from '../types/models';

export class PrescriptionService {
  async createPrescription(
    input: CreatePrescriptionInput,
    requestingUserId: string,
    requestingRole: string
  ): Promise<Prescription> {
    // Only doctor or admin can prescribe
    if (requestingRole !== 'doctor' && requestingRole !== 'admin') {
      throw new ForbiddenError('Only clinicians or admins can issue prescriptions');
    }

    // Verify doctor exists
    const doctor = await doctorRepository.findById(input.doctorId);
    if (!doctor) {
      throw new NotFoundError('Doctor');
    }

    // Verify patient exists
    const patient = await patientRepository.findById(input.patientId);
    if (!patient) {
      throw new NotFoundError('Patient');
    }

    return await prescriptionRepository.create({
      appointment_id: input.appointmentId,
      patient_id: input.patientId,
      doctor_id: input.doctorId,
      medicines: input.medicines,
      notes: input.notes,
    });
  }

  async getPrescriptionById(
    prescriptionId: string,
    requestingUserId: string,
    requestingRole: string
  ): Promise<Prescription> {
    const prescription = await prescriptionRepository.findById(prescriptionId);
    if (!prescription) {
      throw new NotFoundError('Prescription');
    }

    // Patient can only view their own
    if (requestingRole === 'patient') {
      const patient = await patientRepository.findByUserId(requestingUserId);
      if (!patient || prescription.patient_id !== patient.patient_id) {
        throw new ForbiddenError('You can only view your own prescriptions');
      }
    }

    return prescription;
  }

  async getPrescriptionsByPatientId(
    patientId: string,
    requestingUserId: string,
    requestingRole: string
  ): Promise<Prescription[]> {
    if (requestingRole === 'patient') {
      const patient = await patientRepository.findByUserId(requestingUserId);
      if (!patient || patient.patient_id !== patientId) {
        throw new ForbiddenError('You can only view your own prescriptions');
      }
    }

    return await prescriptionRepository.findByPatientId(patientId);
  }

  async dispensePrescription(
    prescriptionId: string,
    requestingUserId: string,
    requestingRole: string
  ): Promise<Prescription> {
    // Only pharmacies, pharmacists or admins can dispense
    if (requestingRole !== 'pharmacy' && requestingRole !== 'pharmacist' && requestingRole !== 'admin') {
      throw new ForbiddenError('Only pharmacy workers or admins can dispense prescriptions');
    }

    const prescription = await prescriptionRepository.findById(prescriptionId);
    if (!prescription) {
      throw new NotFoundError('Prescription');
    }

    return await prescriptionRepository.markDispensed(prescriptionId);
  }
}

export const prescriptionService = new PrescriptionService();
