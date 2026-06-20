export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  experience: number;
  fee: number;
  hospital: string;
  avatar: string;
  bio: string;
  availability: {
    days: string[];
    slots: string[];
  };
  contact: string;
  waitTime: string;
  distance: number;
  availabilityPeriod: "today" | "tomorrow" | "week";
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  price: number;
  requiresPrescription: boolean;
  description: string;
  manufacturer: string;
  alternatives: string[];
  usages: string[];
  sideEffects: string[];
  interactions: {
    substance: string;
    severity: "Mild" | "Moderate" | "Severe";
    effect: string;
  }[];
  dosage: string;
}

export interface HealthRecord {
  id: string;
  name: string;
  category: "Prescription" | "Lab Report" | "Vaccine Card" | "Imaging";
  date: string;
  doctorName: string;
  hospitalName: string;
  fileSize: string;
  summary: string;
  keyMetrics?: { name: string; value: string; status: "Normal" | "High" | "Low" }[];
}

export interface UserProfile {
  id: string;
  name: string;
  dob: string;
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  insuranceProvider: string;
  insuranceId: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export const MOCK_USER: UserProfile = {
  id: "VAI-8830-492",
  name: "Dr. Kaveesh Saxena",
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
};

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: "doc-1",
    name: "Dr. Alok Sharma",
    specialty: "Cardiologist",
    rating: 4.9,
    experience: 18,
    fee: 1200,
    hospital: "Vaidya Medicity, New Delhi",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=250",
    bio: "Senior Consultant in Interventional Cardiology with expertise in angioplasty, heart failure management, and preventive cardiac wellness strategies.",
    availability: {
      days: ["Mon", "Wed", "Fri"],
      slots: ["09:00 AM", "11:30 AM", "02:00 PM", "04:30 PM"]
    },
    contact: "+91 11 4056 9912",
    waitTime: "No wait",
    distance: 2.4,
    availabilityPeriod: "today"
  },
  {
    id: "doc-2",
    name: "Dr. Priya Deshmukh",
    specialty: "Pediatrician",
    rating: 4.8,
    experience: 12,
    fee: 800,
    hospital: "Rainbow Children's Care, Mumbai",
    avatar: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=250",
    bio: "Dedicated specialist in infant growth, childhood immunizations, developmental milestones, and pediatric nutrition guidance.",
    availability: {
      days: ["Tue", "Thu", "Sat"],
      slots: ["10:00 AM", "12:00 PM", "03:00 PM", "05:00 PM"]
    },
    contact: "+91 22 8872 1104",
    waitTime: "15 min wait",
    distance: 4.8,
    availabilityPeriod: "tomorrow"
  },
  {
    id: "doc-3",
    name: "Dr. Sarah D'Souza",
    specialty: "Dermatologist",
    rating: 4.7,
    experience: 9,
    fee: 900,
    hospital: "Aura Aesthetics Clinic, Bangalore",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=250",
    bio: "Expert in clinical dermatology, acne treatments, chemical peels, eczema therapies, and early detection of skin lesions.",
    availability: {
      days: ["Mon", "Tue", "Thu"],
      slots: ["11:00 AM", "01:30 PM", "04:00 PM", "06:30 PM"]
    },
    contact: "+91 80 4402 7711",
    waitTime: "30 min wait",
    distance: 7.2,
    availabilityPeriod: "today"
  },
  {
    id: "doc-4",
    name: "Dr. Vikram Seth",
    specialty: "Neurologist",
    rating: 4.95,
    experience: 22,
    fee: 1500,
    hospital: "Apex Neuro Institute, Hyderabad",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=250",
    bio: "Renowned expert in epilepsy management, neuro-muscular disorders, migraine treatments, and clinical sleep studies.",
    availability: {
      days: ["Wed", "Thu", "Sat"],
      slots: ["09:30 AM", "11:00 AM", "02:30 PM", "03:30 PM"]
    },
    contact: "+91 40 2309 8812",
    waitTime: "No wait",
    distance: 12.5,
    availabilityPeriod: "week"
  },
  {
    id: "doc-5",
    name: "Dr. Meenakshi Iyer",
    specialty: "Gynecologist",
    rating: 4.85,
    experience: 15,
    fee: 1000,
    hospital: "Lotus Women's Hospital, Chennai",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=250",
    bio: "Compassionate physician specializing in high-risk pregnancies, hormonal imbalances, polycystic ovary syndrome (PCOS), and menopause support.",
    availability: {
      days: ["Mon", "Tue", "Fri"],
      slots: ["10:30 AM", "12:30 PM", "03:30 PM", "05:30 PM"]
    },
    contact: "+91 44 2822 4040",
    waitTime: "45 min wait",
    distance: 18.0,
    availabilityPeriod: "week"
  }
];

export const MOCK_RECORDS: HealthRecord[] = [
  {
    id: "rec-1",
    name: "Annual Health Screening Report",
    category: "Lab Report",
    date: "2026-05-14",
    doctorName: "Dr. Alok Sharma",
    hospitalName: "Vaidya Medicity, New Delhi",
    fileSize: "2.4 MB",
    summary: "Detailed biochemical blood work and lipid profiles mapping health indicators. High cholesterol is flagged; general parameters are healthy.",
    keyMetrics: [
      { name: "Total Cholesterol", value: "242 mg/dL", status: "High" },
      { name: "Fast Blood Sugar", value: "98 mg/dL", status: "Normal" },
      { name: "HbA1c", value: "5.6%", status: "Normal" },
      { name: "Hemoglobin", value: "14.8 g/dL", status: "Normal" }
    ]
  },
  {
    id: "rec-2",
    name: "Asthma Controller Prescription",
    category: "Prescription",
    date: "2026-04-12",
    doctorName: "Dr. Vikram Seth",
    hospitalName: "Apex Neuro Institute, Hyderabad",
    fileSize: "1.1 MB",
    summary: "Seasonal controller prescription including Budesonide + Formoterol inhaler for managing asthma exacerbations during changes in weather.",
    keyMetrics: [
      { name: "Inhaler Frequency", value: "2 puffs / day", status: "Normal" },
      { name: "SPO2 Baseline", value: "99%", status: "Normal" }
    ]
  },
  {
    id: "rec-3",
    name: "COVID-19 Booster Certificate",
    category: "Vaccine Card",
    date: "2025-11-20",
    doctorName: "Vaidya Vaccination Hub",
    hospitalName: "Apollo Vaccination Cell, Bangalore",
    fileSize: "680 KB",
    summary: "Successful administration details of Covishield/AstraZeneca 3rd dose booster. Zero immediate post-administration complications reported.",
    keyMetrics: [
      { name: "Dose Count", value: "3 of 3", status: "Normal" }
    ]
  }
];

export const MOCK_APPOINTMENTS = [
  {
    id: "apt-1",
    doctorId: "doc-1",
    doctorName: "Dr. Alok Sharma",
    specialty: "Cardiologist",
    date: "2026-06-20",
    time: "11:30 AM",
    status: "Confirmed",
    reason: "Lipid profile follow-up & cardiac health evaluation."
  },
  {
    id: "apt-2",
    doctorId: "doc-3",
    doctorName: "Dr. Sarah D'Souza",
    specialty: "Dermatologist",
    date: "2026-06-25",
    time: "04:00 PM",
    status: "Confirmed",
    reason: "Routine eczema treatment planning and skin check."
  },
  {
    id: "apt-3",
    doctorId: "doc-2",
    doctorName: "Dr. Priya Deshmukh",
    specialty: "Pediatrician",
    date: "2026-05-10",
    time: "12:00 PM",
    status: "Completed",
    reason: "Vaccination advisory consultation for child."
  }
];

export const MOCK_MEDICINES: Medicine[] = [
  {
    id: "med-1",
    name: "Metformin 500mg",
    category: "Anti-Diabetic",
    price: 120,
    requiresPrescription: true,
    description: "Oral diabetes medicine that helps control blood sugar levels. Used together with diet and exercise to improve glycemic control in adults with type 2 diabetes mellitus.",
    manufacturer: "Cipla Pharmaceuticals",
    alternatives: ["Glycomet 500", "Obimet 500", "Metfor-G"],
    usages: ["Type 2 Diabetes", "Insulin Resistance", "PCOS Management"],
    sideEffects: ["Nausea", "Diarrhea", "Abdominal Pain", "Lactic Acidosis"],
    interactions: [
      { substance: "Alcohol", severity: "Severe", effect: "Increases the risk of lactic acidosis and hypoglycemia." }
    ],
    dosage: "Take 1 tablet twice daily with meals or as directed by a physician."
  },
  {
    id: "med-2",
    name: "Amoxicillin 500mg",
    category: "Antibiotic",
    price: 290,
    requiresPrescription: true,
    description: "Penicillin antibiotic that fights bacteria. Used to treat many different types of infection caused by bacteria, such as tonsillitis, bronchitis, pneumonia, and infections of the ear, nose, throat, skin, or urinary tract.",
    manufacturer: "Abbott Healthcare",
    alternatives: ["Mox 500", "Novamox 500", "Almox 500"],
    usages: ["Bacterial Infections", "Sinusitis", "Streptococcal Pharyngitis"],
    sideEffects: ["Rashes", "Diarrhea", "Vomiting", "Allergic Reactions"],
    interactions: [
      { substance: "Oral Contraceptives", severity: "Mild", effect: "May reduce the efficacy of estrogen-containing birth control." }
    ],
    dosage: "Take 1 capsule every 8 hours for 7-10 days as prescribed."
  },
  {
    id: "med-3",
    name: "Atorvastatin 10mg",
    category: "Statin",
    price: 180,
    requiresPrescription: true,
    description: "HMG CoA reductase inhibitor, or 'statin' medication. It reduces levels of 'bad' cholesterol (low-density lipoprotein, or LDL) and triglycerides in the blood, while increasing levels of 'good' cholesterol (high-density lipoprotein, or HDL).",
    manufacturer: "Sun Pharmaceutical",
    alternatives: ["Lipivas 10", "Storvas 10", "Tonact 10"],
    usages: ["Hypercholesterolemia", "Cardiovascular Risk Prevention"],
    sideEffects: ["Muscle Pain", "Joint Pain", "Headache", "Elevated Liver Enzymes"],
    interactions: [
      { substance: "Grapefruit Juice", severity: "Moderate", effect: "Increases the drug concentration in blood, rising risks of muscle breakdown." }
    ],
    dosage: "Take 1 tablet daily at bedtime or as directed by a physician."
  },
  {
    id: "med-4",
    name: "Paracetamol 650mg",
    category: "Analgesic",
    price: 40,
    requiresPrescription: false,
    description: "Analgesic (pain reliever) and antipyretic (fever reducer). Used to treat mild to moderate pain (from headaches, menstrual periods, toothaches, backaches, osteoarthritis, or cold/flu aches) and to reduce fever.",
    manufacturer: "GSK Consumer Health",
    alternatives: ["Calpol 650", "Dolo 650", "Pacimol 650"],
    usages: ["Fever Reduction", "Mild Pain Relief", "Headache"],
    sideEffects: ["Nausea", "Allergic Skin Rash", "Liver Damage (on overdose)"],
    interactions: [
      { substance: "Alcohol", severity: "Moderate", effect: "Chronic consumption increases the risk of severe hepatotoxicity." }
    ],
    dosage: "Take 1 tablet every 4 to 6 hours as needed. Do not exceed 4 tablets in 24 hours."
  }
];

