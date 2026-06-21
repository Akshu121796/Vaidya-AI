"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowLeft, ArrowRight, ShieldAlert, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHealthStore } from "@/store/useHealthStore";
import { motion } from "framer-motion";

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginUserAsync, logout } = useHealthStore();
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!phoneOrEmail.trim() || !password.trim()) { setError("Please enter your phone/email and password."); return; }
    setLoading(true);
    const result = await loginUserAsync(phoneOrEmail.trim(), password);
    setLoading(false);
    if (result.ok) {
      const user = useHealthStore.getState().user;
      if (user?.role !== "admin") {
        setError("Unauthorized: This portal is strictly for administrators.");
        logout();
        return;
      }
      router.push("/admin/dashboard");
      return;
    }
    setError(result.error || "Invalid credentials. Please try again.");
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError("");
    const result = await loginUserAsync("admin@vaidya.ai", "admin123");
    setLoading(false);
    if (result.ok) {
      const user = useHealthStore.getState().user;
      if (user?.role !== "admin") {
        setError("Unauthorized: This portal is strictly for administrators.");
        logout();
        return;
      }
      router.push("/admin/dashboard");
    } else {
      setError(result.error || "Demo login failed to connect to database.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 relative overflow-hidden bg-[#04060b]">
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="w-full max-w-md flex flex-col gap-6 z-10">
        <Link href="/login" className="self-start text-xs font-semibold text-muted-foreground hover:text-white flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="h-4 w-4" />Back to role selector
        </Link>
        <div className="text-center flex flex-col items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-rose-400 to-red-500 flex items-center justify-center shadow-lg shadow-rose-500/20 mb-2">
            <ShieldAlert className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Admin Telemetry Hub</h2>
          <p className="text-xs text-muted-foreground">Sign in to audit epidemic anomalies and security gates.</p>
        </div>
        <motion.form onSubmit={handleLogin} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
          className="glass-panel bg-[#0c101d]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Phone Number or Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="text" placeholder="+91 98765 43210 or admin@vaidya.ai"
                value={phoneOrEmail} onChange={(e) => { setPhoneOrEmail(e.target.value); setError(""); }}
                className="pl-10 h-10 bg-black/40 border-white/5 focus:border-primary/50 text-xs rounded-xl" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">PassKey Code</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type={showPassword ? "text" : "password"} placeholder="••••••••"
                value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }}
                className="pl-10 pr-10 h-10 bg-black/40 border-white/5 focus:border-primary/50 text-xs rounded-xl" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {error && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span className="text-[10px] font-semibold">{error}</span>
            </motion.div>
          )}
          <Button type="submit" variant="default" disabled={loading} className="w-full h-10 rounded-xl font-bold mt-2 flex items-center justify-center gap-1.5">
            {loading ? "Verifying..." : "Authenticate Telemetry"}{!loading && <ArrowRight className="h-4 w-4" />}
          </Button>

          <div className="relative flex items-center justify-center my-1.5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
            <span className="relative bg-[#0c101d] px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">OR</span>
          </div>

          <Button 
            type="button" 
            onClick={handleDemoLogin}
            disabled={loading}
            variant="glow" 
            className="w-full h-10 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-rose-500/10"
          >
            Launch System Dashboard
          </Button>

          <p className="text-center text-[9px] text-muted-foreground/50 font-medium">Demo: admin@vaidya.ai / admin123</p>
        </motion.form>
      </div>
    </div>
  );
}
