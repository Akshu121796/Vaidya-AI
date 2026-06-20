"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  Activity, 
  Sparkles, 
  Search, 
  Calendar, 
  FolderLock, 
  Pill, 
  LayoutDashboard, 
  Heart,
  Bell,
  Users,
  AlertTriangle,
  FileText,
  UserCheck,
  TrendingUp,
  Database,
  Lock,
  ClipboardList,
  LogOut,
  PlusCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHealthStore } from "@/store/useHealthStore";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, role, logout } = useHealthStore();
  const router = useRouter();

  const isLoginPage = pathname?.startsWith("/login");
  if (isLoginPage) return null;

  const getNavItems = () => {
    switch (role) {
      case "doctor":
        return [
          { label: "Doctor Console", href: "/doctor/dashboard", icon: LayoutDashboard },
          { label: "Appointments", href: "/doctor/dashboard?tab=appointments", icon: Calendar },
          { label: "Patients Queue", href: "/doctor/dashboard?tab=queue", icon: Users },
          { label: "Prescriptions", href: "/doctor/dashboard?tab=prescriptions", icon: FileText },
          { label: "Availability", href: "/doctor/dashboard?tab=availability", icon: UserCheck }
        ];
      case "pharmacist":
        return [
          { label: "Pharmacy Hub", href: "/pharmacy/dashboard", icon: LayoutDashboard },
          { label: "Inventory", href: "/pharmacy/dashboard?tab=inventory", icon: Pill },
          { label: "Stock Alerts", href: "/pharmacy/dashboard?tab=alerts", icon: AlertTriangle },
          { label: "Forecasts", href: "/pharmacy/dashboard?tab=forecasts", icon: TrendingUp }
        ];
      case "asha":
        return [
          { label: "ASHA Home", href: "/asha/dashboard", icon: LayoutDashboard },
          { label: "Registration", href: "/asha/dashboard?tab=register", icon: PlusCircle },
          { label: "Offline Records", href: "/asha/dashboard?tab=records", icon: ClipboardList },
          { label: "Sync Center", href: "/asha/dashboard?tab=sync", icon: Database }
        ];
      case "admin":
        return [
          { label: "Admin Console", href: "/admin/dashboard", icon: LayoutDashboard },
          { label: "Analytics", href: "/admin/dashboard?tab=analytics", icon: TrendingUp },
          { label: "Outbreaks", href: "/admin/dashboard?tab=outbreaks", icon: AlertTriangle },
          { label: "Reports", href: "/admin/dashboard?tab=reports", icon: FileText },
          { label: "Users", href: "/admin/dashboard?tab=users", icon: Users }
        ];
      case "patient":
      default:
        return [
          { label: "Patient Hub", href: "/patient/dashboard", icon: LayoutDashboard },
          { label: "Symptom Checker", href: "/symptom-checker", icon: Activity },
          { label: "Appointments", href: "/appointments", icon: Calendar },
          { label: "Health Locker", href: "/health-locker", icon: FolderLock },
          { label: "Medicine Search", href: "/medicine-search", icon: Pill },
          { label: "Notifications", href: "/notifications", icon: Bell },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-card/25 border-r border-white/5 h-screen sticky top-0 shrink-0 p-6 justify-between select-none">
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 px-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Heart className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-lg leading-none tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">Vaidya.ai</span>
              <p className="text-[9px] text-muted-foreground font-semibold tracking-wider uppercase">{role} workspace</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (pathname + pathname.split("?")[1] === item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                    isActive 
                      ? "bg-primary/10 text-primary border-l-2 border-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <Icon className={cn(
                    "h-4 w-4 shrink-0 transition-transform",
                    isActive ? "text-primary" : "text-muted-foreground/80 group-hover:scale-105"
                  )} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card / Switch User */}
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => {
              logout();
              router.replace("/login");
            }}
            className="flex items-center justify-center gap-2 text-xs font-bold w-full border border-rose-500/10 bg-rose-500/5 hover:bg-rose-500/10 hover:border-rose-500/20 py-2.5 rounded-xl text-rose-400 transition-all shadow-sm cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Logout / Switch Role
          </button>

          <Link 
            href={`/health-card/${user?.id ?? ""}`}
            className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-[#0a0e19] hover:bg-[#121828] hover:border-white/10 transition-all select-none group"
          >
            <div className="relative h-9 w-9 rounded-full overflow-hidden bg-neutral-800 shrink-0">
              <img 
                src={user?.avatar ?? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"} 
                alt={user?.name ?? "User"} 
                className="object-cover h-full w-full" 
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-full" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-semibold truncate text-foreground group-hover:text-primary transition-colors">{user?.name ?? "Guest"}</h4>
              <p className="text-[10px] text-muted-foreground tracking-wider font-medium">{user?.id ?? "N/A"}</p>
            </div>
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar (Apple Health Aesthetic) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#090d16]/90 backdrop-blur-lg border-t border-white/5 z-40 flex items-center justify-around px-2 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-1.5 transition-all",
                isActive ? "text-primary scale-105" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span className="text-[9px] font-medium tracking-tight truncate max-w-[56px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
