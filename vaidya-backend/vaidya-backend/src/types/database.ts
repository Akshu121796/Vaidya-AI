export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          user_id: string;
          name: string;
          phone: string;
          email: string | null;
          password_hash: string;
          role: 'patient' | 'doctor' | 'pharmacy' | 'asha' | 'admin';
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          user_id?: string;
          name: string;
          phone: string;
          email?: string | null;
          password_hash: string;
          role: 'patient' | 'doctor' | 'pharmacy' | 'asha' | 'admin';
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      patients: {
        Row: {
          patient_id: string;
          user_id: string;
          village_id: string | null;
          blood_group: string | null;
          date_of_birth: string | null;
          gender: 'male' | 'female' | 'other' | null;
          allergies: string[];
          medical_history: unknown[];
          qr_token: string;
          created_at: string;
        };
        Insert: {
          patient_id?: string;
          user_id: string;
          village_id?: string | null;
          blood_group?: string | null;
          date_of_birth?: string | null;
          gender?: 'male' | 'female' | 'other' | null;
          allergies?: string[];
          medical_history?: unknown[];
          qr_token?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['patients']['Insert']>;
      };
      doctors: {
        Row: {
          doctor_id: string;
          user_id: string;
          hospital_id: string | null;
          specialization: string;
          qualification: string | null;
          is_available: boolean;
          avg_wait_minutes: number;
          telegram_chat_id: string | null;
          created_at: string;
        };
        Insert: {
          doctor_id?: string;
          user_id: string;
          hospital_id?: string | null;
          specialization: string;
          qualification?: string | null;
          is_available?: boolean;
          avg_wait_minutes?: number;
          telegram_chat_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['doctors']['Insert']>;
      };
      appointments: {
        Row: {
          appointment_id: string;
          patient_id: string;
          doctor_id: string;
          scheduled_at: string;
          notes: string | null;
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          telegram_chat_id: string | null;
          created_at: string;
        };
        Insert: {
          appointment_id?: string;
          patient_id: string;
          doctor_id: string;
          scheduled_at: string;
          notes?: string | null;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          telegram_chat_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['appointments']['Insert']>;
      };
      prescriptions: {
        Row: {
          prescription_id: string;
          appointment_id: string;
          patient_id: string;
          doctor_id: string;
          medicines: unknown[];
          diagnosis: string | null;
          issued_at: string;
        };
        Insert: {
          prescription_id?: string;
          appointment_id: string;
          patient_id: string;
          doctor_id: string;
          medicines?: unknown[];
          diagnosis?: string | null;
          issued_at?: string;
        };
        Update: Partial<Database['public']['Tables']['prescriptions']['Insert']>;
      };
      pharmacies: {
        Row: {
          pharmacy_id: string;
          user_id: string;
          name: string;
          village_id: string | null;
          latitude: number | null;
          longitude: number | null;
          phone: string | null;
        };
        Insert: {
          pharmacy_id?: string;
          user_id: string;
          name: string;
          village_id?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          phone?: string | null;
        };
        Update: Partial<Database['public']['Tables']['pharmacies']['Insert']>;
      };
      medicines: {
        Row: {
          medicine_id: string;
          pharmacy_id: string;
          name: string;
          generic_name: string | null;
          quantity: number;
          price: number | null;
          last_updated: string;
        };
        Insert: {
          medicine_id?: string;
          pharmacy_id: string;
          name: string;
          generic_name?: string | null;
          quantity?: number;
          price?: number | null;
          last_updated?: string;
        };
        Update: Partial<Database['public']['Tables']['medicines']['Insert']>;
      };
      villages: {
        Row: {
          village_id: string;
          name: string;
          district: string;
          state: string;
          latitude: number | null;
          longitude: number | null;
          created_at: string;
        };
        Insert: {
          village_id?: string;
          name: string;
          district: string;
          state?: string;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['villages']['Insert']>;
      };
      hospitals: {
        Row: {
          hospital_id: string;
          name: string;
          village_id: string | null;
          address: string | null;
          phone: string | null;
        };
        Insert: {
          hospital_id?: string;
          name: string;
          village_id?: string | null;
          address?: string | null;
          phone?: string | null;
        };
        Update: Partial<Database['public']['Tables']['hospitals']['Insert']>;
      };
      symptom_reports: {
        Row: {
          report_id: string;
          patient_id: string;
          village_id: string | null;
          symptoms_raw: string | null;
          symptoms_structured: unknown[];
          urgency_level: 'low' | 'medium' | 'emergency' | null;
          language: string;
          created_at: string;
        };
        Insert: {
          report_id?: string;
          patient_id: string;
          village_id?: string | null;
          symptoms_raw?: string | null;
          symptoms_structured?: unknown[];
          urgency_level?: 'low' | 'medium' | 'emergency' | null;
          language?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['symptom_reports']['Insert']>;
      };
      outbreak_alerts: {
        Row: {
          alert_id: string;
          village_id: string;
          symptom_type: string;
          case_count: number;
          severity: 'watch' | 'warning' | 'critical';
          detected_at: string;
          resolved_at: string | null;
          is_active: boolean;
        };
        Insert: {
          alert_id?: string;
          village_id: string;
          symptom_type: string;
          case_count: number;
          severity: 'watch' | 'warning' | 'critical';
          detected_at?: string;
          resolved_at?: string | null;
          is_active?: boolean;
        };
        Update: Partial<Database['public']['Tables']['outbreak_alerts']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};