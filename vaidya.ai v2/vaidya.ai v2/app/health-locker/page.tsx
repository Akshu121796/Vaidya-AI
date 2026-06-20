"use client";

import React, { useState } from "react";
import { 
  FolderLock, 
  Search, 
  Upload, 
  Trash2, 
  FileText, 
  Calendar, 
  Plus, 
  Download,
  AlertTriangle,
  Activity,
  Heart,
  ShieldAlert,
  Clock,
  History as HistoryIcon,
  BadgeCheck,
  ChevronRight,
  Shield,
  FileCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter, 
  DialogClose 
} from "@/components/ui/dialog";
import { useHealthStore } from "@/store/useHealthStore";
import { useToast } from "@/components/ui/toast";
import { HealthRecord } from "@/lib/mock-data";
import api from "@/lib/api";
import { useEffect } from "react";

export default function RebuiltHealthLocker() {
  const { records, addRecord, deleteRecord, user } = useHealthStore();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"prescriptions" | "reports" | "vaccinations" | "allergies" | "history">("prescriptions");
  const [searchQuery, setSearchQuery] = useState("");
  const [backendRecords, setBackendRecords] = useState<HealthRecord[]>([]);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);

  // Fetch real health history from backend on mount
  useEffect(() => {
    if (!user?.backendUserId && !user?.id) return;
    const uid = user.backendUserId ?? user.id;
    setIsFetchingHistory(true);
    api.get<{ success: boolean; data: { prescriptions?: any[]; symptomReports?: any[] } }>(`/api/patients/${uid}/history`)
      .then(res => {
        if (res.success && res.data) {
          const prescriptionsMapped: HealthRecord[] = (res.data.prescriptions ?? []).map((p: any) => {
            let medsStr = "";
            try {
              const meds = typeof p.medicines === "string" ? JSON.parse(p.medicines) : p.medicines;
              medsStr = Array.isArray(meds) ? meds.map((m: any) => m.name || m).join(", ") : "";
            } catch (e) {
              medsStr = "Prescribed Medications";
            }

            return {
              id: p.prescription_id ?? p.id,
              name: medsStr || "Prescription Report",
              category: "Prescription" as const,
              date: new Date(p.created_at).toLocaleDateString("en-IN"),
              doctorName: p.doctors?.users?.name ?? "Vaidya Clinician",
              hospitalName: "Vaidya Medical Centre",
              fileSize: "1.2 MB",
              summary: p.notes ?? "No prescription notes provided.",
            };
          });

          const reportsMapped: HealthRecord[] = (res.data.symptomReports ?? []).map((sr: any) => ({
            id: sr.report_id ?? sr.id,
            name: `Symptom Check: ${(sr.symptoms_raw ?? "Analysis").slice(0, 30)}...`,
            category: "Lab Report" as const,
            date: new Date(sr.created_at).toLocaleDateString("en-IN"),
            doctorName: "Vaidya AI Triage",
            hospitalName: "AI-Assisted Symptom Analyzer",
            fileSize: "N/A",
            summary: `Symptoms: ${sr.symptoms_raw ?? ""}\nUrgency Level: ${sr.urgency_level ?? "Normal"}\nClinical Explanation: ${sr.ai_explanation ?? ""}`,
          }));

          setBackendRecords([...prescriptionsMapped, ...reportsMapped]);
        }
      })
      .catch((err) => {
        console.error("Failed to load clinical history from backend:", err);
      })
      .finally(() => setIsFetchingHistory(false));
  }, [user?.id, user?.backendUserId]);

  // Merge: backend records + local Zustand records (deduplicated by id)
  const allRecords = [
    ...backendRecords,
    ...records.filter(r => !backendRecords.some(b => b.id === r.id))
  ];

  // Upload Form State
  const [docName, setDocName] = useState("");
  const [docCategory, setDocCategory] = useState<HealthRecord["category"]>("Prescription");
  const [signedDoctor, setSignedDoctor] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [docSummary, setDocSummary] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Groupings & Counts (use merged records)
  const prescriptionRecords = allRecords.filter(r => r.category === "Prescription" && r.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const reportRecords = allRecords.filter(r => r.category === "Lab Report" && r.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const vaccineRecords = allRecords.filter(r => r.category === "Vaccine Card" && r.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const allPrescriptions = allRecords.filter(r => r.category === "Prescription");
  const allReports = allRecords.filter(r => r.category === "Lab Report");
  const allVaccines = allRecords.filter(r => r.category === "Vaccine Card");

  // Mock Allergies List based on User profile
  const allergyList = (user?.allergies || []).map((allergy, index) => {
    let severity = "Moderate";
    let status = "Active";
    let reaction = "Skin rashes or respiratory wheezing";
    let date = "2024-05-10";

    if (allergy === "Penicillin") {
      severity = "Severe";
      reaction = "Anaphylaxis, hives, and cardiac strain";
      date = "2020-04-12";
    } else if (allergy === "Dust Mites") {
      severity = "Mild";
      reaction = "Allergic rhinitis and nasal congestion";
      date = "2025-11-20";
    }

    return {
      id: `allergy-${index}`,
      name: allergy,
      reaction,
      severity,
      status,
      date
    };
  }).filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Mock Clinical Event History Logs
  const historyLogs = [
    { id: "log-1", name: "Symptom Diagnostic Check: suspected URTI", date: "2026-06-14", status: "Completed", type: "Triage" },
    { id: "log-2", name: "Cardiologist Consultation booked with Dr. Alok Sharma", date: "2026-06-14", status: "Confirmed", type: "Booking" },
    { id: "log-3", name: "Uploaded Annual Health Screening Lab Report", date: "2026-05-14", status: "Logged", type: "Locker" },
    { id: "log-4", name: "Dermatologist Consultation with Dr. Sarah D'Souza", date: "2026-05-10", status: "Completed", type: "Consult" },
    { id: "log-5", name: "Emergency directives profile modified", date: "2026-04-12", status: "Verified", type: "Health ID" },
  ].filter(h => h.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleDownload = (name: string) => {
    toast({
      title: "Downloading File",
      description: `Preparing encrypted PDF bundle for "${name}"...`,
      variant: "default"
    });
  };

  const handleUploadSubmit = () => {
    if (!docName || !signedDoctor || !docSummary) {
      toast({
        title: "Required Inputs Missing",
        description: "Please specify document title, signing physician, and medical summary.",
        variant: "destructive"
      });
      return;
    }

    const size = `${(Math.random() * 2 + 0.5).toFixed(1)} MB`;

    addRecord({
      name: docName,
      category: docCategory,
      date: new Date().toISOString().split("T")[0],
      doctorName: signedDoctor,
      hospitalName: hospitalName || "Vaidya MedHub",
      fileSize: size,
      summary: docSummary
    });

    toast({
      title: "File Vaulted",
      description: `"${docName}" has been safely encrypted and uploaded to your locker.`,
      variant: "default"
    });

    setDocName("");
    setSignedDoctor("");
    setHospitalName("");
    setDocSummary("");
    setIsUploadOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 pb-16 select-none text-foreground">
      
      {/* Page Header */}
      <div className="flex flex-col gap-1.5 border-b border-white/5 pb-4">
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <FolderLock className="h-6.5 w-6.5 text-primary" />
          Health Locker: {user?.name || 'Patient'}
        </h1>
        <p className="text-xs text-muted-foreground">Apple Health inspired clinical vault. Decentralized encryption for prescriptions, reports, and vaccines.</p>
      </div>

      {/* Apple Health Vitals Summary Grid Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Prescription Tile (Orange theme) */}
        <Card className="bg-[#1b120c]/40 border-[#d97706]/15 hover:border-[#d97706]/30 transition-all duration-300">
          <CardHeader className="p-4 flex flex-row justify-between items-center pb-2">
            <span className="text-[10px] font-bold text-[#f59e0b] uppercase tracking-wider">Active Meds</span>
            <div className="h-7 w-7 rounded-full bg-[#f59e0b]/10 flex items-center justify-center text-[#f59e0b]">
              <Plus className="h-4 w-4 rotate-45" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-extrabold text-white">{allPrescriptions.length}</div>
            <span className="text-[9px] text-muted-foreground mt-0.5 block">Vaulted Prescriptions</span>
          </CardContent>
        </Card>

        {/* Reports Tile (Cyan theme) */}
        <Card className="bg-[#09171e]/40 border-[#06b6d4]/15 hover:border-[#06b6d4]/30 transition-all duration-300">
          <CardHeader className="p-4 flex flex-row justify-between items-center pb-2">
            <span className="text-[10px] font-bold text-[#06b6d4] uppercase tracking-wider">Lab Reports</span>
            <div className="h-7 w-7 rounded-full bg-[#06b6d4]/10 flex items-center justify-center text-[#06b6d4]">
              <FileText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-extrabold text-white">{allReports.length}</div>
            <span className="text-[9px] text-muted-foreground mt-0.5 block">Biochemical Records</span>
          </CardContent>
        </Card>

        {/* Vaccines Tile (Blue theme) */}
        <Card className="bg-[#0c1326]/40 border-[#3b82f6]/15 hover:border-[#3b82f6]/30 transition-all duration-300">
          <CardHeader className="p-4 flex flex-row justify-between items-center pb-2">
            <span className="text-[10px] font-bold text-[#3b82f6] uppercase tracking-wider">Vaccinations</span>
            <div className="h-7 w-7 rounded-full bg-[#3b82f6]/10 flex items-center justify-center text-[#3b82f6]">
              <Shield className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-extrabold text-white">{allVaccines.length}</div>
            <span className="text-[9px] text-muted-foreground mt-0.5 block">Boosters Logged</span>
          </CardContent>
        </Card>

        {/* Allergies Tile (Rose theme) */}
        <Card className="bg-[#1c0f16]/40 border-[#f43f5e]/15 hover:border-[#f43f5e]/30 transition-all duration-300">
          <CardHeader className="p-4 flex flex-row justify-between items-center pb-2">
            <span className="text-[10px] font-bold text-[#f43f5e] uppercase tracking-wider">Allergens</span>
            <div className="h-7 w-7 rounded-full bg-[#f43f5e]/10 flex items-center justify-center text-[#f43f5e]">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-extrabold text-white">{user?.allergies?.length ?? 0}</div>
            <span className="text-[9px] text-rose-400 mt-0.5 block font-bold">Red Flags Flagged</span>
          </CardContent>
        </Card>

      </div>

      {/* Main search and upload bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        {/* Search */}
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search records: 'Metformin', 'Lipid', 'Allergy'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-[#0d121f]"
          />
        </div>

        {/* Upload Trigger */}
        <Button 
          variant="glow"
          onClick={() => setIsUploadOpen(true)}
          className="w-full sm:w-auto rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 h-10 px-4"
        >
          <Plus className="h-4 w-4" />
          Upload Record
        </Button>
      </div>

      {/* Apple Health Tabs Segmented Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 border-b border-white/5 pb-4">
        
        {/* Prescriptions */}
        <button
          onClick={() => setActiveTab("prescriptions")}
          className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all justify-center ${
            activeTab === "prescriptions" 
              ? "bg-[#101827] border-primary text-primary shadow-lg shadow-primary/5" 
              : "bg-white/5 border-white/5 text-muted-foreground hover:text-white"
          }`}
        >
          <Plus className="h-4 w-4 text-emerald-400 rotate-45 shrink-0" />
          Prescriptions
        </button>

        {/* Reports */}
        <button
          onClick={() => setActiveTab("reports")}
          className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all justify-center ${
            activeTab === "reports" 
              ? "bg-[#101827] border-primary text-primary shadow-lg shadow-primary/5" 
              : "bg-white/5 border-white/5 text-muted-foreground hover:text-white"
          }`}
        >
          <FileText className="h-4 w-4 text-cyan-400 shrink-0" />
          Reports
        </button>

        {/* Vaccinations */}
        <button
          onClick={() => setActiveTab("vaccinations")}
          className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all justify-center ${
            activeTab === "vaccinations" 
              ? "bg-[#101827] border-primary text-primary shadow-lg shadow-primary/5" 
              : "bg-white/5 border-white/5 text-muted-foreground hover:text-white"
          }`}
        >
          <Shield className="h-4 w-4 text-blue-400 shrink-0" />
          Vaccines
        </button>

        {/* Allergies */}
        <button
          onClick={() => setActiveTab("allergies")}
          className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all justify-center ${
            activeTab === "allergies" 
              ? "bg-[#101827] border-primary text-primary shadow-lg shadow-primary/5" 
              : "bg-white/5 border-white/5 text-muted-foreground hover:text-white"
          }`}
        >
          <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
          Allergies
        </button>

        {/* History */}
        <button
          onClick={() => setActiveTab("history")}
          className={`col-span-2 sm:col-span-1 flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all justify-center ${
            activeTab === "history" 
              ? "bg-[#101827] border-primary text-primary shadow-lg shadow-primary/5" 
              : "bg-white/5 border-white/5 text-muted-foreground hover:text-white"
          }`}
        >
          <Clock className="h-4 w-4 text-purple-400 shrink-0" />
          History
        </button>

      </div>

      {/* Dynamic Display Area */}
      <div className="flex flex-col gap-3">
        
        {/* PRESCRIPTIONS TAB */}
        {activeTab === "prescriptions" && (
          prescriptionRecords.length > 0 ? (
            prescriptionRecords.map((item) => (
              <div 
                key={item.id}
                className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-card/45 hover:bg-card/75 transition-colors gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-primary shrink-0">
                    <Plus className="h-4.5 w-4.5 rotate-45" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate leading-tight">{item.name}</h4>
                    <span className="text-[10px] text-muted-foreground mt-0.5 block">{item.date} • Signee: {item.doctorName} • {item.fileSize}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[8px] font-bold py-0.5 uppercase tracking-wider">Active</Badge>
                  <button 
                    onClick={() => handleDownload(item.name)}
                    className="p-2 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white rounded-lg transition-colors border border-white/5"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground text-center py-8">No matching prescriptions in locker.</p>
          )
        )}

        {/* REPORTS TAB */}
        {activeTab === "reports" && (
          reportRecords.length > 0 ? (
            reportRecords.map((item) => (
              <div 
                key={item.id}
                className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-card/45 hover:bg-card/75 transition-colors gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 shrink-0">
                    <FileText className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate leading-tight">{item.name}</h4>
                    <span className="text-[10px] text-muted-foreground mt-0.5 block">{item.date} • Origin: {item.hospitalName} • {item.fileSize}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant="outline" className="text-[8px] font-bold py-0.5 border-white/10 uppercase tracking-wider text-muted-foreground">Verified</Badge>
                  <button 
                    onClick={() => handleDownload(item.name)}
                    className="p-2 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white rounded-lg transition-colors border border-white/5"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground text-center py-8">No matching lab reports in locker.</p>
          )
        )}

        {/* VACCINATIONS TAB */}
        {activeTab === "vaccinations" && (
          vaccineRecords.length > 0 ? (
            vaccineRecords.map((item) => (
              <div 
                key={item.id}
                className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-card/45 hover:bg-card/75 transition-colors gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
                    <Shield className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate leading-tight">{item.name}</h4>
                    <span className="text-[10px] text-muted-foreground mt-0.5 block">{item.date} • Hub: {item.hospitalName.split(",")[0]} • {item.fileSize}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[8px] font-bold py-0.5 uppercase tracking-wider">Immunized</Badge>
                  <button 
                    onClick={() => handleDownload(item.name)}
                    className="p-2 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white rounded-lg transition-colors border border-white/5"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground text-center py-8">No matching vaccination boosters in locker.</p>
          )
        )}

        {/* ALLERGIES TAB */}
        {activeTab === "allergies" && (
          allergyList.length > 0 ? (
            allergyList.map((item) => (
              <div 
                key={item.id}
                className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-card/45 hover:bg-card/75 transition-colors gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 shrink-0">
                    <AlertTriangle className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate leading-tight">{item.name} Allergy</h4>
                    <span className="text-[10px] text-muted-foreground mt-0.5 block truncate max-w-[280px]">Reaction: {item.reaction}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge 
                    variant={item.severity === "Severe" ? "destructive" : "warning"}
                    className="text-[8px] font-bold py-0.5 uppercase tracking-wider"
                  >
                    {item.severity}
                  </Badge>
                  <button 
                    onClick={() => handleDownload(`${item.name} Allergen Protocol`)}
                    className="p-2 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white rounded-lg transition-colors border border-white/5"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground text-center py-8">No matching allergens listed.</p>
          )
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          historyLogs.length > 0 ? (
            historyLogs.map((item) => (
              <div 
                key={item.id}
                className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-card/45 hover:bg-card/75 transition-colors gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 shrink-0">
                    <HistoryIcon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate leading-tight">{item.name}</h4>
                    <span className="text-[10px] text-muted-foreground mt-0.5 block">Category: {item.type}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] font-mono text-muted-foreground">{item.date}</span>
                  <Badge variant="outline" className="text-[8px] font-bold py-0.5 border-white/10 uppercase tracking-wider text-muted-foreground">{item.status}</Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground text-center py-8">No logs matching query.</p>
          )
        )}

      </div>

      {/* Upload Document Dialog Modal */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="max-w-md bg-[#0a0e19] border-white/10 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Vault Health Document
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Add prescriptions, scan reports, or vaccinations to your locker. Files are stored with military-grade client-side encryption.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2 text-xs">
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-muted-foreground">Document Title</label>
              <Input 
                placeholder="e.g. Lipid Blood Panel Report, COVID Booster Card..."
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                className="bg-[#0b101c]"
              />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-muted-foreground">Document Category</label>
              <Select
                value={docCategory}
                onChange={(e) => setDocCategory(e.target.value as HealthRecord["category"])}
                className="bg-[#0b101c]"
              >
                <option value="Prescription">Prescription</option>
                <option value="Lab Report">Lab Report</option>
                <option value="Vaccine Card">Vaccine Card</option>
              </Select>
            </div>

            {/* Doctor */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-muted-foreground">Clinical Signee (Clinician Name)</label>
              <Input 
                placeholder="e.g. Dr. Alok Sharma"
                value={signedDoctor}
                onChange={(e) => setSignedDoctor(e.target.value)}
                className="bg-[#0b101c]"
              />
            </div>

            {/* Hospital */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-muted-foreground">Origin Hospital / Laboratory</label>
              <Input 
                placeholder="e.g. Vaidya Medicity, PathLabs"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                className="bg-[#0b101c]"
              />
            </div>

            {/* Summary */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-muted-foreground">Clinical Summary & Extracted Findings</label>
              <textarea
                placeholder="Explain the results: e.g. HbA1c at 5.6% within range. High HDL, low LDL triggers..."
                value={docSummary}
                onChange={(e) => setDocSummary(e.target.value)}
                className="flex w-full rounded-lg border border-white/10 bg-[#0d121f] px-3 py-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary/50 min-h-[85px]"
              />
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <DialogClose>
              <Button variant="outline" size="sm" className="rounded-xl text-[11px] h-9">Close</Button>
            </DialogClose>
            <Button 
              variant="default" 
              size="sm"
              onClick={handleUploadSubmit}
              className="rounded-xl text-[11px] h-9 font-semibold"
            >
              Sign & Vault File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
