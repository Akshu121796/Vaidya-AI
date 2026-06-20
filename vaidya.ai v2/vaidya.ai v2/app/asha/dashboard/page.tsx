"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { 
  UserPlus, 
  Activity, 
  Calendar, 
  RefreshCw, 
  Save, 
  ShieldCheck, 
  Tablet, 
  Heart,
  User,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  ArrowRight,
  Database
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useHealthStore } from "@/store/useHealthStore";
import { useToast } from "@/components/ui/toast";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

interface SyncRecord {
  type: 'PATIENT_REGISTRATION' | 'SYMPTOM_REPORT' | 'APPOINTMENT_BOOKING';
  offlineId: string;
  timestamp: string;
  payload: any;
}

// Default patients (pre-cleaned phone numbers)
const DEFAULT_PATIENTS = [
  { id: "pat-1", name: "Ram Lal (राम लाल)", age: 52, phone: "9876501234" },
  { id: "pat-2", name: "Sita Devi (सीता देवी)", age: 43, phone: "9876556789" },
  { id: "pat-3", name: "Karan Singh (करण सिंह)", age: 29, phone: "9876599012" }
];

const ASHA_TRANSLATIONS = {
  English: {
    welcome: "Welcome",
    ashaCompanion: "ASHA Companion",
    activeSession: "Active Session",
    offlineRegisters: "Offline village health registers buffer.",
    syncStatusActive: "Sync Status: offline buffer active",
    unsyncedRecords: "unsynced health records in local cache",
    localRecordCount: "local records",
    syncNow: "Sync Now",
    registerPatient: "Register Patient",
    logVitals: "Log Vitals",
    scheduleVisit: "Schedule Visit",
    syncBuffer: "Sync Buffer",
    overview: "Overview",
    newPatientHindi: "New Patient",
    vitalsHindi: "Log Vitals & Pulse",
    doctorVisitHindi: "Doctor Meet",
    dataSyncHindi: "Data Sync",
    villageHealthSummary: "Village Health Summary",
    familiesTracedStatus: "Status of families registered in your primary care segment.",
    familiesTraced: "Families Traced",
    familiesCount: "32 Families",
    highRiskFlags: "High Risk Flags",
    flagsCount: "3 Alerts",
    registerNewMember: "Register New Family Member",
    activeVillageLogs: "Active Village Logs Cache",
    registerNewTitle: "Register New Patient",
    patientNameLabel: "Patient Full Name",
    ageLabel: "Age",
    genderLabel: "Gender",
    male: "Male",
    female: "Female",
    other: "Other",
    mobileLabel: "Mobile Number",
    savePatientOffline: "Save Patient Offline",
    logVitalsTitle: "Log Patient Vitals",
    selectPatientLabel: "Select Registered Patient",
    pulseRateLabel: "Pulse Rate (BPM)",
    bpLabel: "Blood Pressure (BP)",
    oxygenLabel: "Oxygen Saturation (SpO2 %)",
    tempLabel: "Temperature (°F)",
    saveVitalsOffline: "Save Vitals Offline",
    scheduleVisitTitle: "Schedule Doctor Visit",
    preferredDateLabel: "Preferred Date",
    requiredSpecialtyLabel: "Required Specialty",
    bookConsultation: "Book Telehealth Consultation",
    decentralizedSyncTitle: "Decentralized Primary Sync Buffer",
    syncInstructions: "All logs registered offline are queued safely. Upon reaching a cellular network, click sync to finalize profiles onto ABDM databases.",
    queueBufferLabel: "Queue Buffer",
    pendingSyncBadge: "Pending Sync",
    performGatewaySync: "Perform Cellular Gateway Sync",
    noUnsyncedRecords: "No unsynced health records.",
    alreadySyncedTitle: "Already Synced",
    alreadySyncedDesc: "Cloud is synchronized.",
    errorTitle: "Error",
    registeredOfflineToast: "Registered offline successfully.",
    vitalsSavedToast: "Vitals saved offline successfully.",
    bookingSavedToast: "Booking saved offline successfully."
  },
  Hindi: {
    welcome: "स्वागत है",
    ashaCompanion: "आशा सहयोगी (ग्रामीण सखी)",
    activeSession: "सक्रिय सत्र",
    offlineRegisters: "ऑफ़लाइन ग्राम स्वास्थ्य रजिस्टर बफर।",
    syncStatusActive: "सिंक स्थिति: ऑफ़लाइन बफर सक्रिय",
    unsyncedRecords: "स्थानीय कैश में सिंक न किए गए स्वास्थ्य रिकॉर्ड",
    localRecordCount: "स्थानीय रिकॉर्ड",
    syncNow: "सिंक करें",
    registerPatient: "रोगी पंजीकरण",
    logVitals: "वाइटल्स दर्ज करें",
    scheduleVisit: "मुलाकात निर्धारित करें",
    syncBuffer: "बफर सिंक करें",
    overview: "अवलोकन",
    newPatientHindi: "नया मरीज",
    vitalsHindi: "लक्षण व धड़कन",
    doctorVisitHindi: "डॉक्टर मुलाक़ात",
    dataSyncHindi: "डेटा सिंक",
    villageHealthSummary: "ग्राम स्वास्थ्य सारांश",
    familiesTracedStatus: "आपके प्राथमिक स्वास्थ्य देखभाल क्षेत्र में पंजीकृत परिवारों की स्थिति।",
    familiesTraced: "ट्रेस किए गए परिवार",
    familiesCount: "32 परिवार",
    highRiskFlags: "उच्च जोखिम वाले फ्लैग",
    flagsCount: "3 अलर्ट",
    registerNewMember: "नया परिवार सदस्य पंजीकृत करें",
    activeVillageLogs: "सक्रिय ग्राम लॉग कैश",
    registerNewTitle: "नया रोगी पंजीकृत करें",
    patientNameLabel: "रोगी का पूरा नाम",
    ageLabel: "उम्र",
    genderLabel: "लिंग",
    male: "पुरुष",
    female: "महिला",
    other: "अन्य",
    mobileLabel: "मोबाइल नंबर",
    savePatientOffline: "रोगी को ऑफ़लाइन सहेजें",
    logVitalsTitle: "रोगी के वाइटल्स दर्ज करें",
    selectPatientLabel: "पंजीकृत रोगी चुनें",
    pulseRateLabel: "धड़कन की दर (BPM)",
    bpLabel: "रक्तचाप (BP)",
    oxygenLabel: "ऑक्सीजन स्तर (SpO2 %)",
    tempLabel: "तापमान (°F)",
    saveVitalsOffline: "वाइटल्स ऑफ़लाइन सहेजें",
    scheduleVisitTitle: "डॉक्टर मुलाक़ात निर्धारित करें",
    preferredDateLabel: "पसंदीदा तारीख",
    requiredSpecialtyLabel: "आवश्यक विशेषज्ञता",
    bookConsultation: "टेलीहेल्थ परामर्श बुक करें",
    decentralizedSyncTitle: "विकेंद्रित प्राथमिक सिंक बफर",
    syncInstructions: "ऑफ़लाइन दर्ज किए गए सभी लॉग सुरक्षित रूप से कतारबद्ध हैं। नेटवर्क मिलने पर, क्लाउड डेटाबेस पर सिंक करने के लिए सिंक पर क्लिक करें।",
    queueBufferLabel: "कतार बफर",
    pendingSyncBadge: "सिंक लंबित है",
    performGatewaySync: "सेलुलर गेटवे सिंक निष्पादित करें",
    noUnsyncedRecords: "कोई सिंक न किए गए रिकॉर्ड नहीं हैं।",
    alreadySyncedTitle: "पहले से ही सिंक है",
    alreadySyncedDesc: "क्लाउड डेटा सिंक्रोनाइज़्ड है।",
    errorTitle: "त्रुटि",
    registeredOfflineToast: "ऑफलाइन सफलतापूर्वक दर्ज किया गया।",
    vitalsSavedToast: "वाइटल्स ऑफलाइन सफलतापूर्वक सहेजे गए।",
    bookingSavedToast: "परामर्श बुकिंग ऑफलाइन सफलतापूर्वक सहेजी गई।"
  },
  Marathi: {
    welcome: "स्वागत आहे",
    ashaCompanion: "आशा सहयोगी (ग्रामीण सखी)",
    activeSession: "सक्रिय सत्र",
    offlineRegisters: "ऑफलाइन ग्राम आरोग्य रजिस्टर बफर.",
    syncStatusActive: "सिंक स्थिती: ऑफलाइन बफर सक्रिय",
    unsyncedRecords: "स्थानिक कॅशेमध्ये सिंक न केलेले आरोग्य रेकॉर्ड",
    localRecordCount: "स्थानिक रेकॉर्ड",
    syncNow: "सिंक करा",
    registerPatient: "रुग्ण नोंदणी",
    logVitals: "वाइटल्स नोंदवा",
    scheduleVisit: "भेट नियोजित करा",
    syncBuffer: "बफर सिंक करा",
    overview: "आढावा",
    newPatientHindi: "नवीन रुग्ण",
    vitalsHindi: "लक्षणे व धडधड",
    doctorVisitHindi: "डॉक्टर भेट",
    dataSyncHindi: "डेटा सिंक",
    familiesTracedStatus: "तुमच्या प्राथमिक आरोग्य काळजी विभागातील नोंदणीकृत कुटुंबांची स्थिती.",
    familiesTraced: "शोधलेली कुटुंबे",
    familiesCount: "32 कुटुंबे",
    highRiskFlags: "उच्च जोखीम फ्लॅग",
    flagsCount: "3 अलर्ट",
    registerNewMember: "नवीन कुटुंब सदस्य नोंदवा",
    activeVillageLogs: "सक्रिय गाव लॉग कॅशे",
    registerNewTitle: "नवीन रुग्ण नोंदवा",
    patientNameLabel: "रुग्णाचे पूर्ण नाव",
    ageLabel: "वय",
    genderLabel: "लिंग",
    male: "पुरुष",
    female: "महिला",
    other: "इतर",
    mobileLabel: "मोबाईल नंबर",
    savePatientOffline: "रुग्ण ऑफलाइन जतन करा",
    logVitalsTitle: "रुग्णाचे वाइटल्स नोंदवा",
    selectPatientLabel: "नोंदणीकृत रुग्ण निवडा",
    pulseRateLabel: "नाडी दर (BPM)",
    bpLabel: "रक्तदाब (BP)",
    oxygenLabel: "ऑक्सिजन संपृक्तता (SpO2 %)",
    tempLabel: "तापमान (°F)",
    saveVitalsOffline: "वाइटल्स ऑफलाइन जतन करा",
    scheduleVisitTitle: "डॉक्टर भेट नियोजित करा",
    preferredDateLabel: "पसंतीची तारीख",
    requiredSpecialtyLabel: "आवश्यक विशेषज्ञता",
    bookConsultation: "टेलिहेल्थ सल्लामसलत बुक करा",
    decentralizedSyncTitle: "विकेंद्रित प्राथमिक सिंक बफर",
    syncInstructions: "ऑफलाइन नोंदवलेले सर्व लॉग सुरक्षितपणे रांगेत ठेवले आहेत. नेटवर्क मिळाल्यावर, क्लाउड डेटाबेसवर अंतिम करण्यासाठी सिंक क्लिक करा.",
    queueBufferLabel: "रांग बफर",
    pendingSyncBadge: "सिंक प्रलंबित",
    performGatewaySync: "सेल्युलर गेटवे सिंक करा",
    noUnsyncedRecords: "सिंक न केलेले कोणतेही रेकॉर्ड नाहीत.",
    alreadySyncedTitle: "आधीच सिंक केले आहे",
    alreadySyncedDesc: "क्लाउड सिंक्रोनाइझ झाले आहे.",
    errorTitle: "त्रुटी",
    registeredOfflineToast: "ऑफलाइन यशस्वीरित्या नोंदणी केली.",
    vitalsSavedToast: "वाइटल्स ऑफलाइन यशस्वीरित्या जतन केले.",
    bookingSavedToast: "बुकिंग ऑफलाइन यशस्वीरित्या जतन केले."
  }
};

export default function AshaWorkerDashboard() {
  const searchParams = useSearchParams();
  const activeTabParam = searchParams.get("tab");
  const { addAppointment, user, language } = useHealthStore();
  const { toast } = useToast();

  const activeLang = (language === "Hindi" || language === "Marathi") ? language : "English";
  const t = ASHA_TRANSLATIONS[activeLang] as Record<string, string>;

  const [activeTab, setActiveTab] = useState("overview");
  const [isSyncing, setIsSyncing] = useState(false);
  const [registeredPatients, setRegisteredPatients] = useState(DEFAULT_PATIENTS);
  const [syncQueue, setSyncQueue] = useState<SyncRecord[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);

  // Form states: Register Patient
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("Male");
  const [patientPhone, setPatientPhone] = useState("");

  // Form states: Vitals Form
  const [vitalsPatientId, setVitalsPatientId] = useState("pat-1");
  const [vitalPulse, setVitalPulse] = useState("");
  const [vitalBP, setVitalBP] = useState("");
  const [vitalSpO2, setVitalSpO2] = useState("");
  const [vitalTemp, setVitalTemp] = useState("");

  // Form states: Schedule Visit
  const [schedulePatientId, setSchedulePatientId] = useState("pat-1");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleSpecialty, setScheduleSpecialty] = useState("General Physician");

  // Load from localStorage on mount and fetch doctors
  useEffect(() => {
    const cachedQueue = localStorage.getItem("vaidya_asha_sync_queue");
    if (cachedQueue) {
      try {
        setSyncQueue(JSON.parse(cachedQueue));
      } catch (e) {
        console.error("Failed to parse cached sync queue", e);
      }
    }

    const cachedPatients = localStorage.getItem("vaidya_asha_registered_patients");
    if (cachedPatients) {
      try {
        setRegisteredPatients(JSON.parse(cachedPatients));
      } catch (e) {
        console.error("Failed to parse cached registered patients", e);
      }
    } else {
      localStorage.setItem("vaidya_asha_registered_patients", JSON.stringify(DEFAULT_PATIENTS));
    }

    // Fetch doctors from backend
    api.get<{ success: boolean; data: any[] }>('/api/doctors')
      .then(res => {
        if (res.success && res.data) {
          setDoctors(res.data);
        }
      })
      .catch(err => {
        console.error("Failed to fetch doctors list from backend", err);
      });
  }, []);

  // Helpers to update state + localStorage
  const updateSyncQueue = (newQueue: SyncRecord[]) => {
    setSyncQueue(newQueue);
    localStorage.setItem("vaidya_asha_sync_queue", JSON.stringify(newQueue));
  };

  const updateRegisteredPatients = (newPatients: typeof registeredPatients) => {
    setRegisteredPatients(newPatients);
    localStorage.setItem("vaidya_asha_registered_patients", JSON.stringify(newPatients));
  };

  // Sync state tab parameter
  useEffect(() => {
    if (activeTabParam) {
      setActiveTab(activeTabParam);
    } else {
      setActiveTab("overview");
    }
  }, [activeTabParam]);

  // Submit Handlers
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim()) {
      toast({
        title: "त्रुटि / Error",
        description: "कृपया नाम और मोबाइल दर्ज करें / Please enter patient name and mobile number.",
        variant: "destructive"
      });
      return;
    }

    const cleanedPhone = patientPhone.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
      toast({
        title: "त्रुटि / Error",
        description: "कृपया मान्य 10 अंकों का मोबाइल नंबर दर्ज करें (6-9 से शुरू) / Please enter a valid 10-digit mobile number starting with 6-9.",
        variant: "destructive"
      });
      return;
    }

    const newId = `pat-${Date.now()}`;
    const newPatient = {
      id: newId,
      name: `${patientName} (${patientGender === "Male" ? "पुरुष" : patientGender === "Female" ? "महिला" : "अन्य"})`,
      age: parseInt(patientAge) || 30,
      phone: cleanedPhone
    };

    const estimatedDob = patientAge ? `${new Date().getFullYear() - parseInt(patientAge)}-01-01` : undefined;
    const registrationRecord: SyncRecord = {
      type: 'PATIENT_REGISTRATION',
      offlineId: `offline-pat-${Date.now()}`,
      timestamp: new Date().toISOString(),
      payload: {
        name: patientName,
        phone: cleanedPhone,
        password: "vaidya123",
        gender: patientGender.toLowerCase() as 'male' | 'female' | 'other',
        dateOfBirth: estimatedDob,
        allergies: [],
      }
    };

    const updatedPatients = [...registeredPatients, newPatient];
    updateRegisteredPatients(updatedPatients);
    setVitalsPatientId(newId);
    setSchedulePatientId(newId);

    const updatedQueue = [...syncQueue, registrationRecord];
    updateSyncQueue(updatedQueue);

    toast({
      title: "सफलतापूर्वक दर्ज / Registered!",
      description: `${patientName} को ऑफलाइन बफर में सुरक्षित कर लिया गया है।`,
      variant: "default"
    });

    setPatientName("");
    setPatientAge("");
    setPatientPhone("");
    setActiveTab("overview");
  };

  const handleVitalsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vitalPulse || !vitalBP || !vitalSpO2) {
      toast({
        title: "त्रुटि / Error",
        description: "कृपया धड़कन, ब्लड प्रेशर और ऑक्सीजन भरें / Please enter Pulse, BP, and SpO2.",
        variant: "destructive"
      });
      return;
    }

    const selectedPatient = registeredPatients.find(p => p.id === vitalsPatientId);
    if (!selectedPatient) return;
    const phone = selectedPatient.phone.replace(/\D/g, "");

    const symptomsString = `ASHA Patient Vitals - Pulse: ${vitalPulse} BPM, Blood Pressure: ${vitalBP}, SpO2: ${vitalSpO2}%, Temperature: ${vitalTemp || 'N/A'}°F.`;

    const vitalsRecord: SyncRecord = {
      type: 'SYMPTOM_REPORT',
      offlineId: `offline-vit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      payload: {
        patientPhone: phone,
        symptoms: symptomsString,
        language: 'en'
      }
    };

    const updatedQueue = [...syncQueue, vitalsRecord];
    updateSyncQueue(updatedQueue);

    toast({
      title: "वाइटल्स दर्ज / Vitals Saved!",
      description: `${selectedPatient.name.split(" ")[0]} के वाइटल्स को ऑफलाइन सहेज लिया गया है।`,
      variant: "default"
    });

    setVitalPulse("");
    setVitalBP("");
    setVitalSpO2("");
    setVitalTemp("");
    setActiveTab("overview");
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleDate) {
      toast({
        title: "त्रुटि / Error",
        description: "कृपया मुलाकात की तारीख चुनें / Please pick a date.",
        variant: "destructive"
      });
      return;
    }

    const selectedPatient = registeredPatients.find(p => p.id === schedulePatientId);
    if (!selectedPatient) return;

    const matchedDoc = doctors.find(
      (d: any) => d.specialization?.toLowerCase() === scheduleSpecialty.toLowerCase()
    ) || doctors[0];

    if (!matchedDoc) {
      toast({
        title: "त्रुटि / Error",
        description: "कोई डॉक्टर उपलब्ध नहीं है / No doctors available in system to book.",
        variant: "destructive"
      });
      return;
    }

    const phone = selectedPatient.phone.replace(/\D/g, "");
    const scheduledAt = new Date(`${scheduleDate}T10:00:00`).toISOString();

    const appointmentRecord: SyncRecord = {
      type: 'APPOINTMENT_BOOKING',
      offlineId: `offline-apt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      payload: {
        patientPhone: phone,
        doctorId: matchedDoc.doctor_id,
        scheduledAt,
        notes: `ASHA Field scheduled visit. Specialty: ${scheduleSpecialty}.`
      }
    };

    addAppointment({
      doctorId: matchedDoc.doctor_id,
      doctorName: matchedDoc.users?.name ?? "Dr. Alok Sharma (ASHA Field)",
      specialty: scheduleSpecialty,
      date: scheduleDate,
      time: "10:00 AM",
      reason: `ASHA Worker Field Sync booking for ${selectedPatient.name}`
    });

    const updatedQueue = [...syncQueue, appointmentRecord];
    updateSyncQueue(updatedQueue);

    toast({
      title: "मुलाकात बुक / Booking Saved!",
      description: `${selectedPatient.name.split(" ")[0]} की मीटिंग ऑफलाइन सुरक्षित हो गई है।`,
      variant: "default"
    });

    setScheduleDate("");
    setActiveTab("overview");
  };

  const handleSyncData = async () => {
    if (syncQueue.length === 0) {
      toast({
        title: "सिंक आवश्यक नहीं / Already Synced",
        description: "सभी रिकॉर्ड पहले से सिंक हैं / Cloud is synchronized.",
        variant: "default"
      });
      return;
    }

    const ashaId = user?.backendUserId || user?.id;
    if (!ashaId) {
      toast({
        title: "त्रुटि / Error",
        description: "ASHA Worker ID not found. Please log in again.",
        variant: "destructive"
      });
      return;
    }

    setIsSyncing(true);
    try {
      const res = await api.post<{ success: boolean; data: { sync: any } }>('/api/sync/batch', {
        records: syncQueue,
        ashaId
      });

      if (res.success && res.data?.sync) {
        const { succeeded, failed, results } = res.data.sync;
        if (failed > 0) {
          const failedIds = results
            .filter((r: any) => r.status === 'failed')
            .map((r: any) => r.offlineId);

          const remainingQueue = syncQueue.filter(r => failedIds.includes(r.offlineId));
          updateSyncQueue(remainingQueue);

          toast({
            title: "आंशिक सिंक / Partial Sync Completed",
            description: `${succeeded} records synced, ${failed} records failed. Failed records are retained in the buffer.`,
            variant: "destructive"
          });
        } else {
          updateSyncQueue([]);
          toast({
            title: "सफलतापूर्वक सिंक / Sync Completed!",
            description: `सभी ${succeeded} रिकॉर्ड क्लाउड में सिंक हो गए हैं।`,
            variant: "default"
          });
        }
      } else {
        throw new Error("Sync response invalid");
      }
    } catch (err: any) {
      toast({
        title: "सिंक विफल / Sync Failed",
        description: err.message ?? "कॉल फेल हो गई / Network or server error occurred during sync.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col max-w-4xl mx-auto select-none gap-6 pb-16 text-foreground">
      
      {/* 1. Core Header */}
      <div className="flex items-center gap-4 bg-[#0d121f]/80 border border-white/5 p-4 rounded-2xl shadow-xl">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-purple-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
          <Tablet className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="font-extrabold text-sm md:text-base text-white flex items-center gap-2">
            {t.welcome}, {(user?.name || "ASHA").split(" ")[0]} 👋
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/20 text-[9px] tracking-widest font-extrabold uppercase py-0.5">{t.ashaCompanion}</Badge>
          </h1>
          <p className="text-[10px] text-muted-foreground mt-0.5">{t.activeSession}: {user?.name || "ASHA"} • {t.offlineRegisters}</p>
        </div>
      </div>

      {/* 2. Sync Offline Status Banner */}
      <div className="p-4 rounded-xl border border-white/5 bg-[#0b101c]/55 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-amber-500/80 animate-pulse shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-white">{t.syncStatusActive}</span>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {syncQueue.length} {t.unsyncedRecords} ({t.localRecordCount}: {syncQueue.length})
            </p>
          </div>
        </div>
        <Button 
          onClick={handleSyncData}
          disabled={isSyncing}
          className="bg-primary hover:bg-emerald-600 font-bold text-xs h-9 rounded-xl flex items-center gap-1.5"
        >
          {isSyncing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {t.syncNow}
        </Button>
      </div>

      {/* 3. Action Navigation Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { id: "register", label: t.registerPatient, sub: t.newPatientHindi, icon: UserPlus },
          { id: "vitals", label: t.logVitals, sub: t.vitalsHindi, icon: Activity },
          { id: "schedule", label: t.scheduleVisit, sub: t.doctorVisitHindi, icon: Calendar },
          { id: "sync", label: t.syncBuffer, sub: t.dataSyncHindi, icon: Database }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`p-4 rounded-xl border flex flex-col items-center text-center gap-2 transition-all ${
                activeTab === item.id 
                  ? "bg-purple-500/10 border-purple-500/30 text-purple-300" 
                  : "bg-card/40 border-white/5 hover:border-white/10 hover:bg-white/5 text-muted-foreground hover:text-white"
              }`}
            >
              <Icon className="h-6 w-6 text-purple-400" />
              <div className="text-xs">
                <span className="font-bold block">{item.label}</span>
                <span className="text-[10px] opacity-70 mt-0.5 block">{item.sub}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="min-h-[300px]">
        <AnimatePresence mode="wait">
          
          {/* Overview / Village Summary */}
          {activeTab === "overview" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <Card className="glass-panel bg-[#0b101c]/45 border-white/5 p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <h3 className="text-xs uppercase font-extrabold text-white flex items-center gap-1.5 tracking-wider">
                    <Heart className="h-4.5 w-4.5 text-rose-400 animate-pulse" />
                    {t.villageHealthSummary}
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-1">{t.familiesTracedStatus}</p>
                  
                  <div className="grid grid-cols-2 gap-3 mt-4 text-xs font-semibold">
                    <div className="p-3 bg-black/40 border border-white/5 rounded-xl">
                      <span className="text-muted-foreground block text-[9px] uppercase tracking-wide">{t.familiesTraced}</span>
                      <strong className="text-white text-base block mt-0.5">{activeLang === "English" ? "32 Families" : activeLang === "Hindi" ? "32 परिवार" : "32 कुटुंबे"}</strong>
                    </div>
                    <div className="p-3 bg-black/40 border border-white/5 rounded-xl">
                      <span className="text-muted-foreground block text-[9px] uppercase tracking-wide">{t.highRiskFlags}</span>
                      <strong className="text-rose-400 text-base block mt-0.5">{activeLang === "English" ? "3 Alerts" : activeLang === "Hindi" ? "3 अलर्ट" : "3 अलर्ट"}</strong>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => setActiveTab("register")}
                  className="w-full bg-[#121828] hover:bg-white/5 border border-white/5 rounded-xl text-xs font-bold h-10 mt-5 flex items-center justify-center gap-1"
                >
                  {t.registerNewMember}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Card>

              <Card className="glass-panel bg-[#0b101c]/45 border-white/5 p-5 rounded-2xl">
                <h3 className="text-xs uppercase font-extrabold text-white tracking-wider">{t.activeVillageLogs}</h3>
                <div className="flex flex-col gap-2.5 mt-4 text-xs">
                  {registeredPatients.map((pat) => (
                    <div key={pat.id} className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between">
                      <span className="font-bold text-white">{pat.name}</span>
                      <span className="text-[10px] text-muted-foreground">{t.ageLabel} {pat.age} • {t.mobileLabel} {pat.phone}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Tab: Register Patient */}
          {activeTab === "register" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card className="glass-panel bg-[#0b101c]/55 border-white/5 max-w-xl mx-auto rounded-2xl p-6">
                <h3 className="text-xs uppercase font-extrabold text-white tracking-wider border-b border-white/5 pb-2.5">
                  {t.registerNewTitle}
                </h3>
                
                <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4 mt-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t.patientNameLabel}</label>
                    <Input 
                      type="text" 
                      placeholder="e.g. Ramesh Kumar"
                      value={patientName} 
                      onChange={(e) => setPatientName(e.target.value)} 
                      className="bg-black/40 border-white/5 text-xs h-10 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t.ageLabel}</label>
                      <Input 
                        type="number" 
                        placeholder="e.g. 35"
                        value={patientAge} 
                        onChange={(e) => setPatientAge(e.target.value)} 
                        className="bg-black/40 border-white/5 text-xs h-10 rounded-xl"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t.genderLabel}</label>
                      <select 
                        value={patientGender}
                        onChange={(e) => setPatientGender(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 h-10 px-3 text-xs rounded-xl text-white focus:outline-none"
                      >
                        <option value="Male">{t.male}</option>
                        <option value="Female">{t.female}</option>
                        <option value="Other">{t.other}</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t.mobileLabel}</label>
                    <Input 
                      type="tel" 
                      placeholder="e.g. 98765 43210"
                      value={patientPhone} 
                      onChange={(e) => setPatientPhone(e.target.value)} 
                      className="bg-black/40 border-white/5 text-xs h-10 rounded-xl"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-primary hover:bg-emerald-600 rounded-xl font-bold h-10 mt-2 flex items-center justify-center gap-1.5">
                    <Save className="h-4 w-4" />
                    {t.savePatientOffline}
                  </Button>
                </form>
              </Card>
            </motion.div>
          )}

          {/* Tab: Log Vitals */}
          {activeTab === "vitals" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card className="glass-panel bg-[#0b101c]/55 border-white/5 max-w-xl mx-auto rounded-2xl p-6">
                <h3 className="text-xs uppercase font-extrabold text-white tracking-wider border-b border-white/5 pb-2.5">
                  {t.logVitalsTitle}
                </h3>

                <form onSubmit={handleVitalsSubmit} className="flex flex-col gap-4 mt-5">
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t.selectPatientLabel}</label>
                    <select
                      value={vitalsPatientId}
                      onChange={(e) => setVitalsPatientId(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 h-10 px-3 text-xs rounded-xl text-white focus:outline-none"
                    >
                      {registeredPatients.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t.pulseRateLabel}</label>
                      <Input 
                        type="number" 
                        placeholder="e.g. 72"
                        value={vitalPulse} 
                        onChange={(e) => setVitalPulse(e.target.value)} 
                        className="bg-black/40 border-white/5 text-xs h-10 rounded-xl"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t.bpLabel}</label>
                      <Input 
                        type="text" 
                        placeholder="e.g. 120/80"
                        value={vitalBP} 
                        onChange={(e) => setVitalBP(e.target.value)} 
                        className="bg-black/40 border-white/5 text-xs h-10 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t.oxygenLabel}</label>
                      <Input 
                        type="number" 
                        placeholder="e.g. 98"
                        value={vitalSpO2} 
                        onChange={(e) => setVitalSpO2(e.target.value)} 
                        className="bg-black/40 border-white/5 text-xs h-10 rounded-xl"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t.tempLabel}</label>
                      <Input 
                        type="number" 
                        placeholder="e.g. 98.6"
                        value={vitalTemp} 
                        onChange={(e) => setVitalTemp(e.target.value)} 
                        className="bg-black/40 border-white/5 text-xs h-10 rounded-xl"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-primary hover:bg-emerald-600 rounded-xl font-bold h-10 mt-2 flex items-center justify-center gap-1.5">
                    <Save className="h-4 w-4" />
                    {t.saveVitalsOffline}
                  </Button>
                </form>
              </Card>
            </motion.div>
          )}

          {/* Tab: Schedule Visit */}
          {activeTab === "schedule" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card className="glass-panel bg-[#0b101c]/55 border-white/5 max-w-xl mx-auto rounded-2xl p-6">
                <h3 className="text-xs uppercase font-extrabold text-white tracking-wider border-b border-white/5 pb-2.5">
                  {t.scheduleVisitTitle}
                </h3>

                <form onSubmit={handleScheduleSubmit} className="flex flex-col gap-4 mt-5">
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t.selectPatientLabel}</label>
                    <select
                      value={schedulePatientId}
                      onChange={(e) => setSchedulePatientId(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 h-10 px-3 text-xs rounded-xl text-white focus:outline-none"
                    >
                      {registeredPatients.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t.preferredDateLabel}</label>
                      <Input 
                        type="date" 
                        value={scheduleDate} 
                        onChange={(e) => setScheduleDate(e.target.value)} 
                        className="bg-black/40 border-white/5 text-xs h-10 rounded-xl text-white focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t.requiredSpecialtyLabel}</label>
                      <select
                        value={scheduleSpecialty}
                        onChange={(e) => setScheduleSpecialty(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 h-10 px-3 text-xs rounded-xl text-white focus:outline-none"
                      >
                        <option value="General Physician">General Physician / सामान्य डॉक्टर</option>
                        <option value="Cardiologist">Cardiologist / हृदय रोग विशेषज्ञ</option>
                        <option value="Pediatrician">Pediatrician / बाल रोग विशेषज्ञ</option>
                        <option value="Dermatologist">Dermatologist / त्वचा रोग विशेषज्ञ</option>
                      </select>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-primary hover:bg-emerald-600 rounded-xl font-bold h-10 mt-2 flex items-center justify-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {t.bookConsultation}
                  </Button>
                </form>
              </Card>
            </motion.div>
          )}

          {/* Tab: Sync Buffer */}
          {activeTab === "sync" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-xl mx-auto flex flex-col gap-4"
            >
              <Card className="glass-panel bg-[#0b101c]/55 border-white/5 p-6 rounded-2xl text-center flex flex-col items-center gap-4">
                <Database className="h-10 w-10 text-purple-400 animate-bounce" />
                <div>
                  <h3 className="font-extrabold text-white text-sm">{t.decentralizedSyncTitle}</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">
                    {t.syncInstructions}
                  </p>
                </div>
                
                <div className="w-full p-4 bg-black/40 border border-white/5 rounded-xl text-xs flex justify-between items-center text-muted-foreground">
                  <span>{t.queueBufferLabel}: <strong>{syncQueue.length} {t.unsyncedRecords}</strong></span>
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/20 text-[8px] uppercase">{t.pendingSyncBadge}</Badge>
                </div>

                <Button 
                  onClick={handleSyncData}
                  disabled={syncQueue.length === 0 || isSyncing}
                  className="w-full bg-primary hover:bg-emerald-600 rounded-xl font-bold h-10 flex items-center justify-center gap-1.5"
                >
                  {isSyncing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  {t.performGatewaySync}
                </Button>
              </Card>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
