"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Search, 
  Activity, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  FolderLock,
  Lock,
  ArrowUpRight,
  Code,
  Users,
  Terminal,
  Smartphone,
  Volume2,
  RefreshCw,
  Globe2,
  HeartHandshake
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHealthStore } from "@/store/useHealthStore";

// Localized Testimonials for Bharat Theme
const TESTIMONIALS = [
  {
    quote: "Vaidya.ai has completely shifted our primary triage workflow in Uttar Pradesh. The vernacular symptom triager resolves low-priority cases before they crowd regional healthcare centers.",
    author: "Dr. Rajesh Kurup",
    role: "Chief Medical Officer, Apollo Health Group",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150"
  },
  {
    quote: "Asha's voice-first Indian language input lets me register and track prenatal checkups and child immunization in our village instantly, even with zero network connectivity.",
    author: "Smt. Savita Devi",
    role: "ASHA Community Health Worker, Mirzapur, UP",
    avatar: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=150"
  },
  {
    quote: "I consult with Asha in my native Hindi, log my blood glucose levels, and share my health pass at the town clinic without carrying heaps of old prescriptions.",
    author: "Vikas Rawat",
    role: "Farmer / Vaidya Beta User, Uttarakhand",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
  }
];

export default function RedesignedLandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useHealthStore();
  const userId = user?.id || "VAI-8830-492";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/asha?q=${encodeURIComponent(searchQuery)}`);
  };

  // Pulse/Heartbeat line animation variables
  const pulsePath = "M 0 50 L 50 50 L 70 50 L 80 20 L 95 85 L 110 50 L 120 50 L 140 50 L 150 20 L 165 85 L 180 50 L 250 50 L 300 50";

  return (
    <div className="flex flex-col gap-24 pb-20 overflow-x-hidden text-foreground selection:bg-emerald-500/35 selection:text-white select-none">
      
      {/* 1. HERO SECTION (Series A startup style + Localized Bharat Branding) */}
      <section className="relative pt-12 md:pt-20 pb-8 flex flex-col items-center justify-center text-center">
        {/* Glow Gradients */}
        <div className="absolute top-[-10%] left-[10%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-[20%] right-[10%] w-[350px] h-[350px] bg-[#6366f1]/10 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Grid Background decoration */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="z-10 flex flex-col items-center max-w-4xl px-4"
        >
          {/* ABDM Announcement Tag */}
          <Link href="/admin" className="group mb-5">
            <div className="inline-flex items-center gap-2 bg-[#0d121f] border border-white/5 group-hover:border-primary/30 px-3 py-1.5 rounded-full text-xs font-semibold text-muted-foreground transition-all">
              <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase">ABDM Sync</span>
              <span className="flex items-center gap-1 group-hover:text-foreground transition-colors">
                Announcing Ayushman Bharat (ABHA) Integration & v2 Field Modules
                <ArrowRight className="h-3 w-3 text-primary group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </Link>
          
          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] bg-gradient-to-b from-foreground via-foreground/95 to-muted-foreground bg-clip-text text-transparent pb-2">
            The Healthcare OS <br />
            <span className="bg-gradient-to-r from-emerald-400 via-primary to-cyan-400 bg-clip-text text-transparent">For Bharat.</span>
          </h1>
          
          <p className="text-muted-foreground text-sm sm:text-lg mt-6 max-w-2xl leading-relaxed">
            AI-driven primary care diagnostics, local language voice triaging, and zero-knowledge health vaults. Built to democratize clinical safety across 1.4 billion lives.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link href="/symptom-checker">
              <Button variant="glow" size="lg" className="rounded-xl font-bold flex items-center gap-1.5 shadow-emerald-500/25">
                Launch Health Console
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={`/health-card/${userId}`}>
              <Button variant="outline" size="lg" className="rounded-xl font-bold border-white/10 text-white hover:bg-white/5 flex items-center gap-1.5">
                <Code className="h-4 w-4 text-primary" />
                Inspect ABHA ID Pass
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Perplexity Search box */}
        <motion.form 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          onSubmit={handleSearchSubmit}
          className="w-full max-w-2xl mt-12 px-4 z-10"
        >
          <div className="glass-panel bg-card/60 rounded-2xl border border-white/5 p-2 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/30 shadow-2xl flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground ml-3 shrink-0" />
            <input
              type="text"
              placeholder="Ask anything in your language: 'क्या मुझे गर्म पानी पीना चाहिए?'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-0 text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/60 h-11"
            />
            <Button type="submit" size="sm" variant="default" className="rounded-xl px-4 font-bold shrink-0">
              Query Asha
              <Sparkles className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </div>
        </motion.form>
      </section>

      {/* 2. HOLOGRAPHIC ANIMATED CLINICAL ILLUSTRATION (Apple Health Style Vitals + Activity Rings) */}
      <section className="relative px-4 flex flex-col items-center">
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-4xl p-6 md:p-8 glass-panel bg-[#0b101c]/70 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle light lines */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.06)_0%,transparent_50%)] pointer-events-none" />

          {/* Console Header Bar */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500/80 animate-ping" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-primary flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-primary" />
                Live Vitals Pipeline • Vaidya.Sync
              </span>
            </div>
            <div className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-white/10" />
              <span className="h-2 w-2 rounded-full bg-white/10" />
              <span className="h-2 w-2 rounded-full bg-white/10" />
            </div>
          </div>

          {/* Interactive dashboard visualizer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* Heartbeat ECG path */}
            <div className="md:col-span-2 flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-[#090d16] border border-white/5 relative h-36 flex items-center overflow-hidden">
                {/* Scrolling Grid Lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:10px_100%] pointer-events-none" />
                
                <span className="absolute left-3 top-3 text-[9px] font-bold text-muted-foreground uppercase">Electrocardiogram (ECG) Baseline</span>
                
                {/* ECG Wavepath */}
                <svg className="w-full h-24 stroke-emerald-400 stroke-[2] fill-none" viewBox="0 0 300 100">
                  <motion.path 
                    d={pulsePath}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                  />
                </svg>

                <div className="absolute right-4 bottom-3 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-mono font-bold text-emerald-400">72 BPM</span>
                </div>
              </div>

              {/* Status statistics row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[9px] text-muted-foreground font-bold uppercase block">SpO2 (Oxygenation)</span>
                  <div className="flex justify-between items-baseline mt-1">
                    <span className="text-xl font-extrabold text-white">98%</span>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[8px] font-bold">Normal</Badge>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[9px] text-muted-foreground font-bold uppercase block">Blood Pressure (BP)</span>
                  <div className="flex justify-between items-baseline mt-1">
                    <span className="text-xl font-extrabold text-white">122/82</span>
                    <span className="text-[9px] font-mono text-muted-foreground">mmHg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Apple Health interactive rings */}
            <div className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/5 rounded-xl h-full relative">
              <span className="absolute left-3 top-3 text-[9px] font-bold text-muted-foreground uppercase">ASHA Target Sync</span>
              
              <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Ring 1 (Daily Patients Screened - green) */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="50" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
                  <motion.circle 
                    cx="64" cy="64" r="50" fill="transparent" stroke="#10b981" strokeWidth="8" 
                    strokeDasharray="314"
                    initial={{ strokeDashoffset: 314 }}
                    animate={{ strokeDashoffset: 314 * 0.15 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                
                {/* Ring 2 (Vaccinations Checked - Rose) */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90 scale-90 origin-center">
                  <circle cx="64" cy="64" r="50" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="9" />
                  <motion.circle 
                    cx="64" cy="64" r="50" fill="transparent" stroke="#f43f5e" strokeWidth="9" 
                    strokeDasharray="314"
                    initial={{ strokeDashoffset: 314 }}
                    animate={{ strokeDashoffset: 314 * 0.3 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                  />
                </svg>

                {/* Ring 3 (Locker Uploads - Blue) */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90 scale-75 origin-center">
                  <circle cx="64" cy="64" r="50" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="10" />
                  <motion.circle 
                    cx="64" cy="64" r="50" fill="transparent" stroke="#3b82f6" strokeWidth="10" 
                    strokeDasharray="314"
                    initial={{ strokeDashoffset: 314 }}
                    animate={{ strokeDashoffset: 314 * 0.45 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                  />
                </svg>

                <div className="text-center z-10 flex flex-col items-center">
                  <Activity className="h-5 w-5 text-primary animate-pulse" />
                  <span className="text-[10px] text-white font-bold mt-1">Bharat.Sync</span>
                </div>
              </div>

              <div className="flex gap-2.5 mt-4 text-[9px] font-semibold text-muted-foreground">
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Triage</span>
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" />Vaccines</span>
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" />Uploads</span>
              </div>
            </div>

          </div>
        </motion.div>
      </section>

      {/* 3. BENTO GRID FEATURE CARDS (Linear/Stripe Aesthetic + Bharat Core Features) */}
      <section className="max-w-6xl mx-auto px-4 flex flex-col gap-10">
        <div className="flex flex-col gap-2 max-w-xl">
          <span className="text-xs uppercase font-bold text-primary tracking-widest block">Unified Architecture</span>
          <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight">Built for Bharat's unique scale.</h2>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mt-2">Every feature is optimized for vernacular availability, low internet latency, and national health ID compliance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Vernacular Symptom Triage (Large) */}
          <Card className="md:col-span-2 bg-[#0b101c]/80 border-white/5 group hover:border-emerald-500/25 transition-all duration-300">
            <Link href="/symptom-checker" className="h-full flex flex-col justify-between p-6 md:p-8">
              <div className="flex flex-col gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                  <Volume2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white flex items-center gap-1 group-hover:text-primary transition-colors">
                      Vernacular AI Triage
                    </h3>
                    <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 text-[8px]">12+ Languages</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-md">
                    Connect and speak in Hindi, Bengali, Tamil, Telugu, and more. Our local-first AI system analyses symptoms and maps them to primary healthcare protocols with transparent diagnostic recommendations.
                  </p>
                </div>
              </div>

              {/* Dynamic UI visualizer */}
              <div className="mt-8 border border-white/5 bg-[#090d16] rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden">
                <div className="absolute right-0 top-0 p-4 opacity-10 pointer-events-none">
                  <Activity className="h-24 w-24 text-emerald-400" />
                </div>
                <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Globe2 className="h-3 w-3 text-emerald-400" /> Hindi Voice Output</span>
                  <Badge variant="outline" className="text-[8px] uppercase tracking-wider py-0 font-bold border-white/10 text-muted-foreground">Triaged</Badge>
                </div>
                <h4 className="text-xs font-bold text-white mt-1">वायरल बुखार (Mild Viral Fever)</h4>
                <p className="text-[10px] text-muted-foreground">Estimated Match: 94% • Low Severity • Paracetamol Recommended</p>
              </div>
            </Link>
          </Card>

          {/* Card 2: ABHA Health ID Passport */}
          <Card className="bg-[#0b101c]/80 border-white/5 group hover:border-primary/25 transition-all duration-300">
            <Link href={`/health-card/${userId}`} className="h-full flex flex-col justify-between p-6 md:p-8">
              <div className="flex flex-col gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-1 group-hover:text-primary transition-colors">
                    ABHA Health Pass
                    <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Link your Ayushman Bharat Digital Health Account. Generates an Apple Wallet style health pass containing critical clinical allergies, blood type, and emergency QR contacts.
                  </p>
                </div>
              </div>

              <div className="mt-8 p-3 rounded-xl bg-[#090d16] border border-white/5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground block">ABDM CARD STATUS</span>
                  <span className="font-mono text-primary font-bold">{userId}</span>
                </div>
                <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
              </div>
            </Link>
          </Card>

          {/* Card 3: Encrypted ZK Locker */}
          <Card className="bg-[#0b101c]/80 border-white/5 group hover:border-cyan-500/25 transition-all duration-300">
            <Link href="/health-locker" className="h-full flex flex-col justify-between p-6 md:p-8">
              <div className="flex flex-col gap-4">
                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                  <FolderLock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-1 group-hover:text-primary transition-colors">
                    Zero-Knowledge Locker
                    <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Store prescriptions, maternity books, and lab report PDFs securely. Sovereign patient keypairs prevent unauthorized data accesses, keeping files private.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                  <Lock className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-white font-bold block truncate">mirzapur_health_camp.pdf</span>
                  <span className="text-[8px] text-muted-foreground font-mono">ZKP Key Protected</span>
                </div>
              </div>
            </Link>
          </Card>

          {/* Card 4: ASHA Field Worker Node (Large) */}
          <Card className="md:col-span-2 bg-[#0b101c]/80 border-white/5 group hover:border-indigo-500/25 transition-all duration-300">
            <Link href="/asha" className="h-full flex flex-col justify-between p-6 md:p-8">
              <div className="flex flex-col gap-4">
                <div className="h-10 w-10 rounded-xl bg-[#6366f1]/10 border border-[#6366f1]/25 flex items-center justify-center text-[#818cf8] group-hover:scale-105 transition-transform">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white flex items-center gap-1 group-hover:text-primary transition-colors">
                      ASHA Community Field Node
                    </h3>
                    <Badge className="bg-[#6366f1]/20 text-[#818cf8] border-[#6366f1]/20 text-[8px]">Offline-First Sync</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-md">
                    Tailored offline-first interface for ASHA community health workers. Operates locally in remote regions with low cellular signals, autosynching registered diagnostics when network is connected.
                  </p>
                </div>
              </div>

              <div className="mt-8 border border-white/5 bg-[#090d16] rounded-xl p-4 flex flex-col gap-2 text-xs">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <RefreshCw className="h-3 w-3 text-indigo-400 animate-spin" />
                    <span className="text-[9px] uppercase font-bold text-muted-foreground">ASHA Lite Sync Queue</span>
                  </div>
                  <span className="text-[9px] text-[#818cf8] font-bold">8 records ready to sync</span>
                </div>
                <p className="text-white font-medium italic mt-1">"Immunization tracker and maternal vital logs cached locally for Village Mirzapur Sector 4."</p>
              </div>
            </Link>
          </Card>

        </div>
      </section>

      {/* 4. HOW IT WORKS (Notion & Linear Stepper) */}
      <section className="max-w-5xl mx-auto px-4 flex flex-col gap-12">
        <div className="text-center flex flex-col items-center max-w-xl mx-auto">
          <span className="text-xs uppercase font-bold text-primary tracking-widest block">System Flow</span>
          <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight mt-1">Unified Health Protocol</h2>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mt-2">Connecting patients, ASHA worker networks, and clinical facilities under one secure layer.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative select-none">
          
          {/* Step 1 */}
          <div className="flex flex-col gap-4 relative">
            <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 text-primary flex items-center justify-center font-bold text-xs">01</div>
            <div>
              <h3 className="text-sm font-bold text-white">Issue ABDM Health Pass</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Connect your Indian national health registry ABHA ID to establish your localized clinical passport, synced directly with local device storage keychains.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col gap-4 relative">
            <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 text-primary flex items-center justify-center font-bold text-xs">02</div>
            <div>
              <h3 className="text-sm font-bold text-white">Consult Vernacular Triage</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Speak or check symptoms in local Indian dialects. Asha translates diagnostic data and pulls references to global medical standards automatically.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col gap-4 relative">
            <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 text-primary flex items-center justify-center font-bold text-xs">03</div>
            <div>
              <h3 className="text-sm font-bold text-white">Delegate Vault Access Keys</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Empower ASHA field workers and local clinics to review diagnostic histories securely using time-bound cryptographic locker decryption keys.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 5. STATS SECTION (Series A Metrics) */}
      <section className="relative py-12 border-y border-white/5 bg-[#0b101c]/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(16,185,129,0.02)_0%,transparent_60%)] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          
          <div className="flex flex-col gap-1">
            <span className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">1.4B+</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-1">Lives Coverage Target</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-3xl md:text-5xl font-extrabold text-primary tracking-tight">99.4%</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-1">Vernacular Triaging</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">12+</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-1">Indian Languages Supported</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-3xl md:text-5xl font-extrabold text-cyan-400 tracking-tight">0 ms</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-1">Local Queue Sync Latency</span>
          </div>

        </div>
      </section>

      {/* 6. TESTIMONIALS (Glassmorphic Slider/Grid) */}
      <section className="max-w-6xl mx-auto px-4 flex flex-col gap-12">
        <div className="text-center flex flex-col items-center max-w-xl mx-auto">
          <span className="text-xs uppercase font-bold text-primary tracking-widest block">Testimonials</span>
          <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight mt-1">Trusted Across Bharat</h2>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mt-2">What doctors, patient communities, and ASHA health partners say about Vaidya.ai.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <Card key={idx} className="bg-[#0b101c]/80 border-white/5 flex flex-col justify-between p-6 md:p-8 hover:border-white/10 transition-all duration-300">
              <p className="text-xs text-foreground/80 leading-relaxed italic">"{t.quote}"</p>
              
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-white/5">
                <div className="relative h-9 w-9 rounded-full overflow-hidden bg-neutral-800 shrink-0">
                  <img src={t.avatar} alt={t.author} className="object-cover h-full w-full" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">{t.author}</h4>
                  <span className="text-[9px] text-muted-foreground font-semibold block mt-0.5">{t.role}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 7. HIGH-IMPACT CALL-TO-ACTION (Stripe/Linear style) */}
      <section className="max-w-5xl mx-auto px-4 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="p-8 md:p-12 rounded-3xl bg-gradient-to-tr from-[#0b101c] via-[#101726] to-[#0e1628] border border-primary/25 shadow-2xl relative overflow-hidden flex flex-col items-center text-center gap-6"
        >
          {/* Subtle light bubble */}
          <div className="absolute bottom-[-50%] right-[-10%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-xs font-semibold text-primary">
            <HeartHandshake className="h-3.5 w-3.5" />
            Empower Bharat's Health Ecosystem
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-2xl">
            Experience the future of healthcare.
          </h2>
          
          <p className="text-xs md:text-sm text-muted-foreground max-w-md leading-relaxed">
            Configure your ABHA Health Passport, query symptoms in your local language, and secure your files inside encrypted lockers.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-2">
            <Link href="/asha">
              <Button variant="glow" size="lg" className="rounded-xl font-bold flex items-center gap-1.5">
                Launch Asha AI Worker
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/doctors">
              <Button variant="outline" size="lg" className="rounded-xl font-bold border-white/10 text-white hover:bg-white/5">
                Browse Specialists
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
