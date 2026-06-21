"use client";

import React, { useState, useMemo } from "react";
import { 
  Bell, 
  ShieldAlert, 
  Sparkles, 
  Calendar, 
  Info, 
  CheckCircle2, 
  Search, 
  AlertTriangle, 
  Wifi, 
  Activity, 
  Lock, 
  Database, 
  ArrowRight,
  RefreshCw,
  Clock,
  MapPin,
  Trash2,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

// Notification Category types
type NotificationCategory = "all" | "critical" | "sync" | "security" | "system";

// Notification Interface
interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  severity: "critical" | "warning" | "info" | "success";
  timestamp: string;
  location?: string;
  metadata?: Record<string, any>;
  read: boolean;
}

// Initial Mock Notifications
const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Critical Outbreak Warning: Dengue Surge",
    message: "Epidemiological anomaly detected. 14 clinical cases reported in past 48 hours within Village Zone C (Sector 4). Triggering diagnostic protocols.",
    category: "critical",
    severity: "critical",
    timestamp: "10 mins ago",
    location: "Village Zone C (Sector 4)",
    metadata: {
      "Vector Risk Level": "Severe",
      "Action Code": "Asha-Triage-Protocol-3",
      "Flagged By": "ASHA Sync Hub",
      "Affected Sectors": "Zone C, Sectors 4 and 5"
    },
    read: false
  },
  {
    id: "notif-2",
    title: "ASHA Patient Logs Synchronized",
    message: "Savita Devi successfully uploaded 8 prenatal patient profiles to the decentralized gateway. All diagnostic records validated against regional registry.",
    category: "sync",
    severity: "success",
    timestamp: "25 mins ago",
    location: "Mirzapur Hub",
    metadata: {
      "Synced Profiles": "8 Patients",
      "Sync Batch Hash": "ipfs://QmX8bF...92pA",
      "Status": "Verified Online Sync",
      "Payload Protocol": "ABHA-V2-Field-Log"
    },
    read: false
  },
  {
    id: "notif-3",
    title: "Drug Interaction Warning Flagged",
    message: "Security pipeline flagged a potential drug-drug interaction event: Metformin 500mg + Iodinated Contrast Agent. High severity risk under review.",
    category: "security",
    severity: "warning",
    timestamp: "1 hour ago",
    metadata: {
      "Patient Identifier": "VAI-8830-492",
      "Interacting Agent A": "Metformin (Oral)",
      "Interacting Agent B": "Contrast Agent (Diagnostic)",
      "Clinical Severity": "Moderate/Severe"
    },
    read: false
  },
  {
    id: "notif-4",
    title: "Telegram Alert: Appointment Logged",
    message: "Dispatched direct Telegram notify bot message: Dr. Alok Sharma confirmed for consultation tomorrow at 11:30 AM. Status updated.",
    category: "system",
    severity: "info",
    timestamp: "2 hours ago",
    location: "Vaidya Medicity, New Delhi",
    metadata: {
      "Doctor Name": "Dr. Alok Sharma",
      "Patient ID": "VAI-8830-492",
      "Alert Gateway": "Telegram API Bot",
      "Time Block": "11:30 AM"
    },
    read: true
  },
  {
    id: "notif-5",
    title: "Decentralized Locker Encryption Locked",
    message: "Document 'Annual_Blood_Work_2026.pdf' locked and encrypted via AES-GCM-256 on IPFS network. Key shared with secure ABHA proxy keys.",
    category: "sync",
    severity: "success",
    timestamp: "4 hours ago",
    metadata: {
      "Document Category": "Lab Report",
      "Encryption Schema": "AES-GCM-256",
      "Node Custody Hash": "ipfs://QmY7h...22fB",
      "File Integrity Check": "MD5-Pass"
    },
    read: true
  }
];

// Helper to simulate random notifications
const SIMULATION_POOL: Omit<NotificationItem, "id" | "timestamp" | "read">[] = [
  {
    title: "ASHA Emergency Triage Alert",
    message: "High risk vitals uploaded for patient Laxmi Devi (Age 62): BP 162/98 mmHg. Dispatching automated telemedicine support invitation.",
    category: "critical",
    severity: "critical",
    location: "Sector 2 Cluster",
    metadata: {
      "Triage Level": "Emergency Tier 1",
      "Symptom Profile": "Systolic hypertension, dizziness",
      "ASHA Worker": "Savita Devi",
      "Action recommended": "Urgent General Physician callback"
    }
  },
  {
    title: "ABHA Health Pass Verified",
    message: "Consent manager approved temporary diagnostic access for Dr. Sarah D'Souza. Medical vault key unlocked for next 2 hours.",
    category: "security",
    severity: "success",
    metadata: {
      "Doctor Scope": "Dr. Sarah D'Souza (Dermatologist)",
      "Consent ID": "CON-902-88B",
      "Duration": "120 minutes limit",
      "Access Type": "Read-Only Cryptographic Vault"
    }
  },
  {
    title: "Waterborne Outbreak Alert Flagged",
    message: "8 gastroenteritis case records logged in Village Sector 2 in past 12 hours. High sanitation anomaly reported to CM office.",
    category: "critical",
    severity: "warning",
    location: "Village Sector 2",
    metadata: {
      "Alert Level": "Regional Pre-warning",
      "Primary Symptoms": "Diarrhea, vomiting",
      "Environmental Vector": "Local tubewell filtration audit suggested"
    }
  },
  {
    title: "Network Telemetry Refreshed",
    message: "Completed decentralized health card directory lookup synchronizations. 16 regional peer nodes reporting online sync.",
    category: "system",
    severity: "info",
    metadata: {
      "Uptime Metric": "99.98% operational",
      "Protocol Version": "ABDM-v2.6-SaaS",
      "Ping Latency": "12ms baseline"
    }
  }
];

export default function NotificationsPage() {
  const [alerts, setAlerts] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<NotificationCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAlert, setSelectedAlert] = useState<NotificationItem | null>(null);

  // Statistics
  const unreadCount = useMemo(() => alerts.filter(a => !a.read).length, [alerts]);
  const criticalCount = useMemo(() => alerts.filter(a => a.category === "critical" && !a.read).length, [alerts]);

  // Handle Mark All Read
  const handleMarkAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  // Handle Clear All
  const handleClearAll = () => {
    setAlerts([]);
  };

  // Handle Individual Read/Unread Toggle
  const toggleReadStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: !a.read } : a));
  };

  // Handle Simulate New Alert
  const handleSimulateAlert = () => {
    const randomIndex = Math.floor(Math.random() * SIMULATION_POOL.length);
    const template = SIMULATION_POOL[randomIndex];
    const newAlert: NotificationItem = {
      id: `sim-${Date.now()}`,
      ...template,
      timestamp: "Just now",
      read: false
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  // Filtered Alerts list
  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      const matchesCategory = activeFilter === "all" || a.category === activeFilter;
      const matchesSearch = 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.location && a.location.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [alerts, activeFilter, searchQuery]);

  // Icons based on severity
  const getSeverityStyle = (severity: NotificationItem["severity"]) => {
    switch (severity) {
      case "critical":
        return "bg-rose-500/10 border-rose-500/20 text-rose-300";
      case "warning":
        return "bg-amber-500/10 border-amber-500/20 text-amber-300";
      case "success":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-300";
      case "info":
      default:
        return "bg-sky-500/10 border-sky-500/20 text-sky-300";
    }
  };

  const getSeverityBadge = (severity: NotificationItem["severity"]) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive" className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5">Critical</Badge>;
      case "warning":
        return <Badge variant="warning" className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5">Warning</Badge>;
      case "success":
        return <Badge variant="default" className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Synced</Badge>;
      case "info":
      default:
        return <Badge variant="secondary" className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5">System</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-16 select-none text-foreground">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary animate-pulse" />
            Clinical Notification Stream
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Real-time alerts, critical triage anomalies, and system diagnostic telemetry feeds.</p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="border-white/5 bg-[#0a0e19] hover:bg-[#121828] text-xs font-semibold rounded-xl transition-all"
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-primary" />
            Mark All Read
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClearAll}
            disabled={alerts.length === 0}
            className="border-white/5 bg-[#0a0e19] hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 text-xs font-semibold rounded-xl transition-all"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Grid Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left main feed area */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          {/* Filters & Search Controls */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between p-3 rounded-xl border border-white/5 bg-[#0a0e19]/60 backdrop-blur-md">
            
            {/* Category tabs */}
            <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
              {(["all", "critical", "sync", "security", "system"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                    activeFilter === cat 
                      ? "bg-primary/20 text-primary border border-primary/30" 
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
                  }`}
                >
                  {cat === "all" ? "All Streams" : cat}
                  {cat === "critical" && criticalCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 text-[8px] bg-rose-500 text-white rounded-full font-extrabold animate-pulse">
                      {criticalCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search alerts stream..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 bg-black/40 border-white/5 focus:border-primary/50 text-xs rounded-lg"
              />
            </div>

          </div>

          {/* Dynamic Feed Stream */}
          <div className="flex flex-col gap-3 min-h-[400px]">
            <AnimatePresence initial={false}>
              {filteredAlerts.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-white/5 rounded-2xl bg-[#0a0e19]/30"
                >
                  <Bell className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">No clinical events matching criteria</h3>
                  <p className="text-xs text-muted-foreground/60 max-w-sm mt-1">There are no diagnostic telemetry alerts in this segment. Run the simulation to trigger a pipeline update.</p>
                </motion.div>
              ) : (
                filteredAlerts.map((notif) => (
                  <motion.div
                    key={notif.id}
                    layoutId={notif.id}
                    initial={{ opacity: 0, y: -20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    onClick={() => setSelectedAlert(notif)}
                    className={`glass-panel glass-panel-hover p-4.5 rounded-xl border flex gap-4 items-start cursor-pointer select-none transition-all relative overflow-hidden ${
                      notif.read ? "bg-[#0b101c]/30 border-white/5 opacity-80" : "bg-[#0c1326]/75 border-white/10"
                    }`}
                  >
                    {/* Unread indicator bar */}
                    {!notif.read && (
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent" />
                    )}

                    {/* Icon Column */}
                    <div className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 shadow-lg ${getSeverityStyle(notif.severity)}`}>
                      {notif.category === "critical" && <ShieldAlert className="h-4.5 w-4.5 text-rose-400" />}
                      {notif.category === "sync" && <Database className="h-4.5 w-4.5 text-emerald-400" />}
                      {notif.category === "security" && <Lock className="h-4.5 w-4.5 text-amber-400" />}
                      {notif.category === "system" && <Activity className="h-4.5 w-4.5 text-sky-400" />}
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {getSeverityBadge(notif.severity)}
                        <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {notif.timestamp}
                        </span>
                        {notif.location && (
                          <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-0.5">
                            <MapPin className="h-3 w-3 text-primary" />
                            {notif.location}
                          </span>
                        )}
                      </div>

                      <h4 className="font-extrabold text-sm text-white mt-1.5 leading-snug flex items-center gap-1.5">
                        {notif.title}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-1">{notif.message}</p>
                    </div>

                    {/* Toggle read status button */}
                    <button
                      onClick={(e) => toggleReadStatus(notif.id, e)}
                      className="text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 bg-black/20 shrink-0 self-center transition-all"
                    >
                      {notif.read ? "Mark Unread" : "Mark Read"}
                    </button>

                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Right side diagnostics panel */}
        <div className="flex flex-col gap-6">
          
          {/* Action Trigger Card */}
          <Card className="glass-panel border-white/5 bg-[#0b101c]/55 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
            <CardHeader className="pb-3">
              <CardTitle className="text-xs uppercase font-extrabold text-white flex items-center gap-1.5 tracking-wider">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                Pipeline Simulation
              </CardTitle>
              <CardDescription className="text-[10px]">Simulate asynchronous clinical sync alerts.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3.5 pt-0">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Test real-time dashboard events, vitals triage, database synchronizations, and generic security compliance checks instantly.
              </p>
              <Button 
                onClick={handleSimulateAlert}
                variant="glow"
                className="w-full rounded-xl font-bold flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Simulate Diagnostic Alert
              </Button>
            </CardContent>
          </Card>

          {/* Connection Guard Telemetry */}
          <Card className="glass-panel border-white/5 bg-[#0b101c]/55">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-xs uppercase font-extrabold text-white flex items-center gap-1.5 tracking-wider">
                <Wifi className="h-4.5 w-4.5 text-primary" />
                System Telemetry Guard
              </CardTitle>
              <CardDescription className="text-[10px]">Core connection infrastructure telemetry.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-4 text-xs font-semibold">
              
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-muted-foreground">Gateway Sync Status</span>
                <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 animate-ping shrink-0" />
                  ABDM API Sync Active
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-muted-foreground">Connected Peer Nodes</span>
                <span className="text-white font-bold">16 active nodes</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-muted-foreground">Average Ping Latency</span>
                <span className="text-primary font-bold">12ms</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Uptime Stream Guard</span>
                <span className="text-white font-bold">99.98%</span>
              </div>

            </CardContent>
          </Card>

        </div>

      </div>

      {/* Alert Diagnostics Detail Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={(open) => !open && setSelectedAlert(null)}>
        <DialogContent className="max-w-xl bg-[#090d16] border border-white/10 rounded-2xl p-6">
          {selectedAlert && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2.5">
                  <div className={`h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 ${getSeverityStyle(selectedAlert.severity)}`}>
                    {selectedAlert.category === "critical" && <ShieldAlert className="h-4 w-4" />}
                    {selectedAlert.category === "sync" && <Database className="h-4 w-4" />}
                    {selectedAlert.category === "security" && <Lock className="h-4 w-4" />}
                    {selectedAlert.category === "system" && <Activity className="h-4 w-4" />}
                  </div>
                  <div>
                    <DialogTitle className="text-base font-extrabold text-white">{selectedAlert.title}</DialogTitle>
                    <DialogDescription className="text-[10px] text-muted-foreground font-semibold mt-0.5 flex items-center gap-2">
                      <span>Stream: {selectedAlert.category.toUpperCase()}</span>
                      <span>•</span>
                      <span>Logged: {selectedAlert.timestamp}</span>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Dialog Main Content */}
              <div className="flex flex-col gap-4.5 pt-4">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs text-muted-foreground leading-relaxed">
                  <h5 className="font-extrabold text-white mb-1">Telemetry Summary</h5>
                  {selectedAlert.message}
                </div>

                {/* Metadata details table */}
                {selectedAlert.metadata && (
                  <div className="flex flex-col gap-2">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Payload Data Mapping</h5>
                    <div className="rounded-xl border border-white/5 bg-black/45 overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/5 bg-white/5">
                            <th className="p-2.5 text-[10px] font-extrabold uppercase text-muted-foreground">Metric Registry</th>
                            <th className="p-2.5 text-[10px] font-extrabold uppercase text-muted-foreground">Decrypted Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-xs">
                          {Object.entries(selectedAlert.metadata).map(([key, value]) => (
                            <tr key={key}>
                              <td className="p-2.5 font-bold text-muted-foreground">{key}</td>
                              <td className="p-2.5 font-mono text-primary font-bold">{String(value)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="flex items-center justify-between pt-5 mt-4 border-t border-white/5">
                <div className="text-[10px] font-semibold text-muted-foreground">
                  ID: <span className="font-mono text-white">{selectedAlert.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedAlert(null)}
                    className="border-white/5 bg-[#0a0e19] text-xs font-semibold rounded-xl"
                  >
                    Acknowledge & Close
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}

