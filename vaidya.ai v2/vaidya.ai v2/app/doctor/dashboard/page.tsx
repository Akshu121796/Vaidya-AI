"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Calendar, 
  Users, 
  Clock, 
  FileText, 
  UserCheck, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  PlusCircle, 
  Search, 
  ToggleLeft, 
  ToggleRight,
  ExternalLink,
  ChevronRight,
  XCircle,
  FileSpreadsheet
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useHealthStore } from "@/store/useHealthStore";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Mock Patients list for Doctor Queue
const QUEUE_PATIENTS = [
  { id: "pat-101", name: "Ram Lal", age: 52, gender: "Male", time: "09:30 AM", reason: "Post-cardiac lipid review", vitals: "BP: 135/85, SPO2: 97%, Pulse: 78", patientId: undefined },
  { id: "pat-102", name: "Sita Devi", age: 43, gender: "Female", time: "10:15 AM", reason: "Prenatal routine check", vitals: "BP: 118/75, SPO2: 99%, Pulse: 70", patientId: undefined },
  { id: "pat-103", name: "Karan Singh", age: 29, gender: "Male", time: "11:00 AM", reason: "Acute asthmatic flare", vitals: "BP: 122/80, SPO2: 95%, Pulse: 85", patientId: undefined },
  { id: "pat-104", name: "Sunita Verma", age: 35, gender: "Female", time: "11:30 AM", reason: "Seasonal high fever check", vitals: "BP: 110/70, SPO2: 98%, Pulse: 94", patientId: undefined }
];

// Mock Consultation Requests
const CONSULT_REQUESTS = [
  { id: "req-1", patientName: "Asha Worker / savita devi (Mirzapur)", referral: "Laxmi Devi (Age 62)", symptoms: "Hypertension crisis (BP 162/98)", time: "5 mins ago" },
  { id: "req-2", patientName: "Asha Worker / preeti sharma (Sonbhadra)", referral: "Rohan Kumar (Age 6)", symptoms: "Severe dehydration & vomiting", time: "15 mins ago" }
];

// Recharts Traffic Data
const APPOINTMENT_TRENDS = [
  { day: "Mon", patients: 12 },
  { day: "Tue", patients: 19 },
  { day: "Wed", patients: 15 },
  { day: "Thu", patients: 22 },
  { day: "Fri", patients: 18 },
  { day: "Sat", patients: 8 }
];

const DOCTOR_TRANSLATIONS = {
  English: {
    terminalTitle: "Physician Clinical Terminal",
    terminalDesc: "Manage regional health queues, telemedicine referrals, and secure ABDM prescriptions.",
    telehealthIntake: "Telehealth Intake:",
    online: "Online",
    offline: "Offline",
    activeSession: "Active Session",
    goodMorning: "Good Morning",
    welcomeBack: "Welcome back to your clinical terminal. Triage queues and telehealth calls are online.",
    activePractitioner: "Active Practitioner",
    loggedToday: "Patients Logged Today",
    completed: "Consultations Completed",
    avgWait: "Average Queue Wait Time",
    patientsLabel: "Patients",
    minutesLabel: "Minutes",
    completedLabel: "Completed",
    overview: "Overview",
    appointments: "Appointments",
    queue: "Queue",
    prescriptions: "Prescriptions",
    availability: "Availability",
    intakeStatus: "Intake Status:",
    abdmId: "ABDM ID:",
    activeQueueLabel: "Active Patient Queue",
    viewAllQueue: "View All Queue",
    reasonLabel: "Reason",
    ashaReferrals: "ASHA Worker Referral Calls",
    noIncomingCalls: "No incoming telehealth consult requests.",
    referralLabel: "referral",
    patientLabel: "Patient",
    symptomsLabel: "Symptoms",
    acceptBtn: "Accept",
    declineBtn: "Decline",
    consultationTrends: "Consultation Trends",
    dailyTraffic: "Daily Traffic Overview",
    weeklyConsultations: "Weekly physical & virtual consultations.",
    todaySchedule: "Today's Appointment Schedule",
    slotTime: "Slot Time",
    patientName: "Patient Name",
    category: "Category",
    status: "Status",
    actions: "Actions",
    scheduled: "Scheduled",
    details: "Details",
    ageGender: "Age/Gender",
    complaint: "Complaint",
    triageVitalsBuffer: "Triage Vitals Buffer",
    writePrescription: "Write Prescription",
    medicalLockerView: "Medical Locker View",
    composerTitle: "ABDM e-Prescription Composer",
    composerDesc: "Submit secure electronic prescription guidelines.",
    targetPatient: "Target Patient",
    medsDosage: "Medications & Dosage",
    specialInstructions: "Special Instructions / Diagnostic Notes",
    signLock: "Sign & Lock e-Prescription",
    availabilitySettings: "Practitioner Availability Settings",
    availabilityDesc: "Define your clinic slots and remote intake configurations. When remote consultations are toggled off, ASHA workers will see you as offline.",
    telehealthConsult: "Telehealth Audio/Video Consultation",
    activeState: "Active",
    pausedState: "Paused",
    workHours: "Scheduled Work Hours",
    monFri: "Monday - Friday",
    sat: "Saturday",
    chiefComplaint: "Chief Symptom Complaint",
    triageLogs: "Triage Vitals Logs",
    diagnosticHistory: "Clinical Diagnostic History",
    historyDesc: "Prior history of mild hypertension. No drug allergies reported. Patient maintains active compliance.",
    closeProfile: "Close Profile"
  },
  Hindi: {
    terminalTitle: "चिकित्सक नैदानिक ​​टर्मिनल",
    terminalDesc: "क्षेत्रीय स्वास्थ्य कतारों, टेलीमेडिसिन रेफरल और सुरक्षित एबीडीएम नुस्खे प्रबंधित करें।",
    telehealthIntake: "टेलीहेल्थ इनटेक:",
    online: "ऑनलाइन",
    offline: "ऑफ़लाइन",
    activeSession: "सक्रिय सत्र",
    goodMorning: "शुभ प्रभात",
    welcomeBack: "आपके नैदानिक ​​​​टर्मिनल पर आपका स्वागत है। ट्राइएज कतारें और टेलीहेल्थ कॉल ऑनलाइन हैं।",
    activePractitioner: "सक्रिय चिकित्सक",
    loggedToday: "आज दर्ज मरीज",
    completed: "परामर्श पूरा हुआ",
    avgWait: "औसत कतार प्रतीक्षा समय",
    patientsLabel: "मरीज",
    minutesLabel: "मिनट",
    completedLabel: "पूरा हुआ",
    overview: "अवलोकन",
    appointments: "नियुक्तियां",
    queue: "कतार",
    prescriptions: "परामर्श नुस्खे",
    availability: "उपलब्धता",
    intakeStatus: "इनटेक स्थिति:",
    abdmId: "एबीडीएम आईडी:",
    activeQueueLabel: "सक्रिय रोगी कतार",
    viewAllQueue: "पूरी कतार देखें",
    reasonLabel: "कारण",
    ashaReferrals: "आशा कार्यकर्ता रेफरल कॉल",
    noIncomingCalls: "कोई इनकमिंग टेलीहेल्थ परामर्श अनुरोध नहीं है।",
    referralLabel: "रेफरल",
    patientLabel: "रोगी",
    symptomsLabel: "लक्षण",
    acceptBtn: "स्वीकार करें",
    declineBtn: "अस्वीकार करें",
    consultationTrends: "परामर्श रुझान",
    dailyTraffic: "दैनिक ट्रैफ़िक अवलोकन",
    weeklyConsultations: "साप्ताहिक शारीरिक और आभासी परामर्श।",
    todaySchedule: "आज की नियुक्ति अनुसूची",
    slotTime: "समय स्लॉट",
    patientName: "रोगी का नाम",
    category: "श्रेणी",
    status: "स्थिति",
    actions: "कार्रवाई",
    scheduled: "निर्धारित",
    details: "विवरण",
    ageGender: "उम्र/लिंग",
    complaint: "शिकायत",
    triageVitalsBuffer: "ट्राइएज वाइटल्स बफर",
    writePrescription: "नुस्खा लिखें",
    medicalLockerView: "मेडिकल लॉकर देखें",
    composerTitle: "एबीडीएम ई-प्रिस्क्रिप्शन कंपोज़र",
    composerDesc: "सुरक्षित इलेक्ट्रॉनिक नुस्खे सबमिट करें।",
    targetPatient: "लक्षित रोगी",
    medsDosage: "दवाएं और खुराक",
    specialInstructions: "विशेष निर्देश / नैदानिक ​​नोट्स",
    signLock: "हस्ताक्षर करें और ई-प्रिस्क्रिप्शन लॉक करें",
    availabilitySettings: "चिकित्सक उपलब्धता सेटिंग्स",
    availabilityDesc: "अपने क्लिनिक स्लॉट और रिमोट इनटेक कॉन्फ़िगरेशन को परिभाषित करें। जब रिमोट परामर्श बंद कर दिया जाता है, तो आशा कार्यकर्ता आपको ऑफ़लाइन देखेंगे।",
    telehealthConsult: "टेलीहेल्थ ऑडियो/वीडियो परामर्श",
    activeState: "सक्रिय",
    pausedState: "रुका हुआ",
    workHours: "निर्धारित कार्य समय",
    monFri: "सोमवार - शुक्रवार",
    sat: "शनिवार",
    chiefComplaint: "मुख्य लक्षण शिकायत",
    triageLogs: "ट्राइएज वाइटल्स लॉग्स",
    diagnosticHistory: "नैदानिक ​​इतिहास",
    historyDesc: "हल्के उच्च रक्तचाप का पिछला इतिहास। किसी दवा की एलर्जी की सूचना नहीं है। रोगी सक्रिय अनुपालन बनाए रखता है।",
    closeProfile: "प्रोफ़ाइल बंद करें"
  },
  Marathi: {
    terminalTitle: "वैद्यकीय क्लिनिकल टर्मिनल",
    terminalDesc: "प्रादेशिक आरोग्य रांगा, टेलिमेडिसिन संदर्भ आणि सुरक्षित एबीडीएम औषधोपचार व्यवस्थापित करा.",
    telehealthIntake: "टेलिहेल्थ इनटेक:",
    online: "ऑनलाइन",
    offline: "ऑफलाइन",
    activeSession: "सक्रिय सत्र",
    goodMorning: "शुभ प्रभात",
    welcomeBack: "तुमच्या क्लिनिकल टर्मिनलवर आपले स्वागत आहे। ट्राइएज रांगा आणि टेलिहेल्थ कॉल्स ऑनलाइन आहेत.",
    activePractitioner: "सक्रिय चिकित्सक",
    loggedToday: "आज नोंदवलेले रुग्ण",
    completed: "पूर्ण झालेल्या सल्लामसलत",
    avgWait: "सरासरी रांगेत प्रतीक्षा वेळ",
    patientsLabel: "रुग्ण",
    minutesLabel: "मिनिटे",
    completedLabel: "पूर्ण",
    overview: "आढावा",
    appointments: "अपॉइंटमेंट्स",
    queue: "रांग",
    prescriptions: "औषधोपचार",
    availability: "उपलब्धता",
    intakeStatus: "इनटेक स्थिती:",
    abdmId: "एबीडीएम आयडी:",
    activeQueueLabel: "सक्रिय रुग्ण रांग",
    viewAllQueue: "सर्व रांग पहा",
    reasonLabel: "कारण",
    ashaReferrals: "आशा स्वयंसेविका रेफरल कॉल्स",
    noIncomingCalls: "कोणतेही येणारे टेलिहेल्थ सल्लामसलत विनंत्या नाहीत.",
    referralLabel: "रेफरल",
    patientLabel: "रुग्ण",
    symptomsLabel: "लक्षणे",
    acceptBtn: "स्वीकार करा",
    declineBtn: "नाकारा",
    consultationTrends: "सल्लामसलत ट्रेंड",
    dailyTraffic: "दैनिक रहदारी आढावा",
    weeklyConsultations: "साप्ताहिक शारीरिक आणि आभासी सल्लामसलत.",
    todaySchedule: "आजचे अपॉइंटमेंट वेळापत्रक",
    slotTime: "वेळ स्लॉट",
    patientName: "रुग्णाचे नाव",
    category: "वर्ग",
    status: "स्थिती",
    actions: "कृती",
    scheduled: "नियोजित",
    details: "तपशील",
    ageGender: "वय/लिंग",
    complaint: "तक्रार",
    triageVitalsBuffer: "ट्राइएज वाइटल्स बफर",
    writePrescription: "औषधोपचार लिहा",
    medicalLockerView: "वैद्यकीय लॉकर पहा",
    composerTitle: "एबीडीएम ई-प्रिस्क्रिप्शन कंपोझर",
    composerDesc: "सुरक्षित इलेक्ट्रॉनिक औषधोपचार मार्गदर्शक तत्त्वे सबमिट करा.",
    targetPatient: "लक्ष्य रुग्ण",
    medsDosage: "औषधे आणि डोस",
    specialInstructions: "विशेष सूचना / निदान नोट्स",
    signLock: "स्वाक्षरी करा आणि ई-प्रिस्क्रिप्शन लॉक करा",
    availabilitySettings: "वैद्यकीय उपलब्धता सेटिंग्ज",
    availabilityDesc: "तुमच्या क्लिनिकच्या वेळा आणि रिमोट इनटेक कॉन्फिगरेशन परिभाषित करा. जेव्हा रिमोट सल्लामसलत बंद असते, तेव्हा आशा स्वयंसेविका तुम्हाला ऑफलाइन पाहतील.",
    telehealthConsult: "टेलिहेल्थ ऑडिओ/व्हिडिओ सल्लामसलत",
    activeState: "सक्रिय",
    pausedState: "थांबवले",
    workHours: "नियोजित कामाचे तास",
    monFri: "सोमवार - शुक्रवार",
    sat: "शनिवार",
    chiefComplaint: "मुख्य लक्षण तक्रार",
    triageLogs: "ट्राइएज वाइटल्स लॉग्स",
    diagnosticHistory: "वैद्यकीय इतिहास",
    historyDesc: "सौम्य उच्च रक्तदाबाचा पूर्व इतिहास. कोणतीही औषध ॲलर्जी नोंदवली नाही. रुग्ण सक्रिय अनुपालन राखतो.",
    closeProfile: "प्रोफाइल बंद करा"
  }
};

export default function DoctorDashboard() {
  const searchParams = useSearchParams();
  const activeTabParam = searchParams.get("tab");
  const { toast } = useToast();
  const { user, appointments, fetchAppointments, language } = useHealthStore();

  const activeLang = (language === "Hindi" || language === "Marathi") ? language : "English";
  const t = DOCTOR_TRANSLATIONS[activeLang] as Record<string, string>;

  const doctorDisplayName = user?.name 
    ? (user.name.startsWith("Dr.") 
        ? user.name.split(" ").slice(0, 2).join(" ") 
        : `Dr. ${user.name.split(" ")[0]}`)
    : "Dr. Clinician";

  const [activeTab, setActiveTab] = useState("overview");
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  
  // Consultation Requests state
  const [requests, setRequests] = useState(CONSULT_REQUESTS);

  // Prescription Form state
  const [prescriptionPatient, setPrescriptionPatient] = useState("");
  const [prescriptionMeds, setPrescriptionMeds] = useState("");
  const [prescriptionInstructions, setPrescriptionInstructions] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  // Load appointments and availability on mount
  useEffect(() => {
    if (user && user.role === "doctor") {
      fetchAppointments();
      
      // Fetch doctor availability
      api.get<{ success: boolean; data: { doctor: any } }>("/api/doctors/me")
        .then((res) => {
          if (res.success && res.data?.doctor) {
            setIsAvailable(res.data.doctor.is_available);
          }
        })
        .catch((e) => console.error("Failed to load availability on mount:", e));
    }
  }, [user, fetchAppointments]);

  // Sync state tab parameter
  useEffect(() => {
    if (activeTabParam) {
      setActiveTab(activeTabParam);
    }
  }, [activeTabParam]);

  const activeQueue = appointments
    .filter(a => a.status === 'Confirmed')
    .map(a => ({
      ...a,
      name: a.patientName || "Unknown Patient"
    }));

  // Submit Prescription
  const handlePrescriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prescriptionPatient.trim() || !prescriptionMeds.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter patient name/phone and medications list.",
        variant: "destructive"
      });
      return;
    }

    let patientId = selectedPatientId;
    let appointmentId = selectedAppointmentId;

    if (!patientId) {
      const match = appointments.find(
        (a) => a.patientName?.toLowerCase().includes(prescriptionPatient.trim().toLowerCase())
      );
      patientId = match?.patientId || null;
      appointmentId = match?.id || null;
    }

    try {
      const parsedLines = prescriptionMeds
        .split("\n")
        .map(l => l.trim())
        .filter(l => l.length > 0);

      const medicines = parsedLines.map(line => {
        const parts = line.split("-").map(p => p.trim());
        const namePart = parts[0] || "Unknown Medication";
        const dosagePart = parts[1] || "1-0-1";
        const durationPart = parts[2] || "5 days";
        
        let name = namePart;
        let dosage = "500mg";
        const matchWeight = namePart.match(/(\d+\s*(mg|g|ml))/i);
        if (matchWeight) {
          dosage = matchWeight[0];
          name = namePart.replace(matchWeight[0], "").trim();
        }

        return {
          name,
          dosage,
          frequency: dosagePart,
          duration: durationPart,
        };
      });

      const res = await api.post<{ success: boolean }>("/api/prescriptions", {
        patientId,
        appointmentId,
        medicines,
        notes: prescriptionInstructions || ""
      });

      if (res.success) {
        toast({
          title: "Prescription Logged Successfully",
          description: `e-Prescription secured via ABDM gateway for ${prescriptionPatient}.`,
          variant: "default"
        });

        setPrescriptionMeds("");
        setPrescriptionInstructions("");
        setSelectedPatientId(null);
        setSelectedAppointmentId(null);
        setActiveTab("overview");
      }
    } catch (err: any) {
      toast({
        title: "Submission Failed",
        description: err.message || "Failed to secure e-prescription. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Availability toggle handler
  const handleAvailabilityToggle = async () => {
    if (!user || !user.doctorId) {
      toast({
        title: "Session Error",
        description: "Doctor profile session not loaded. Please log in again.",
        variant: "destructive"
      });
      return;
    }

    const nextState = !isAvailable;
    try {
      const res = await api.put<{ success: boolean; data: { doctor: any } }>(
        `/api/doctors/${user.doctorId}/availability`,
        { isAvailable: nextState }
      );
      if (res.success) {
        setIsAvailable(nextState);
        toast({
          title: "Availability Updated",
          description: `You are now ${nextState ? "Online & Available" : "Offline / Unavailable"} for telehealth calls.`,
          variant: "default"
        });
      }
    } catch (e: any) {
      toast({
        title: "Failed to Update Availability",
        description: e.message || "An error occurred updating availability.",
        variant: "destructive"
      });
    }
  };

  // Accept request handler
  const handleAcceptRequest = (id: string, name: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    toast({
      title: "Request Approved",
      description: `Telehealth consult connection established with ${name}.`,
      variant: "default"
    });
  };

  // Reject request
  const handleRejectRequest = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    toast({
      title: "Request Declined",
      description: "Consultation request routed back to local triage queue.",
      variant: "destructive"
    });
  };

  return (
    <div className="flex flex-col gap-6 pb-16 select-none text-foreground">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <UserCheck className="h-6.5 w-6.5 text-primary" />
            {t.terminalTitle}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">{t.terminalDesc}</p>
        </div>

        {/* Availability Toggle Widget */}
        <div className="flex items-center gap-2 bg-[#0b101c]/80 border border-white/5 p-2 rounded-xl">
          <span className="text-xs font-bold text-muted-foreground">{t.telehealthIntake}</span>
          <button onClick={handleAvailabilityToggle} className="flex items-center">
            {isAvailable ? (
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold">
                {t.online} <ToggleRight className="h-5.5 w-5.5 text-emerald-400" />
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-muted-foreground font-bold">
                {t.offline} <ToggleLeft className="h-5.5 w-5.5 text-muted-foreground" />
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Welcome Greeting Banner */}
      <div className="relative p-5 rounded-2xl border border-[#06b6d4]/10 bg-[#071520]/45 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#06b6d4]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col gap-1.5">
          <span className="bg-[#06b6d4]/20 text-[#06b6d4] px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border border-[#06b6d4]/20 w-fit">{t.activeSession}</span>
          <h2 className="text-lg md:text-xl font-extrabold text-white mt-1">{t.goodMorning}, {doctorDisplayName} 👨‍⚕️</h2>
          <p className="text-xs text-muted-foreground">{t.welcomeBack}</p>
        </div>
      </div>

      {/* Overview Stat Cards */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-panel glass-panel-hover rounded-xl border-[#06b6d4]/20 bg-[#06b6d4]/5">
            <CardHeader className="flex flex-row items-center gap-3 p-4">
              <div className="h-10 w-10 rounded-lg overflow-hidden bg-neutral-800 shrink-0 border border-[#06b6d4]/20 shadow-md">
                <img src={user?.avatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150"} alt={user?.name} className="object-cover h-full w-full" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-[9px] uppercase font-bold tracking-wider text-[#06b6d4]">{t.activePractitioner}</CardTitle>
                <h4 className="text-xs font-extrabold text-white truncate mt-0.5">{user?.name}</h4>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[10px] text-muted-foreground flex flex-col gap-1">
              <div className="flex justify-between">
                <span>{t.abdmId}</span>
                <span className="font-mono text-white font-bold">{user?.id}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.intakeStatus}</span>
                <span className="text-emerald-400 font-bold">{t.online} & {activeLang === "English" ? "Active" : "सक्रिय"}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel glass-panel-hover rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
              <CardTitle className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">{t.loggedToday}</CardTitle>
              <Users className="h-4.5 w-4.5 text-primary" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl font-extrabold text-white">{activeQueue.length + 14} {t.patientsLabel}</div>
              <p className="text-[9px] text-muted-foreground mt-1">{activeQueue.length} active in queue</p>
            </CardContent>
          </Card>

          <Card className="glass-panel glass-panel-hover rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
              <CardTitle className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">{t.completed}</CardTitle>
              <CheckCircle2 className="h-4.5 w-4.5 text-cyan-400" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl font-extrabold text-white">14 {activeLang === "English" ? "Completed" : activeLang === "Hindi" ? "पूरा हुआ" : "पूर्ण"}</div>
              <p className="text-[9px] text-emerald-400 font-bold mt-1">78% target achieved</p>
            </CardContent>
          </Card>

          <Card className="glass-panel glass-panel-hover rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
              <CardTitle className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">{t.avgWait}</CardTitle>
              <Clock className="h-4.5 w-4.5 text-amber-400" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl font-extrabold text-white">12 {activeLang === "English" ? "Minutes" : activeLang === "Hindi" ? "मिनट" : "मिनिटे"}</div>
              <p className="text-[9px] text-emerald-400 font-bold mt-1">Optimal triage flow</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab Selectors */}
      <div className="flex gap-2 border-b border-white/5 pb-2">
        {["overview", "appointments", "queue", "prescriptions", "availability"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
              activeTab === tab 
                ? "bg-primary/20 text-primary border border-primary/30" 
                : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
            }`}
          >
            {t[tab] || tab}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="min-h-[400px]">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Col: Queue and Requests */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Queue */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Patient Queue</h3>
                  <button onClick={() => setActiveTab("queue")} className="text-xs font-bold text-primary hover:underline">View All Queue</button>
                </div>
                <div className="flex flex-col gap-2.5">
                  {activeQueue.slice(0, 3).map((pat) => (
                    <div 
                      key={pat.id}
                      onClick={() => setSelectedPatient(pat)}
                      className="p-3.5 rounded-xl border border-white/5 bg-card/40 hover:bg-[#121828] hover:border-white/10 transition-all flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground shrink-0 font-bold text-xs">
                          {pat.time.split(" ")[0]}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white flex items-center gap-2">
                            {pat.name}
                            <Badge variant="outline" className="text-[8px] uppercase">{pat.gender}, {pat.age}y</Badge>
                          </h4>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Reason: {pat.reason}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Consultation Requests Referral */}
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">ASHA Worker Referral Calls</h3>
                <div className="flex flex-col gap-2.5">
                  {requests.length === 0 ? (
                    <div className="p-4 text-center rounded-xl border border-dashed border-white/5 text-muted-foreground text-xs font-bold">
                      No incoming telehealth consult requests.
                    </div>
                  ) : (
                    requests.map((req) => (
                      <div key={req.id} className="p-4 rounded-xl border border-[#06b6d4]/20 bg-[#06b6d4]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="text-xs">
                          <h4 className="font-extrabold text-white flex items-center gap-1.5">
                            <AlertTriangle className="h-4 w-4 text-cyan-400 animate-pulse" />
                            {req.patientName} referral
                          </h4>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Patient: {req.referral} • Symptoms: {req.symptoms}</p>
                          <span className="text-[8px] text-muted-foreground tracking-wide font-bold">{req.time}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleAcceptRequest(req.id, req.referral)}
                            size="sm" 
                            className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-xs font-bold px-3 py-1"
                          >
                            Accept
                          </Button>
                          <Button 
                            onClick={() => handleRejectRequest(req.id)}
                            variant="outline" 
                            size="sm" 
                            className="border-white/10 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/25 rounded-lg text-xs font-bold px-3 py-1"
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Right Col: Consultation Analytics Chart */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Consultation Trends</h3>
              <Card className="glass-panel border-white/5 bg-[#0b101c]/55 p-4 rounded-xl h-[330px] flex flex-col justify-between">
                <div>
                  <CardTitle className="text-xs uppercase font-extrabold text-white">Daily Traffic Overview</CardTitle>
                  <CardDescription className="text-[10px]">Weekly physical & virtual consultations.</CardDescription>
                </div>
                
                <div className="h-[220px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={APPOINTMENT_TRENDS}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#0b101c", border: "1px solid rgba(255,255,255,0.1)" }} />
                      <Line type="monotone" dataKey="patients" stroke="#10b981" strokeWidth={2} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

          </div>
        )}

        {/* Tab: Appointments */}
        {activeTab === "appointments" && (
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Today's Appointment Schedule</h3>
            <div className="rounded-xl border border-white/5 bg-black/40 overflow-hidden">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5 text-[10px] uppercase font-bold text-muted-foreground">
                      <th className="p-3">Slot Time</th>
                      <th className="p-3">Patient Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {activeQueue.map((pat) => (
                      <tr key={pat.id} className="hover:bg-white/5 transition-all">
                        <td className="p-3 font-bold text-white">{pat.time}</td>
                        <td className="p-3">
                          <span className="font-bold text-white">{pat.name}</span>
                          <span className="text-[10px] text-muted-foreground ml-1">({pat.gender}, {pat.age}y)</span>
                        </td>
                        <td className="p-3 text-muted-foreground">{pat.reason}</td>
                        <td className="p-3">
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[8px] uppercase">Scheduled</Badge>
                        </td>
                        <td className="p-3">
                          <Button size="sm" variant="outline" onClick={() => setSelectedPatient(pat)} className="text-[10px] h-7 rounded-lg">Details</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Queue */}
        {activeTab === "queue" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeQueue.map((pat) => (
              <Card key={pat.id} className="glass-panel border-white/5 bg-[#0b101c]/45 p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-extrabold text-white">{pat.name}</h4>
                    <span className="text-[10px] text-primary font-bold">{pat.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Age/Gender: {pat.age} / {pat.gender}</p>
                  <p className="text-xs text-muted-foreground mt-2 font-medium">Complaint: {pat.reason}</p>
                  
                  <div className="mt-3 p-2.5 rounded-lg bg-black/40 border border-white/5 text-[10px] font-mono text-muted-foreground">
                    <strong className="text-white block mb-0.5">Triage Vitals Buffer:</strong>
                    {pat.vitals}
                  </div>
                </div>
 
                <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setPrescriptionPatient(pat.name);
                      setSelectedPatientId(pat.patientId || null);
                      setSelectedAppointmentId(pat.id.startsWith("apt-") ? null : pat.id);
                      setActiveTab("prescriptions");
                    }}
                    className="flex-1 bg-primary hover:bg-emerald-600 rounded-lg text-xs font-bold py-1.5"
                  >
                    Write Prescription
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setSelectedPatient(pat)}
                    className="border-white/10 hover:bg-white/5 rounded-lg text-xs font-bold py-1.5"
                  >
                    Medical Locker View
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Tab: Prescriptions */}
        {activeTab === "prescriptions" && (
          <Card className="glass-panel border-white/5 bg-[#0b101c]/55 max-w-xl mx-auto rounded-xl">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-sm uppercase font-extrabold text-white flex items-center gap-1.5">
                <PlusCircle className="h-4.5 w-4.5 text-primary" />
                ABDM e-Prescription Composer
              </CardTitle>
              <CardDescription className="text-[10px]">Submit secure electronic prescription guidelines.</CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handlePrescriptionSubmit} className="flex flex-col gap-4">
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Target Patient</label>
                  <Input 
                    type="text" 
                    value={prescriptionPatient} 
                    onChange={(e) => setPrescriptionPatient(e.target.value)} 
                    className="bg-black/40 border-white/5 text-xs h-10 rounded-xl"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Medications & Dosage</label>
                  <Input 
                    type="text" 
                    placeholder="e.g. Paracetamol 650mg - 1-0-1 after meals (5 days)"
                    value={prescriptionMeds} 
                    onChange={(e) => setPrescriptionMeds(e.target.value)} 
                    className="bg-black/40 border-white/5 text-xs h-10 rounded-xl"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Special Instructions / Diagnostic Notes</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Bed rest advised. Settle fluid balance. Monitor SPO2 every 4 hours."
                    value={prescriptionInstructions} 
                    onChange={(e) => setPrescriptionInstructions(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 p-3 text-xs rounded-xl focus:outline-none focus:border-primary/50 text-foreground"
                  />
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-emerald-600 rounded-xl font-bold h-10 mt-2">
                  Sign & Lock e-Prescription
                </Button>

              </form>
            </CardContent>
          </Card>
        )}

        {/* Tab: Availability */}
        {activeTab === "availability" && (
          <Card className="glass-panel border-white/5 bg-[#0b101c]/55 max-w-md mx-auto rounded-xl p-6 flex flex-col gap-4">
            <h3 className="text-xs uppercase font-extrabold text-white tracking-wider">Practitioner Availability Settings</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Define your clinic slots and remote intake configurations. When remote consultations are toggled off, ASHA workers will see you as offline.
            </p>

            <div className="flex items-center justify-between p-3.5 bg-black/40 border border-white/5 rounded-xl">
              <span className="text-xs font-bold text-white">Telehealth Audio/Video Consultation</span>
              <button 
                onClick={handleAvailabilityToggle}
                className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase ${isAvailable ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-muted-foreground"}`}
              >
                {isAvailable ? "Active" : "Paused"}
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Scheduled Work Hours</span>
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs text-muted-foreground flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <strong className="text-white">09:00 AM - 05:00 PM</strong>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <strong className="text-white">09:00 AM - 01:00 PM</strong>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Patient Detail Dialogue */}
      <Dialog open={!!selectedPatient} onOpenChange={(open) => !open && setSelectedPatient(null)}>
        <DialogContent className="max-w-md bg-[#090d16] border border-white/10 rounded-2xl p-6">
          {selectedPatient && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base font-extrabold text-white">{selectedPatient.name}</DialogTitle>
                <DialogDescription className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                  ID Ref: {selectedPatient.id} • {selectedPatient.gender}, {selectedPatient.age} years old
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4 pt-3">
                
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs">
                  <h5 className="font-extrabold text-white mb-1.5 uppercase text-[9px] tracking-wider text-primary">Chief Symptom Complaint</h5>
                  {selectedPatient.reason}
                </div>

                <div className="p-3 bg-black/45 rounded-xl border border-white/5 text-xs font-mono">
                  <h5 className="font-extrabold text-white mb-1.5 uppercase text-[9px] tracking-wider text-primary">Triage Vitals Logs</h5>
                  {selectedPatient.vitals}
                </div>

                <div className="flex flex-col gap-1.5">
                  <h5 className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">Clinical Diagnostic History</h5>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[10px] text-muted-foreground leading-relaxed">
                    Prior history of mild hypertension. No drug allergies reported. Patient maintains active compliance.
                  </div>
                </div>

              </div>

              <DialogFooter className="flex gap-2 pt-4 mt-2 border-t border-white/5">
                <Button 
                  onClick={() => {
                    setPrescriptionPatient(selectedPatient.name);
                    setSelectedPatientId(selectedPatient.patientId || null);
                    setSelectedAppointmentId(selectedPatient.id.startsWith("apt-") ? null : selectedPatient.id);
                    setSelectedPatient(null);
                    setActiveTab("prescriptions");
                  }}
                  className="flex-1 bg-primary hover:bg-emerald-600 rounded-xl text-xs font-bold py-1.5"
                >
                  Write Prescription
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedPatient(null)}
                  className="border-white/5 bg-[#0a0e19] text-xs font-semibold rounded-xl"
                >
                  Close Profile
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
