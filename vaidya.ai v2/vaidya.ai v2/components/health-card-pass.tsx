"use client";

import React, { useState } from "react";
import QRCode from "react-qr-code";
import { 
  Heart, 
  Smartphone, 
  RotateCcw,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Globe,
  Award
} from "lucide-react";
import { UserProfile } from "@/store/useHealthStore";
import { Badge } from "@/components/ui/badge";

interface HealthCardPassProps {
  user: UserProfile;
}

export default function RebuiltHealthCardPass({ user }: HealthCardPassProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const cardQrValue = `vaidya://health-card/${user.id}?blood=${encodeURIComponent(user.bloodGroup || "")}&allergies=${(user.allergies || []).join(",")}`;

  return (
    <div className="flex flex-col items-center justify-center gap-4 text-foreground selection:bg-transparent">
      {/* 3D Smart Card Pass Container */}
      <div 
        className="w-[340px] h-[500px] cursor-pointer group [perspective:1000px]"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div 
          className="relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] select-none"
          style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* FRONT: DIGITAL GOVERNMENT SMART-CARD */}
          <div className="absolute inset-0 w-full h-full rounded-2xl p-5 bg-gradient-to-tr from-[#111726] via-[#090e18] to-[#121929] border-2 border-amber-500/30 shadow-2xl flex flex-col justify-between [backface-visibility:hidden] overflow-hidden">
            
            {/* Guilloche pattern security overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,#fff_0%,transparent_100%)] bg-[size:10px_10px]" />
            <div className="absolute top-[-30%] left-[-20%] w-[300px] h-[300px] bg-amber-500/[0.04] rounded-full blur-[100px] pointer-events-none" />

            {/* Smart-Card Header (Official Government Theme) */}
            <div className="border-b border-amber-500/20 pb-3 z-10 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="font-extrabold text-[10px] text-amber-400 tracking-wider">NATIONAL DIGITAL HEALTH AUTHORITY</span>
                <p className="text-[7px] text-white/80 font-bold uppercase tracking-widest mt-0.5">Ministry of Health & Clinical Core Services</p>
              </div>
              <ShieldCheck className="h-5 w-5 text-amber-400 shrink-0" />
            </div>

            {/* Smart Chip and NFC wave section */}
            <div className="flex justify-between items-center py-2 z-10">
              {/* Gold Smart Chip */}
              <div className="w-10 h-7 rounded bg-gradient-to-tr from-amber-200 via-amber-400 to-amber-300 border border-amber-600/40 relative overflow-hidden p-1 flex flex-col justify-between shadow-inner shrink-0">
                <div className="flex justify-between h-full w-full">
                  <span className="border-r border-amber-600/40 w-1/4 h-full" />
                  <span className="border-r border-amber-600/40 w-1/4 h-full" />
                  <span className="border-r border-amber-600/40 w-1/4 h-full" />
                </div>
                <div className="absolute inset-y-1/2 inset-x-0 border-t border-amber-600/40" />
              </div>

              {/* NFC Sign */}
              <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <span className="h-1 w-1 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[7px] text-emerald-400 font-bold uppercase tracking-wider">NFC Encrypted</span>
              </div>
            </div>

            {/* Patient Credentials & Photo Grid */}
            <div className="grid grid-cols-12 gap-3 items-center z-10">
              
              {/* Photo */}
              <div className="col-span-5 flex flex-col items-center">
                <div className="relative h-24 w-20 rounded-lg overflow-hidden border border-amber-500/25 bg-neutral-800 shrink-0 shadow-lg">
                  <img 
                    src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"} 
                    alt={user.name} 
                    className="object-cover h-full w-full" 
                  />
                  <div className="absolute inset-0 border border-inset border-white/5 rounded-lg" />
                </div>
                <span className="text-[7px] text-muted-foreground uppercase font-bold mt-1.5">Secure Capture</span>
              </div>

              {/* Basic Fields */}
              <div className="col-span-7 flex flex-col gap-2.5 pl-1 text-[10px]">
                <div>
                  <span className="text-[7px] text-muted-foreground uppercase font-bold block">Patient Name</span>
                  <span className="font-extrabold text-white tracking-wide truncate block">{user.name}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[7px] text-muted-foreground uppercase font-bold block">Blood Type</span>
                    <span className="font-extrabold text-amber-400">{(user.bloodGroup || "N/A").split(" ")[0]}</span>
                  </div>
                  <div>
                    <span className="text-[7px] text-muted-foreground uppercase font-bold block">Date of Birth</span>
                    <span className="font-extrabold text-white">{user.dob || "N/A"}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[7px] text-muted-foreground uppercase font-bold block">Unique Health Identifier</span>
                  <span className="font-mono font-extrabold text-emerald-400 tracking-wide text-xs">{user.id}</span>
                </div>
              </div>

            </div>

            {/* QR Scanner Node */}
            <div className="py-2.5 flex justify-center bg-white/5 border border-white/5 rounded-xl z-10 relative">
              <div className="absolute top-1 left-1 border-t border-l border-amber-500/40 w-2.5 h-2.5" />
              <div className="absolute top-1 right-1 border-t border-r border-amber-500/40 w-2.5 h-2.5" />
              <div className="absolute bottom-1 left-1 border-b border-l border-amber-500/40 w-2.5 h-2.5" />
              <div className="absolute bottom-1 right-1 border-b border-r border-amber-500/40 w-2.5 h-2.5" />
              
              <div className="bg-white p-2 rounded-lg w-fit shadow-md">
                <QRCode 
                  value={cardQrValue} 
                  size={100}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  fgColor="#090d16"
                />
              </div>
            </div>

            {/* Tap instruction */}
            <div className="text-center pt-2 border-t border-white/5 text-[8px] text-neutral-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 z-10">
              <RotateCcw className="h-3 w-3 text-amber-500" />
              Click card to view clinical alerts & emergency contact
            </div>
          </div>

          {/* BACK: MEDICAL DIRECTIVES BACK PAGE */}
          <div 
            className="absolute inset-0 w-full h-full rounded-2xl p-5 bg-gradient-to-tr from-[#160d11] via-[#090e18] to-[#1a0f14] border-2 border-rose-500/25 shadow-2xl flex flex-col justify-between [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-hidden"
          >
            <div className="absolute top-[-30%] left-[-20%] w-[300px] h-[300px] bg-rose-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

            {/* Back Header */}
            <div className="flex justify-between items-center z-10 border-b border-rose-500/20 pb-3">
              <div className="flex items-center gap-1.5 text-rose-400">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span className="text-[9px] uppercase tracking-wider font-extrabold">Clinical Alert Directives</span>
              </div>
              <span className="text-[7px] text-muted-foreground font-bold">PAGE 2 OF 2</span>
            </div>

            {/* Clinical fields */}
            <div className="flex flex-col gap-3 my-auto z-10 text-[10px]">
              
              {/* Drug Allergies */}
              <div>
                <span className="text-[7px] text-rose-300 font-bold uppercase tracking-wider block mb-1">Declared Drug Allergies</span>
                <div className="flex flex-wrap gap-1">
                  {(user.allergies || []).map((allergy) => (
                    <Badge key={allergy} variant="destructive" className="bg-rose-500/10 text-rose-300 border-rose-500/20 py-0.5 px-2 text-[8px]">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Chronic */}
              <div>
                <span className="text-[7px] text-amber-300 font-bold uppercase tracking-wider block mb-1">Active Diagnoses</span>
                <div className="flex flex-wrap gap-1">
                  {(user.chronicConditions || []).map((cond) => (
                    <Badge key={cond} variant="warning" className="bg-amber-500/10 text-amber-300 border-amber-500/20 py-0.5 px-2 text-[8px]">
                      {cond}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Responder contact */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[7px] text-muted-foreground font-bold uppercase block mb-0.5">Emergency Contact Responder</span>
                {user.emergencyContact ? (
                  <>
                    <h4 className="text-xs font-bold text-white leading-tight">{user.emergencyContact.name} ({user.emergencyContact.relationship})</h4>
                    <p className="text-[10px] font-mono font-bold text-rose-400 mt-1">{user.emergencyContact.phone}</p>
                  </>
                ) : (
                  <h4 className="text-xs font-bold text-muted-foreground leading-tight">None Listed</h4>
                )}
              </div>

              {/* Insurance details */}
              <div className="grid grid-cols-2 gap-2 text-[9px]">
                <div>
                  <span className="text-[7px] text-muted-foreground uppercase font-bold block">Insurance Policy</span>
                  <span className="text-white font-medium truncate block mt-0.5">{user.insuranceProvider || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[7px] text-muted-foreground uppercase font-bold block">Policy ID</span>
                  <span className="text-white font-mono truncate block mt-0.5">{user.insuranceId || "N/A"}</span>
                </div>
              </div>

            </div>

            {/* Bottom Barcode */}
            <div className="flex flex-col items-center gap-1.5 z-10 pt-2 border-t border-white/5">
              {/* Barcode representation */}
              <div className="w-full h-8 bg-neutral-900 border border-white/5 rounded p-1 flex justify-between items-center opacity-70">
                {Array.from({ length: 32 }).map((_, i) => (
                  <span 
                    key={i} 
                    className="h-full bg-white" 
                    style={{ 
                      width: i % 3 === 0 ? "3px" : i % 5 === 0 ? "1px" : "2px",
                      opacity: i % 4 === 0 ? 0.3 : 1
                    }} 
                  />
                ))}
              </div>
              
              <span className="text-[7px] text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <RotateCcw className="h-3 w-3 text-rose-500" />
                Tap card to return to front page
              </span>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
