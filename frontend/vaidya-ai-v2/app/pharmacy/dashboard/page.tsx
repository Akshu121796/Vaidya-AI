"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Pill, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  Search, 
  Edit3, 
  RefreshCw, 
  Package, 
  DollarSign,
  ChevronRight,
  TrendingDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useHealthStore } from "@/store/useHealthStore";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Mock Medicine Inventory
const INITIAL_INVENTORY = [
  { id: "med-1", name: "Metformin 500mg", category: "Anti-Diabetic", qty: 450, price: 120, available: true, requests: 120 },
  { id: "med-2", name: "Amoxicillin 500mg", category: "Antibiotic", qty: 12, price: 290, available: true, requests: 290 },
  { id: "med-3", name: "Atorvastatin 10mg", category: "Statin", qty: 88, price: 180, available: true, requests: 180 },
  { id: "med-4", name: "Paracetamol 650mg", category: "Analgesic", qty: 0, price: 40, available: false, requests: 420 },
  { id: "med-5", name: "Calpol 120 Syrup", category: "Pediatric Analgesic", qty: 8, price: 65, available: true, requests: 95 }
];

// Mock Demand Forecast telemetry data
const DEMAND_FORECAST = [
  { month: "Jan", paracetamol: 320, amoxicillin: 210, metformin: 110 },
  { month: "Feb", paracetamol: 380, amoxicillin: 240, metformin: 115 },
  { month: "Mar", paracetamol: 400, amoxicillin: 260, metformin: 120 },
  { month: "Apr", paracetamol: 420, amoxicillin: 290, metformin: 120 },
  { month: "May", paracetamol: 490, amoxicillin: 310, metformin: 125 },
  { month: "Jun", paracetamol: 540, amoxicillin: 330, metformin: 130 }
];

const PHARMACY_TRANSLATIONS = {
  English: {
    welcome: "Welcome",
    pageDesc: "Active Stock Ledger for",
    descTail: "• Control medicine stocks and configure retail tariffs.",
    totalMeds: "Total Medicines registered",
    itemsLabel: "Items",
    activeInventoryList: "Active inventory list",
    lowStockWarnings: "Low Stock Warnings",
    requiresReorder: "Requires reorder soon",
    outOfStockWarnings: "Out of Stock Warnings",
    unavailableForPatients: "Unavailable for patients",
    mostRequested: "Most Requested Agent",
    highDemand: "High demand this week",
    overviewTab: "Overview",
    inventoryTab: "Inventory",
    alertsTab: "Alerts",
    forecastsTab: "Forecasts",
    criticalInventoryWarnings: "Critical Inventory Warnings",
    viewAllAlerts: "View All Alerts",
    categoryLabel: "Category",
    outOfStockBadge: "Out of Stock",
    lowStockBadge: "Low: {qty} units",
    restockBtn: "Restock (+100)",
    liveTelemedLog: "Live Telemedicine Requests Log",
    activeSearchQuery: "Active medicine search query:",
    alternativesAvailable: "A regional doctor requested generic alternatives. Alternatives available:",
    demandTelemetry: "Demand Telemetry Forecast",
    monthlyUsage: "Monthly Usage Analytics",
    requestTrends: "Request trends across winter / summer seasons.",
    filterPlaceholder: "Filter inventory by name or category...",
    medName: "Medicine Name",
    qtyUnits: "Quantity (Units)",
    priceInr: "Price (INR)",
    status: "Status",
    actions: "Actions",
    available: "Available",
    toggleActive: "Toggle Active",
    refillAlertRegister: "Stock Refill Alert Register",
    orderRestock: "Order Restock",
    seasonalDemand: "Seasonal Demand Anomaly Forecasting",
    projectedRequirements: "Projected requirement curves based on past regional epidemics logs."
  },
  Hindi: {
    welcome: "स्वागत है",
    pageDesc: "सक्रिय स्टॉक लेजर - ",
    descTail: "• दवा के स्टॉक को नियंत्रित करें और खुदरा दरों को कॉन्फ़िगर करें।",
    totalMeds: "कुल पंजीकृत दवाएं",
    itemsLabel: "आइटम",
    activeInventoryList: "सक्रिय इन्वेंटरी सूची",
    lowStockWarnings: "कम स्टॉक चेतावनी",
    requiresReorder: "जल्द ही पुन: व्यवस्थित करने की आवश्यकता है",
    outOfStockWarnings: "स्टॉक समाप्त चेतावनी",
    unavailableForPatients: "रोगियों के लिए अनुपलब्ध",
    mostRequested: "सर्वाधिक अनुरोधित दवा",
    highDemand: "इस सप्ताह उच्च मांग",
    overviewTab: "अवलोकन",
    inventoryTab: "इन्वेंटरी",
    alertsTab: "अलर्ट",
    forecastsTab: "पूर्वानुमान",
    criticalInventoryWarnings: "महत्वपूर्ण इन्वेंटरी चेतावनी",
    viewAllAlerts: "सभी अलर्ट देखें",
    categoryLabel: "श्रेणी",
    outOfStockBadge: "स्टॉक में नहीं है",
    lowStockBadge: "कम: {qty} इकाइयां",
    restockBtn: "स्टॉक भरें (+100)",
    liveTelemedLog: "लाइव टेलीमेडिसिन अनुरोध लॉग",
    activeSearchQuery: "सक्रिय दवा खोज क्वेरी:",
    alternativesAvailable: "एक क्षेत्रीय चिकित्सक ने जेनेरिक विकल्पों का अनुरोध किया। उपलब्ध विकल्प:",
    demandTelemetry: "मांग टेलीमेट्री पूर्वानुमान",
    monthlyUsage: "मासिक उपयोग विश्लेषण",
    requestTrends: "सर्दियों/गर्मियों के मौसम में मांग के रुझान।",
    filterPlaceholder: "नाम या श्रेणी द्वारा इन्वेंटरी छानें...",
    medName: "दवा का नाम",
    qtyUnits: "मात्रा (इकाई)",
    priceInr: "कीमत (INR)",
    status: "स्थिति",
    actions: "कार्रवाई",
    available: "उपलब्ध",
    toggleActive: "सक्रिय/निष्क्रिय करें",
    refillAlertRegister: "स्टॉक रिफिल अलर्ट रजिस्टर",
    orderRestock: "स्टॉक भरने का ऑर्डर",
    seasonalDemand: "मौसमी मांग विसंगति पूर्वानुमान",
    projectedRequirements: "पिछले क्षेत्रीय महामारी लॉग के आधार पर अनुमानित आवश्यकताएं।"
  },
  Marathi: {
    welcome: "स्वागत आहे",
    pageDesc: "सक्रिय स्टॉक लेजर - ",
    descTail: "• औषध साठा नियंत्रित करा आणि किरकोळ दर ठरवा.",
    totalMeds: "एकूण नोंदणीकृत औषधे",
    itemsLabel: "आयटम",
    activeInventoryList: "सक्रिय इन्व्हेंटरी यादी",
    lowStockWarnings: "कमी स्टॉक चेतावणी",
    requiresReorder: "लवकरच पुन्हा ऑर्डर करणे आवश्यक आहे",
    outOfStockWarnings: "स्टॉक संपल्याची चेतावणी",
    unavailableForPatients: "रुग्णांसाठी अनुपलब्ध",
    mostRequested: "सर्वाधिक विनंती केलेले औषध",
    highDemand: "या आठवड्यात जास्त मागणी",
    overviewTab: "आढावा",
    inventoryTab: "इन्व्हेंटरी",
    alertsTab: "अलर्ट",
    forecastsTab: "पूर्वानुमान",
    criticalInventoryWarnings: "महत्त्वपूर्ण इन्व्हेंटरी चेतावणी",
    viewAllAlerts: "सर्व अलर्ट पहा",
    categoryLabel: "वर्ग",
    outOfStockBadge: "स्टॉकमध्ये नाही",
    lowStockBadge: "कमी: {qty} युनिट्स",
    restockBtn: "साठा भरा (+100)",
    liveTelemedLog: "लाइव्ह टेलिमेडिसिन विनंत्या लॉग",
    activeSearchQuery: "सक्रिय औषध शोध क्वेरी:",
    alternativesAvailable: "प्रादेशिक डॉक्टरांनी जेनेरिक पर्यायांची विनंती केली. उपलब्ध पर्याय:",
    demandTelemetry: "मागणीचे अंदाज",
    monthlyUsage: "मासिक वापर विश्लेषण",
    requestTrends: "हिवाळा/उन्हाळा ऋतूंमधील मागणीचे ट्रेंड.",
    filterPlaceholder: "नाव किंवा श्रेणीनुसार इन्व्हेंटरी फिल्टर करा...",
    medName: "औषधाचे नाव",
    qtyUnits: "प्रमाण (युनिट्स)",
    priceInr: "किंमत (INR)",
    status: "स्थिती",
    actions: "कृती",
    available: "उपलब्ध",
    toggleActive: "सक्रिय/निष्क्रिय करा",
    refillAlertRegister: "स्टॉक रिफिल अलर्ट रजिस्टर",
    orderRestock: "स्टॉक मागवा",
    seasonalDemand: "हंगामी मागणी अंदाज",
    projectedRequirements: "मागील प्रादेशिक महामारी लॉगवर आधारित अंदाजित मागणी."
  }
};

export default function PharmacistDashboard() {
  const searchParams = useSearchParams();
  const activeTabParam = searchParams.get("tab");
  const { toast } = useToast();
  const { user, language } = useHealthStore();

  const activeLang = (language === "Hindi" || language === "Marathi") ? language : "English";
  const t = PHARMACY_TRANSLATIONS[activeLang] as Record<string, string>;

  const [activeTab, setActiveTab] = useState("overview");
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [searchTerm, setSearchTerm] = useState("");

  // Keep tab state synchronized with query params
  useEffect(() => {
    if (activeTabParam) {
      setActiveTab(activeTabParam);
    } else {
      setActiveTab("overview");
    }
  }, [activeTabParam]);

  // Derived stats
  const totalMeds = inventory.length;
  const lowStockCount = inventory.filter(m => m.qty > 0 && m.qty < 20).length;
  const outOfStockCount = inventory.filter(m => m.qty === 0).length;
  const mostRequested = [...inventory].sort((a, b) => b.requests - a.requests)[0]?.name || "N/A";

  // Actions
  const handleUpdateQty = (id: string, newQty: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const available = newQty > 0;
        return { ...item, qty: newQty, available };
      }
      return item;
    }));
    toast({
      title: "Quantity Updated",
      description: "Stock ledger refreshed successfully.",
      variant: "default"
    });
  };

  const handleUpdatePrice = (id: string, newPrice: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, price: newPrice };
      }
      return item;
    }));
    toast({
      title: "Price Updated",
      description: "Medicine retail tariff modified.",
      variant: "default"
    });
  };

  const handleToggleAvailable = (id: string) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const newAvailable = !item.available;
        const newQty = newAvailable ? (item.qty === 0 ? 10 : item.qty) : 0;
        return { ...item, available: newAvailable, qty: newQty };
      }
      return item;
    }));
    toast({
      title: "Availability Modified",
      description: "Consultation status for this inventory item changed.",
      variant: "default"
    });
  };

  // Filtered inventory list
  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 pb-16 select-none text-foreground">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Pill className="h-6.5 w-6.5 text-primary" />
            {t.welcome}, {user?.name || "Pharmacist"} 👋
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">{t.pageDesc} {user?.name || "Pharmacist"} {t.descTail}</p>
        </div>
      </div>

      {/* Overview stats cards */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-panel glass-panel-hover rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
              <CardTitle className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">{t.totalMeds}</CardTitle>
              <Package className="h-4.5 w-4.5 text-primary" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl font-extrabold text-white">{totalMeds} {t.itemsLabel}</div>
              <p className="text-[9px] text-muted-foreground mt-1">{t.activeInventoryList}</p>
            </CardContent>
          </Card>

          <Card className="glass-panel glass-panel-hover rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
              <CardTitle className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">{t.lowStockWarnings}</CardTitle>
              <AlertTriangle className="h-4.5 w-4.5 text-amber-400" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl font-extrabold text-white">{lowStockCount} {t.itemsLabel}</div>
              <p className="text-[9px] text-amber-400 font-bold mt-1">{t.requiresReorder}</p>
            </CardContent>
          </Card>

          <Card className="glass-panel glass-panel-hover rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
              <CardTitle className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">{t.outOfStockWarnings}</CardTitle>
              <TrendingDown className="h-4.5 w-4.5 text-rose-400" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl font-extrabold text-white">{outOfStockCount} {t.itemsLabel}</div>
              <p className="text-[9px] text-rose-400 font-bold mt-1">{t.unavailableForPatients}</p>
            </CardContent>
          </Card>

          <Card className="glass-panel glass-panel-hover rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
              <CardTitle className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">{t.mostRequested}</CardTitle>
              <TrendingUp className="h-4.5 w-4.5 text-cyan-400" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-lg font-extrabold text-white truncate">{mostRequested}</div>
              <p className="text-[9px] text-muted-foreground mt-1">{t.highDemand}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab select list */}
      <div className="flex gap-2 border-b border-white/5 pb-2">
        {["overview", "inventory", "alerts", "forecasts"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
              activeTab === tab 
                ? "bg-primary/20 text-primary border border-primary/30" 
                : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
            }`}
          >
            {tab === "overview" ? t.overviewTab : tab === "inventory" ? t.inventoryTab : tab === "alerts" ? t.alertsTab : t.forecastsTab}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="min-h-[400px]">
        
        {/* Tab: Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left side: low stock logs */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t.criticalInventoryWarnings}</h3>
                  <button onClick={() => setActiveTab("alerts")} className="text-xs font-bold text-primary hover:underline">{t.viewAllAlerts}</button>
                </div>

                <div className="flex flex-col gap-2.5">
                  {inventory.filter(item => item.qty < 20).map((item) => (
                    <div 
                      key={item.id}
                      className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                        item.qty === 0 
                          ? "bg-rose-500/10 border-rose-500/20 text-rose-300" 
                          : "bg-amber-500/10 border-amber-500/20 text-amber-300"
                      }`}
                    >
                      <div className="text-xs">
                        <h4 className="font-extrabold text-white">{item.name}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{t.categoryLabel}: {item.category}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={item.qty === 0 ? "destructive" : "warning"} className="text-[8px] font-extrabold uppercase py-0.5">
                          {item.qty === 0 ? t.outOfStockBadge : t.lowStockBadge.replace("{qty}", String(item.qty))}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUpdateQty(item.id, 100)}
                          className="border-white/10 hover:bg-white/5 text-[10px] h-7 rounded-lg font-bold"
                        >
                          {t.restockBtn}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medicine search requests queue */}
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t.liveTelemedLog}</h3>
                <div className="p-4 rounded-xl border border-white/5 bg-[#0b101c]/30 text-xs text-muted-foreground leading-normal">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span>{t.activeSearchQuery} <strong>'Metformin 500mg'</strong></span>
                    <Badge variant="outline" className="text-[8px]">10 min ago</Badge>
                  </div>
                  <p className="mt-2 text-[10px]">{t.alternativesAvailable} Glycomet, Obimet.</p>
                </div>
              </div>

            </div>

            {/* Right side: quick demand graph preview */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t.demandTelemetry}</h3>
              <Card className="glass-panel border-white/5 bg-[#0b101c]/55 p-4 rounded-xl h-[330px] flex flex-col justify-between">
                <div>
                  <CardTitle className="text-xs uppercase font-extrabold text-white">{t.monthlyUsage}</CardTitle>
                  <CardDescription className="text-[10px]">{t.requestTrends}</CardDescription>
                </div>

                <div className="h-[220px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={DEMAND_FORECAST}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#0b101c", border: "1px solid rgba(255,255,255,0.1)" }} />
                      <Bar dataKey="paracetamol" fill="#10b981" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="amoxicillin" fill="#06b6d4" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

          </div>
        )}

        {/* Tab: Inventory Grid */}
        {activeTab === "inventory" && (
          <div className="flex flex-col gap-4">
            
            {/* Search and control row */}
            <div className="flex justify-between items-center p-3 rounded-xl border border-white/5 bg-black/40">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t.filterPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 bg-black/20 border-white/5 focus:border-primary/50 text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Inventory table */}
            <div className="rounded-xl border border-white/5 bg-black/40 overflow-hidden">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5 text-[10px] uppercase font-bold text-muted-foreground">
                      <th className="p-3.5">{t.medName}</th>
                      <th className="p-3.5">{t.categoryLabel}</th>
                      <th className="p-3.5">{t.qtyUnits}</th>
                      <th className="p-3.5">{t.priceInr}</th>
                      <th className="p-3.5">{t.status}</th>
                      <th className="p-3.5">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {filteredInventory.map((item) => (
                      <tr key={item.id} className="hover:bg-white/5 transition-all">
                        <td className="p-3.5 font-bold text-white">{item.name}</td>
                        <td className="p-3.5 text-muted-foreground">{item.category}</td>
                        
                        {/* Qty edit input */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            <Input
                              type="number"
                              defaultValue={item.qty}
                              onBlur={(e) => handleUpdateQty(item.id, parseInt(e.target.value) || 0)}
                              className="w-16 h-7 text-xs bg-black/20 border-white/10 text-center rounded-md"
                            />
                            <span className="text-[10px] text-muted-foreground">pcs</span>
                          </div>
                        </td>

                        {/* Price edit input */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-muted-foreground">₹</span>
                            <Input
                              type="number"
                              defaultValue={item.price}
                              onBlur={(e) => handleUpdatePrice(item.id, parseInt(e.target.value) || 0)}
                              className="w-16 h-7 text-xs bg-black/20 border-white/10 text-center rounded-md"
                            />
                          </div>
                        </td>

                        <td className="p-3.5">
                          {item.available ? (
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[8px] uppercase">{t.available}</Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[8px] uppercase">{t.outOfStockBadge}</Badge>
                          )}
                        </td>

                        <td className="p-3.5">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleToggleAvailable(item.id)}
                            className="text-[9px] h-7 px-2.5 rounded-lg border-white/10"
                          >
                            {t.toggleActive}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* Tab: Alerts list */}
        {activeTab === "alerts" && (
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t.refillAlertRegister}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inventory.filter(item => item.qty < 20).map((item) => (
                <Card key={item.id} className="glass-panel border-white/5 bg-[#0b101c]/45 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.name}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{t.categoryLabel}: {item.category}</p>
                    <p className="text-[10px] text-rose-400 font-bold mt-1">
                      {activeLang === "English" ? `Current Stock: ${item.qty} units` : activeLang === "Hindi" ? `वर्तमान स्टॉक: ${item.qty} इकाइयां` : `चालू स्टॉक: ${item.qty} युनिट्स`}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleUpdateQty(item.id, 200)}
                    className="bg-primary hover:bg-emerald-600 rounded-lg text-xs font-bold px-3 py-1.5"
                  >
                    {t.orderRestock}
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Forecasts */}
        {activeTab === "forecasts" && (
          <div className="grid grid-cols-1 gap-6">
            <Card className="glass-panel border-white/5 bg-[#0b101c]/55 p-6 rounded-xl">
              <div>
                <CardTitle className="text-xs uppercase font-extrabold text-white">{t.seasonalDemand}</CardTitle>
                <CardDescription className="text-[10px] mt-1">{t.projectedRequirements}</CardDescription>
              </div>

              <div className="h-[300px] w-full mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={DEMAND_FORECAST}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#0b101c", border: "1px solid rgba(255,255,255,0.1)" }} />
                    <Legend />
                    <Line type="monotone" dataKey="paracetamol" stroke="#10b981" strokeWidth={2} name="Paracetamol (Analgesic)" />
                    <Line type="monotone" dataKey="amoxicillin" stroke="#06b6d4" strokeWidth={2} name="Amoxicillin (Antibiotic)" />
                    <Line type="monotone" dataKey="metformin" stroke="#f59e0b" strokeWidth={2} name="Metformin (Anti-Diabetic)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

      </div>

    </div>
  );
}
