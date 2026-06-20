import { create } from "zustand";
import { 
  Doctor, 
  Medicine, 
  HealthRecord, 
  MOCK_APPOINTMENTS, 
  MOCK_RECORDS 
} from "@/lib/mock-data";
import { authApi } from "@/lib/auth";
import api, { clearToken, setToken } from "@/lib/api";

export interface UserProfile {
  id: string;
  name: string;
  role: "patient" | "doctor" | "pharmacist" | "asha" | "admin";
  email: string;
  avatar: string;
  dob?: string;
  bloodGroup?: string;
  allergies?: string[];
  chronicConditions?: string[];
  insuranceProvider?: string;
  insuranceId?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  // Backend real IDs (populated after real login)
  backendUserId?: string;  // Supabase user_id (uuid)
  patientId?: string;      // patients.patient_id (uuid)
  doctorId?: string;       // doctors.doctor_id (uuid)
  phone?: string;          // phone used for backend auth
  qrToken?: string;        // qr_token from patients table
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: string;
  reason: string;
  patientId?: string;
  patientName?: string;
  patientPhone?: string;
  gender?: string;
  age?: number;
  vitals?: string;
}

export const DEMO_ACCOUNTS: Record<string, UserProfile> = {
  "kaveesh.patient@vaidya.ai": {
    id: "VAI-KAV-PAT-883",
    name: "Kaveesh Kadirvel",
    role: "patient",
    email: "kaveesh.patient@vaidya.ai",
    phone: "9876543210",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
    dob: "1994-08-22",
    bloodGroup: "O-positive (O+)",
    allergies: ["Penicillin", "Peanuts", "Dust Mites"],
    chronicConditions: ["Mild Asthma", "Hypercholesterolemia"],
    insuranceProvider: "CarePlus Global Health",
    insuranceId: "CPG-903-882-11B",
    emergencyContact: {
      name: "Ananya Saxena",
      relationship: "Spouse",
      phone: "+91 98765 43210"
    }
  },
  "kaveesh.doctor@vaidya.ai": {
    id: "VAI-KAV-DOC-902",
    name: "Dr. Kaveesh Kadirvel",
    role: "doctor",
    email: "kaveesh.doctor@vaidya.ai",
    phone: "9876543211",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150",
    dob: "1983-05-14",
    bloodGroup: "A-positive (A+)",
    allergies: ["Sulfa Drugs"],
    chronicConditions: [],
    insuranceProvider: "LIC India Med",
    insuranceId: "LIC-DOC-902"
  },
  "kaveesh.pharmacy@vaidya.ai": {
    id: "VAI-KAV-PHA-118",
    name: "Kaveesh Pharmacy",
    role: "pharmacist",
    email: "kaveesh.pharmacy@vaidya.ai",
    phone: "9876543212",
    avatar: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=150"
  },
  "kaveesh.asha@vaidya.ai": {
    id: "VAI-KAV-ASH-771",
    name: "Kaveesh ASHA Worker",
    role: "asha",
    email: "kaveesh.asha@vaidya.ai",
    phone: "9876543298",
    avatar: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=150"
  },
  "kaveesh.admin@vaidya.ai": {
    id: "VAI-KAV-ADM-401",
    name: "Kaveesh Admin",
    role: "admin",
    email: "kaveesh.admin@vaidya.ai",
    phone: "9876543299",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"
  }
};

export interface Message {
  id: string;
  sender: "user" | "asha";
  text: string;
  timestamp: string;
  citations?: string[];
}

interface HealthStore {
  user: UserProfile | null;
  isAuthenticated: boolean;
  appointments: Appointment[];
  records: HealthRecord[];
  ashaChat: Message[];
  
  // Profile
  updateUser: (profile: Partial<UserProfile>) => void;
  
  // Appointments
  addAppointment: (appointment: {
    doctorId: string;
    doctorName: string;
    specialty: string;
    date: string;
    time: string;
    reason: string;
  }) => void;
  cancelAppointment: (id: string) => void;
  rescheduleAppointment: (id: string, date: string, time: string) => void;
  
  // Locker
  addRecord: (record: Omit<HealthRecord, "id">) => void;
  deleteRecord: (id: string) => void;
  
  // Asha AI Chat
  sendAshaMessage: (text: string) => void;
  clearAshaChat: () => void;
  
  // User Roles
  role: "patient" | "doctor" | "pharmacist" | "asha" | "admin";
  setRole: (role: "patient" | "doctor" | "pharmacist" | "asha" | "admin") => void;
  language: "English" | "Hindi" | "Marathi";
  setLanguage: (lang: "English" | "Hindi" | "Marathi") => void;
  loginUserAsync: (phone: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  restoreSession: () => Promise<void>;
  fetchAppointments: () => Promise<void>;
}

export const useHealthStore = create<HealthStore>((set, get) => ({
  // Start unauthenticated — user must log in
  user: null,
  isAuthenticated: false,
  role: "patient",
  setRole: (role) => set({ role }),
  language: "English",
  setLanguage: (language) => set({ language }),

  // Real backend login — call POST /api/auth/login
  loginUserAsync: async (phone, password) => {
    try {
      const backendUser = await authApi.login(phone, password);
      // Map backend role to frontend role
      const roleMapped = (backendUser.role === 'pharmacy' ? 'pharmacist' : backendUser.role) as UserProfile['role'];
      // Build frontend profile, merging any demo data if available
      const demoKey = Object.keys(DEMO_ACCOUNTS).find(k => DEMO_ACCOUNTS[k].role === roleMapped);
      const demoProfile = demoKey ? DEMO_ACCOUNTS[demoKey] : null;

      let patientId: string | undefined = undefined;
      let doctorId: string | undefined = undefined;
      let qrToken: string | undefined = undefined;
      let bloodGroup = demoProfile?.bloodGroup;
      let allergies = demoProfile?.allergies ?? [];
      let dob: string | undefined = undefined;

      if (roleMapped === 'patient' || roleMapped === 'asha') {
        try {
          const profileRes = await api.get<{ success: boolean; data: { patient: any } }>('/api/patients/me');
          if (profileRes.success && profileRes.data?.patient) {
            patientId = profileRes.data.patient.patient_id;
            qrToken = profileRes.data.patient.qr_token;
            bloodGroup = profileRes.data.patient.blood_group ?? bloodGroup;
            allergies = profileRes.data.patient.allergies ?? allergies;
            dob = profileRes.data.patient.date_of_birth ?? undefined;
          }
        } catch (e) {
          console.error('Failed to load patient profile details', e);
        }
      } else if (roleMapped === 'doctor') {
        try {
          const profileRes = await api.get<{ success: boolean; data: { doctor: any } }>('/api/doctors/me');
          if (profileRes.success && profileRes.data?.doctor) {
            doctorId = profileRes.data.doctor.doctor_id;
          }
        } catch (e) {
          console.error('Failed to load doctor profile details', e);
        }
      }

      const profile: UserProfile = {
        id: backendUser.user_id,
        name: backendUser.name,
        role: roleMapped,
        email: backendUser.email ?? phone,
        phone: backendUser.phone,
        avatar: demoProfile?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(backendUser.name)}&background=10b981&color=fff`,
        bloodGroup,
        allergies,
        chronicConditions: demoProfile?.chronicConditions ?? [],
        emergencyContact: demoProfile?.emergencyContact,
        backendUserId: backendUser.user_id,
        patientId,
        doctorId,
        qrToken,
        dob,
      };

      set({ user: profile, role: roleMapped, isAuthenticated: true });
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err.message ?? 'Login failed' };
    }
  },

  logout: () => {
    clearToken();
    set({ user: null as UserProfile | null, isAuthenticated: false, role: 'patient' });
  },

  restoreSession: async () => {
    const cached = authApi.getCachedUser();
    if (cached) {
      const roleMapped = (cached.role === 'pharmacy' ? 'pharmacist' : cached.role) as UserProfile['role'];
      const demoKey = Object.keys(DEMO_ACCOUNTS).find(k => DEMO_ACCOUNTS[k].role === roleMapped);
      const demoProfile = demoKey ? DEMO_ACCOUNTS[demoKey] : null;

      let patientId: string | undefined = undefined;
      let doctorId: string | undefined = undefined;
      let qrToken: string | undefined = undefined;
      let bloodGroup = demoProfile?.bloodGroup;
      let allergies = demoProfile?.allergies ?? [];
      let dob: string | undefined = undefined;

      if (roleMapped === 'patient' || roleMapped === 'asha') {
        try {
          const profileRes = await api.get<{ success: boolean; data: { patient: any } }>('/api/patients/me');
          if (profileRes.success && profileRes.data?.patient) {
            patientId = profileRes.data.patient.patient_id;
            qrToken = profileRes.data.patient.qr_token;
            bloodGroup = profileRes.data.patient.blood_group ?? bloodGroup;
            allergies = profileRes.data.patient.allergies ?? allergies;
            dob = profileRes.data.patient.date_of_birth ?? undefined;
          }
        } catch (e) {
          console.error('Failed to load patient profile in restoreSession', e);
        }
      } else if (roleMapped === 'doctor') {
        try {
          const profileRes = await api.get<{ success: boolean; data: { doctor: any } }>('/api/doctors/me');
          if (profileRes.success && profileRes.data?.doctor) {
            doctorId = profileRes.data.doctor.doctor_id;
          }
        } catch (e) {
          console.error('Failed to load doctor profile in restoreSession', e);
        }
      }

      const profile: UserProfile = {
        id: cached.user_id,
        name: cached.name,
        role: roleMapped,
        email: cached.email ?? cached.phone,
        phone: cached.phone,
        avatar: demoProfile?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(cached.name)}&background=10b981&color=fff`,
        bloodGroup,
        allergies,
        chronicConditions: demoProfile?.chronicConditions ?? [],
        emergencyContact: demoProfile?.emergencyContact,
        backendUserId: cached.user_id,
        patientId,
        doctorId,
        qrToken,
        dob,
      };
      set({ user: profile, role: roleMapped, isAuthenticated: true });
    }
  },

  fetchAppointments: async () => {
    const user = get().user;
    if (!user) return;
    try {
      if (user.role === 'patient' && user.patientId) {
        const res = await api.get<{ success: boolean; data: { appointments: any[] } }>(
          `/api/appointments/patient/${user.patientId}`
        );
        if (res.success && res.data?.appointments) {
          const mapped = res.data.appointments.map((a: any) => ({
            id: a.appointment_id,
            doctorId: a.doctor_id,
            doctorName: a.doctors?.users?.name ?? 'Dr. Alok Sharma',
            specialty: a.doctors?.specialization ?? 'Cardiologist',
            date: a.scheduled_at.split('T')[0],
            time: new Date(a.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            reason: a.notes || 'Routine consultation',
            status: a.status === 'pending' ? 'Confirmed' : a.status === 'confirmed' ? 'Confirmed' : a.status === 'completed' ? 'Completed' : 'Cancelled'
          }));
          set({ appointments: mapped });
        }
      } else if (user.role === 'doctor') {
        try {
          const docRes = await api.get<{ success: boolean; data: { doctor: any } }>('/api/doctors/me');
          if (docRes.success && docRes.data?.doctor) {
            const docId = docRes.data.doctor.doctor_id;
            const apptsRes = await api.get<{ success: boolean; data: any[] }>(`/api/doctors/${docId}/appointments`);
            if (apptsRes.success && apptsRes.data) {
              const mapped = apptsRes.data.map((a: any) => {
                let age = 45; // Default fallback
                if (a.patients?.date_of_birth) {
                  const birthDate = new Date(a.patients.date_of_birth);
                  const today = new Date();
                  age = today.getFullYear() - birthDate.getFullYear();
                  const m = today.getMonth() - birthDate.getMonth();
                  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                  }
                }
                return {
                  id: a.appointment_id,
                  doctorId: docId,
                  doctorName: user.name,
                  specialty: docRes.data.doctor.specialization,
                  date: a.scheduled_at.split('T')[0],
                  time: new Date(a.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  reason: a.notes || 'Routine consultation',
                  status: a.status === 'pending' ? 'Confirmed' : a.status === 'confirmed' ? 'Confirmed' : a.status === 'completed' ? 'Completed' : 'Cancelled',
                  patientId: a.patients?.patient_id ?? '',
                  patientName: a.patients?.users?.name ?? 'Unknown Patient',
                  patientPhone: a.patients?.users?.phone ?? '',
                  gender: a.patients?.gender ? (a.patients.gender.charAt(0).toUpperCase() + a.patients.gender.slice(1)) : 'Unknown',
                  age: age,
                  vitals: 'BP: 120/80, SPO2: 98%, Pulse: 72' // Default triage vitals
                };
              });
              set({ appointments: mapped });
            }
          }
        } catch (e) {
          console.error('Failed to load doctor appointments', e);
        }
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    }
  },

  appointments: MOCK_APPOINTMENTS,
  records: MOCK_RECORDS,
  ashaChat: [
    {
      id: "init-1",
      sender: "asha",
      text: "Namaste! I am Asha, your AI health companion. How can I help you today? You can ask me about seasonal illnesses, diet recommendations, child immunization schedules, or understand your prescriptions.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ],
  
  updateUser: (profile) => set((state) => ({ user: state.user ? { ...state.user, ...profile } : null })),
  
  addAppointment: (apt) => set((state) => ({
    appointments: [
      {
        id: `apt-${Date.now()}`,
        ...apt,
        status: "Confirmed"
      },
      ...state.appointments
    ]
  })),
  
  cancelAppointment: (id) => {
    api.put(`/api/appointments/${id}/status`, { status: 'cancelled' }).catch((e) => {
      console.error('Failed to cancel appointment on backend', e);
    });

    set((state) => ({
      appointments: state.appointments.map((apt) => 
        apt.id === id ? { ...apt, status: "Cancelled" } : apt
      )
    }));
  },
  
  rescheduleAppointment: (id, date, time) => set((state) => ({
    appointments: state.appointments.map((apt) => 
      apt.id === id ? { ...apt, date, time, status: "Confirmed" } : apt
    )
  })),
  
  addRecord: (rec) => set((state) => ({
    records: [
      {
        id: `rec-${Date.now()}`,
        ...rec
      },
      ...state.records
    ]
  })),
  
  deleteRecord: (id) => set((state) => ({
    records: state.records.filter((rec) => rec.id !== id)
  })),
  
  sendAshaMessage: (text) => set((state) => {
    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    // Generate AI responses based on common keywords
    let responseText = "I have received your request. Let me analyze that context for you.";
    let citations: string[] = ["Vaidya Clinical Knowledgebase (v2.4)"];
    
    const query = text.toLowerCase();
    if (query.includes("diet") || query.includes("food") || query.includes("eat")) {
      responseText = "For optimal metabolic health and general wellness, I recommend a balanced fiber-rich diet. Minimize refined sugars and high-sodium snacks. Focus on leafy greens, whole grains (like millet or brown rice), lean proteins, and stay hydrated (2.5 - 3 liters of water daily).";
      citations.push("WHO Dietary Guidelines 2025", "ICMR Nutrition Chart");
    } else if (query.includes("fever") || query.includes("cough") || query.includes("cold")) {
      responseText = "An acute cough or mild fever is commonly viral. Rest, drink plenty of warm fluids, and monitor your temperature. If the fever exceeds 101°F or persists past 3 days, please consult a General Physician. You may use Paracetamol 650mg for relief, up to 3-4 times a day.";
      citations.push("CDC Influenza Guidelines", "Asha Primary Care Protocol");
    } else if (query.includes("cholesterol") || query.includes("lipid")) {
      responseText = "Your cholesterol levels show slight elevation (LDL/Total). Focus on reducing saturated fats and increasing soluble fiber (oats, beans). Cardio workouts of 30 mins, 5 days a week will raise your HDL. If statins (like Atorvastatin) are prescribed, take them consistently at night.";
      citations.push("ACC/AHA Cholesterol Management Guidelines");
    } else if (query.includes("asthma") || query.includes("inhaler")) {
      responseText = "Maintain controller inhaler use as prescribed. Keep a reliever inhaler (e.g. Albuterol) close by. Avoid active trigger agents like heavy dust, pet dander, and cold air drafts. Check your peak flow meter regularly.";
      citations.push("GINA Asthma Management Standard 2026");
    } else if (query.includes("vaccine") || query.includes("immunization")) {
      responseText = "Children should follow the national immunization calendar strictly. Important boosters include DTap, MMR, and Hepatitis B. For adults, an annual Influenza booster and a Tetanus toxoid update every 10 years are recommended.";
      citations.push("National Immunization Schedule (NIS) India");
    }
    
    const ashaMsg: Message = {
      id: `msg-${Date.now()}-asha`,
      sender: "asha",
      text: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations
    };
    
    return {
      ashaChat: [...state.ashaChat, userMsg, ashaMsg]
    };
  }),
  
  clearAshaChat: () => set({
    ashaChat: [
      {
        id: "init-1",
        sender: "asha",
        text: "Chat history cleared. How can I assist you with your health today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]
  })
}));
