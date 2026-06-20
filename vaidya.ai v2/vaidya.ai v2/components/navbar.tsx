"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  Bell, 
  ShieldCheck, 
  CreditCard,
  Heart,
  LogOut,
  User,
  Settings,
  XCircle,
  Shield,
  Activity,
  Phone,
  Mail,
  MapPin,
  Clock,
  HeartHandshake,
  ChevronDown,
  Globe
} from "lucide-react";
import { useHealthStore } from "@/store/useHealthStore";
import { usePathname, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, logout, language, setLanguage } = useHealthStore();
  const { toast } = useToast();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLoginPage = pathname?.startsWith("/login");

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoginPage) return null;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return role === "doctor" ? "Good morning, Doctor" : "Good morning";
    if (hour < 17) return role === "doctor" ? "Good afternoon, Doctor" : "Good afternoon";
    return role === "doctor" ? "Good evening, Doctor" : "Good evening";
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    router.replace("/login");
  };

  const handleSettingsSave = () => {
    setIsSettingsOpen(false);
    toast({
      title: "Settings Saved",
      description: "Regional telemetry preference keys successfully updated.",
      variant: "default"
    });
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-white/5 bg-[#090d16]/60 backdrop-blur-md px-4 py-3 select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Desktop Greeting */}
          <div className="hidden md:block">
            <h1 className="text-sm font-semibold text-foreground/90 flex items-center gap-1.5">
              {getGreeting()}, <span className="text-primary font-bold">{user?.name ?? "Guest"}</span>
              {role === "doctor" && " 👨‍⚕️"}
            </h1>
            <p className="text-[10px] text-muted-foreground mt-0.5">Logged in as {role.toUpperCase()} • System operational.</p>
          </div>

          {/* Mobile Header Logo */}
          <div className="flex md:hidden items-center gap-2">
            <div className="h-7.5 w-7.5 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-xs text-foreground block leading-none">Vaidya.ai</span>
              <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider">{role}</span>
            </div>
          </div>

          {/* Action Widgets */}
          <div className="flex items-center gap-3 relative" ref={dropdownRef}>
            
            {/* Language Selector Dropdown */}
            <div className="relative flex items-center">
              <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <select
                value={language}
                onChange={(e) => {
                  const selectedLang = e.target.value as "English" | "Hindi" | "Marathi";
                  setLanguage(selectedLang);
                  toast({
                    title: "Language Changed / भाषा बदली गई",
                    description: `Interface set to ${selectedLang}.`,
                    variant: "default"
                  });
                }}
                className="pl-8 pr-7 py-1.5 bg-[#0d121f] text-muted-foreground hover:text-white border border-white/5 hover:border-white/10 rounded-xl text-[11px] font-bold transition-all cursor-pointer outline-none appearance-none"
              >
                <option value="English">EN</option>
                <option value="Hindi">हिन्दी</option>
                <option value="Marathi">मराठी</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
            </div>

            {/* Clinical Sync Status */}
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full text-[9px] font-semibold text-emerald-400">
              <ShieldCheck className="h-3 w-3" />
              Connected
            </div>

            {/* Quick Notification Bell */}
            <Link href="/notifications" className="relative p-2 rounded-xl border border-white/5 bg-[#0d121f] text-muted-foreground hover:text-foreground hover:bg-white/5 hover:border-white/10 transition-all">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </Link>

            {/* Direct Logout Button */}
            <button 
              onClick={handleLogout} 
              title="Logout / Sign Out"
              className="p-2 rounded-xl border border-rose-500/10 bg-rose-500/5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>

            {/* Profile Menu Trigger */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl border border-white/5 bg-[#0d121f] hover:bg-[#121828] hover:border-white/10 transition-all text-left"
            >
              <div className="relative h-7 w-7 rounded-lg overflow-hidden bg-neutral-800 shrink-0">
                <img 
                  src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"} 
                  alt={user?.name ?? "User"} 
                  className="object-cover h-full w-full" 
                />
              </div>
              <div className="hidden lg:block min-w-0 pr-1">
                <h4 className="text-xs font-bold truncate text-foreground leading-none">{user?.name}</h4>
                <span className="text-[9px] text-muted-foreground tracking-wider font-semibold capitalize mt-0.5 block">{role}</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-1 shrink-0" />
            </button>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-56 glass-panel bg-[#0d121f]/95 border border-white/10 rounded-xl shadow-2xl p-2 flex flex-col gap-1 z-50 text-xs"
                >
                  <div className="p-2 border-b border-white/5 flex flex-col gap-0.5">
                    <span className="font-extrabold text-white text-[11px] truncate">{user?.name}</span>
                    <span className="text-[9px] text-muted-foreground truncate">{user?.email}</span>
                  </div>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsProfileOpen(true);
                    }}
                    className="flex items-center gap-2 p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 text-left font-bold transition-all"
                  >
                    <User className="h-4 w-4 text-primary" />
                    My Profile
                  </button>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsSettingsOpen(true);
                    }}
                    className="flex items-center gap-2 p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 text-left font-bold transition-all"
                  >
                    <Settings className="h-4 w-4 text-cyan-400" />
                    Settings
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 p-2 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 text-left font-bold border-t border-white/5 mt-1 transition-all"
                  >
                    <LogOut className="h-4 w-4 text-rose-400" />
                    Sign Out / Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </header>

      {/* User Profile Information Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-md bg-[#090d16] border border-white/10 rounded-2xl p-6 text-foreground">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="relative h-11 w-11 rounded-xl overflow-hidden bg-neutral-800 shrink-0">
                <img src={user?.avatar} alt={user?.name ?? ""} className="object-cover h-full w-full" />
              </div>
              <div>
                <DialogTitle className="text-base font-extrabold text-white">{user?.name}</DialogTitle>
                <DialogDescription className="text-[10px] text-muted-foreground font-semibold mt-0.5 uppercase tracking-wider">
                  System Role: {role} • ID: {user?.id}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Role-Specific Detail Blocks */}
          <div className="flex flex-col gap-4 pt-4">
            
            {/* Common Contacts */}
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs flex flex-col gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5 text-primary" />
                <span>Email: <strong className="text-white">{user?.email}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span>Security Token: <strong className="text-white">ABDM-v2-Verified</strong></span>
              </div>
            </div>

            {/* Patient Specifics */}
            {role === "patient" && (
              <div className="flex flex-col gap-2 text-xs">
                <h5 className="text-[9px] uppercase font-bold tracking-wider text-primary">Patient Demographics</h5>
                <div className="grid grid-cols-2 gap-2 bg-black/40 border border-white/5 p-3 rounded-xl">
                  <div>
                    <span className="text-muted-foreground text-[9px] block">Birth Date</span>
                    <strong className="text-white">{user?.dob || "1994-08-22"}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[9px] block">Blood Group</span>
                    <strong className="text-white">{user?.bloodGroup || "O+"}</strong>
                  </div>
                </div>

                <div className="flex flex-col gap-1 bg-black/40 border border-white/5 p-3 rounded-xl">
                  <span className="text-muted-foreground text-[9px] block uppercase font-bold tracking-wider text-rose-400">Allergies & Intolerance</span>
                  <p className="text-white font-semibold">{user?.allergies?.join(", ") || "No severe allergies logged."}</p>
                </div>
              </div>
            )}

            {/* Doctor Specifics */}
            {role === "doctor" && (
              <div className="flex flex-col gap-2 text-xs">
                <h5 className="text-[9px] uppercase font-bold tracking-wider text-primary">Practitioner Registry</h5>
                <div className="grid grid-cols-2 gap-2 bg-black/40 border border-white/5 p-3 rounded-xl">
                  <div>
                    <span className="text-muted-foreground text-[9px] block">Specialty</span>
                    <strong className="text-white">General Clinical Triage</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[9px] block">Affiliated Clinic</span>
                    <strong className="text-white">Delhi MedHub Central</strong>
                  </div>
                </div>
              </div>
            )}

            {/* ASHA Specifics */}
            {role === "asha" && (
              <div className="flex flex-col gap-2 text-xs">
                <h5 className="text-[9px] uppercase font-bold tracking-wider text-primary">ASHA Field Work Segment</h5>
                <div className="bg-black/40 border border-white/5 p-3 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Assigned Segment:</span>
                    <strong className="text-white">Nerul Sector 4</strong>
                  </div>
                </div>
              </div>
            )}

          </div>

          <DialogFooter className="pt-4 mt-4 border-t border-white/5">
            <Button onClick={() => setIsProfileOpen(false)} className="rounded-xl font-bold text-xs">
              Close Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-sm bg-[#090d16] border border-white/10 rounded-2xl p-6 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold text-white flex items-center gap-1.5">
              <Settings className="h-5 w-5 text-cyan-400 animate-spin-slow" />
              Portal Configurations
            </DialogTitle>
            <DialogDescription className="text-[10px] text-muted-foreground font-semibold mt-0.5 uppercase">
              Configure telemetry settings
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3.5 pt-4 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-white/5 border border-white/5 rounded-xl">
              <span>Enable Cellular Vitals Buffer</span>
              <input type="checkbox" defaultChecked className="accent-primary h-4 w-4" />
            </div>
            <div className="flex items-center justify-between p-2.5 bg-white/5 border border-white/5 rounded-xl">
              <span>Dynamic Language Translation</span>
              <input type="checkbox" defaultChecked className="accent-primary h-4 w-4" />
            </div>
            <div className="flex items-center justify-between p-2.5 bg-white/5 border border-white/5 rounded-xl">
              <span>Notifications Telegram WebHook</span>
              <input type="checkbox" defaultChecked className="accent-primary h-4 w-4" />
            </div>
          </div>

          <DialogFooter className="pt-4 mt-4 border-t border-white/5">
            <Button onClick={handleSettingsSave} className="rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-600">
              Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
