import bcrypt from 'bcryptjs';
import { patientRepository } from '../repositories/patient.repository';
import { userRepository } from '../repositories/user.repository';
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from '../utils/errors';
import type {
  RegisterPatientInput,
  UpdatePatientInput,
} from '../schemas/patient.schema';
import type { Patient, User } from '../types/models';

export class PatientService {
  // ASHA worker registers a patient on their behalf
  // This is different from self-registration — ASHA sets a default password
  async registerByAsha(
    input: RegisterPatientInput,
    ashaUserId: string
  ): Promise<{ patient: Patient; user: Omit<User, 'password_hash'> }> {
    // Check phone not already registered
    const exists = await userRepository.existsByPhone(input.phone);
    if (exists) {
      throw new ConflictError('Phone number already registered');
    }

    const password_hash = await bcrypt.hash(input.password, 10);

    // Create user account for the patient
    const user = await userRepository.create({
      name: input.name,
      phone: input.phone,
      password_hash,
      role: 'patient',
    });

    // Create patient profile
    const patient = await patientRepository.create({
      user_id: user.user_id,
      village_id: input.villageId,
      blood_group: input.bloodGroup,
      date_of_birth: input.dateOfBirth,
      gender: input.gender,
      allergies: input.allergies,
    });

    const { password_hash: _, ...safeUser } = user;
    return { patient, user: safeUser };
  }

  async getPatientById(
    patientId: string,
    requestingUserId: string,
    requestingRole: string
  ): Promise<Patient> {
    const patient = await patientRepository.findById(patientId);
    if (!patient) {
      throw new NotFoundError('Patient');
    }

    // Patients can only view their own profile
    // Doctors, ASHA workers, and admins can view any profile
    if (requestingRole === 'patient' && patient.user_id !== requestingUserId) {
      throw new ForbiddenError('You can only view your own profile');
    }

    return patient;
  }

  // QR scan — no auth required, token is the auth mechanism
  // Doctor scans QR card and gets patient profile instantly
  async getPatientByQrToken(qrToken: string): Promise<Patient> {
    const patient = await patientRepository.findByQrToken(qrToken);
    if (!patient) {
      throw new NotFoundError('Patient QR token');
    }
    return patient;
  }

  async updatePatient(
    patientId: string,
    input: UpdatePatientInput,
    requestingUserId: string,
    requestingRole: string
  ): Promise<Patient> {
    const patient = await patientRepository.findById(patientId);
    if (!patient) {
      throw new NotFoundError('Patient');
    }

    // Only the patient themselves or admin can update profile
    if (
      requestingRole === 'patient' &&
      patient.user_id !== requestingUserId
    ) {
      throw new ForbiddenError('You can only update your own profile');
    }

    return await patientRepository.update(patientId, {
      blood_group: input.bloodGroup,
      date_of_birth: input.dateOfBirth,
      gender: input.gender,
      allergies: input.allergies,
      village_id: input.villageId,
    });
  }

  // Full medical history — prescriptions + symptom reports
  async getPatientHistory(
    patientId: string,
    requestingUserId: string,
    requestingRole: string
  ) {
    const patient = await patientRepository.findById(patientId);
    if (!patient) {
      throw new NotFoundError('Patient');
    }

    if (requestingRole === 'patient' && patient.user_id !== requestingUserId) {
      throw new ForbiddenError('You can only view your own history');
    }

    // Fetch both in parallel — faster than sequential awaits
    const [prescriptions, symptomReports] = await Promise.all([
      patientRepository.findPrescriptions(patientId),
      patientRepository.findSymptomReports(patientId),
    ]);

    return {
      patient,
      prescriptions,
      symptomReports,
    };
  }

  // Get patient profile for the currently logged-in patient user
  async getMyProfile(userId: string): Promise<Patient> {
    const patient = await patientRepository.findByUserId(userId);
    if (!patient) {
      throw new NotFoundError('Patient profile');
    }
    return patient;
  }
}

export const patientService = new PatientService();