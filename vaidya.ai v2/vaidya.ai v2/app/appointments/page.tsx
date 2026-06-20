"use client";

import React, { useState } from "react";
import { 
  Calendar, 
  Clock, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  Activity, 
  History,
  Send,
  ExternalLink,
  MessageSquare,
  Smartphone,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useHealthStore } from "@/store/useHealthStore";
import { useToast } from "@/components/ui/toast";

export default function AppointmentsPage() {
  const { appointments, cancelAppointment, rescheduleAppointment, user, fetchAppointments } = useHealthStore();
  const { toast } = useToast();

  const [activeAptId, setActiveAptId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlot, setRescheduleSlot] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  React.useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Groupings
  const upcomingApts = appointments.filter(
    (apt) => apt.status === "Confirmed"
  );
  
  const historyApts = appointments.filter(
    (apt) => apt.status === "Completed" || apt.status === "Cancelled"
  );

  // Active appointment for Telegram preview
  const primaryApt = upcomingApts[0] || {
    doctorName: "Dr. Alok Sharma",
    specialty: "Cardiologist",
    date: "2026-06-20",
    time: "11:30 AM",
    reason: "Lipid profile follow-up & cardiac health evaluation."
  };

  const handleCancel = (id: string, doctorName: string) => {
    cancelAppointment(id);
    toast({
      title: "Appointment Cancelled",
      description: `Your consultation with ${doctorName} has been cancelled successfully.`,
      variant: "destructive"
    });
  };

  const handleOpenReschedule = (id: string, date: string, time: string) => {
    setActiveAptId(id);
    setRescheduleDate(date);
    setRescheduleSlot(time);
    setIsDialogOpen(true);
  };

  const handleConfirmReschedule = () => {
    if (!activeAptId) return;
    if (!rescheduleDate || !rescheduleSlot) {
      toast({
        title: "Selection Required",
        description: "Please specify both the rescheduled date and time slot.",
        variant: "destructive"
      });
      return;
    }

    rescheduleAppointment(activeAptId, rescheduleDate, rescheduleSlot);

    toast({
      title: "Rescheduled Successfully!",
      description: `Your consultation has been moved to ${rescheduleDate} at ${rescheduleSlot}.`,
      variant: "default"
    });

    setIsDialogOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 pb-12 select-none text-foreground">
      
      {/* Page Header */}
      <div className="flex flex-col gap-1.5 border-b border-white/5 pb-4">
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Calendar className="h-6.5 w-6.5 text-primary" />
          Appointments: {user?.name || "Patient"}
        </h1>
        <p className="text-xs text-muted-foreground">Manage active bookings, view clinical history, and reschedule consultations for {user?.name || "Patient"}.</p>
      </div>

      {/* Split Grid: Appointments (Col 2) & Telegram Preview (Col 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Appointments Tabs List */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="bg-[#0d121f] border-white/5 p-1 w-full max-w-[320px] rounded-xl">
              <TabsTrigger value="upcoming" className="flex items-center gap-1.5 flex-1 justify-center rounded-lg text-xs py-1.5">
                <Activity className="h-3.5 w-3.5" />
                Upcoming ({upcomingApts.length})
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-1.5 flex-1 justify-center rounded-lg text-xs py-1.5">
                <History className="h-3.5 w-3.5" />
                History ({historyApts.length})
              </TabsTrigger>
            </TabsList>

            {/* UPCOMING CONTENT */}
            <TabsContent value="upcoming" className="mt-4 outline-none">
              {upcomingApts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {upcomingApts.map((apt) => (
                    <Card key={apt.id} className="bg-card/45 border-white/5 flex flex-col justify-between hover:border-primary/25 transition-all duration-300">
                      <div>
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-sm font-extrabold text-white leading-tight">{apt.doctorName}</CardTitle>
                              <span className="text-[10px] text-primary font-semibold block mt-0.5">{apt.specialty}</span>
                            </div>
                            <Badge className="bg-primary/20 text-primary border-primary/20 text-[9px] font-bold uppercase tracking-wider py-0 px-2">
                              {apt.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pb-4">
                          {/* Booking Timings */}
                          <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-white/5 border border-white/5 text-[11px]">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[8px] text-muted-foreground font-bold uppercase">Scheduled Date</span>
                              <span className="font-semibold text-white/95">{apt.date}</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[8px] text-muted-foreground font-bold uppercase">Consult Slot</span>
                              <span className="font-semibold text-white/95">{apt.time}</span>
                            </div>
                          </div>

                          {/* Reason */}
                          <div className="mt-3">
                            <span className="text-[8px] text-muted-foreground font-bold uppercase block">Reason for visit</span>
                            <p className="text-[11px] text-foreground/85 mt-0.5 font-medium leading-relaxed">{apt.reason}</p>
                          </div>
                        </CardContent>
                      </div>

                      {/* Actions */}
                      <CardFooter className="flex gap-2 justify-end pt-3 pb-3 border-t border-white/5 bg-[#090d16]/30">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancel(apt.id, apt.doctorName)}
                          className="rounded-xl text-[10px] h-8 font-semibold text-rose-400 border-rose-500/10 hover:bg-rose-500/10 hover:border-rose-500/25 px-2.5"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenReschedule(apt.id, apt.date, apt.time)}
                          className="rounded-xl text-[10px] h-8 font-semibold px-2.5 flex gap-1 items-center"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Reschedule
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center bg-card/45 border-white/5">
                  <CardContent className="flex flex-col items-center justify-center py-6">
                    <Calendar className="h-10 w-10 text-muted-foreground opacity-55 mb-2" />
                    <h4 className="font-semibold text-xs text-white">No Upcoming Appointments</h4>
                    <p className="text-[11px] text-muted-foreground mt-1 max-w-sm">You do not have any consultations currently scheduled. Check doctors listings to book a specialist.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* HISTORY CONTENT */}
            <TabsContent value="history" className="mt-4 outline-none">
              {historyApts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {historyApts.map((apt) => (
                    <Card key={apt.id} className="bg-card/40 border-white/5 opacity-80 hover:opacity-100 transition-opacity">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-sm font-bold text-white">{apt.doctorName}</CardTitle>
                            <span className="text-[10px] text-muted-foreground block mt-0.5">{apt.specialty}</span>
                          </div>
                          <Badge 
                            variant={apt.status === "Cancelled" ? "destructive" : "secondary"}
                            className="text-[9px] font-bold uppercase tracking-wider py-0 px-2"
                          >
                            {apt.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3 text-xs text-muted-foreground">
                        <div className="flex justify-between p-2 rounded-lg bg-white/5 border border-white/5 text-[10px] mb-2 font-mono">
                          <span>Date: {apt.date}</span>
                          <span>Slot: {apt.time}</span>
                        </div>
                        <span className="text-[8px] uppercase font-bold text-neutral-400">Consultation Objective</span>
                        <p className="text-[10px] text-neutral-300 mt-0.5 italic">"{apt.reason}"</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center bg-card/45 border-white/5">
                  <CardContent className="flex flex-col items-center justify-center py-6">
                    <History className="h-10 w-10 text-muted-foreground opacity-55 mb-2" />
                    <h4 className="font-semibold text-xs text-white">No Consult History</h4>
                    <p className="text-[11px] text-muted-foreground mt-1 max-w-sm">No historical consultations or logs found for your clinical profile.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Telegram Notification Preview Column */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest block">Automated Dispatch Alerts</span>
          
          <Card className="bg-[#0b101c]/80 border-white/5 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            {/* Ambient background glow */}
            <div className="absolute top-[-50%] right-[-10%] w-48 h-48 bg-[#229ed9]/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* Telegram App Header Mock */}
            <div className="bg-[#17212b] px-4 py-3 border-b border-[#0f161e] flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Simulated blue Telegram logo */}
                <div className="h-7 w-7 rounded-full bg-[#229ed9] flex items-center justify-center text-white shrink-0">
                  <Send className="h-3.5 w-3.5 -rotate-45 -translate-x-0.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">Telegram Alerts</h4>
                  <span className="text-[8px] text-[#229ed9] font-bold block">Vaidya.ai Bot • Online</span>
                </div>
              </div>
              <Badge className="bg-[#229ed9]/10 border-[#229ed9]/20 text-[#229ed9] text-[8px] font-bold tracking-wider py-0 px-2">
                ACTIVE
              </Badge>
            </div>

            {/* Telegram Message Feed Body */}
            <CardContent className="p-4 bg-[#0e1621] space-y-4 min-h-[280px]">
              
              {/* Timestamp text */}
              <div className="text-center">
                <span className="bg-[#17212b]/80 text-[8px] font-bold text-neutral-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">Today</span>
              </div>

              {/* Bot chat bubble */}
              <div className="flex gap-2.5 items-start max-w-[90%]">
                <div className="h-7 w-7 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center text-primary text-[9px] font-bold shrink-0">
                  V
                </div>
                
                <div className="bg-[#182533] border border-[#243547] text-white rounded-2xl rounded-tl-none p-3.5 shadow-xl text-xs space-y-3 relative">
                  
                  {/* Title indicator */}
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <span>APPOINTMENT CONFIRMED</span>
                  </div>

                  {/* Message Details */}
                  <div className="space-y-1.5 font-medium text-[11px] text-neutral-200">
                    <p>Namaste **{user?.name || "Patient"}**, your consultation booking with Vaidya.ai clinical network is successfully locked in.</p>
                    
                    <div className="border-l-2 border-primary/50 pl-2 py-0.5 mt-2 space-y-1 bg-[#1c2e42]/30 rounded">
                      <p><span className="text-neutral-400 font-normal">Physician:</span> **{primaryApt.doctorName}**</p>
                      <p><span className="text-neutral-400 font-normal">Specialty:</span> {primaryApt.specialty}</p>
                      <p><span className="text-neutral-400 font-normal">Timings:</span> **{primaryApt.date}** at **{primaryApt.time}**</p>
                      <p><span className="text-neutral-400 font-normal">Objective:</span> *"{primaryApt.reason}"*</p>
                    </div>
                  </div>

                  {/* Simulated Telegram Inline Buttons */}
                  <div className="grid grid-cols-2 gap-1.5 pt-2">
                    <button className="bg-[#243547] hover:bg-[#2e4258] border border-[#2c3d52] rounded-lg py-1.5 text-[9px] font-bold text-[#229ed9] flex items-center justify-center gap-1 transition-all">
                      🗓️ Calendar Sync
                    </button>
                    <button className="bg-[#243547] hover:bg-[#2e4258] border border-[#2c3d52] rounded-lg py-1.5 text-[9px] font-bold text-[#229ed9] flex items-center justify-center gap-1 transition-all">
                      🏥 Location Map
                    </button>
                  </div>

                  {/* Message Time watermark */}
                  <span className="absolute bottom-1 right-2 text-[8px] text-neutral-400 font-mono">12:00 PM</span>

                </div>
              </div>

            </CardContent>

            {/* Telegram Footer info */}
            <CardFooter className="py-2.5 px-4 bg-[#17212b] border-t border-[#0f161e] flex justify-between items-center text-[9px] text-neutral-400">
              <span className="flex items-center gap-1 font-mono">
                <Smartphone className="h-3 w-3 text-neutral-400" />
                SMS / WhatsApp Synced
              </span>
              <span className="font-semibold text-white/70 flex items-center gap-0.5">
                Configure Bot <ChevronRight className="h-3 w-3" />
              </span>
            </CardFooter>
          </Card>
        </div>

      </div>

      {/* Reschedule Dialog Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-[#0a0e19] border-white/10 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              Reschedule Session
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Select a new date and time slot to move your booking.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2 text-xs">
            {/* New Date */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-muted-foreground">Select New Date</label>
              <Input 
                type="date" 
                value={rescheduleDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="bg-[#0b101c]"
              />
            </div>

            {/* New Slot */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-muted-foreground">Select New Slot</label>
              <Select
                value={rescheduleSlot}
                onChange={(e) => setRescheduleSlot(e.target.value)}
                className="bg-[#0b101c]"
              >
                <option value="" disabled>Choose a new time slot</option>
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:30 AM">10:30 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="02:30 PM">02:30 PM</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="05:30 PM">05:30 PM</option>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <DialogClose>
              <Button variant="outline" size="sm" className="rounded-xl text-[11px] h-9">Cancel</Button>
            </DialogClose>
            <Button 
              variant="default" 
              size="sm"
              onClick={handleConfirmReschedule}
              className="rounded-xl text-[11px] h-9 font-semibold"
            >
              Update Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
