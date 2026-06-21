"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Heart, 
  User, 
  Activity, 
  Pill, 
  Sparkles, 
  ShieldAlert, 
  ArrowRight,
  Stethoscope
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const ROLES = [
  {
    id: "patient",
    title: "Patient Console",
    description: "Access your ABHA health pass, triage symptoms, and manage prescription locker keys.",
    icon: User,
    color: "from-emerald-400 to-teal-500",
    glow: "shadow-emerald-500/10 hover:shadow-emerald-500/20",
    href: "/login/patient"
  },
  {
    id: "doctor",
    title: "Doctor Clinic WorkSpace",
    description: "Manage clinical queues, issue secure e-prescriptions, and accept consultations.",
    icon: Stethoscope,
    color: "from-cyan-400 to-blue-500",
    glow: "shadow-cyan-500/10 hover:shadow-cyan-500/20",
    href: "/login/doctor"
  },
  {
    id: "pharmacist",
    title: "Pharmacy Portal",
    description: "Update inventory, track low stock warnings, and verify prescription integrity.",
    icon: Pill,
    color: "from-amber-400 to-orange-500",
    glow: "shadow-amber-500/10 hover:shadow-amber-500/20",
    href: "/login/pharmacist"
  },
  {
    id: "asha",
    title: "ASHA Worker Lite",
    description: "Bilingual tablet companion optimized for offline rural registrations and vitals sync.",
    icon: Sparkles,
    color: "from-purple-400 to-indigo-500",
    glow: "shadow-purple-500/10 hover:shadow-purple-500/20",
    href: "/login/asha"
  },
  {
    id: "admin",
    title: "SaaS Admin Telemetry",
    description: "Monitor outbreak anomalies, track analytics, and manage regional clinics.",
    icon: ShieldAlert,
    color: "from-rose-400 to-red-500",
    glow: "shadow-rose-500/10 hover:shadow-rose-500/20",
    href: "/login/admin"
  }
];

export default function LoginSelectionPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-16 relative overflow-hidden bg-[#04060b]">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[10%] left-[10%] w-[350px] h-[350px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none -z-10" />

      <div className="w-full max-w-4xl flex flex-col gap-10 items-center z-10">
        
        {/* Header Branding */}
        <div className="text-center flex flex-col items-center gap-3">
          <Link href="/" className="flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Heart className="h-5.5 w-5.5 text-white animate-pulse" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">Vaidya.ai</span>
          </Link>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-foreground via-foreground/95 to-muted-foreground bg-clip-text text-transparent leading-none">
            Choose Your Console Gateway
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg leading-relaxed mt-2">
            Select your clinical role to log in. Vaidya.ai synchronizes records, telemetry, and triage diagnostics across all regional tiers.
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-4">
          {ROLES.map((roleCard, idx) => {
            const Icon = roleCard.icon;
            return (
              <motion.div
                key={roleCard.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ scale: 1.02 }}
                className={`glass-panel glass-panel-hover rounded-2xl border border-white/5 flex flex-col justify-between p-6 shadow-xl relative overflow-hidden bg-[#0c101d]/60 backdrop-blur-xl ${roleCard.glow} group cursor-pointer`}
                onClick={() => router.push(roleCard.href)}
              >
                {/* Visual Top Glow */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${roleCard.color}`} />

                <div className="flex flex-col gap-4">
                  {/* Icon Card */}
                  <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${roleCard.color} p-0.5 flex items-center justify-center text-white shrink-0`}>
                    <div className="h-full w-full bg-[#090d16]/90 rounded-[10px] flex items-center justify-center">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-extrabold text-base text-white group-hover:text-primary transition-colors">{roleCard.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">{roleCard.description}</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">Launch Portal</span>
                  <div className="h-7 w-7 rounded-lg bg-white/5 group-hover:bg-primary/20 border border-white/5 group-hover:border-primary/20 flex items-center justify-center transition-all">
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="text-center mt-4">
          <p className="text-xs text-muted-foreground/60 font-semibold tracking-wider uppercase">
            Ayushman Bharat Health Account (ABHA) Compliant • Vaidya Core v2.6
          </p>
        </div>

      </div>
    </div>
  );
}
