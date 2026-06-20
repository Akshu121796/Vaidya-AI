import { medicineRepository } from '../repositories/medicine.repository';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors';
import type {
  AddMedicineInput,
  UpdateMedicineInput,
  SearchMedicineInput,
} from '../schemas/medicine.schema';

export class MedicineService {
  async searchMedicines(input: SearchMedicineInput) {
    const results = await medicineRepository.search(input.name, input.villageId);

    // Add availability label for frontend
    return results.map((med: any) => ({
      ...med,
      availability:
        med.quantity > 50
          ? 'high'
          : med.quantity > 10
          ? 'medium'
          : 'low',
    }));
  }

  async getPharmacyMedicines(pharmacyId: string) {
    return await medicineRepository.findByPharmacyId(pharmacyId);
  }

  async addMedicine(input: AddMedicineInput, requestingUserId: string) {
    // Only pharmacy users can add medicines
    const pharmacy = await medicineRepository.findPharmacyByUserId(requestingUserId);
    if (!pharmacy) {
      throw new ForbiddenError('No pharmacy profile found for your account');
    }

    return await medicineRepository.create({
      pharmacy_id: pharmacy.pharmacy_id,
      name: input.name,
      generic_name: input.genericName,
      quantity: input.quantity,
      price: input.price,
    });
  }

  async updateMedicine(
    medicineId: string,
    input: UpdateMedicineInput,
    requestingUserId: string
  ) {
    // Verify medicine exists
    const medicine = await medicineRepository.findById(medicineId);
    if (!medicine) {
      throw new NotFoundError('Medicine');
    }

    // Verify the pharmacy owns this medicine
    const pharmacy = await medicineRepository.findPharmacyByUserId(requestingUserId);
    if (!pharmacy || medicine.pharmacy_id !== pharmacy.pharmacy_id) {
      throw new ForbiddenError('You can only update medicines in your own pharmacy');
    }

    return await medicineRepository.update(medicineId, {
      quantity: input.quantity,
      price: input.price,
      generic_name: input.genericName,
    });
  }
}

export const medicineService = new MedicineService();