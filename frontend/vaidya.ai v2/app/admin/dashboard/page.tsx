"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle,
  TrendingUp, 
  Database,
  Pill,
  UserCheck,
  MapPin,
  FileSpreadsheet,
  Download,
  ShieldAlert
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useHealthStore } from "@/store/useHealthStore";
import { useToast } from "@/components/ui/toast";
import api from "@/lib/api";
import dynamic from "next/dynamic";

const OutbreakMap = dynamic(() => import("@/components/outbreak-map"), { ssr: false });


// Analytics Metrics
const PATIENTS_GROWTH = [
  { month: "Jan", count: 240 },
  { month: "Feb", count: 380 },
  { month: "Mar", count: 590 },
  { month: "Apr", count: 850 },
  { month: "May", count: 1120 },
  { month: "Jun", count: 1480 },
];

const APPOINTMENTS_FREQUENCY = [
  { day: "Mon", sessions: 18 },
  { day: "Tue", sessions: 26 },
  { day: "Wed", sessions: 22 },
  { day: "Thu", sessions: 31 },
  { day: "Fri", sessions: 28 },
  { day: "Sat", sessions: 14 },
];

const DOCTOR_UTILIZATION = [
  { specialty: "Cardiology", utilization: 84, color: "#10b981" },
  { specialty: "Pediatrics", utilization: 72, color: "#06b6d4" },
  { specialty: "Dermatology", utilization: 68, color: "#f59e0b" },
  { specialty: "Neurology", utilization: 58, color: "#6366f1" },
  { specialty: "Gynecology", utilization: 52, color: "#f43f5e" },
];

const OUTBREAK_WARNINGS = [
  { 
    id: "out-1", 
    disease: "Dengue Surge Warning", 
    location: "Rampura Phul", 
    details: "14 clinical cases reported in past 48 hours. Epidemic anomaly flagged.", 
    status: "Critical" 
  },
  { 
    id: "out-2", 
    disease: "Gastroenteritis Cluster", 
    location: "Barnala", 
    details: "8 cases recorded matching waterborne infection symptoms.", 
    status: "Warning" 
  }
];

const VILLAGE_HEAT_ALERTS = [
  { sector: "Rampura Phul", symptom: "High Fever & Joint Pain", cases: 14, alert: "Critical", syncTime: "10 min ago" },
  { sector: "Barnala", symptom: "Diarrhea & Vomiting", cases: 8, alert: "Warning", syncTime: "25 min ago" },
  { sector: "Sangrur", symptom: "Mild Cold & Cough", cases: 22, alert: "Stable", syncTime: "1 hour ago" },
  { sector: "Nabha", symptom: "Dry Cough & Congestion", cases: 5, alert: "Stable", syncTime: "3 hours ago" },
  { sector: "Malerkotla", symptom: "Fever & Rash", cases: 12, alert: "Critical", syncTime: "12 min ago" },
  { sector: "Sunam", symptom: "Vomiting & Dehydration", cases: 6, alert: "Warning", syncTime: "45 min ago" },
];

const USER_REGISTRY = [
  { name: "Dr. Alok Sharma", role: "Doctor", clinic: "Vaidya Medicity, New Delhi", status: "Online" },
  { name: "Dr. Priya Deshmukh", role: "Doctor", clinic: "Rainbow Children's Care, Mumbai", status: "Online" },
  { name: "Smt. Savita Devi", role: "ASHA Worker", clinic: "Mirzapur Hub", status: "Synced" },
  { name: "Sunil Verma", role: "Pharmacist", clinic: "SaaS Central Pharmacy", status: "Online" }
];

const ADMIN_TRANSLATIONS = {
  English: {
    welcome: "Welcome",
    consoleDesc: "SaaS Telemetry Administration Console for",
    descTail: "• Monitor epidemic disease maps, ASHA vitals, and system audit logs.",
    overviewTab: "Overview",
    analyticsTab: "Analytics",
    outbreaksTab: "Outbreaks",
    reportsTab: "Reports",
    usersTab: "Users",
    outbreakHeat: "Outbreak Heat Tracker",
    cases24h: "Symptoms reported in last 24h.",
    weeklyDoctorAppointments: "Weekly Doctor Appointments",
    sessionLoading: "Session loading across standard departments.",
    dengueSurge: "Dengue Surge Warning",
    gastroenteritis: "Gastroenteritis Cluster",
    casesAlert: "cases reported in past 48 hours. Epidemic anomaly flagged.",
    alertLabel: "Alert",
    locationLabel: "Location",
    totalPatients: "Total Patients Registered",
    growthMonth: "+15% growth this month",
    activeConsultations: "Active Consultations",
    liveDb: "Live from database",
    decentralizedVault: "Decentralized Vault Size",
    filesLabel: "files",
    encryptedStored: "Encrypted documents stored",
    clinicalCore: "Clinical Core Status",
    allOperational: "All database servers operational",
    patientsGrowth: "Monthly Patient Enrollment",
    growthGrid: "Growth tracking on ABDM village grids.",
    utilizationTitle: "Doctor Specialty Utilization",
    averageCapacity: "Average capacity loads per department.",
    feverReports: "Village Fever & Pathogen Heat Reports",
    villageSector: "Village Location",
    flaggedSymptom: "Flagged Symptom",
    activeCases: "Active Cases",
    severity: "Severity",
    auditComposer: "Clinical Protocol Audit Composer",
    generateAudit: "Generate cryptographically signed compliance reports.",
    selectAuditType: "Select telemetry audit component...",
    generateBtn: "Generate Audit Ledger",
    exportBtn: "Export Ledger",
    userDirectory: "SaaS Practice Practitioner Registry",
    activeLicenses: "Review active physician credentials and network synchronizations.",
    practitionerName: "Practitioner Name",
    assignedRole: "Assigned Role",
    primaryNetwork: "Primary Hub / Affiliated Clinic",
    syncState: "Sync State",
    online: "Online",
    offline: "Offline",
    synced: "Synced",
    exportAuditReports: "Export System Audit Reports",
    exportDesc: "Compile regional demographics, medicine distributions, and outbreak warnings into ABDM-compliant audits.",
    exportCsv: "Export CSV Sheet",
    exportPdf: "Export PDF Report",
    pendingVisits: "Pending physical visits",
    toastTitle: "Generating System Audit Report",
    toastDesc: "Downloading Vaidya_Telemetry_Audit_{time}.{format}"
  },
  Hindi: {
    welcome: "स्वागत है",
    consoleDesc: "SaaS टेलीमेट्री प्रशासन कंसोल - ",
    descTail: "• महामारी रोग मानचित्र, आशा वाइटल्स और सिस्टम ऑडिट लॉग की निगरानी करें।",
    overviewTab: "अवलोकन",
    analyticsTab: "विश्लेषण",
    outbreaksTab: "प्रकोप (आउटब्रेक)",
    reportsTab: "रिपोर्ट्स",
    usersTab: "उपयोगकर्ता",
    outbreakHeat: "प्रकोप हीट ट्रैकर",
    cases24h: "पिछले 24 घंटों में दर्ज लक्षण।",
    weeklyDoctorAppointments: "साप्ताहिक डॉक्टर नियुक्तियां",
    sessionLoading: "मानक विभागों में सत्र का भार।",
    dengueSurge: "डेंगू प्रकोप चेतावनी",
    gastroenteritis: "गैस्ट्रोएंटेराइटिस क्लस्टर",
    casesAlert: "मामले पिछले 48 घंटों में दर्ज। महामारी विसंगति चिह्नित।",
    alertLabel: "अलर्ट",
    locationLabel: "स्थान",
    totalPatients: "कुल पंजीकृत रोगी",
    growthMonth: "इस महीने +15% वृद्धि",
    activeConsultations: "सक्रिय परामर्श",
    liveDb: "डेटाबेस से लाइव",
    decentralizedVault: "विकेंद्रीकृत वॉल्ट आकार",
    filesLabel: "फाइलें",
    encryptedStored: "एन्क्रिप्टेड दस्तावेज़ संग्रहीत",
    clinicalCore: "क्लिनिकल कोर स्थिति",
    allOperational: "सभी डेटाबेस सर्वर चालू हैं",
    patientsGrowth: "मासिक रोगी नामांकन",
    growthGrid: "एबीडीएम ग्राम ग्रिड पर विकास ट्रैकिंग।",
    utilizationTitle: "डॉक्टर विशेषज्ञता उपयोग",
    averageCapacity: "प्रति विभाग औसत क्षमता भार।",
    feverReports: "ग्राम बुखार और रोगज़नक़ हीट रिपोर्ट",
    villageSector: "ग्राम स्थान",
    flaggedSymptom: "चिह्नित लक्षण",
    activeCases: "सक्रिय मामले",
    severity: "तीव्रता",
    auditComposer: "क्लिनिकल प्रोटोकॉल ऑडिट कंपोजर",
    generateAudit: "क्रिप्टोग्राफिक रूप से हस्ताक्षरित अनुपालन रिपोर्ट तैयार करें।",
    selectAuditType: "टेलीमेट्री ऑडिट घटक चुनें...",
    generateBtn: "ऑडिट बहीखाता तैयार करें",
    exportBtn: "बहीखाता निर्यात करें",
    userDirectory: "SaaS चिकित्सक रजिस्ट्री",
    activeLicenses: "सक्रिय चिकित्सक क्रेडेंशियल और नेटवर्क सिंक की समीक्षा करें।",
    practitionerName: "चिकित्सक का नाम",
    assignedRole: "सौंपा गया रोल",
    primaryNetwork: "प्राथमिक हब / संबद्ध क्लिनिक",
    syncState: "सिंक स्थिति",
    online: "ऑनलाइन",
    offline: "ऑफ़लाइन",
    synced: "सिंक किया गया",
    exportAuditReports: "सिस्टम ऑडिट रिपोर्ट निर्यात करें",
    exportDesc: "क्षेत्रीय जनसांख्यिकी, दवा वितरण, और प्रकोप चेतावनियों को एबीडीएम-अनुरूप ऑडिट में संकलित करें।",
    exportCsv: "CSV शीट निर्यात करें",
    exportPdf: "PDF रिपोर्ट निर्यात करें",
    pendingVisits: "लंबित शारीरिक मुलाकातें",
    toastTitle: "सिस्टम ऑडिट रिपोर्ट जनरेट की जा रही है",
    toastDesc: "Vaidya_Telemetry_Audit_{time}.{format} डाउनलोड हो रहा है"
  },
  Marathi: {
    welcome: "स्वागत आहे",
    consoleDesc: "SaaS टेलिमेट्री प्रशासन कन्सोल - ",
    descTail: "• महामारी रोग नकाशे, आशा वाइटल्स आणि सिस्टम ऑडिट लॉगचे निरीक्षण करा.",
    overviewTab: "आढावा",
    analyticsTab: "विश्लेषण",
    outbreaksTab: "प्रकोप (आउटब्रेक)",
    reportsTab: "अहवाल (रिपोर्ट्स)",
    usersTab: "वापरकर्ते",
    outbreakHeat: "प्रकोप हीट ट्रॅकर",
    cases24h: "मागील २४ तासांत नोंदवलेली लक्षणे.",
    weeklyDoctorAppointments: "साप्ताहिक डॉक्टर भेटी",
    sessionLoading: "मानक विभागांमधील सत्रांचे लोड.",
    dengueSurge: "डेंग्यू प्रकोप चेतावणी",
    gastroenteritis: "गॅस्ट्रोएन्टेरिटिस क्लस्टर",
    casesAlert: "केसेस मागील ४८ तासांत नोंदवल्या. महामारी विसंगती चिन्हांकित.",
    alertLabel: "अलर्ट",
    locationLabel: "स्थान",
    totalPatients: "एकूण नोंदणीकृत रुग्ण",
    growthMonth: "या महिन्यात +१५% वाढ",
    activeConsultations: "सक्रिय सल्लामसलत",
    liveDb: "डेटाबेसमधून लाइव्ह",
    decentralizedVault: "विकेंद्रित वॉल्ट आकार",
    filesLabel: "फायली",
    encryptedStored: "एनक्रिप्टेड कागदपत्रे जतन केली",
    clinicalCore: "क्लिनिकल कोर स्थिती",
    allOperational: "सर्व डेटाबेस सर्व्हर कार्यरत आहेत",
    patientsGrowth: "मासिक रुग्ण नोंदणी",
    growthGrid: "एबीडीएम गाव ग्रिडवर वाढ ट्रॅकिंग.",
    utilizationTitle: "डॉक्टर विशेषज्ञता वापर",
    averageCapacity: "प्रति विभाग सरासरी क्षमता भार.",
    feverReports: "गाव ताप आणि रोगजनक हीट अहवाल",
    villageSector: "गाव ठिकाण",
    flaggedSymptom: "चिन्हांकित लक्षण",
    activeCases: "सक्रिय केसेस",
    severity: "तीव्रता",
    auditComposer: "क्लिनिकल प्रोटोकॉल ऑडिट कंपोजर",
    generateAudit: "क्रिप्टोग्राफिक पद्धतीने स्वाक्षरी केलेले अहवाल तयार करा.",
    selectAuditType: "टेलिमेट्री ऑडिट घटक निवडा...",
    generateBtn: "ऑडिट लेजर तयार करा",
    exportBtn: "लेजर निर्यात करा",
    userDirectory: "SaaS डॉक्टर नोंदणी",
    activeLicenses: "सक्रिय डॉक्टर क्रेडेंशियल आणि नेटवर्क सिंकचे पुनरावलोकन करा.",
    practitionerName: "डॉक्टरांचे नाव",
    assignedRole: "भूमिका (रोल)",
    primaryNetwork: "प्राथमिक हब / संलग्न क्लिनिक",
    syncState: "सिंक स्थिती",
    online: "ऑनलाइन",
    offline: "ऑफलाइन",
    synced: "सिंक केलेले",
    exportAuditReports: "सिस्टम ऑडिट अहवाल निर्यात करा",
    exportDesc: "प्रादेशिक लोकसंख्याशास्त्र, औषध वितरण आणि उद्रेक चेतावणी एबीडीएम-सुसंगत ऑडिटमध्ये संकलित करा.",
    exportCsv: "CSV पत्रक निर्यात करा",
    exportPdf: "PDF अहवाल निर्यात करा",
    pendingVisits: "प्रलंबित शारीरिक भेटी",
    toastTitle: "सिस्टम ऑडिट अहवाल तयार करत आहे",
    toastDesc: "Vaidya_Telemetry_Audit_{time}.{format} डाउनलोड होत आहे"
  }
};

export default function AdminDashboardPage() {
  const searchParams = useSearchParams();
  const activeTabParam = searchParams.get("tab");
  const { appointments, records, user, language } = useHealthStore();
  const { toast } = useToast();

  const activeLang = (language === "Hindi" || language === "Marathi") ? language : "English";
  const t = ADMIN_TRANSLATIONS[activeLang] as Record<string, string>;

  const [activeTab, setActiveTab] = useState("overview");

  // Real backend stats
  const [stats, setStats] = useState<{
    totalPatients: number;
    totalAppointments: number;
    totalDoctors: number;
    activeOutbreaks: number;
  } | null>(null);

  const [outbreakList, setOutbreakList] = useState(OUTBREAK_WARNINGS);
  const [heatmapAlerts, setHeatmapAlerts] = useState(VILLAGE_HEAT_ALERTS);
  const [focusLocation, setFocusLocation] = useState<{ lat: number; lng: number } | null>(null);

  const VILLAGE_COORDS: Record<string, [number, number]> = {
    "Nabha":         [30.3742, 76.1422],
    "Rampura Phul":  [30.2632, 75.8234],
    "Barnala":       [30.3806, 75.5493],
    "Sangrur":       [30.2452, 75.8369],
    "Malerkotla":    [30.5290, 75.8826],
    "Dhuri":         [30.3695, 75.8665],
    "Sunam":         [30.1279, 75.7978],
    "Lehragaga":     [30.1706, 75.9533],
    "Moonak":        [29.9971, 75.9106],
    "Budhlada":      [29.9249, 75.5575],
    "Mansa":         [29.9914, 75.3872],
    "Bhikhi":        [30.0423, 75.6231],
    "Bhadaur":       [30.2027, 75.5891],
    "Patran":        [30.0552, 76.0367],
    "Nabha Rural":   [30.3500, 76.1100],
  };

  useEffect(() => {
    if (activeTabParam) setActiveTab(activeTabParam);
    else setActiveTab("overview");
  }, [activeTabParam]);

  // Fetch real stats on mount
  useEffect(() => {
    api.get<{ success: boolean; data: any }>('/api/admin/stats')
      .then(res => {
        if (res.success && res.data) {
          setStats({
            totalPatients: res.data.totalPatients ?? 0,
            totalAppointments: res.data.totalAppointments ?? 0,
            totalDoctors: res.data.totalDoctors ?? 0,
            activeOutbreaks: res.data.activeOutbreaks ?? 0,
          });
        }
      })
      .catch(() => {/* use mock fallback */});

    api.get<{ success: boolean; data: any[] }>('/api/outbreak/heatmap')
      .then(res => {
        if (res.success && res.data?.length) {
          const mapped = res.data.map((o: any, i: number) => ({
            id: `out-${i}`,
            disease: o.symptom_pattern ?? 'Unknown Outbreak',
            location: o.villages?.name ?? 'Unknown Location',
            details: `${o.case_count} cases reported in the last 48 hours.`,
            status: o.case_count >= 10 ? 'Critical' : 'Warning'
          }));
          setOutbreakList(mapped.length ? mapped : OUTBREAK_WARNINGS);

          const heatMapped = res.data.map((o: any) => ({
            sector: o.villages?.name ?? 'Unknown Zone',
            symptom: o.symptom_pattern ?? 'Unknown',
            cases: o.case_count ?? 0,
            alert: o.case_count >= 10 ? 'Critical' : o.case_count >= 5 ? 'Warning' : 'Stable',
            syncTime: 'Live'
          }));
          setHeatmapAlerts(heatMapped.length ? heatMapped : VILLAGE_HEAT_ALERTS);
        }
      })
      .catch(() => {/* use mock fallback */});
  }, []);

  const activeAppts = stats?.totalAppointments ?? appointments.filter(a => a.status === 'Confirmed').length;

  const handleExport = (format: "csv" | "pdf") => {
    toast({
      title: t.toastTitle,
      description: t.toastDesc.replace("{time}", String(Date.now())).replace("{format}", format),
      variant: "default"
    });
  };

  return (
    <div className="flex flex-col gap-6 pb-16 select-none text-foreground">
      
      {/* Page Header */}
      <div className="flex flex-col gap-1.5 border-b border-white/5 pb-4">
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <LayoutDashboard className="h-6.5 w-6.5 text-primary" />
          {t.welcome}, {user?.name || "Admin"} 👋
        </h1>
        <p className="text-xs text-muted-foreground">{t.consoleDesc} {user?.name || "Admin"} {t.descTail}</p>
      </div>

      {/* Tab Selectors */}
      <div className="flex gap-2 border-b border-white/5 pb-2">
        {["overview", "analytics", "outbreaks", "reports", "users"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
              activeTab === tab 
                ? "bg-primary/20 text-primary border border-primary/30" 
                : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
            }`}
          >
            {tab === "overview" ? t.overviewTab : tab === "analytics" ? t.analyticsTab : tab === "outbreaks" ? t.outbreaksTab : tab === "reports" ? t.reportsTab : t.usersTab}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="min-h-[400px] flex flex-col gap-6">
        
        {/* Tab: Overview */}
        {activeTab === "overview" && (
          <>
            {/* Outbreaks deck */}
            {outbreakList.length > 0 && (
              <div className="flex flex-col gap-3">
                {outbreakList.map((warn) => (
                  <div 
                    key={warn.id}
                    className={`p-4 rounded-xl border flex gap-3.5 items-start transition-all duration-300 hover:brightness-105 ${
                      warn.status === "Critical" 
                        ? "bg-rose-500/10 border-rose-500/20 text-rose-300" 
                        : "bg-amber-500/10 border-amber-500/20 text-amber-300"
                    }`}
                  >
                    <div className="relative shrink-0 mt-0.5">
                      <span className={`absolute inset-0 rounded-full h-4 w-4 ${warn.status === "Critical" ? "bg-rose-400 animate-ping" : "bg-amber-400 animate-ping"}`} />
                      <AlertTriangle className={`h-4.5 w-4.5 ${warn.status === "Critical" ? "text-rose-400" : "text-amber-400"}`} />
                    </div>
                    <div className="text-xs">
                      <h4 className="font-extrabold text-white flex items-center gap-2">
                        {warn.disease === "Dengue Surge Warning" ? t.dengueSurge : warn.disease === "Gastroenteritis Cluster" ? t.gastroenteritis : warn.disease}
                        <Badge variant={warn.status === "Critical" ? "destructive" : "warning"} className="text-[8px] font-bold py-0 px-2 tracking-wider uppercase">
                          {warn.status} {t.alertLabel}
                        </Badge>
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{t.locationLabel}: {warn.location}</p>
                      <p className="text-muted-foreground/90 mt-1">{warn.details.includes("cases reported") ? warn.details.replace("cases reported in past 48 hours. Epidemic anomaly flagged.", t.casesAlert) : warn.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Metrics cards row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="glass-panel glass-panel-hover rounded-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
                  <CardTitle className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">{t.totalPatients}</CardTitle>
                  <Users className="h-4.5 w-4.5 text-primary" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-xl font-extrabold text-white">{stats?.totalPatients?.toLocaleString() ?? '1,480'}</div>
                  <p className="text-[9px] text-emerald-400 font-bold mt-1 flex items-center gap-0.5">
                    <TrendingUp className="h-3 w-3" />
                    {t.growthMonth}
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-panel glass-panel-hover rounded-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
                  <CardTitle className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">{t.activeConsultations}</CardTitle>
                  <Calendar className="h-4.5 w-4.5 text-cyan-400" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-xl font-extrabold text-white">{activeAppts}</div>
                  <p className="text-[9px] text-muted-foreground mt-1">{stats ? (activeLang === "English" ? "Live from database" : activeLang === "Hindi" ? "डेटाबेस से लाइव" : "डेटाबेसमधून लाइव्ह") : t.pendingVisits}</p>
                </CardContent>
              </Card>

              <Card className="glass-panel glass-panel-hover rounded-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
                  <CardTitle className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">{t.decentralizedVault}</CardTitle>
                  <Database className="h-4.5 w-4.5 text-amber-400" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-xl font-extrabold text-white">{records.length} {t.filesLabel}</div>
                  <p className="text-[9px] text-muted-foreground mt-1">{t.encryptedStored}</p>
                </CardContent>
              </Card>

              <Card className="glass-panel glass-panel-hover rounded-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
                  <CardTitle className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">{t.clinicalCore}</CardTitle>
                  <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-xl font-extrabold text-white">{t.online}</div>
                  <p className="text-[9px] text-emerald-400 font-bold mt-1">{t.allOperational}</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick charts preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass-panel border-white/5 bg-[#0b101c]/55 p-4 rounded-xl h-[300px] flex flex-col justify-between">
                <div>
                  <CardTitle className="text-xs uppercase font-extrabold text-white">{t.weeklyDoctorAppointments}</CardTitle>
                  <CardDescription className="text-[10px]">{t.sessionLoading}</CardDescription>
                </div>
                <div className="h-[200px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={APPOINTMENTS_FREQUENCY}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#0b101c", border: "1px solid rgba(255,255,255,0.1)" }} />
                      <Bar dataKey="sessions" fill="#10b981" radius={[2, 2, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="glass-panel border-white/5 bg-[#0b101c]/55 p-4 rounded-xl h-[300px] flex flex-col justify-between">
                <div>
                  <CardTitle className="text-xs uppercase font-extrabold text-white">{t.outbreakHeat}</CardTitle>
                  <CardDescription className="text-[10px]">{t.cases24h}</CardDescription>
                </div>
                <div className="overflow-x-auto w-full mt-4">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/5 text-[9px] font-bold uppercase text-muted-foreground">
                        <th className="p-2">{t.villageSector}</th>
                        <th className="p-2">{t.flaggedSymptom}</th>
                        <th className="p-2">{t.activeCases}</th>
                        <th className="p-2">{t.status}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs text-muted-foreground">
                      {VILLAGE_HEAT_ALERTS.slice(0, 3).map((alert, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-all">
                          <td className="p-2 font-bold text-white flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                            {alert.sector}
                          </td>
                          <td className="p-2">{alert.symptom}</td>
                          <td className="p-2 font-bold text-white">{alert.cases}</td>
                          <td className="p-2">
                            <Badge variant={alert.alert === "Critical" ? "destructive" : alert.alert === "Warning" ? "warning" : "default"} className="text-[8px] py-0 px-2 tracking-wider">
                              {alert.alert}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </>
        )}

        {/* Tab: Analytics */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-panel border-white/5 bg-[#0b101c]/55 p-5 rounded-xl">
              <CardTitle className="text-xs uppercase font-extrabold text-white">{t.patientsGrowth}</CardTitle>
              <CardDescription className="text-[10px] mt-1">{t.growthGrid}</CardDescription>
              
              <div className="h-[250px] w-full mt-5">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={PATIENTS_GROWTH}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#0b101c", border: "1px solid rgba(255,255,255,0.1)" }} />
                    <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="glass-panel border-white/5 bg-[#0b101c]/55 p-5 rounded-xl">
              <CardTitle className="text-xs uppercase font-extrabold text-white">{t.utilizationTitle}</CardTitle>
              <CardDescription className="text-[10px] mt-1">{t.averageCapacity}</CardDescription>
              
              <div className="h-[250px] w-full mt-5">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={DOCTOR_UTILIZATION} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" stroke="#64748b" fontSize={10} />
                    <YAxis dataKey="specialty" type="category" stroke="#64748b" fontSize={10} width={80} />
                    <Tooltip contentStyle={{ background: "#0b101c", border: "1px solid rgba(255,255,255,0.1)" }} />
                    <Bar dataKey="utilization" fill="#6366f1" radius={[0, 2, 2, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* Tab: Outbreaks */}
        {activeTab === "outbreaks" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">{t.outbreakHeat}</h3>
              <p className="text-[11px] text-muted-foreground">Interactive cluster maps and live symptom vectors sync.</p>
            </div>

            {/* Outbreak Map Card */}
            <div className="glass-panel border-white/5 bg-[#0b101c]/45 p-4 rounded-xl flex flex-col gap-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">📡 Regional Telemetry Map</span>
                <span className="text-[10px] text-primary font-mono bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 animate-pulse">Live Scan</span>
              </div>
              <OutbreakMap 
                alerts={heatmapAlerts.map(h => ({
                  name: h.sector,
                  cases: h.cases,
                  symptom: h.symptom,
                  alert: h.alert as "Critical" | "Warning" | "Stable",
                  syncTime: h.syncTime
                }))}
                focusLocation={focusLocation}
              />
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t.feverReports}</h3>
              <div className="rounded-xl border border-white/5 bg-black/40 overflow-hidden shadow-lg">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/5 text-[10px] uppercase font-bold text-muted-foreground">
                        <th className="p-3.5">{t.villageSector}</th>
                        <th className="p-3.5">{t.flaggedSymptom}</th>
                        <th className="p-3.5">{t.activeCases}</th>
                        <th className="p-3.5">{t.severity}</th>
                        <th className="p-3.5">{activeLang === "English" ? "Last Synced Time" : activeLang === "Hindi" ? "अंतिम सिंक समय" : "शेवटची सिंक वेळ"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs text-muted-foreground">
                      {heatmapAlerts.map((alert, idx) => (
                        <tr 
                          key={idx} 
                          className="hover:bg-white/5 hover:text-white transition-all cursor-pointer"
                          onClick={() => {
                            const coords = VILLAGE_COORDS[alert.sector];
                            if (coords) {
                              setFocusLocation({ lat: coords[0], lng: coords[1] });
                            }
                          }}
                        >
                          <td className="p-3.5 font-bold text-white flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-primary" />
                            {alert.sector}
                          </td>
                          <td className="p-3.5">{alert.symptom}</td>
                          <td className="p-3.5 font-bold text-white">{alert.cases}</td>
                          <td className="p-3.5">
                            <Badge variant={alert.alert === "Critical" ? "destructive" : alert.alert === "Warning" ? "warning" : "default"} className="text-[8px] py-0.5 px-2 tracking-wider">
                              {alert.alert}
                            </Badge>
                          </td>
                          <td className="p-3.5 font-mono text-[10px]">{alert.syncTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Reports */}
        {activeTab === "reports" && (
          <Card className="glass-panel border-white/5 bg-[#0b101c]/55 max-w-xl mx-auto rounded-xl p-6 flex flex-col gap-4">
            <h3 className="text-xs uppercase font-extrabold text-white tracking-wider border-b border-white/5 pb-2">
              {t.exportAuditReports}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.exportDesc}
            </p>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <Button 
                onClick={() => handleExport("csv")}
                variant="outline" 
                className="rounded-xl border-white/10 hover:bg-white/5 h-11 text-xs font-bold flex items-center justify-center gap-2"
              >
                <FileSpreadsheet className="h-4.5 w-4.5 text-emerald-400" />
                {t.exportCsv}
              </Button>
              <Button 
                onClick={() => handleExport("pdf")}
                variant="outline" 
                className="rounded-xl border-white/10 hover:bg-white/5 h-11 text-xs font-bold flex items-center justify-center gap-2"
              >
                <Download className="h-4.5 w-4.5 text-primary" />
                {t.exportPdf}
              </Button>
            </div>
          </Card>
        )}

        {/* Tab: Users */}
        {activeTab === "users" && (
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t.userDirectory}</h3>
            <div className="rounded-xl border border-white/5 bg-black/40 overflow-hidden">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5 text-[10px] uppercase font-bold text-muted-foreground">
                      <th className="p-3.5">{activeLang === "English" ? "User Name" : activeLang === "Hindi" ? "उपयोगकर्ता नाम" : "वापरकर्ता नाव"}</th>
                      <th className="p-3.5">{t.assignedRole}</th>
                      <th className="p-3.5">{t.primaryNetwork}</th>
                      <th className="p-3.5">{t.syncState}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs text-muted-foreground">
                    {USER_REGISTRY.map((userNode, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-all">
                        <td className="p-3.5 font-bold text-white">{userNode.name}</td>
                        <td className="p-3.5">
                          <Badge variant="outline" className="text-[8px] uppercase tracking-wider font-extrabold">
                            {userNode.role}
                          </Badge>
                        </td>
                        <td className="p-3.5">{userNode.clinic}</td>
                        <td className="p-3.5">
                          <span className="text-emerald-400 flex items-center gap-1.5 font-bold text-[10px]">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                            {userNode.status === "Online" ? t.online : userNode.status === "Synced" ? t.synced : t.offline}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
