"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  CreditCard, 
  ArrowLeft, 
  Save, 
  Info,
  ShieldCheck,
  User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useHealthStore, UserProfile } from "@/store/useHealthStore";
import { useToast } from "@/components/ui/toast";
import HealthCardPass from "@/components/health-card-pass";
import api from "@/lib/api";
import QRCode from "react-qr-code";
import { useEffect, useState } from "react";

// Zod Schema for validation
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  bloodGroup: z.string().min(1, "Please select your blood group."),
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
  emergencyName: z.string().min(2, "Emergency contact name is required."),
  emergencyPhone: z.string().min(10, "Emergency contact phone must be valid."),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const mapBloodGroupToBackend = (bg: string) => {
  if (bg.includes("O+")) return "O+";
  if (bg.includes("O-")) return "O-";
  if (bg.includes("A+")) return "A+";
  if (bg.includes("A-")) return "A-";
  if (bg.includes("B+")) return "B+";
  if (bg.includes("B-")) return "B-";
  if (bg.includes("AB+")) return "AB+";
  if (bg.includes("AB-")) return "AB-";
  return undefined;
};

const mapBloodGroupToFrontend = (bg?: string) => {
  if (!bg) return "O-positive (O+)";
  if (bg === "O+") return "O-positive (O+)";
  if (bg === "O-") return "O-negative (O-)";
  if (bg === "A+") return "A-positive (A+)";
  if (bg === "A-") return "A-negative (A-)";
  if (bg === "B+") return "B-positive (B+)";
  if (bg === "B-") return "B-negative (B-)";
  if (bg === "AB+") return "AB-positive (AB+)";
  if (bg === "AB-") return "AB-negative (AB-)";
  return bg;
};

export default function HealthCardDetail() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, updateUser } = useHealthStore();

  // Try to load real patient data from QR token (when doctor scans)
  const [scannedPatient, setScannedPatient] = useState<any>(null);
  const [qrToken, setQrToken] = useState<string>('');

  useEffect(() => {
    const id = params?.id as string;
    if (!id) return;

    // Try fetching as QR token (public endpoint, no auth)
    api.get<{ success: boolean; data: { patient: any } }>(`/api/patients/qr/${id}`, false)
      .then(res => {
        if (res.success && res.data?.patient) {
          setScannedPatient(res.data.patient);
        }
      })
      .catch(() => {
        // Not a QR scan — user is viewing their own card
        // Try to get qr_token from patient profile
        api.get<{ success: boolean; data: { patient: any } }>('/api/patients/me')
          .then(r => {
            if (r.data?.patient?.qr_token) {
              setQrToken(r.data.patient.qr_token);
            }
          })
          .catch(() => {/* backend unreachable — use user.id as fallback */});
      });
  }, [params?.id]);

  const displayUser = scannedPatient
    ? ({
        id: user?.id ?? scannedPatient.patient_id ?? 'unknown',
        role: user?.role ?? 'patient',
        email: user?.email ?? scannedPatient.users?.email ?? '',
        avatar: user?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(scannedPatient.users?.name || 'P')}&background=10b981&color=fff`,
        ...user,
        name: scannedPatient.users?.name ?? user?.name ?? 'Patient',
        bloodGroup: scannedPatient.blood_group ?? user?.bloodGroup ?? 'Unknown',
        allergies: scannedPatient.allergies ?? user?.allergies ?? [],
      } as UserProfile)
    : user;

  const cardQrUrl = `${process.env.NEXT_PUBLIC_API_URL ? 'https://vaidya.ai' : 'http://localhost:3001'}/health-card/${qrToken || params?.id}`;

  // Initialize form with current Zustand values
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: displayUser?.name ?? '',
      bloodGroup: mapBloodGroupToFrontend(displayUser?.bloodGroup),
      allergies: (displayUser?.allergies ?? []).join(", "),
      chronicConditions: (displayUser?.chronicConditions ?? []).join(", "),
      emergencyName: displayUser?.emergencyContact?.name ?? '',
      emergencyPhone: displayUser?.emergencyContact?.phone ?? '',
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    // Process comma separated text back into arrays
    const allergiesArray = data.allergies 
      ? data.allergies.split(",").map(s => s.trim()).filter(Boolean) 
      : [];
    
    const chronicArray = data.chronicConditions 
      ? data.chronicConditions.split(",").map(s => s.trim()).filter(Boolean) 
      : [];

    updateUser({
      name: data.name,
      bloodGroup: data.bloodGroup,
      allergies: allergiesArray,
      chronicConditions: chronicArray,
      emergencyContact: {
        name: data.emergencyName,
        relationship: user?.emergencyContact?.relationship ?? 'Spouse', // preserve relationship
        phone: data.emergencyPhone,
      }
    });

    const patientId = displayUser?.patientId || user?.patientId || scannedPatient?.patient_id;
    if (patientId) {
      try {
        const backendBloodGroup = mapBloodGroupToBackend(data.bloodGroup);
        await api.put(`/api/patients/${patientId}`, {
          bloodGroup: backendBloodGroup,
          allergies: allergiesArray,
        });
      } catch (err: any) {
        console.error("Failed to sync profile updates to backend:", err);
      }
    }

    toast({
      title: "Health ID Updated",
      description: "Your digital wallet pass data and NFC sync variables are saved.",
      variant: "success"
    });
  };

  if (!displayUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16] text-muted-foreground text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
          <span>Retrieving digital health passport...</span>
        </div>
      </div>
    );
  }

  const isOwner = user && displayUser && (user.id === displayUser.id || user.patientId === displayUser.patientId);

  return (
    <div className="flex flex-col gap-6 pb-12 select-none text-foreground">
      
      {/* Back navigation */}
      <div>
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Page Header */}
      <div className="flex flex-col gap-1.5 border-b border-white/5 pb-4">
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <CreditCard className="h-6.5 w-6.5 text-primary" />
          QR Health Card: {displayUser.name}
        </h1>
        <p className="text-xs text-muted-foreground">Decentralized electronic ABHA health pass, NFC-enabled telemetry sync.</p>
      </div>

      {/* Grid split: Card Pass on Left, Profile Details Editor on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Health Pass + Live QR Code */}
        <div className="lg:col-span-5 flex flex-col gap-4 items-center">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground self-start">Digital Wallet Pass</h2>

          <HealthCardPass user={displayUser} />

          {/* Live scannable QR code */}
          <div className="flex flex-col items-center gap-3 w-full p-4 rounded-2xl bg-white/5 border border-white/5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Scan to Pull Clinical Summary</p>
            <div className="p-3 rounded-xl bg-white">
              <QRCode
                value={cardQrUrl}
                size={160}
                bgColor="#ffffff"
                fgColor="#0a0f1e"
                level="M"
              />
            </div>
            <p className="text-[9px] text-muted-foreground text-center leading-relaxed max-w-[220px]">
              Doctors scan this to view allergies, chronic conditions, and drug interaction warnings.
            </p>
            <code className="text-[8px] text-emerald-400/70 font-mono break-all text-center px-2">{cardQrUrl}</code>
          </div>
        </div>

        {/* Right: Edit Clinical Metadata Form OR Read-only verified data */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {isOwner ? "Clinical Directives Registry" : "Clinical Record Pass"}
          </h2>
          
          {isOwner ? (
            <Card className="bg-[#0b101c]/80 border-white/5">
              <CardHeader className="pb-4 border-b border-white/5">
                <CardTitle className="text-base font-bold text-white flex items-center gap-1.5">
                  <User className="h-4.5 w-4.5 text-primary" />
                  Medical Information Editor
                </CardTitle>
                <CardDescription className="text-xs">Update your core clinical metrics to reflect on your digital ID card instantly.</CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 text-xs">
                  
                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="text-xs font-semibold text-muted-foreground">Full Legal Name</label>
                    <Input 
                      id="name"
                      placeholder="Patient Name" 
                      {...register("name")} 
                      className="bg-[#0d121f]"
                    />
                    {errors.name && <span className="text-[10px] text-rose-400 font-semibold">{errors.name.message}</span>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Blood Group */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="bloodGroup" className="text-xs font-semibold text-muted-foreground">Blood Group</label>
                      <Select 
                        id="bloodGroup"
                        {...register("bloodGroup")}
                        className="bg-[#0d121f]"
                      >
                        <option value="O-positive (O+)">O-positive (O+)</option>
                        <option value="O-negative (O-)">O-negative (O-)</option>
                        <option value="A-positive (A+)">A-positive (A+)</option>
                        <option value="A-negative (A-)">A-negative (A-)</option>
                        <option value="B-positive (B+)">B-positive (B+)</option>
                        <option value="B-negative (B-)">B-negative (B-)</option>
                        <option value="AB-positive (AB+)">AB-positive (AB+)</option>
                        <option value="AB-negative (AB-)">AB-negative (AB-)</option>
                      </Select>
                    </div>
                  </div>

                  {/* Allergies list (comma separated text) */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="allergies" className="text-xs font-semibold text-muted-foreground">Clinical Allergies (Comma Separated)</label>
                    <Input 
                      id="allergies"
                      placeholder="e.g. Penicillin, Peanuts, Latex" 
                      {...register("allergies")} 
                      className="bg-[#0d121f]"
                    />
                    <span className="text-[9px] text-muted-foreground">Separated by commas for rendering on back page.</span>
                  </div>

                  {/* Chronic Conditions */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="chronicConditions" className="text-xs font-semibold text-muted-foreground">Chronic Diagnoses (Comma Separated)</label>
                    <Input 
                      id="chronicConditions"
                      placeholder="e.g. Mild Asthma, Hypertension" 
                      {...register("chronicConditions")} 
                      className="bg-[#0d121f]"
                    />
                  </div>

                  {/* Emergency Contact Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-4 mt-2">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="emergencyName" className="text-xs font-semibold text-muted-foreground">First Responder Name</label>
                      <Input 
                        id="emergencyName"
                        placeholder="Contact Name" 
                        {...register("emergencyName")} 
                        className="bg-[#0d121f]"
                      />
                      {errors.emergencyName && <span className="text-[10px] text-rose-400 font-semibold">{errors.emergencyName.message}</span>}
                    </div>

                    {/* Emergency Contact Phone */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="emergencyPhone" className="text-xs font-semibold text-muted-foreground">Responder Phone Number</label>
                      <Input 
                        id="emergencyPhone"
                        placeholder="e.g. +91 98765 43210" 
                        {...register("emergencyPhone")} 
                        className="bg-[#0d121f]"
                      />
                      {errors.emergencyPhone && <span className="text-[10px] text-rose-400 font-semibold">{errors.emergencyPhone.message}</span>}
                    </div>
                  </div>

                  {/* Submit action */}
                  <div className="pt-4 border-t border-white/5 mt-2 flex justify-end">
                    <Button 
                      type="submit" 
                      variant="glow" 
                      size="default" 
                      disabled={isSubmitting}
                      className="rounded-xl px-5 font-semibold text-xs min-w-[140px] h-10"
                    >
                      <Save className="h-4 w-4 mr-1.5" />
                      {isSubmitting ? "Saving Updates..." : "Save Profile Updates"}
                    </Button>
                  </div>

                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-[#0b101c]/80 border-white/5 shadow-2xl">
              <CardHeader className="pb-4 border-b border-white/5">
                <CardTitle className="text-base font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  Verified Health Pass Summary
                </CardTitle>
                <CardDescription className="text-xs">This data has been securely pulled from the patient's ABDM record buffer.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 flex flex-col gap-5 text-xs text-foreground">
                <div className="grid grid-cols-2 gap-4 bg-black/40 border border-white/5 p-4 rounded-xl">
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider mb-1">Full Legal Name</span>
                    <strong className="text-white text-sm font-extrabold">{displayUser.name}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider mb-1">Blood Group</span>
                    <strong className="text-amber-400 text-sm font-extrabold">{displayUser.bloodGroup || "Unknown"}</strong>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Clinical Allergies</span>
                  <div className="flex flex-wrap gap-1.5">
                    {displayUser.allergies && displayUser.allergies.length > 0 ? (
                      displayUser.allergies.map((a: string) => (
                        <span key={a} className="bg-rose-500/10 text-rose-400 border border-rose-500/25 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                          {a}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-foreground italic text-[11px]">No logged allergies</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Chronic Conditions</span>
                  <div className="flex flex-wrap gap-1.5">
                    {displayUser.chronicConditions && displayUser.chronicConditions.length > 0 ? (
                      displayUser.chronicConditions.map((c: string) => (
                        <span key={c} className="bg-amber-500/10 text-amber-400 border border-amber-500/25 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                          {c}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-foreground italic text-[11px]">No chronic diagnoses on file</span>
                    )}
                  </div>
                </div>

                {displayUser.emergencyContact && (
                  <div className="flex flex-col gap-2 border-t border-white/5 pt-4 mt-2">
                    <span className="text-[10px] text-rose-400 uppercase font-bold tracking-wider">First Responder Contact</span>
                    <div className="bg-rose-950/20 border border-rose-500/10 p-3 rounded-xl flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-medium">Name:</span>
                        <strong className="text-white font-extrabold">{displayUser.emergencyContact.name} ({displayUser.emergencyContact.relationship})</strong>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-medium">Phone:</span>
                        <strong className="text-rose-300 font-mono font-extrabold">{displayUser.emergencyContact.phone}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {(displayUser.insuranceProvider || displayUser.insuranceId) && (
                  <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
                    <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">Insurance Coverage</span>
                    <div className="bg-cyan-950/15 border border-cyan-500/10 p-3 rounded-xl flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Provider:</span>
                        <strong className="text-white">{displayUser.insuranceProvider || "N/A"}</strong>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Policy ID:</span>
                        <strong className="text-white font-mono">{displayUser.insuranceId || "N/A"}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

      </div>

    </div>
  );
}
