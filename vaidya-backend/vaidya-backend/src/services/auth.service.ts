import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository';
import { patientRepository } from '../repositories/patient.repository';
import { doctorRepository } from '../repositories/doctor.repository';
import { ConflictError, UnauthorizedError } from '../utils/errors';
import type { RegisterInput, LoginInput } from '../schemas/auth.schema';
import type { User } from '../types/models';

export class AuthService {
  // How many salt rounds for bcrypt.
  // 10 is the industry standard — secure without being too slow.
  private readonly SALT_ROUNDS = 10;

  async register(input: RegisterInput): Promise<{ user: Omit<User, 'password_hash'> }> {
    // 1. Check if phone already registered
    const exists = await userRepository.existsByPhone(input.phone);
    if (exists) {
      throw new ConflictError('Phone number already registered');
    }

    // 2. Hash the password — never store plaintext
    const password_hash = await bcrypt.hash(input.password, this.SALT_ROUNDS);

    // 3. Create the user
    const user = await userRepository.create({
      name: input.name,
      phone: input.phone,
      email: input.email,
      password_hash,
      role: input.role,
    });

    // 4. Create role-specific profile
    // Each role gets its own profile table row
    if (input.role === 'patient' || input.role === 'asha') {
  await patientRepository.create({
    user_id: user.user_id,
    village_id: input.villageId,
    blood_group: input.bloodGroup,       // ADD
    date_of_birth: input.dateOfBirth,    // ADD
    gender: input.gender,               // ADD
    allergies: input.allergies,         // ADD
  });
}

    if (input.role === 'doctor') {
      if (!input.specialization) {
        throw new Error('Specialization is required for doctors');
      }
      await doctorRepository.create({
        user_id: user.user_id,
        specialization: input.specialization,
        hospital_id: input.hospitalId,
      });
    }

    // 5. Never return the password hash to the client
    const { password_hash: _, ...safeUser } = user;
    return { user: safeUser };
  }

  async login(input: LoginInput): Promise<{
    user: Omit<User, 'password_hash'>;
    token: string;
  }> {
    // 1. Find user by phone
    const user = await userRepository.findByPhone(input.phone);
    if (!user) {
      // Important: same error message for wrong phone AND wrong password
      // This prevents attackers from knowing which one is wrong
      throw new UnauthorizedError('Invalid phone number or password');
    }

    // 2. Check if account is active
    if (!user.is_active) {
      throw new UnauthorizedError('Account is deactivated. Contact support.');
    }

    // 3. Verify password
    const passwordMatch = await bcrypt.compare(input.password, user.password_hash);
    if (!passwordMatch) {
      throw new UnauthorizedError('Invalid phone number or password');
    }

    // 4. Return user without password hash
    // The controller will generate the JWT using Fastify's jwt plugin
    const { password_hash: _, ...safeUser } = user;
    return { user: safeUser, token: '' }; // token filled in by controller
  }

  async getMe(userId: string): Promise<Omit<User, 'password_hash'>> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    const { password_hash: _, ...safeUser } = user;
    return safeUser;
  }
}

export const authService = new AuthService();