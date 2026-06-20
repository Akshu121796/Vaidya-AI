export type UserRole = 'patient' | 'doctor' | 'pharmacy' | 'asha' | 'admin';

export interface User {
  user_id: string;
  name: string;
  phone: string;
  email?: string;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Patient {
  patient_id: string;
  user_id: string;
  village_id?: string;
  blood_group?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  allergies: string[];
  medical_history: unknown[];
  qr_token: string;
  created_at: string;
}

export interface Doctor {
  doctor_id: string;
  user_id: string;
  hospital_id?: string;
  specialization: string;
  qualification?: string;
  is_available: boolean;
  avg_wait_minutes: number;
  telegram_chat_id?: string;
  created_at: string;
}

export interface Village {
  village_id: string;
  name: string;
  district: string;
  state: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
}

export interface Hospital {
  hospital_id: string;
  name: string;
  village_id?: string;
  address?: string;
  phone?: string;
}

export interface Appointment {
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_at: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  telegram_chat_id?: string;
  created_at: string;
}

export interface Prescription {
  prescription_id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  medicines: PrescriptionMedicine[];
  diagnosis?: string;
  issued_at: string;
}

export interface PrescriptionMedicine {
  name: string;
  dosage: string;
  duration: string;
  quantity: number;
}

export interface Medicine {
  medicine_id: string;
  pharmacy_id: string;
  name: string;
  generic_name?: string;
  quantity: number;
  price?: number;
  last_updated: string;
}

export interface Pharmacy {
  pharmacy_id: string;
  user_id: string;
  name: string;
  village_id?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
}

export interface SymptomReport {
  report_id: string;
  patient_id: string;
  village_id?: string;
  symptoms_raw?: string;
  symptoms_structured: unknown[];
  urgency_level?: 'low' | 'medium' | 'emergency';
  language: string;
  created_at: string;
}

export interface OutbreakAlert {
  alert_id: string;
  village_id: string;
  symptom_type: string;
  case_count: number;
  severity: 'watch' | 'warning' | 'critical';
  detected_at: string;
  resolved_at?: string;
  is_active: boolean;
}