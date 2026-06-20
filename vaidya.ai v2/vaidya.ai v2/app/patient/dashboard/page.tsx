"use client";

import React from "react";
import Link from "next/link";
import { 
  Activity, 
  Calendar, 
  FolderLock, 
  CreditCard, 
  Pill, 
  Bell, 
  Search, 
  Sparkles, 
  Heart, 
  ShieldCheck, 
  ArrowRight,
  ChevronRight,
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHealthStore } from "@/store/useHealthStore";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { useEffect, useState } from "react";

const DASHBOARD_TRANSLATIONS = {
  English: {
    registrySync: "ABDM Registry Sync",
    welcomeBack: "Welcome back",
    syncMessage: "Your decentralized health credentials and vital charts are fully synchronized.",
    viewPass: "View ABHA ID Pass",
    checkSymptoms: "Check Symptoms",
    vernacularAI: "Vernacular AI symptom checker",
    findDoctor: "Find Doctor",
    discoverClinics: "Discover clinics & book slots",
    searchMedicine: "Search Medicine",
    lookupStocks: "Lookup local stocks & generic equivalents",
    vitalsTitle: "Physiological Vitals Baseline",
    bloodGlucose: "Blood Glucose",
    bloodPressure: "Blood Pressure",
    oxygenSat: "Oxygen Saturation",
    heartRate: "Heart Rate",
    recentDocs: "Recent Encrypted Health Files",
    viewAllLocker: "View All Locker",
    upcomingConsult: "Upcoming Consultations",
    noAppts: "No active appointments scheduled.",
    bookNow: "Book Now",
    manageBookings: "Manage Bookings",
    streamAlerts: "Real-time Stream Alerts",
    dengueOutbreak: "Dengue outbreak flagged",
    dengueDesc: "Surge warning in Sector 4 cluster. Prevent stagnated water.",
    recordLocked: "Record locked secure",
    recordLockedDesc: "Encryption hash issued successfully on IPFS.",
    alertsConsole: "Open Alerts Console",
    issuedBy: "Issued by"
  },
  Hindi: {
    registrySync: "एबीडीएम रजिस्ट्री सिंक",
    welcomeBack: "आपका स्वागत है",
    syncMessage: "आपके विकेन्द्रीकृत स्वास्थ्य क्रेडेंशियल्स और महत्वपूर्ण चार्ट पूरी तरह से सिंक्रनाइज़ हैं।",
    viewPass: "आभा आईडी पास देखें",
    checkSymptoms: "लक्षणों की जांच करें",
    vernacularAI: "स्थानीय भाषा एआई लक्षण जांचकर्ता",
    findDoctor: "डॉक्टर खोजें",
    discoverClinics: "क्लीनिक खोजें और स्लॉट बुक करें",
    searchMedicine: "दवा खोजें",
    lookupStocks: "स्थानीय स्टॉक और सामान्य दवाएं खोजें",
    vitalsTitle: "शारीरिक महत्वपूर्ण संकेत",
    bloodGlucose: "रक्त शर्करा (ग्लूकोज)",
    bloodPressure: "रक्तचाप (बीपी)",
    oxygenSat: "ऑक्सीजन स्तर",
    heartRate: "धड़कन दर",
    recentDocs: "हाल की एन्क्रिप्टेड स्वास्थ्य फाइलें",
    viewAllLocker: "सभी लॉकर देखें",
    upcomingConsult: "आगामी परामर्श",
    noAppts: "कोई सक्रिय अपॉइंटमेंट निर्धारित नहीं है।",
    bookNow: "अभी बुक करें",
    manageBookings: "बुकिंग प्रबंधित करें",
    streamAlerts: "रीयल-टाइम स्ट्रीम अलर्ट",
    dengueOutbreak: "डेंगू का प्रकोप घोषित",
    dengueDesc: "सेक्टर 4 क्लस्टर में डेंगू का खतरा। जमे हुए पानी से बचें।",
    recordLocked: "फाइल सुरक्षित लॉक की गई",
    recordLockedDesc: "आईपीएफएस पर एन्क्रिप्शन हैश सफलतापूर्वक जारी किया गया।",
    alertsConsole: "अलर्ट कंसोल खोलें",
    issuedBy: "द्वारा जारी"
  },
  Marathi: {
    registrySync: "एबीडीएम रजिस्ट्री सिंक",
    welcomeBack: "आपले स्वागत आहे",
    syncMessage: "तुमचे विकेंद्रित आरोग्य क्रेडेंशियल्स आणि महत्त्वपूर्ण तक्ते पूर्णपणे सिंक्रोनाइझ आहेत.",
    viewPass: "आभा आयडी पास पहा",
    checkSymptoms: "लक्षणे तपासा",
    vernacularAI: "प्रादेशिक भाषा एआय लक्षण तपासक",
    findDoctor: "डॉक्टर शोधा",
    discoverClinics: "दवाखाने शोधा आणि स्लॉट बुक करा",
    searchMedicine: "औषध शोधा",
    lookupStocks: "स्थानिक साठा आणि जेनेरिक औषध शोधा",
    vitalsTitle: "शारीरिक महत्त्वपूर्ण संकेत",
    bloodGlucose: "रक्त शर्करा (ग्लूकोज)",
    bloodPressure: "रक्तदाब (बीपी)",
    oxygenSat: "ऑक्सिजन पातळी",
    heartRate: "हृदय गती",
    recentDocs: "अलीकडील कूटबद्ध आरोग्य फायली",
    viewAllLocker: "सर्व लॉकर पहा",
    upcomingConsult: "आगामी सल्लामसलत",
    noAppts: "कोणतीही सक्रिय अपॉइंटमेंट शेड्यूल केलेली नाही.",
    bookNow: "आता बुक करा",
    manageBookings: "बुकिंग व्यवस्थापित करा",
    streamAlerts: "रीयल-टाइम प्रवाह इशारे",
    dengueOutbreak: "डेंग्यूचा उद्रेक घोषित",
    dengueDesc: "सेक्टर ४ क्लस्टरमध्ये डेंग्यूचा इशारा. साचलेले पाणी टाळा.",
    recordLocked: "फाइल सुरक्षित लॉक केली",
    recordLockedDesc: "आयपीएफएसवर कूटबद्धीकरण हॅश यशस्वीरित्या जारी केला.",
    alertsConsole: "इशारे कंसोल उघडा",
    issuedBy: "द्वारे जारी"
  }
};

export default function PatientDashboard() {
  const { user, appointments, records, language } = useHealthStore();
  const activeLang = (language === "Hindi" || language === "Marathi") ? language : "English";
  const t = DASHBOARD_TRANSLATIONS[activeLang];

  // Fetch real appointments from backend
  const [liveAppts, setLiveAppts] = useState(appointments);

  useEffect(() => {
    const uid = user?.backendUserId ?? user?.id;
    if (!uid) return;
    api.get<{ success: boolean; data: { appointments: any[] } }>(`/api/appointments/patient/${uid}`)
      .then(res => {
        if (res.success && res.data?.appointments?.length) {
          const mapped = res.data.appointments.map((a: any) => ({
            id: a.appointment_id,
            doctorId: a.doctor_id,
            doctorName: a.doctors?.users?.name ?? 'Doctor',
            specialty: a.doctors?.specialization ?? 'General',
            date: new Date(a.scheduled_at).toLocaleDateString('en-IN'),
            time: new Date(a.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            status: a.status === 'confirmed' ? 'Confirmed' : a.status === 'cancelled' ? 'Cancelled' : 'Pending',
            reason: a.notes ?? 'Medical consultation',
          }));
          setLiveAppts(mapped.length ? mapped : appointments);
        }
      })
      .catch(() => setLiveAppts(appointments));
  }, [user?.id, user?.backendUserId]);

  const activeAppts = liveAppts.filter(a => a.status === 'Confirmed');

  // Mock patient vitals baseline
  const VITALS = [
    { name: t.bloodGlucose, value: "98 mg/dL", status: activeLang === "English" ? "Normal" : "सामान्य", color: "text-emerald-400" },
    { name: t.bloodPressure, value: "120/80 mmHg", status: activeLang === "English" ? "Optimal" : "सर्वोत्तम", color: "text-emerald-400" },
    { name: t.oxygenSat, value: "99%", status: activeLang === "English" ? "Optimal" : "सर्वोत्तम", color: "text-emerald-400" },
    { name: t.heartRate, value: "72 bpm", status: activeLang === "English" ? "Normal" : "सामान्य", color: "text-emerald-400" }
  ];

  return (
    <div className="flex flex-col gap-6 pb-16 select-none text-foreground">
      
      {/* Welcome Hero Panel */}
      <div className="relative p-6 rounded-2xl border border-white/5 bg-[#0b101c]/70 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="bg-primary/20 text-primary px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border border-primary/20">{t.registrySync}</span>
            <h2 className="text-xl md:text-2xl font-extrabold text-white mt-2">{t.welcomeBack}, {user?.name ? user.name.split(" ")[0] : "Patient"} 👋</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{t.syncMessage}</p>
          </div>
          <Link href={`/health-card/${user?.id || ""}`}>
            <Button variant="glow" size="sm" className="rounded-xl font-bold flex items-center gap-1">
              {t.viewPass}
              <CreditCard className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/symptom-checker" className="group">
          <div className="p-4 rounded-xl border border-white/5 bg-card/45 group-hover:bg-[#10b981]/5 group-hover:border-[#10b981]/30 transition-all flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Activity className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">{t.checkSymptoms}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">{t.vernacularAI}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        <Link href="/doctors" className="group">
          <div className="p-4 rounded-xl border border-white/5 bg-card/45 group-hover:bg-[#06b6d4]/5 group-hover:border-[#06b6d4]/30 transition-all flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Search className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">{t.findDoctor}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">{t.discoverClinics}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        <Link href="/medicine-search" className="group">
          <div className="p-4 rounded-xl border border-white/5 bg-card/45 group-hover:bg-[#f59e0b]/5 group-hover:border-[#f59e0b]/30 transition-all flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Pill className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">{t.searchMedicine}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">{t.lookupStocks}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Bento Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Vitals Summary Card */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t.vitalsTitle}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {VITALS.map((vital, idx) => (
              <Card key={idx} className="glass-panel glass-panel-hover border-white/5 bg-[#0b101c]/45 p-4 rounded-xl">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">{vital.name}</span>
                    <span className="text-lg font-extrabold text-white mt-1">{vital.value}</span>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] font-bold uppercase py-0.5">
                    {vital.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>

          {/* Health Locker Recent Documents Card */}
          <div className="flex flex-col gap-3.5 mt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t.recentDocs}</h3>
              <Link href="/health-locker" className="text-xs text-primary font-bold hover:underline">{t.viewAllLocker}</Link>
            </div>
            <div className="flex flex-col gap-2.5">
              {records.slice(0, 2).map((rec) => (
                <div 
                  key={rec.id}
                  className="p-3.5 rounded-xl border border-white/5 bg-card/30 flex justify-between items-center hover:bg-white/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <FileText className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{rec.name}</h4>
                      <p className="text-[9px] text-muted-foreground mt-0.5">{rec.date} • {t.issuedBy} {rec.doctorName}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[9px] font-mono text-muted-foreground">
                    {rec.fileSize}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side: appointments & notifications alerts */}
        <div className="flex flex-col gap-6">
          
          {/* Upcoming consultations */}
          <div className="flex flex-col gap-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t.upcomingConsult}</h3>
            <Card className="glass-panel border-white/5 bg-[#0b101c]/55 p-4 rounded-xl">
              {activeAppts.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-xs font-bold">{t.noAppts}</p>
                  <Link href="/doctors">
                    <Button size="sm" variant="outline" className="mt-3 border-white/10 text-xs rounded-xl">{t.bookNow}</Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {activeAppts.slice(0, 1).map((apt) => (
                    <div key={apt.id} className="flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-bold text-white">{apt.doctorName}</h4>
                          <p className="text-[9px] text-primary font-bold uppercase tracking-wider mt-0.5">{apt.specialty}</p>
                        </div>
                        <Badge className="bg-primary/20 text-primary border-primary/20 text-[8px] font-extrabold uppercase">Confirmed</Badge>
                      </div>
                      
                      <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-[10px] text-muted-foreground flex justify-between">
                        <span>Date: <strong className="text-white">{apt.date}</strong></span>
                        <span>Time: <strong className="text-white">{apt.time}</strong></span>
                      </div>

                      <Link href="/appointments" className="w-full">
                        <Button size="sm" variant="outline" className="w-full border-white/10 text-xs rounded-xl font-bold flex items-center justify-center gap-1">
                          {t.manageBookings}
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Quick Notifications panel */}
          <div className="flex flex-col gap-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t.streamAlerts}</h3>
            <Card className="glass-panel border-white/5 bg-[#0b101c]/55 p-4 rounded-xl flex flex-col gap-3">
              <div className="flex items-start gap-2.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping mt-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate">{t.dengueOutbreak}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-normal">{t.dengueDesc}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate">{t.recordLocked}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-normal">{t.recordLockedDesc}</p>
                </div>
              </div>
              <Link href="/notifications">
                <Button size="sm" variant="outline" className="w-full border-white/10 text-xs rounded-xl font-bold">
                  {t.alertsConsole}
                </Button>
              </Link>
            </Card>
          </div>

        </div>

      </div>

    </div>
  );
}
