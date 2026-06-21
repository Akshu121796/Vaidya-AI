import { doctorRepository } from '../repositories/doctor.repository';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import type {
  UpdateAvailabilityInput,
  ListDoctorsInput,
} from '../schemas/doctor.schema';
import type { Doctor } from '../types/models';

export class DoctorService {
  async listDoctors(filters: ListDoctorsInput): Promise<Doctor[]> {
    return await doctorRepository.findAll({
      specialization: filters.specialization,
      available: filters.available,
      villageId: filters.villageId,
    });
  }

  async getDoctorById(doctorId: string): Promise<Doctor> {
    const doctor = await doctorRepository.findById(doctorId);
    if (!doctor) {
      throw new NotFoundError('Doctor');
    }
    return doctor;
  }

  async updateAvailability(
    doctorId: string,
    input: UpdateAvailabilityInput,
    requestingUserId: string,
    requestingRole: string
  ): Promise<Doctor> {
    const doctor = await doctorRepository.findById(doctorId);
    if (!doctor) {
      throw new NotFoundError('Doctor');
    }

    // Only the doctor themselves or admin can toggle availability
    if (
      requestingRole === 'doctor' &&
      doctor.user_id !== requestingUserId
    ) {
      throw new ForbiddenError('You can only update your own availability');
    }

    return await doctorRepository.updateAvailability(
      doctorId,
      input.isAvailable,
      input.avgWaitMinutes
    );
  }

  async getDoctorAppointments(
    doctorId: string,
    requestingUserId: string,
    requestingRole: string
  ) {
    const doctor = await doctorRepository.findById(doctorId);
    if (!doctor) {
      throw new NotFoundError('Doctor');
    }

    if (
      requestingRole === 'doctor' &&
      doctor.user_id !== requestingUserId
    ) {
      throw new ForbiddenError('You can only view your own appointments');
    }

    return await doctorRepository.findAppointments(doctorId);
  }

  async getMyProfile(userId: string): Promise<Doctor> {
    const doctor = await doctorRepository.findByUserId(userId);
    if (!doctor) {
      throw new NotFoundError('Doctor profile');
    }
    return doctor;
  }
}

export const doctorService = new DoctorService();