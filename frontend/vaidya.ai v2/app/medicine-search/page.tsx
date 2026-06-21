"use client";

import React, { useState, lazy, Suspense } from "react";
import { 
  Search, 
  Pill, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  RotateCcw,
  Sparkles,
  Layers,
  FileWarning,
  MapPin,
  Store,
  Boxes,
  HeartHandshake,
  Map
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { MOCK_MEDICINES, Medicine } from "@/lib/mock-data";
import { useToast } from "@/components/ui/toast";
import dynamic from "next/dynamic";
import type { PharmacyLocation } from "@/components/pharmacy-map";
import api from "@/lib/api";
import { useEffect, useRef } from "react";
import { useHealthStore } from "@/store/useHealthStore";

// Dynamically import the map to avoid SSR / window issues in Next.js
const PharmacyMap = dynamic(() => import("@/components/pharmacy-map"), { ssr: false });

// Leaflet CSS — loaded globally at the layout level via a <link> tag or here via a style import workaround
// We inject it via a tiny helper effect below

// ── Pharmacy mock data with real Dehradun-area coordinates ──────────────────
const PHARMACY_STOCKS: Record<string, {
  pharmacy: string;
  distance: number;
  stock: string;
  price: number;
  type: "normal" | "low" | "out";
  lat: number;
  lng: number;
}[]> = {
  // ── Metformin 500mg ────────────────────────────────────────────────────
  "med-1": [
    { pharmacy: "Jeevan Rekha Chemist — Paltan Bazaar, Dehradun Sector 1",  distance: 1.2,  stock: "45 tablets",        price: 110, type: "normal", lat: 30.3220, lng: 78.0310 },
    { pharmacy: "Apollo Pharmacy — Rajpur Rd, Dehradun Sector 4",           distance: 2.8,  stock: "120 tablets",       price: 120, type: "normal", lat: 30.3510, lng: 78.0645 },
    { pharmacy: "MedPlus — Saharanpur Rd, Dehradun Sector 2",              distance: 4.1,  stock: "60 tablets",        price: 118, type: "normal", lat: 30.3012, lng: 78.0760 },
    { pharmacy: "Jan Aushadhi — Prem Nagar Sector 3",                      distance: 5.3,  stock: "200 tablets",       price: 35,  type: "normal", lat: 30.2950, lng: 78.0520 },
    { pharmacy: "Rishikesh Main Clinic — Rishikesh City Center",           distance: 18.5, stock: "80 tablets",        price: 105, type: "normal", lat: 30.1022, lng: 78.2676 },
    { pharmacy: "Haridwar Government Medical Hall — Haridwar",             distance: 52.0, stock: "Out of Stock",      price: 0,   type: "out",    lat: 29.9457, lng: 78.1642 },
    { pharmacy: "Mussoorie Hospital Pharmacy — Mussoorie Town",            distance: 34.0, stock: "Low Stock: 8 tabs", price: 130, type: "low",    lat: 30.4539, lng: 78.0643 },
    { pharmacy: "Doiwala PHC — Dehradun Rural Sector",                     distance: 9.8,  stock: "Out of Stock",      price: 0,   type: "out",    lat: 30.1880, lng: 78.1202 },
    { pharmacy: "Roorkee Junction Apollo — Roorkee City",                  distance: 65.0, stock: "250 tablets",       price: 115, type: "normal", lat: 29.8543, lng: 77.8880 },
    { pharmacy: "Saharanpur MedPlus Hub — Saharanpur City",                distance: 88.0, stock: "500 tablets",       price: 108, type: "normal", lat: 29.9640, lng: 77.5460 },
  ],
  // ── Amoxicillin 500mg ──────────────────────────────────────────────
  "med-2": [
    { pharmacy: "Doiwala PHC — Dehradun Rural Sector",                     distance: 1.5,  stock: "30 capsules",        price: 270, type: "normal", lat: 30.1880, lng: 78.1202 },
    { pharmacy: "Jeevan Rekha Chemist — Paltan Bazaar, Dehradun Sector 1",  distance: 2.8,  stock: "80 capsules",        price: 280, type: "normal", lat: 30.3220, lng: 78.0310 },
    { pharmacy: "Apollo Pharmacy — Rajpur Rd, Dehradun Sector 4",           distance: 4.2,  stock: "150 capsules",       price: 290, type: "normal", lat: 30.3510, lng: 78.0645 },
    { pharmacy: "MedPlus — Saharanpur Rd, Dehradun Sector 2",              distance: 6.8,  stock: "Low Stock: 4 caps",  price: 295, type: "low",    lat: 30.3012, lng: 78.0760 },
    { pharmacy: "Jan Aushadhi — Clement Town, Dehradun Sector 5",          distance: 7.5,  stock: "200 capsules",       price: 220, type: "normal", lat: 30.2700, lng: 78.0060 },
    { pharmacy: "Rishikesh Main Clinic — Rishikesh City Center",           distance: 18.5, stock: "Low Stock: 12 caps", price: 260, type: "low",    lat: 30.1022, lng: 78.2676 },
    { pharmacy: "Saharanpur MedPlus Hub — Saharanpur City",                distance: 88.0, stock: "300 capsules",       price: 265, type: "normal", lat: 29.9640, lng: 77.5460 },
    { pharmacy: "Roorkee Junction Apollo — Roorkee City",                  distance: 65.0, stock: "Out of Stock",       price: 0,   type: "out",    lat: 29.8543, lng: 77.8880 },
    { pharmacy: "Haridwar Government Medical Hall — Haridwar",             distance: 52.0, stock: "50 capsules",        price: 250, type: "normal", lat: 29.9457, lng: 78.1642 },
  ],
  // ── Atorvastatin 10mg ──────────────────────────────────────────────
  "med-3": [
    { pharmacy: "Apollo Pharmacy — Rajpur Rd, Dehradun Sector 4",           distance: 2.1,  stock: "90 tablets",        price: 180, type: "normal", lat: 30.3510, lng: 78.0645 },
    { pharmacy: "MedPlus — Saharanpur Rd, Dehradun Sector 2",              distance: 4.8,  stock: "60 tablets",        price: 185, type: "normal", lat: 30.3012, lng: 78.0760 },
    { pharmacy: "Jeevan Rekha Chemist — Paltan Bazaar, Dehradun Sector 1",  distance: 6.2,  stock: "Low Stock: 9 tabs", price: 175, type: "low",    lat: 30.3220, lng: 78.0310 },
    { pharmacy: "Doiwala PHC — Dehradun Rural Sector",                     distance: 8.4,  stock: "Out of Stock",      price: 0,   type: "out",    lat: 30.1880, lng: 78.1202 },
    { pharmacy: "Mussoorie Hospital Pharmacy — Mussoorie Town",            distance: 34.0, stock: "22 tablets",        price: 195, type: "normal", lat: 30.4539, lng: 78.0643 },
    { pharmacy: "Rishikesh Main Clinic — Rishikesh City Center",           distance: 18.5, stock: "45 tablets",        price: 178, type: "normal", lat: 30.1022, lng: 78.2676 },
    { pharmacy: "Jan Aushadhi — Clement Town, Dehradun Sector 5",          distance: 7.5,  stock: "100 tablets",       price: 120, type: "normal", lat: 30.2700, lng: 78.0060 },
    { pharmacy: "Haridwar Government Medical Hall — Haridwar",             distance: 52.0, stock: "Out of Stock",      price: 0,   type: "out",    lat: 29.9457, lng: 78.1642 },
    { pharmacy: "Saharanpur MedPlus Hub — Saharanpur City",                distance: 88.0, stock: "400 tablets",       price: 172, type: "normal", lat: 29.9640, lng: 77.5460 },
    { pharmacy: "Roorkee Junction Apollo — Roorkee City",                  distance: 65.0, stock: "Low Stock: 5 tabs", price: 188, type: "low",    lat: 29.8543, lng: 77.8880 },
  ],
  // ── Paracetamol 650mg ──────────────────────────────────────────────
  "med-4": [
    { pharmacy: "Jeevan Rekha Chemist — Paltan Bazaar, Dehradun Sector 1",  distance: 0.8,  stock: "200 tablets",  price: 35,  type: "normal", lat: 30.3220, lng: 78.0310 },
    { pharmacy: "Doiwala PHC — Dehradun Rural Sector",                     distance: 1.2,  stock: "350 tablets",  price: 30,  type: "normal", lat: 30.1880, lng: 78.1202 },
    { pharmacy: "Apollo Pharmacy — Rajpur Rd, Dehradun Sector 4",           distance: 3.1,  stock: "500 tablets",  price: 40,  type: "normal", lat: 30.3510, lng: 78.0645 },
    { pharmacy: "MedPlus — Saharanpur Rd, Dehradun Sector 2",              distance: 5.0,  stock: "400 tablets",  price: 38,  type: "normal", lat: 30.3012, lng: 78.0760 },
    { pharmacy: "Jan Aushadhi — Prem Nagar Sector 3",                      distance: 5.3,  stock: "600 tablets",  price: 18,  type: "normal", lat: 30.2950, lng: 78.0520 },
    { pharmacy: "Jan Aushadhi — Clement Town, Dehradun Sector 5",          distance: 7.5,  stock: "800 tablets",  price: 18,  type: "normal", lat: 30.2700, lng: 78.0060 },
    { pharmacy: "Rishikesh Main Clinic — Rishikesh City Center",           distance: 18.5, stock: "300 tablets",  price: 32,  type: "normal", lat: 30.1022, lng: 78.2676 },
    { pharmacy: "Mussoorie Hospital Pharmacy — Mussoorie Town",            distance: 34.0, stock: "100 tablets",  price: 45,  type: "normal", lat: 30.4539, lng: 78.0643 },
    { pharmacy: "Haridwar Government Medical Hall — Haridwar",             distance: 52.0, stock: "1000 tablets", price: 28,  type: "normal", lat: 29.9457, lng: 78.1642 },
    { pharmacy: "Roorkee Junction Apollo — Roorkee City",                  distance: 65.0, stock: "250 tablets",  price: 37,  type: "normal", lat: 29.8543, lng: 77.8880 },
    { pharmacy: "Saharanpur MedPlus Hub — Saharanpur City",                distance: 88.0, stock: "500 tablets",  price: 34,  type: "normal", lat: 29.9640, lng: 77.5460 },
  ],
};

// User's fixed location (Dehradun city centre)
const USER_LAT = 30.3165;
const USER_LNG = 78.0322;

const MEDICINE_TRANSLATIONS = {
  English: {
    pageTitle: "Medicine Index",
    pageDesc: "Search critical medicines, check stock levels, view local pharmacy distances on map, and verify drug compatibilities.",
    searchPlaceholder: "Search by name: 'Metformin', 'Paracetamol'...",
    searchLabel: "Clinical Inventory",
    genericAlternatives: "Suggested Generic Alternatives",
    nearbyPharmacies: "Nearby Pharmacy Availabilities",
    hideMap: "Hide Map",
    viewOnMap: "View on Map",
    mapLegend: "Map Legend",
    yourLocation: "Your Location",
    inStock: "In Stock",
    lowStock: "Low Stock",
    outOfStock: "Out of Stock",
    reserveMedication: "Reserve Medication",
    kmAway: "km away",
    rxRequired: "Rx Required",
    otcSafe: "OTC Safe",
    basePrice: "Base Price",
    therapeuticAction: "Therapeutic Action",
    clinicalUsages: "Clinical Usages",
    genericSubstitutes: "Lower-Cost Substitutes (Generic Alternatives)",
    standardDosage: "Standard Dosage Directives",
    interactionAnalyzer: "Drug Interaction Analyzer",
    selectToCompare: "Select medication to compare...",
    noMedsFound: "No matching medicines found.",
    selectMedPrompt: "Select a medication from the directory list on the left to review details.",
    brandSelectedTitle: "Brand Selected",
    brandSelectedDesc: "Generic alternative chosen: {alt}. Search index to view profiles.",
    conflictDesc: "Check if taking **{med}** along with another compound triggers clinical conflicts.",
    reserveTitle: "Medicine Reserved!",
    reserveDesc: "1 unit of {med} reserved at {pharmacy}. Ready for pick up."
  },
  Hindi: {
    pageTitle: "दवा सूची",
    pageDesc: "महत्वपूर्ण दवाओं की खोज करें, स्टॉक स्तर की जांच करें, नक्शे पर स्थानीय फार्मेसी दूरी देखें, और दवाओं की अनुकूलता सत्यापित करें।",
    searchPlaceholder: "नाम से खोजें: 'मेटफॉर्मिन', 'पैरासिटामोल'...",
    searchLabel: "नैदानिक ​​​​इन्वेंटरी",
    genericAlternatives: "सुझाए गए जेनेरिक विकल्प",
    nearbyPharmacies: "आस-पास के फार्मासियों में उपलब्धता",
    hideMap: "नक्शा छुपाएं",
    viewOnMap: "नक्शे पर देखें",
    mapLegend: "नक्शा संकेतक",
    yourLocation: "आपका स्थान",
    inStock: "स्टॉक में",
    lowStock: "कम स्टॉक",
    outOfStock: "स्टॉक में नहीं",
    reserveMedication: "दवा आरक्षित करें",
    kmAway: "किमी दूर",
    rxRequired: "परामर्श पर्ची आवश्यक",
    otcSafe: "सुरक्षित OTC",
    basePrice: "मूल्य",
    therapeuticAction: "चिकित्सीय कार्रवाई",
    clinicalUsages: "नैदानिक ​​​​उपयोग",
    genericSubstitutes: "कम लागत वाले विकल्प (जेनेरिक विकल्प)",
    standardDosage: "मानक खुराक निर्देश",
    interactionAnalyzer: "दवा पारस्परिक क्रिया विश्लेषक",
    selectToCompare: "तुलना करने के लिए दवा चुनें...",
    noMedsFound: "कोई मिलती-जुलती दवा नहीं मिली।",
    selectMedPrompt: "विवरण की समीक्षा करने के लिए बाईं ओर सूची से एक दवा चुनें।",
    brandSelectedTitle: "ब्रांड चुना गया",
    brandSelectedDesc: "जेनेरिक विकल्प चुना गया: {alt}। प्रोफाइल देखने के लिए खोजें।",
    conflictDesc: "जांचें कि क्या {med} को किसी अन्य दवा के साथ लेने से कोई प्रतिकूल प्रभाव पड़ता है।",
    reserveTitle: "दवा आरक्षित!",
    reserveDesc: "{pharmacy} पर {med} की 1 इकाई आरक्षित की गई है। पिकअप के लिए तैयार है।"
  },
  Marathi: {
    pageTitle: "औषध सूची",
    pageDesc: "महत्वपूर्ण औषधे शोधा, स्टॉक पातळी तपासा, नकाशावर स्थानिक फार्मसी अंतर पहा आणि औषध सुसंगतता सत्यापित करा.",
    searchPlaceholder: "नावाने शोधा: 'मेटफॉर्मिन', 'पॅरासिटामॉल'...",
    searchLabel: "वैद्यकीय यादी",
    genericAlternatives: "सुचविलेले जेनेरिक पर्याय",
    nearbyPharmacies: "जवळपासच्या फार्मसी उपलब्धता",
    hideMap: "नकाशा लपवा",
    viewOnMap: "नकाशावर पहा",
    mapLegend: "नकाशा सूची",
    yourLocation: "तुमचे स्थान",
    inStock: "स्टॉकमध्ये",
    lowStock: "कमी साठा",
    outOfStock: "स्टॉकमध्ये नाही",
    reserveMedication: "औषध आरक्षित करा",
    kmAway: "किमी दूर",
    rxRequired: "डॉक्टरांचे प्रिस्क्रिप्शन आवश्यक",
    otcSafe: "सुरक्षित OTC",
    basePrice: "किंमत",
    therapeuticAction: "वैद्यकीय कृती",
    clinicalUsages: "वैद्यकीय वापर",
    genericSubstitutes: "कमी किमतीचे पर्याय (जेनेरिक पर्याय)",
    standardDosage: "मानक डोस मार्गदर्शक तत्त्वे",
    interactionAnalyzer: "औषध परस्पर क्रिया विश्लेषक",
    selectToCompare: "तुलना करण्यासाठी औषध निवडा...",
    noMedsFound: "कोणतेही जुळणारे औषध आढळले नाही.",
    selectMedPrompt: "तपशील पाहण्यासाठी डावीकडील सूचीमधून औषध निवडा.",
    brandSelectedTitle: "ब्रँड निवडला",
    brandSelectedDesc: "जेनेरिक पर्याय निवडला: {alt}। प्रोफाइल पाहण्यासाठी शोधा।",
    conflictDesc: "तपासा की {med} ला इतर औषधांसोबत घेतल्यास काही दुष्परिणाम होतात का.",
    reserveTitle: "औषध आरक्षित!",
    reserveDesc: "{pharmacy} वर {med} चे 1 युनिट आरक्षित केले आहे. पिकअपसाठी तयार आहे."
  }
};

export default function MedicineSearch() {
  const { toast } = useToast();
  const { language } = useHealthStore();
  const activeLang = (language === "Hindi" || language === "Marathi") ? language : "English";
  const t = MEDICINE_TRANSLATIONS[activeLang] as Record<string, string>;
  
  const [searchQuery, setSearchQuery]     = useState("");
  const [activeMedicine, setActiveMedicine] = useState<Medicine | null>(MOCK_MEDICINES[0]);
  const [showMap, setShowMap]             = useState(false);
  const [focusLocation, setFocusLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [backendMeds, setBackendMeds]     = useState<Medicine[]>([]);
  const [isSearching, setIsSearching]     = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Interaction check state
  const [interactTargetId, setInteractTargetId] = useState("");
  const [interactionResult, setInteractionResult] = useState<any | null>(null);

  // Debounced search against real backend
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (!searchQuery.trim()) {
      setBackendMeds([]);
      return;
    }
    searchDebounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get<{ success: boolean; data: { medicines: any[] } }>(
          `/api/medicines/search?name=${encodeURIComponent(searchQuery)}`
        );
        if (res.success && res.data?.medicines?.length) {
          const mapped: Medicine[] = res.data.medicines.map((m: any) => ({
            id: m.medicine_id ?? m.id,
            name: m.name,
            genericName: m.generic_name ?? m.name,
            category: m.category ?? 'General',
            manufacturer: m.manufacturer ?? 'Generic',
            description: m.description ?? `${m.name} — available at local pharmacies.`,
            usedFor: m.indications ?? [],
            sideEffects: m.side_effects ?? [],
            price: m.price ?? 0,
            requiresPrescription: m.prescription_required ?? false,
            genericAvailable: !!m.generic_name,
            alternatives: [],
            usages: m.indications ?? [],
            interactions: [],
            dosage: 'As directed by physician.',
          }));
          setBackendMeds(mapped);
        } else {
          setBackendMeds([]);
        }
      } catch {
        setBackendMeds([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  }, [searchQuery]);

  // Merge: backend search results + MOCK_MEDICINES filtered locally
  const filteredMeds = [
    ...backendMeds,
    ...MOCK_MEDICINES.filter(med =>
      (med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       med.category.toLowerCase().includes(searchQuery.toLowerCase())) &&
      !backendMeds.some(b => b.id === med.id)
    )
  ];

  const handleSelectMedicine = (med: Medicine) => {
    setActiveMedicine(med);
    setInteractTargetId("");
    setInteractionResult(null);
    setShowMap(false); // reset map view on medicine change
    setFocusLocation(null);
  };

  const handleReserve = (pharmacy: string, medName: string) => {
    toast({
      title: t.reserveTitle,
      description: t.reserveDesc.replace("{med}", medName).replace("{pharmacy}", pharmacy),
      variant: "default"
    });
  };

  const handleCheckInteraction = (targetId: string) => {
    setInteractTargetId(targetId);
    if (!activeMedicine || !targetId) return;

    const targetMed = MOCK_MEDICINES.find(m => m.id === targetId);
    if (!targetMed) return;

    let result = {
      status: "Safe",
      severity: "None" as any,
      text: `No known clinical conflicts found between ${activeMedicine.name} and ${targetMed.name}. They are generally safe to co-administer, but consult your physician.`
    };

    if (
      (activeMedicine.id === "med-1" && targetMed.id === "med-4") || 
      (activeMedicine.id === "med-4" && targetMed.id === "med-1")
    ) {
      result = {
        status: "Caution",
        severity: "Mild",
        text: "Monitor blood glucose levels. Paracetamol is generally safe but chronic heavy use can alter metabolic variables."
      };
    } else if (
      (activeMedicine.id === "med-2" && targetMed.id === "med-3") || 
      (activeMedicine.id === "med-3" && targetMed.id === "med-2")
    ) {
      result = {
        status: "Caution",
        severity: "Moderate",
        text: "Co-administration is permissible. Monitor for gastrointestinal sensitivities and muscle fatigue."
      };
    } else if (
      (activeMedicine.id === "med-1" && targetMed.id === "med-3") || 
      (activeMedicine.id === "med-3" && targetMed.id === "med-1")
    ) {
      result = {
        status: "Compatible",
        severity: "None",
        text: "Highly compatible. This combination is commonly co-prescribed for patients managing Type-2 Diabetes alongside metabolic profiles."
      };
    }

    setInteractionResult(result);
  };

  // Build pharmacy location list for the map
  const activePharmacyLocations: PharmacyLocation[] =
    activeMedicine
      ? (PHARMACY_STOCKS[activeMedicine.id] ?? []).map((s) => ({
          name:     s.pharmacy,
          lat:      s.lat,
          lng:      s.lng,
          distance: s.distance,
          stock:    s.stock,
          price:    s.price,
          type:     s.type,
        }))
      : [];

  return (
      <div className="flex flex-col gap-6 pb-12 select-none text-foreground">
        
        {/* Page Header */}
        <div className="flex flex-col gap-1.5 border-b border-white/5 pb-4">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Pill className="h-6.5 w-6.5 text-primary" />
            {t.pageTitle}
          </h1>
          <p className="text-xs text-muted-foreground">{t.pageDesc}</p>
        </div>

        {/* Main split dashboard: List on Left, Detail & checker on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Side: Search list */}
          <div className="flex flex-col gap-4">
            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest block">{t.searchLabel}</span>
            
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-[#0d121f]"
              />
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
              {filteredMeds.length > 0 ? (
                filteredMeds.map((med) => (
                  <button
                    key={med.id}
                    onClick={() => handleSelectMedicine(med)}
                    className={`p-3.5 rounded-xl text-left border text-xs font-medium transition-all ${
                      activeMedicine?.id === med.id 
                        ? "bg-primary/10 border-primary text-primary" 
                        : "border-white/5 hover:border-white/10 bg-white/5 text-muted-foreground hover:text-white"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-white leading-none block">{med.name}</span>
                      <Badge variant="outline" className="text-[8px] py-0 border-white/10 font-bold uppercase text-muted-foreground tracking-wider">
                        {med.category}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5 truncate">{med.description}</p>
                  </button>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-6">{t.noMedsFound}</p>
              )}
            </div>
          </div>

          {/* Right Side: Detailed views & Interaction Checker */}
          {activeMedicine ? (
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Med Specifications Card */}
              <Card className="bg-[#0b101c]/80 border-white/5 shadow-xl">
                <CardHeader className="pb-3 border-b border-white/5">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <span className="text-[9px] text-primary font-bold uppercase tracking-wider block">{activeMedicine.manufacturer}</span>
                      <CardTitle className="text-base font-extrabold text-white mt-0.5">{activeMedicine.name}</CardTitle>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={activeMedicine.requiresPrescription ? "destructive" : "default"} className="text-[8px] font-bold uppercase px-2 py-0.5">
                        {activeMedicine.requiresPrescription ? t.rxRequired : t.otcSafe}
                      </Badge>
                      <span className="text-xs font-mono font-bold text-white bg-white/5 px-2 py-0.5 rounded border border-white/10">{t.basePrice}: ₹{activeMedicine.price}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 flex flex-col gap-4 text-xs">
                  {/* Description */}
                  <div>
                    <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{t.therapeuticAction}</h4>
                    <p className="text-foreground/90 leading-relaxed text-[11px]">{activeMedicine.description}</p>
                  </div>

                  {/* Usages list */}
                  <div>
                    <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{t.clinicalUsages}</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {activeMedicine.usages.map((use) => (
                        <Badge key={use} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold py-0.5 px-2.5">
                          {use}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Local Pharmacy Stock & Distance Grid + Map toggle */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Boxes className="h-3.5 w-3.5 text-primary" />
                        {t.nearbyPharmacies}
                      </h4>
                      {/* Map toggle button */}
                      <Button
                        size="sm"
                        variant={showMap ? "default" : "outline"}
                        onClick={() => setShowMap((v) => !v)}
                        className={`h-6 text-[9px] px-2.5 font-bold gap-1 rounded-lg transition-all ${
                          showMap
                            ? "bg-primary text-white"
                            : "border-white/10 text-muted-foreground hover:text-white hover:border-primary hover:bg-primary/10"
                        }`}
                      >
                        <Map className="h-3 w-3" />
                        {showMap ? t.hideMap : t.viewOnMap}
                      </Button>
                    </div>

                    {/* ── Leaflet Map ─────────────────────────────────────── */}
                    {showMap && (
                      <div className="mb-4 rounded-xl overflow-hidden border border-white/8 shadow-2xl">
                        {/* Legend */}
                        <div className="flex items-center gap-4 px-3 py-2 bg-[#090d16]/80 border-b border-white/5 flex-wrap">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{t.mapLegend}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block ring-2 ring-white/20" />
                            <span className="text-[9px] text-muted-foreground">{t.yourLocation}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                            <span className="text-[9px] text-muted-foreground">{t.inStock}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                            <span className="text-[9px] text-muted-foreground">{t.lowStock}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                            <span className="text-[9px] text-muted-foreground">{t.outOfStock}</span>
                          </div>
                        </div>

                        <Suspense fallback={<div className="h-[300px] w-full bg-black/20 animate-pulse" />}>
                          <PharmacyMap
                            pharmacies={activePharmacyLocations}
                            userLat={USER_LAT}
                            userLng={USER_LNG}
                            focusLocation={focusLocation}
                          />
                        </Suspense>
                      </div>
                    )}

                    {/* Pharmacy cards grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {PHARMACY_STOCKS[activeMedicine.id]?.map((stockItem, idx) => (
                        <Card 
                          key={idx} 
                          onClick={() => {
                            setShowMap(true);
                            setFocusLocation({ lat: stockItem.lat, lng: stockItem.lng });
                          }}
                          className="bg-[#090d16]/50 border-white/5 p-3 flex flex-col justify-between hover:border-primary/20 transition-all duration-300 cursor-pointer hover:bg-[#0c1324]"
                        >
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-start gap-1.5 justify-between">
                              <span className="font-extrabold text-[11px] text-white leading-tight flex items-center gap-1.5">
                                <Store className="h-3.5 w-3.5 text-primary shrink-0" />
                                {stockItem.pharmacy.split(",")[0]}
                              </span>
                              <Badge 
                                variant={stockItem.type === "out" ? "destructive" : stockItem.type === "low" ? "secondary" : "default"}
                                className="text-[8px] font-bold uppercase py-0 px-2 shrink-0"
                              >
                                {stockItem.stock}
                              </Badge>
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold mt-1">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-primary" />
                                {stockItem.distance} {t.kmAway}
                              </span>
                              {stockItem.price > 0 && (
                                <span className="text-white font-mono font-bold">₹{stockItem.price}</span>
                              )}
                            </div>
                          </div>

                          {stockItem.type !== "out" && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReserve(stockItem.pharmacy, activeMedicine.name);
                              }}
                              className="w-full mt-3 rounded-lg text-[9px] h-7 font-bold flex items-center gap-1 border-white/10 hover:bg-primary/10 hover:border-primary hover:text-primary transition-all"
                            >
                              <HeartHandshake className="h-3 w-3" />
                              {t.reserveMedication}
                            </Button>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Alternatives */}
                  <div>
                    <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{t.genericSubstitutes}</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {activeMedicine.alternatives.map((alt) => (
                        <span 
                          key={alt} 
                          onClick={() => {
                            toast({
                              title: t.brandSelectedTitle,
                              description: t.brandSelectedDesc.replace("{alt}", alt),
                              variant: "default"
                            });
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white cursor-pointer hover:bg-white/10 transition-colors font-semibold flex items-center gap-1 text-[10px]"
                        >
                          <Layers className="h-3 w-3 text-primary" />
                          {alt}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Dosage */}
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[9px] font-bold text-primary uppercase tracking-wider block">{t.standardDosage}</span>
                    <p className="text-white font-semibold mt-1 leading-relaxed text-[11px]">{activeMedicine.dosage}</p>
                  </div>

                </CardContent>
              </Card>

              {/* Interactive Interactions Checker */}
              <Card className="border-cyan-500/25 bg-gradient-to-tr from-[#0b101c] to-cyan-500/5 shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                    <FileWarning className="h-4.5 w-4.5 text-cyan-400" />
                    {t.interactionAnalyzer}
                  </CardTitle>
                  <CardDescription className="text-[10px]">{t.conflictDesc.replace("{med}", activeMedicine.name)}</CardDescription>
                </CardHeader>
                
                <CardContent className="pt-1 flex flex-col gap-4 text-xs">
                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <div className="flex-1 w-full">
                      <Select 
                        value={interactTargetId}
                        onChange={(e) => handleCheckInteraction(e.target.value)}
                        className="bg-[#0d121f]"
                      >
                        <option value="" disabled>{t.selectToCompare}</option>
                        {MOCK_MEDICINES.filter(m => m.id !== activeMedicine.id).map((med) => (
                          <option key={med.id} value={med.id}>{med.name}</option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  {interactionResult && (
                    <div className={`p-3.5 rounded-xl border leading-relaxed ${
                      interactionResult.severity === "Severe" 
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-300" 
                        : interactionResult.severity === "Moderate"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    }`}>
                      <div className="flex items-center gap-2 mb-2 font-bold uppercase tracking-wider text-[9px]">
                        {interactionResult.severity === "Severe" ? (
                          <AlertTriangle className="h-4 w-4 text-rose-400 animate-bounce" />
                        ) : interactionResult.severity === "Moderate" ? (
                          <AlertTriangle className="h-4 w-4 text-amber-400" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        )}
                        <span>{activeLang === "English" ? "Conflict Severity: " : activeLang === "Hindi" ? "पारस्परिक क्रिया तीव्रता: " : "परस्पर क्रिया तीव्रता: "}{interactionResult.severity || (activeLang === "English" ? "Safe / Clear" : activeLang === "Hindi" ? "सुरक्षित / स्पष्ट" : "सुरक्षित / स्पष्ट")}</span>
                      </div>
                      <p className="text-[11px] font-semibold">{interactionResult.text}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          ) : (
            <div className="lg:col-span-2 text-center py-12">
              <p className="text-xs text-muted-foreground">{t.selectMedPrompt}</p>
            </div>
          )}

        </div>

      </div>
  );
}
