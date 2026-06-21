"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Activity, 
  Mic, 
  Send, 
  Globe, 
  CheckCircle2, 
  ArrowRight, 
  UserCheck,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  BookOpen,
  Volume2,
  Terminal,
  Clock,
  Languages
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { MOCK_DOCTORS, Doctor } from "@/lib/mock-data";
import { useToast } from "@/components/ui/toast";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import api from "@/lib/api";
import { useHealthStore } from "@/store/useHealthStore";

interface Message {
  id: string;
  sender: "user" | "asha";
  text: string;
  timestamp: string;
  report?: {
    diagnostic: string;
    urgency: "Critical" | "Moderate" | "Routine";
    recommendedSpecialty: string;
    explanation: string;
    actions: string[];
    citations: string[];
    matchedDoctors?: Doctor[];
  };
}

// 13 Indian Languages Configuration
const LANGUAGES = [
  { key: "English", native: "English", name: "English" },
  { key: "Hindi", native: "हिन्दी", name: "Hindi" },
  { key: "Punjabi", native: "ਪੰਜਾਬੀ", name: "Punjabi" },
  { key: "Marathi", native: "मराठी", name: "Marathi" },
  { key: "Gujarati", native: "ગુજરાતી", name: "Gujarati" },
  { key: "Tamil", native: "தமிழ்", name: "Tamil" },
  { key: "Telugu", native: "తెలుగు", name: "Telugu" },
  { key: "Kannada", native: "ಕನ್ನಡ", name: "Kannada" },
  { key: "Malayalam", native: "മലയാളം", name: "Malayalam" },
  { key: "Bengali", native: "বাংলা", name: "Bengali" },
  { key: "Odia", native: "ଓଡ଼ିଆ", name: "Odia" },
  { key: "Assamese", native: "অসমীয়া", name: "Assamese" },
  { key: "Urdu", native: "اردو", name: "Urdu" }
] as const;

type LanguageKey = typeof LANGUAGES[number]["key"];

// Localized UI Translations
const TRANSLATIONS: Record<LanguageKey, Record<string, string>> = {
  English: {
    welcome: "Namaste! I am Asha, your AI clinical health companion. Describe your symptoms below, or select an example query.",
    placeholder: "Describe symptoms in detail: 'Experiencing dull chest pressure for 2 hours'...",
    voiceActive: "Clinical Voice Capture Active",
    voiceDesc: "Listening... Describe your symptoms in detail.",
    voiceText: "Experiencing severe tightness in my chest and trouble breathing.",
    diagnoseBtn: "Diagnose",
    newDiagnose: "Start New Assessment",
    presetsTitle: "Example Triage Inquiries",
    urgencyLabel: "Urgency Level",
    specialistLabel: "Recommended Specialist",
    actionsLabel: "Suggested Actions",
    citationsLabel: "Citations & References",
    bookBtn: "Book Consult",
    feeLabel: "/ consult",
    typingText: "Analyzing physiological markers...",
    cardTitle: "ASHA Triage Report",
    chatGreeting: "Welcome to AI Symptom Checker",
    subGreeting: "Type symptoms in natural language. Asha will parse metrics and cross-reference clinical databases."
  },
  Hindi: {
    welcome: "नमस्ते! मैं आशा हूँ, आपकी एआई क्लिनिकल हेल्थ companion। कृपया नीचे अपने लक्षणों का वर्णन करें, या एक उदाहरण चुनें।",
    placeholder: "अपने लक्षणों को विस्तार से बताएं: 'मुझे २ घंटे से छाती में भारीपन महसूस हो रहा है'...",
    voiceActive: "क्लिनिकल वॉयस कैप्चर सक्रिय",
    voiceDesc: "सुन रहा हूँ... अपने लक्षणों का वर्णन करें।",
    voiceText: "मुझे छाती में तेज दर्द हो रहा है और सांस लेने में कठिनाई हो रही है।",
    diagnoseBtn: "जांच करें",
    newDiagnose: "नई जांच शुरू करें",
    presetsTitle: "सामान्य जांच के उदाहरण",
    urgencyLabel: "आपातकाल स्तर",
    specialistLabel: "अनुशंसित विशेषज्ञ चिकित्सक",
    actionsLabel: "सुझाए गए उपचार कदम",
    citationsLabel: "सिटेशन्स और संदर्भ",
    bookBtn: "अपॉइंटमेंट बुक करें",
    feeLabel: "/ परामर्श शुल्क",
    typingText: "शारीरिक लक्षणों का विश्लेषण किया जा रहा है...",
    cardTitle: "आशा ट्राइएज रिपोर्ट",
    chatGreeting: "एआई लक्षण जांच केंद्र",
    subGreeting: "प्राकृतिक भाषा में अपने लक्षण लिखें। आशा आपातकालीन रिपोर्ट तैयार करेगी।"
  },
  Punjabi: {
    welcome: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਆਸ਼ਾ ਹਾਂ, ਤੁਹਾਡੀ ਏਆਈ ਕਲੀਨਿਕਲ ਹੈਲथ companion। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਲੱਛਣਾਂ ਦਾ ਵਰਣਨ ਕਰੋ।",
    placeholder: "ਆਪਣੇ ਲੱਛਣਾਂ ਨੂੰ ਵਿਸਥਾਰ ਵਿੱਚ ਦੱਸੋ...",
    voiceActive: "ਕਲੀਨਿਕਲ ਵੌਇਸ ਕੈਪਚਰ ਐਕਟਿਵ",
    voiceDesc: "ਸੁਣ ਰਿਹਾ ਹਾਂ... ਆਪਣੇ ਲੱਛਣ ਦੱਸੋ।",
    voiceText: "ਮੈਨੂੰ ਛਾਤੀ ਵਿੱਚ ਤੇਜ਼ ਦਰਦ ਹੋ ਰਿਹਾ ਹੈ ਅਤੇ ਸਾਹ ਲੈਣ ਵਿੱਚ ਮੁਸ਼ਕਲ ਹੈ।",
    diagnoseBtn: "ਜਾਂਚ ਕਰੋ",
    newDiagnose: "ਨਵੀਂ ਜਾਂਚ ਸ਼ੁਰੂ ਕਰੋ",
    presetsTitle: "ਆਮ ਜਾਂਚ ਦੀਆਂ ਉਦਾਹਰਣਾਂ",
    urgencyLabel: "ਗੰਭੀਰਤਾ ਦਾ ਪੱਧਰ",
    specialistLabel: "ਸਿਫਾਰਸ਼ੀ ਮਾਹਰ ਡਾਕਟਰ",
    actionsLabel: "ਸੁਝਾਏ ਗਏ ਕਦਮ",
    citationsLabel: "ਹਵਾਲੇ",
    bookBtn: "ਮੁਲਾਕਾਤ ਬੁੱਕ ਕਰੋ",
    feeLabel: "/ ਫੀਸ",
    typingText: "ਲੱਛਣਾਂ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...",
    cardTitle: "ਆਸ਼ਾ ਟ੍ਰਾਇਏਜ ਰਿਪੋਰਟ",
    chatGreeting: "ਏਆਈ ਲੱਛਣ ਜਾਂਚ ਕੇਂਦਰ",
    subGreeting: "ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਆਪਣੇ ਲੱਛਣ ਲਿਖੋ।"
  },
  Marathi: {
    welcome: "नमस्ते! मी आशा आहे, तुमची AI आरोग्य सहकारी. कृपया खालील तुमच्या लक्षणांचे वर्णन करा.",
    placeholder: "तुमची लक्षणे सविस्तर लिहा...",
    voiceActive: "आवाज रेकॉर्डिंग सुरू आहे",
    voiceDesc: "ऐकत आहे... लक्षणे सांगा.",
    voiceText: "माझ्या छातीत दुखत आहे आणि श्वास घेण्यास त्रास होत आहे.",
    diagnoseBtn: "तपासा",
    newDiagnose: "नवीन तपासणी",
    presetsTitle: "तपासणीचे नमुने",
    urgencyLabel: "गंभीरता पातळी",
    specialistLabel: "शिफारस केलेले डॉक्टर",
    actionsLabel: "सुचविलेले उपाय",
    citationsLabel: "संदर्भ",
    bookBtn: "अपॉइंटमेंट बुक करा",
    feeLabel: "/ फी",
    typingText: "लक्षणे विश्लेषित करत आहे...",
    cardTitle: "आशा आरोग्य अहवाल",
    chatGreeting: "एआय लक्षण तपासणी केंद्र",
    subGreeting: "तुमच्या भाषेत लक्षणे लिहा."
  },
  Gujarati: {
    welcome: "નમસ્તે! હું આશા છું, તમારી AI ક્લિનિકલ હેલ્થ સહાયક. કૃપા કરીને તમારા લક્ષણો જણાવો.",
    placeholder: "તમારા લક્ષણો વિગતવાર લખો...",
    voiceActive: "વોઈસ કેપ્ચર સક્રિય",
    voiceDesc: "સાંભળી રહ્યું છે...",
    voiceText: "મને છાતીમાં દુખાવો અને શ્વાસ લેવામાં તકલીફ થાય છે.",
    diagnoseBtn: "તપાસ કરો",
    newDiagnose: "નવી તપાસ",
    presetsTitle: "નમૂના પ્રશ્નો",
    urgencyLabel: "ગંભીરતા સ્તર",
    specialistLabel: "ડોક્ટરની ભલામણ",
    actionsLabel: "સૂચવેલા પગલાં",
    citationsLabel: "સંદર્ભ",
    bookBtn: "બુકિંગ કરો",
    feeLabel: "/ ફી",
    typingText: "લક્ષણોનું વિશ્લેષણ ચાલુ છે...",
    cardTitle: "આશા હેલ્થ રિપોર્ટ",
    chatGreeting: "AI લક્ષણ તપાસ કેન્દ્ર",
    subGreeting: "તમારી ભાષામાં લક્ષણો લખો."
  },
  Tamil: {
    welcome: "வணக்கம்! நான் ஆஷா, உங்கள் AI மருத்துவ துணைவர். உங்கள் அறிகுறிகளை கீழே விவரிக்கவும்.",
    placeholder: "அறிகுறிகளை விவரிக்கவும்...",
    voiceActive: "குரல் பதிவு செயலில் உள்ளது",
    voiceDesc: "கேட்கிறது...",
    voiceText: "நெஞ்சு வலி மற்றும் மூச்சு திணறல் உள்ளது.",
    diagnoseBtn: "கண்டறி",
    newDiagnose: "புதிய சோதனை",
    presetsTitle: "மாதிரி கேள்விகள்",
    urgencyLabel: "அவசர நிலை",
    specialistLabel: "பரிந்துரைக்கப்படும் நிபுணர்",
    actionsLabel: "பரிந்துரைக்கப்பட்ட செயல்கள்",
    citationsLabel: "மேற்கோள்கள்",
    bookBtn: "பதிவு செய்க",
    feeLabel: "/ கட்டணம்",
    typingText: "அறிகுறிகளை பகுப்பாய்வு செய்கிறது...",
    cardTitle: "ஆஷா மருத்துவ அறிக்கை",
    chatGreeting: "AI அறிகுறி கண்டறிதல்",
    subGreeting: "உங்கள் அறிகுறிகளை தமிழில் டைப் செய்யவும்."
  },
  Telugu: {
    welcome: "నమస్తే! నేను ఆశా, మీ AI క్లినికల్ హెల్త్ సహాయకురాలిని. మీ లక్షణాలను వివరించండి.",
    placeholder: "లక్షణాలను వివరంగా రాయండి...",
    voiceActive: "వాయిస్ క్యాప్చర్ సక్రియంగా ఉంది",
    voiceDesc: "వింటోంది...",
    voiceText: "ఛాతీ నొప్పి మరియు శ్వాస తీసుకోవడం ఇబ్బందిగా ఉంది.",
    diagnoseBtn: "నిర్ధారించు",
    newDiagnose: "కొత్త తనిఖీ",
    presetsTitle: "ఉదాహరణ ప్రశ్నలు",
    urgencyLabel: "తీవ్రత స్థాయి",
    specialistLabel: "సిఫార్సు చేయబడిన వైద్యుడు",
    actionsLabel: "సూచించబడిన చర్యలు",
    citationsLabel: "ఆధారాలు",
    bookBtn: "బుక్ చేసుకోండి",
    feeLabel: "/ ఫీజు",
    typingText: "లక్షణాలను విశ్లేషిస్తోంది...",
    cardTitle: "ఆశా ఆరోగ్య నివేదిక",
    chatGreeting: "AI లక్షణాల గుర్తింపు",
    subGreeting: "మీ లక్షణాలను తెలుగులో రాయండి."
  },
  Kannada: {
    welcome: "ನಮಸ್ತೆ! ನಾನು ಆಶಾ, ನಿಮ್ಮ AI ಕ್ಲಿನಿಕಲ್ ಆರೋಗ್ಯ ಸಹಾಯಕಿ. ನಿಮ್ಮ ಲಕ್ಷಣಗಳನ್ನು ವಿವರಿಸಿ.",
    placeholder: "ಲಕ್ಷಣಗಳನ್ನು ವಿವರಿಸಿ...",
    voiceActive: "ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್ ಸಕ್ರಿಯವಾಗಿದೆ",
    voiceDesc: "ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದೆ...",
    voiceText: "ಎದೆ ನೋವು ಮತ್ತು ಉಸಿರಾಟದ ತೊಂದರೆ ಇದೆ.",
    diagnoseBtn: "ಪತ್ತೆಹಚ್ಚಿ",
    newDiagnose: "ಹೊಸ ತಪಾಸಣೆ",
    presetsTitle: "ಉದಾಹರಣೆಗಳು",
    urgencyLabel: "ತುರ್ತು ಮಟ್ಟ",
    specialistLabel: "ಶಿಫಾರಸು ಮಾಡಿದ ವೈದ್ಯರು",
    actionsLabel: "ಸೂಚಿಸಲಾದ ಕ್ರಮಗಳು",
    citationsLabel: "ಆಧಾರಗಳು",
    bookBtn: "ಬುಕ್ ಮಾಡಿ",
    feeLabel: "/ ಶುಲ್ಕ",
    typingText: "ಲಕ್ಷಣಗಳ ವಿಶ್ಲೇಷಣೆ ನಡೆಯುತ್ತಿದೆ...",
    cardTitle: "ಆಶಾ ಆರೋಗ್ಯ ವರದಿ",
    chatGreeting: "AI ಲಕ್ಷಣ ತಪಾಸಣೆ",
    subGreeting: "ನಿಮ್ಮ ಲಕ್ಷಣಗಳನ್ನು ಕನ್ನಡದಲ್ಲಿ ಬರೆಯಿರಿ."
  },
  Malayalam: {
    welcome: "നമസ്തേ! ഞാൻ ആശ, നിങ്ങളുടെ AI ക്ലിനിക്കൽ ആരോഗ്യ സഹായി. നിങ്ങളുടെ ലക്ഷണങ്ങൾ വ്യക്തമാക്കുക.",
    placeholder: "ലക്ഷണങ്ങൾ വിശദമായി എഴുതുക...",
    voiceActive: "വോയ്‌സ് റെക്കോർഡിംഗ് സജീവമാണ്",
    voiceDesc: "ശ്രദ്ധിക്കുന്നു...",
    voiceText: "നെഞ്ച് വേദനയും ശ്വാസമെടുക്കാൻ ബുദ്ധിമുട്ടും അനുഭവപ്പെടുന്നു.",
    diagnoseBtn: "കണ്ടെത്തുക",
    newDiagnose: "പുതിയ പരിശോധന",
    presetsTitle: "ഉദാഹരണങ്ങൾ",
    urgencyLabel: "അടിയന്തിര സ്വഭാവം",
    specialistLabel: "നിർദ്ദേശിക്കുന്ന ഡോക്ടർ",
    actionsLabel: "ചെയ്യേണ്ട കാര്യങ്ങൾ",
    citationsLabel: "അവലംബങ്ങൾ",
    bookBtn: "ബുക്ക് ചെയ്യുക",
    feeLabel: "/ ഫീസ്",
    typingText: "രോഗലക്ഷണങ്ങൾ വിശകലനം ചെയ്യുന്നു...",
    cardTitle: "ആശ ആരോഗ്യ റിപ്പോർട്ട്",
    chatGreeting: "AI രോഗലക്ഷണ പരിശോധന",
    subGreeting: "ലക്ഷണങ്ങൾ മലയാളത്തിൽ എഴുതുക."
  },
  Bengali: {
    welcome: "নমস্কার! আমি আশা, আপনার এআই ক্লিনিকাল হেলথ companion। আপনার লক্ষণগুলি বর্ণনা করুন।",
    placeholder: "আপনার লক্ষণগুলি বিস্তারিত লিখুন...",
    voiceActive: "ভয়েস ক্যাপচার সক্রিয়",
    voiceDesc: "শুনছে...",
    voiceText: "বুকে ব্যথা এবং শ্বাসকষ্ট হচ্ছে।",
    diagnoseBtn: "পরীক্ষা করুন",
    newDiagnose: "নতুন পরীক্ষা",
    presetsTitle: "উদাহরণসমূহ",
    urgencyLabel: "জরুরি অবস্থা",
    specialistLabel: "প্রস্তাবিত চিকিৎসক",
    actionsLabel: "প্রস্তাবিত পদক্ষেপ",
    citationsLabel: "তথ্যসূত্র",
    bookBtn: "বুক করুন",
    feeLabel: "/ ভিজিট",
    typingText: "লক্ষণগুলি বিশ্লেষণ করা হচ্ছে...",
    cardTitle: "আশা স্বাস্থ্য রিপোর্ট",
    chatGreeting: "এআই লক্ষণ পরীক্ষা কেন্দ্র",
    subGreeting: "আপনার লক্ষণগুলি বাংলায় লিখুন।"
  },
  Odia: {
    welcome: "ନମସ୍ତେ! ମୁଁ ଆଶା, ଆପଣଙ୍କ AI ସ୍ୱାସ୍ଥ୍ୟ ସହକାରୀ | ଲକ୍ଷଣ ବର୍ଣ୍ଣନା କରନ୍ତୁ |",
    placeholder: "ଲକ୍ଷଣ ସବିଶେଷ ଲେଖନ୍ତୁ...",
    voiceActive: "ସ୍ୱର ଗ୍ରହଣ ସକ୍ରିୟ",
    voiceDesc: "ଶୁଣୁଛି...",
    voiceText: "ଛାତିରେ ଯନ୍ତ୍ରଣା ଏବଂ ଶ୍ୱାସକ୍ରିୟାରେ କଷ୍ଟ ହେଉଛି।",
    diagnoseBtn: "ଯାଞ୍ଚ କରନ୍ତୁ",
    newDiagnose: "ନୂଆ ଯାଞ୍ଚ",
    presetsTitle: "ଉଦାହରଣ",
    urgencyLabel: "ଗୁରୁତର ସ୍ଥିତି",
    specialistLabel: "ପରାମର୍ଶିତ ଡାକ୍ତର",
    actionsLabel: "ପଦକ୍ଷେପ ସମୂହ",
    citationsLabel: "ଆଧାର",
    bookBtn: "ବୁକ୍ କରନ୍ତୁ",
    feeLabel: "/ ଫିସ୍",
    typingText: "ଲକ୍ଷଣ ଯାଞ୍ଚ ଚାଲିଛି...",
    cardTitle: "ଆଶା ସ୍ୱାସ୍ଥ୍ୟ ରିପୋର୍ଟ",
    chatGreeting: "AI ଲକ୍ଷଣ ଯାଞ୍ચ କେନ୍ଦ୍ର",
    subGreeting: "ଆପଣଙ୍କ ଭାଷାରେ ଲକ୍ଷଣ ଲେଖନ୍ତୁ |"
  },
  Assamese: {
    welcome: "নমস্কাৰ! মই আশা, আপোনাৰ AI ক্লিনিকেল স্বাস্থ্য সহায়িকা। আপোনাৰ লক্ষণসমূহ কওক।",
    placeholder: "আপোনাৰ লক্ষণবোৰ সবিস্তাৰে কওক...",
    voiceActive: "কণ্ঠ গ্ৰহণ সক্ৰিয় হৈ আছে",
    voiceDesc: "শুনি থকা হৈছে...",
    voiceText: "বুকুৰ বিষ আৰু উশাহ লোৱাত কষ্ট হৈছে।",
    diagnoseBtn: "পৰীক্ষা কৰক",
    newDiagnose: "নতুন পৰীক্ষা",
    presetsTitle: "উদাহৰণসমূহ",
    urgencyLabel: "গুৰুত্বৰ স্তৰ",
    specialistLabel: "পৰামৰ্শদাতা চিকিৎসক",
    actionsLabel: "পৰামৰ্শমূলক পদক্ষেপ",
    citationsLabel: "উদ্ধৃতি",
    bookBtn: "বুক কৰক",
    feeLabel: "/ মাচুল",
    typingText: "লক্ষণবোৰ পৰীক্ষা কৰা হৈছে...",
    cardTitle: "আশা স্বাস্থ্য প্ৰতিবেদন",
    chatGreeting: "AI লক্ষণ পৰীক্ষা কেন্দ্ষ",
    subGreeting: "আপোনাৰ ভাষাত লক্ষণসমূহ লিখক।"
  },
  Urdu: {
    welcome: "السلام علیکم! میں آشا ہوں، آپ کی اے آئی کلینیکل ہیلتھ اسسٹنٹ۔ اپنی علامات نیچے بیان کریں۔",
    placeholder: "اپنی علامات تفصیل سے لکھیں...",
    voiceActive: "آواز کی ریکارڈنگ فعال ہے",
    voiceDesc: "سن رہا ہے...",
    voiceText: "میرے سینے میں درد اور سانس لینے میں دشواری ہو رہی ہے۔",
    diagnoseBtn: "تشخیص کریں",
    newDiagnose: "نیا معائنہ شروع کریں",
    presetsTitle: "مثالی سوالات",
    urgencyLabel: "شدت کا درجہ",
    specialistLabel: "تجویز کردہ معالج",
    actionsLabel: "تجویز کردہ اقدامات",
    citationsLabel: "حوالہ جات",
    bookBtn: "بک کریں",
    feeLabel: "/ فیس",
    typingText: "علامات کا تجزیہ کیا جا رہا ہے...",
    cardTitle: "آشا ہیلتھ رپورٹ",
    chatGreeting: "اے آئی علامات مرکز",
    subGreeting: "اپنی علامات اردو میں لکھیں۔"
  }
};

// Realistic mock reports translated globally
const REPORTS_DICT: Partial<Record<LanguageKey, Record<string, any>>> = {
  English: {
    cardiac: {
      diagnostic: "Suspected Acute Coronary Syndrome or Myocardial Strain",
      urgency: "Critical",
      recommendedSpecialty: "Cardiologist",
      explanation: "Your symptoms describe significant thoracic chest pressure. This warrants immediate cardiac screening to rule out vascular occlusion or myocardial strain.",
      actions: [
        "EMERGENCY: Proceed to the nearest Emergency Hospital immediately.",
        "Avoid any heavy physical movement; remain seated.",
        "Take 1 chewable Aspirin if advised by emergency operators."
      ],
      citations: ["AHA Acute Cardiac Care Standards 2026", "ACC Chest Pain Protocols"]
    },
    respiratory: {
      diagnostic: "Atypical Bronchitic Congestion / Viral Respiratory Syndrome",
      urgency: "Moderate",
      recommendedSpecialty: "General Physician",
      explanation: "Symptoms indicate typical viral upper respiratory tract congestion. Monitor fever and oxygenation levels regularly.",
      actions: [
        "Take steam inhalations and warm hydration fluids regularly.",
        "Monitor body temperature and SpO2 levels closely using an oximeter.",
        "Schedule general physician consultation if fever persists past 48 hours."
      ],
      citations: ["CDC Guidelines for Influenza Triaging", "ASHA Field Protocol v2"]
    },
    dermal: {
      diagnostic: "Contact Dermatitis / Dermal Inflammatory Response",
      urgency: "Routine",
      recommendedSpecialty: "Dermatologist",
      explanation: "Local skin eruptions indicate potential reaction to contactants or environmental allergens. Prevent scratching to avoid infections.",
      actions: [
        "Avoid scratching the affected area to prevent secondary infection.",
        "Apply cool damp compress or calming calamine lotion.",
        "Consult dermatologist if swelling spreads or fever develops."
      ],
      citations: ["AAD Dermal Inflammatory Protocols"]
    },
    neurological: {
      diagnostic: "Severe Migraine Cephalgia (Neurovascular Headache)",
      urgency: "Moderate",
      recommendedSpecialty: "Neurologist",
      explanation: "Acute unilateral headache accompanied by photophobia matches migraine flares. Dark-room rest is recommended.",
      actions: [
        "Rest in a completely dark and noise-free room.",
        "Apply a cold pack or damp towel to forehead or temples.",
        "Consult medical support if accompanied by aura, speech gaps, or weakness."
      ],
      citations: ["IHS International Headache Guidelines"]
    }
  },
  // All other languages inherit and use localized templates for demo purposes
  Hindi: {
    cardiac: {
      diagnostic: "संदेहास्पद तीव्र कोरोनरी सिंड्रोम (हृदय अवरोध)",
      urgency: "Critical",
      recommendedSpecialty: "Cardiologist",
      explanation: "आपके लक्षण छाती में गंभीर और भारी दबाव को दर्शाते हैं। हृदय अवरोध या मायोकार्डियल स्ट्रेन की पुष्टि के लिए तुरंत ईसीजी (ECG) कराना अनिवार्य है।",
      actions: [
        "आपातकाल: तुरंत नजदीकी अस्पताल के इमरजेंसी वार्ड में जाएं।",
        "शारीरिक गतिविधि तुरंत बंद करें और शांत बैठकर आराम करें।",
        "यदि अस्पताल के डॉक्टर द्वारा सलाह दी जाए तो 1 एस्पिरिन चबाएं।"
      ],
      citations: ["एएचए एक्यूट कार्डिएक केयर मानक 2026", "एसीसी चेस्ट पेन प्रोटोकॉल"]
    },
    respiratory: {
      diagnostic: "असामान्य ब्रोंकाइटिस जमाव / वायरल श्वसन संक्रमण",
      urgency: "Moderate",
      recommendedSpecialty: "General Physician",
      explanation: "लक्षण ऊपरी श्वसन पथ में वायरल संक्रमण का संकेत देते हैं। शरीर के तापमान और ऑक्सीजन स्तर पर लगातार नजर रखें।",
      actions: [
        "दिन में 2 से 3 बार गर्म भाप लें और गुनगुना पानी पिएं।",
        "पल्स ऑक्सीमीटर से शरीर का तापमान और ऑक्सीजन स्तर (SpO2) मापें।",
        "यदि बुखार 48 घंटों से अधिक समय तक बना रहे, तो डॉक्टर से संपर्क करें।"
      ],
      citations: ["सीडीसी इन्फ्लुएंजा ट्राइएज गाइडलाइंस", "आशा फील्ड प्राथमिक देखभाल गाइड"]
    },
    dermal: {
      diagnostic: "संपर्क जिल्द की सूजन (त्वचा एलर्जी / दाने)",
      urgency: "Routine",
      recommendedSpecialty: "Dermatologist",
      explanation: "त्वचा पर लाल दाने और खुजली किसी बाहरी एलर्जी या पौधे के संपर्क में आने से हो सकती है। खरोंचने से बचें ताकि कोई सेकेंडरी संक्रमण न हो।",
      actions: [
        "बैक्टीरिया संक्रमण से बचने के लिए प्रभावित हिस्से को न खुजलाएं।",
        "ठंडी पट्टी से सिकाई करें या शांत करने वाला कैलामाइन लोशन लगाएं।",
        "यदि सूजन बढ़ती है या बुखार आता है, तो तुरंत त्वचा विशेषज्ञ से परामर्श लें।"
      ],
      citations: ["एएडी चर्म रोग प्रोटोकॉल"]
    },
    neurological: {
      diagnostic: "गंभीर माइग्रेन सिरदर्द (न्यूरोवैस्कुलर हेडेक)",
      urgency: "Moderate",
      recommendedSpecialty: "Neurologist",
      explanation: "रोशनी के प्रति संवेदनशीलता के साथ तेज सिरदर्द माइग्रेन को दर्शाता है। शांत और अंधेरे कमरे में आराम करना सबसे सहायक होगा।",
      actions: [
        "पूरी तरह से अंधेरे और शांत कमरे में लेटकर आराम करें।",
        "माथे या कनपटी पर ठंडी गीली पट्टी या आइस पैक लगाएं।",
        "यदि बोलने में रुकावट, चक्कर या कमजोरी महसूस हो, तो न्यूरोलॉजिस्ट से मिलें।"
      ],
      citations: ["आईएचएस इंटरनेशनल हेडेक गाइडलाइंस"]
    }
  },
  Punjabi: {
    cardiac: {
      diagnostic: "ਸ਼ੱਕੀ ਐਕਿਊਟ ਕੋਰੋਨਰੀ ਸਿੰਡਰੋਮ (ਦਿਲ ਦੀ ਬਿਮਾਰੀ)",
      urgency: "Critical",
      recommendedSpecialty: "Cardiologist",
      explanation: "ਤੁਹਾਡੇ ਲੱਛਣ ਛਾਤੀ ਵਿੱਚ ਭਾਰੀ ਦਬਾਅ ਅਤੇ ਸਾਹ ਦੀ ਕਮੀ ਨੂੰ ਦਰਸਾਉਂਦੇ ਹਨ। ਦਿਲ ਦੀ ਰੁਕਾਵਟ ਦੀ ਜਾਂਚ ਲਈ ਤੁਰੰਤ ਈਸੀਜੀ (ECG) ਟੈਸਟ ਕਰਾਉਣਾ ਲਾਜ਼ਮੀ ਹੈ।",
      actions: [
        "ਐਮਰਜੈਂਸੀ: ਤੁਰੰਤ ਨਜ਼ਦੀਕੀ ਹਸਪਤਾਲ ਦੇ ਐਮਰਜੈਂਸੀ ਵਿਭਾਗ ਵਿੱਚ ਜਾਓ।",
        "ਕੋਈ ਵੀ ਸਰੀਰਕ ਕੰਮ ਤੁਰੰਤ ਬੰਦ ਕਰੋ ਅਤੇ ਸ਼ਾਂਤ ਬੈਠ ਕੇ ਆਰਾਮ ਕਰੋ।",
        "ਜੇਕਰ ਐਮਰਜੈਂਸੀ ਡਾਕਟਰ ਦੁਆਰਾ ਸਲਾਹ ਦਿੱਤੀ ਜਾਵੇ ਤਾਂ 1 ਐਸਪਰੀਨ ਚਬਾਓ।"
      ],
      citations: ["ਏ.ਐਚ.ਏ. ਐਕਿਊਟ ਕਾਰਡੀਅक ਕੇਅਰ ਸਟੈਂਡਰਡਸ"]
    },
    respiratory: {
      diagnostic: "ਅਸਾਧਾਰਣ ਬ੍ਰੋਂਕਾਈਟਿਸ ਜਮਾਵ / ਵਾਇਰਲ ਸਾਹ ਦੀ ਇਨਫੈਕਸ਼ਨ",
      urgency: "Moderate",
      recommendedSpecialty: "General Physician",
      explanation: "ਲੱਛਣ ਸਾਹ ਨਲੀ ਵਿੱਚ ਵਾਇਰਲ ਇਨਫੈਕਸ਼ਨ ਅਤੇ ਜਮਾਵ ਨੂੰ ਦਰਸਾਉਂਦੇ ਹਨ। ਬੁਖਾਰ ਅਤੇ ਆਕਸੀਜਨ ਦੇ ਪੱਧਰ 'ਤੇ ਲਗਾਤਾਰ ਨਜ਼ਰ ਰੱਖੋ।",
      actions: [
        "ਦਿਨ ਵਿੱਚ 2-3 ਵਾਰ ਗਰਮ ਭਾਫ਼ ਲਓ ਅਤੇ ਗੁਣਗੁਣਾ ਪਾਣੀ ਪੀਓ।",
        "ਪਲਸ ਆਕਸੀਮੀਟਰ ਨਾਲ ਸਰੀਰ ਦਾ ਤਾਪਮਾਨ ਅਤੇ ਆਕਸੀਜਨ ਪੱਧਰ (SpO2) ਚੈੱਕ ਕਰੋ।"
      ],
      citations: ["ਸੀ.ਡੀ.સી. ਟ੍ਰਾਇਏਜ ਗਾਈਡਲਾਈਨਜ਼"]
    },
    dermal: {
      diagnostic: "ਕੰਟੈਕਟ ਡਰਮੇਟਾਇਟਸ (ਚਮੜੀ ਦੀ ਐਲਰਜੀ / ਖਾਰਸ਼)",
      urgency: "Routine",
      recommendedSpecialty: "Dermatologist",
      explanation: "ਚਮੜੀ 'ਤੇ ਲਾਲ ਦਾਣੇ ਅਤੇ ਖਾਰਸ਼ ਕਿਸੇ ਬਾਹਰੀ ਐਲਰਜੀ ਜਾਂ ਪੌਦੇ ਦੇ ਸੰਪਰਕ ਨਾਲ ਹੋ ਸਕਦੀ ਹੈ। ਖਾਰਸ਼ ਕਰਨ ਤੋਂ ਬਚੋ।",
      actions: [
        "ਇਨਫੈਕਸ਼ਨ ਤੋਂ ਬਚਣ ਲਈ ਪ੍ਰਭਾਵਿਤ ਹਿੱਸੇ ਨੂੰ ਖਾਰਸ਼ ਨਾ ਕਰੋ।",
        "ਠੰਡੀ पट्टी ਨਾਲ ਸਿਕਾਈ ਕਰੋ।"
      ],
      citations: ["ਏ.ਏ.ਡੀ. ਚਮੜੀ ਰੋਗ ਪ੍ਰੋਟੋকੋល"]
    },
    neurological: {
      diagnostic: "ਗੰਭੀਰ ਮਾਈਗ੍ਰੇਨ ਸਿਰਦਰਦ",
      urgency: "Moderate",
      recommendedSpecialty: "Neurologist",
      explanation: "ਰੌਸ਼ਨੀ ਪ੍ਰਤੀ ਸੰਵੇਦਨਸ਼ੀલਤਾ ਦੇ ਨਾਲ ਇੱਕ ਪਾਸੇ ਦਾ ਤੇਜ਼ ਸਿਰ ਦਰਦ ਮਾਈਗ੍ਰੇਨ ਦਾ ਸੰਕੇਤ ਹੈ। ਹਨੇਰੇ ਅਤੇ ਸ਼ਾਂਤ ਕਮਰੇ ਵਿੱਚ ਆਰਾਮ ਕਰੋ।",
      actions: [
        "ਪੂਰੀ ਤਰ੍ਹਾਂ ਹਨੇਰੇ ਅਤੇ ਸ਼ਾਂਤ ਕਮਰੇ ਵਿੱਚ ਲੇਟ ਕੇ ਆਰਾਮ ਕਰੋ।",
        "ਮੱਥੇ 'ਤੇ ਠੰਡੀ ਗਿੱਲੀ ਪੱਟੀ ਲਗਾਓ।"
      ],
      citations: ["ਆਈ.ਐਚ.ਐਸ. ਗਾਈਡਲਾਈਨਜ਼"]
    }
  }
};

// Fallback logic to make other 10 languages work seamlessly with translated reports
const getLocalizedReport = (lang: LanguageKey, type: string) => {
  // If explicitly defined, use it
  if (REPORTS_DICT[lang] && REPORTS_DICT[lang][type]) {
    return REPORTS_DICT[lang][type];
  }
  
  // For regional scripts, fall back to Hindi translation with local custom prefix, or default English
  const isSouthernOrUrdu = ["Tamil", "Telugu", "Kannada", "Malayalam", "Urdu"].includes(lang);
  const baseReport = isSouthernOrUrdu ? REPORTS_DICT["English"]![type] : REPORTS_DICT["Hindi"]![type];
  
  // Return adapted object
  return {
    ...baseReport,
    diagnostic: `[${lang}] ${baseReport.diagnostic}`,
    explanation: `(${lang} Localization) ${baseReport.explanation}`
  };
};

// Localized presets for all 13 languages
const PRESETS_DICT: Record<LanguageKey, { text: string; label: string }[]> = {
  English: [
    { text: "Experiencing dull chest pressure, radiating to left shoulder for 2 hours.", label: "Chest Pressure" },
    { text: "Persistent dry cough, congestion, and 101°F fever since 3 days.", label: "Fever & Cough" },
    { text: "Red itchy rash on arm, expanding after garden work.", label: "Dermal Rash" }
  ],
  Hindi: [
    { text: "छाती में भारीपन महसूस हो रहा है, जो बाएं कंधे तक जा रहा है (२ घंटे से)।", label: "छाती में दबाव" },
    { text: "पिछले ३ दिनों से सूखी खांसी, जकड़न और १०१ डिग्री बुखार है।", label: "खांसी और बुखार" },
    { text: "बगीचे में काम करने के बाद हाथ पर लाल खुजलीदार दाने हो गए हैं।", label: "त्वचा पर दाने" }
  ],
  Punjabi: [
    { text: "ਛਾਤੀ ਵਿੱਚ ਭਾਰਾਪਨ ਮਹਿਸੂਸ ਹੋ ਰਿਹਾ ਹੈ, ਜੋ ਖੱਬੇ ਮੋਢੇ ਤੱਕ ਜਾ ਰਿਹਾ ਹੈ (2 ਘੰਟਿਆਂ ਤੋਂ)।", label: "ਛਾਤੀ ਵਿੱਚ ਦਬਾਅ" },
    { text: "ਪਿਛਲੇ 3 ਦਿਨਾਂ ਤੋਂ ਸੁੱਕੀ ਖੰਘ, ਜਕੜਨ ਅਤੇ 101 ਡਿਗਰੀ ਬੁਖਾਰ ਹੈ।", label: "ਖੰਘ ਅਤੇ ਬੁਖਾਰ" },
    { text: "ਬਗੀਚੇ ਵਿੱਚ ਕੰਮ ਕਰਨ ਤੋਂ ਬਾਅद ਬਾਂਹ 'ਤੇ ਲਾਲ ਖਾਰਸ਼ ਵਾਲੇ ਦਾਣੇ ਹੋ ਗਏ ਹਨ।", label: "ਚਮੜੀ 'ਤੇ ਦਾਣੇ" }
  ],
  Marathi: [
    { text: "छातीत जडपणा जाणवत आहे, जो डाव्या खांद्यापर्यंत जात आहे (२ तास झाले).", label: "छातीत जडपणा" },
    { text: "गेल्या ३ दिवसांपासून सुका खोकला आणि १०१ अंश ताप आहे.", label: "खोकला आणि ताप" }
  ],
  Gujarati: [
    { text: "છાતીમાં દુખાવો થાય છે, જે ડાબા ખભા તરફ ફેલાય છે (૨ કલાકથી).", label: "છાતીમાં દુખાવો" },
    { text: "છેલ્લા ૩ દિવસથી સુકી ખાંસી અને ૧૦૧ તાવ છે.", label: "ખાંસી અને તાવ" }
  ],
  Tamil: [
    { text: "நெஞ்சு வலி மற்றும் இடது தோள்பட்டை வலி 2 மணி நேரமாக உள்ளது.", label: "நெஞ்சு வலி" },
    { text: "3 நாட்களாக வறட்டு இருமல் மற்றும் 101°F காய்ச்சல் உள்ளது.", label: "இருமல் மற்றும் காய்ச்சல்" }
  ],
  Telugu: [
    { text: "ఛాతీ నొప్పిగా ఉంది, అది ఎడమ భుజానికి వ్యాపిస్తోంది (2 గంటలుగా).", label: "ఛాతీ నొప్పి" },
    { text: "3 రోజులుగా పొడి దగ్గు మరియు 101°F జ్వరం ఉన్నాయి.", label: "దగ్గు మరియు జ్వరం" }
  ],
  Kannada: [
    { text: "ಎದೆ ನೋವು ಮತ್ತು ಎಡ ಭುಜಕ್ಕೆ ಹರಡುವ ನೋವು 2 ಗಂಟೆಗಳಿಂದ ಇದೆ.", label: "ಎದೆ ನೋವು" }
  ],
  Malayalam: [
    { text: "നെഞ്ച് വേദനയും ഇടത് തോളിലേക്ക് പടരുന്ന വേദനയും (2 മണിക്കൂറായി).", label: "നെഞ്ച് വേദന" }
  ],
  Bengali: [
    { text: "বুকে জাঁকানো ব্যথা হচ্ছে, যা ২ ঘণ্টা ধরে বাঁ কাঁধে ছড়াচ্ছে।", label: "বুকে ব্যথা" }
  ],
  Odia: [
    { text: "ଛାତିରେ ଯନ୍ତ୍ରଣା ହେଉଛି, ଯାହା ବାମ କାନ୍ଧକୁ ବ୍ୟାପୁଛି (୨ ଘଣ୍ଟା ଧରି)।", label: "ଛାତି ଯନ୍ତ୍ରଣା" }
  ],
  Assamese: [
    { text: "বুকুৰ বিষ আৰু বাওঁ কান্ধলৈ বিষ বিয়পি যোৱা অনুভৱ (২ ঘণ্টাৰ পৰা)।", label: "বুকুৰ বিষ" }
  ],
  Urdu: [
    { text: "سینے میں درد محسوس ہو رہا ہے، جو بائیں کندھے تک جا رہا ہے (2 گھنٹے سے)۔", label: "سینے کا درد" }
  ]
};

const STAGES_DICT: Record<LanguageKey, string[]> = {
  English: ["Decrypting physiological inputs...", "Querying clinical taxonomy databases...", "Cross-referencing drug interaction models...", "Synthesizing diagnostic triage urgency..."],
  Hindi: ["शारीरिक लक्षणों का डिक्रिप्शन किया जा रहा है...", "क्लिनिकल वर्गीकरण डेटाबेस से मिलान किया जा रहा है...", "दवाओं के रिएक्शन की जांच की जा रही है...", "लक्षणों की गंभीरता रिपोर्ट तैयार की जा रही है..."],
  Punjabi: ["ਸਰੀਰਕ ਲੱਛਣਾਂ ਦਾ ਡੀਕ੍ਰਿਪਸ਼ਨ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...", "ਕਲੀਨਿਕਲ ਵਰਗੀਕਰਣ ਨਾਲ ਮਿਲਾਨ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...", "ਦਵਾਈਆਂ ਦੇ ਰਿਐਕਸ਼ਨ ਦੀ ਜਾਂਚ...", "ਲੱਛਣਾਂ ਦੀ ਗੰਭੀਰਤਾ ਰਿਪੋਰਟ ਤਿਆਰ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ..."],
  Marathi: ["लक्षणे तपासली जात आहेत...", "डेटाबेसशी जुळणी केली जात आहे...", "अहवाल तयार होत आहे..."],
  Gujarati: ["શારીરિક લક્ષણોનું ડિક્રિપ્શન ચાલુ છે...", "ક્લિનિકલ ડેટાબેઝ ચેક થાય છે...", "રિપોર્ટ તૈયાર થાય છે..."],
  Tamil: ["அறிகுறிகள் ஆராயப்படுகின்றன...", "தரவுத்தளங்கள் சரிபார்க்கப்படுகின்றன...", "அறிக்கை தயாரிக்கப்படுகிறது..."],
  Telugu: ["లక్షణాలు విశ్లేషించబడుతున్నాయి...", "డేటాబేస్ సరిచూడబడుతోంది...", "నివేదిక సిద్ధమవుతోంది..."],
  Kannada: ["ಲಕ್ಷಣಗಳ ವಿಶ್ಲೇಷಣೆ...", "ಡೇಟಾಬೇಸ್ ಪರಿಶೀಲನೆ...", "ವರದಿ ಸಿದ್ಧವಾಗುತ್ತಿದೆ..."],
  Malayalam: ["ലക്ഷണങ്ങൾ വിശകലനം ചെയ്യുന്നു...", "ഡാറ്റാബേസ് പരിശോധിക്കുന്നു...", "റിപ്പോർട്ട് തയ്യാറാക്കുന്നു..."],
  Bengali: ["লক্ষণ বিশ্লেষণ করা হচ্ছে...", "ডাটাবেস চেক করা হচ্ছে...", "রিপোর্ট তৈরি হচ্ছে..."],
  Odia: ["ଲକ୍ଷଣ ଅନୁସନ୍ଧାନ ଚାଲିଛି...", "ଡାଟାବେସ ଯାଞ୍ଚ ହେଉଛି...", "ରିପୋର୍ଟ ପ୍ରସ୍ତୁତ ହେଉଛି..."],
  Assamese: ["লক্ষণসমূহ নিৰীক্ষণ কৰা হৈছে...", "তথ্য সংৰক্ষণ পৰীক্ষা চলিছে...", "প্ৰতিবেদন তৈয়াৰ হৈছে..."],
  Urdu: ["علامات کا تجزیہ کیا جا رہا ہے...", "ڈیٹا بیس چیک ہو رہا ہے...", "رپورٹ تیار کی جا رہی ہے..."]
};

// Language code mapping for backend
const LANG_CODE: Record<LanguageKey, string> = {
  English: 'en', Hindi: 'hi', Punjabi: 'pa', Marathi: 'hi', Gujarati: 'hi',
  Tamil: 'hi', Telugu: 'hi', Kannada: 'hi', Malayalam: 'hi', Bengali: 'hi',
  Odia: 'hi', Assamese: 'hi', Urdu: 'hi'
};

export default function ChatSymptomChecker() {
  const { toast } = useToast();
  const { isAuthenticated, language, setLanguage } = useHealthStore();
  
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageKey>("English");
  const [symptomText, setSymptomText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // AI Triage processing states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);

  // Voice recording state
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[selectedLanguage];

  // Keep selectedLanguage synced with global language store state
  useEffect(() => {
    if (language) {
      setSelectedLanguage(language as LanguageKey);
    }
  }, [language]);

  // Auto scroll
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAnalyzing]);

  // Load welcome greeting
  useEffect(() => {
    setMessages([
      {
        id: "init-welcome",
        sender: "asha",
        text: TRANSLATIONS[selectedLanguage].welcome,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [selectedLanguage]);

  const handleLanguageChange = (lang: LanguageKey) => {
    setSelectedLanguage(lang);
    if (lang === "English" || lang === "Hindi" || lang === "Marathi") {
      setLanguage(lang);
    }
    toast({
      title: "Language Set / भाषा बदली गई",
      description: `Target set to ${lang}.`,
      variant: "default"
    });
  };

  const handlePresetSelect = (text: string) => {
    setSymptomText(text);
  };

  const handleVoiceToggle = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    // Start recording
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Show analyzing state
        setIsAnalyzing(true);
        setCurrentStage(0);

        if (isAuthenticated) {
          try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');
            formData.append('language', LANG_CODE[selectedLanguage] || 'en');

            const res = await api.postMultipart<{ success: boolean; data: { triage: any } }>(
              '/api/triage/voice', formData
            );
            setIsAnalyzing(false);
            // Show transcription toast
            if (res.data.triage.transcription) {
              toast({ title: `We heard: "${res.data.triage.transcription.slice(0, 80)}..."`, variant: 'default' });
            }
            appendTriageMessage(res.data.triage, res.data.triage.transcription || '');
            return;
          } catch {
            toast({ title: "Voice triage failed", description: "Using demo fallback.", variant: "destructive" });
          }
        }
        // Demo fallback
        setSymptomText(t.voiceText);
        setIsAnalyzing(false);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      toast({ title: t.voiceActive, description: t.voiceDesc, variant: 'default' });
    } catch {
      toast({ title: 'Microphone access denied', description: 'Please allow microphone access.', variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomText.trim()) return;

    const queryText = symptomText;
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: queryText,
      timestamp: timestampStr
    };

    setMessages((prev) => [...prev, userMsg]);
    setSymptomText("");
    setIsAnalyzing(true);
    setCurrentStage(0);

    // Run stage progress animation
    const activeStages = STAGES_DICT[selectedLanguage] || STAGES_DICT["English"];
    let stageIdx = 0;
    const stageInterval = setInterval(() => {
      stageIdx++;
      if (stageIdx >= activeStages.length) {
        clearInterval(stageInterval);
      } else {
        setCurrentStage(stageIdx);
      }
    }, 600);

    // Wait for stage animation to play, then call backend
    await new Promise(res => setTimeout(res, activeStages.length * 600 + 400));
    clearInterval(stageInterval);

    if (isAuthenticated) {
      // ── Real backend call ──────────────────────────────────────────
      try {
        const langCode = LANG_CODE[selectedLanguage] || 'en';
        const res = await api.post<{ success: boolean; data: { triage: any } }>(
          '/api/triage/text',
          { symptoms: queryText, language: langCode }
        );
        setIsAnalyzing(false);
        appendTriageMessage(res.data.triage, queryText);
        return;
      } catch (err: any) {
        toast({ title: "Backend unreachable", description: "Falling back to demo mode.", variant: "destructive" });
      }
    }

    // ── Demo fallback (mock keyword analysis) ─────────────────────
    generateReport(queryText);
  };

  // ── Parse real backend triage response ─────────────────────────
  const appendTriageMessage = (triage: any, queryText: string) => {
    const urgencyMap: Record<string, string> = {
      emergency: 'Critical',
      medium: 'Moderate',
      low: 'Routine'
    };
    const matchedDocs = MOCK_DOCTORS.filter(
      (d) => d.specialty.toLowerCase().includes(
        (triage.recommended_specialist || '').toLowerCase().replace('ist', '')
      )
    );

    const ashaMsg: Message = {
      id: `asha-${Date.now()}`,
      sender: 'asha',
      text: triage.advice,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      report: {
        diagnostic: triage.symptoms_structured?.map((s: any) => s.symptom).join(', ') || queryText,
        urgency: (urgencyMap[triage.urgency_level] || 'Moderate') as "Critical" | "Moderate" | "Routine",
        recommendedSpecialty: triage.recommended_specialist || 'General Physician',
        explanation: triage.advice,
        actions: triage.symptoms_structured?.map((s: any) =>
          `${s.symptom}${s.duration ? ` for ${s.duration}` : ''}${s.severity ? ` — ${s.severity}` : ''}`
        ) || [],
        citations: [`Vaidya AI Triage · Report ID: ${triage.report_id?.slice(0,8) || 'N/A'}`],
        matchedDoctors: matchedDocs
      }
    };
    setMessages((prev) => [...prev, ashaMsg]);
  };

  // ── Mock keyword-based fallback (demo mode / offline) ──────────
  const generateReport = (query: string) => {
    setIsAnalyzing(false);
    const text = query.toLowerCase();
    
    let type = "respiratory";
    if (text.includes("chest") || text.includes("breathing") || text.includes("heart") || 
        text.includes("छाती") || text.includes("दर्द") || text.includes("வலி") ||
        text.includes("గుండె") || text.includes("हृदय") || text.includes("বুক")) {
      type = "cardiac";
    } else if (text.includes("rash") || text.includes("itch") || text.includes("skin") || 
               text.includes("खुजली") || text.includes("दाने") || text.includes("allergy")) {
      type = "dermal";
    } else if (text.includes("headache") || text.includes("migraine") || text.includes("सिरदर्द")) {
      type = "neurological";
    }

    const reportData = getLocalizedReport(selectedLanguage, type);
    const matchedDocs = MOCK_DOCTORS.filter(
      (d) => d.specialty.toLowerCase() === reportData.recommendedSpecialty.toLowerCase()
    );

    const ashaMsg: Message = {
      id: `asha-${Date.now()}`,
      sender: "asha",
      text: reportData.explanation,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      report: {
        diagnostic: reportData.diagnostic,
        urgency: reportData.urgency,
        recommendedSpecialty: reportData.recommendedSpecialty,
        explanation: reportData.explanation,
        actions: reportData.actions,
        citations: reportData.citations,
        matchedDoctors: matchedDocs
      }
    };
    setMessages((prev) => [...prev, ashaMsg]);
  };

  const handleReset = () => {
    setMessages([
      {
        id: "init-welcome",
        sender: "asha",
        text: TRANSLATIONS[selectedLanguage].welcome,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setSymptomText("");
  };

  const activePresets = PRESETS_DICT[selectedLanguage] || PRESETS_DICT["English"];
  const activeStages = STAGES_DICT[selectedLanguage] || STAGES_DICT["English"];

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] select-none text-foreground bg-[#090d16]/30 rounded-2xl border border-white/5 overflow-hidden">
      
      {/* Header with 13-Language Selector */}
      <div className="flex items-center justify-between border-b border-white/5 p-4 md:px-6 bg-[#0b101c]/90 z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-extrabold text-white flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              {t.chatGreeting}
            </h1>
            <p className="text-[10px] text-muted-foreground hidden sm:block">{t.subGreeting}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4 text-muted-foreground hidden xs:block" />
          <div className="w-32 md:w-36 h-8">
            <Select 
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value as any)}
              className="h-8 py-0 px-2 text-[10px] md:text-xs bg-[#090d16]"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.key} value={lang.key}>
                  {lang.native} ({lang.name})
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center border text-[10px] font-bold ${
                msg.sender === "user"
                  ? "bg-white/5 border-white/10 text-white"
                  : "bg-primary/10 border-primary/25 text-primary"
              }`}>
                {msg.sender === "user" ? "U" : "A"}
              </div>

              <div className="flex flex-col gap-1.5">
                <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-[#161c2c] border border-white/5 text-foreground rounded-tr-none"
                    : "bg-[#0b101c]/80 border border-white/5 text-foreground rounded-tl-none"
                }`}>
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
                
                <span className={`text-[8px] text-muted-foreground font-mono px-1 ${
                  msg.sender === "user" ? "text-right" : "text-left"
                }`}>
                  {msg.timestamp}
                </span>

                {/* Triage Report Metadata Card */}
                {msg.sender === "asha" && msg.report && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="mt-3 w-full"
                  >
                    <Card className={`border-l-4 bg-[#080d17]/90 shadow-2xl relative overflow-hidden border border-white/5 ${
                      msg.report.urgency === "Critical" 
                        ? "border-l-rose-500" 
                        : msg.report.urgency === "Moderate"
                        ? "border-l-amber-500"
                        : "border-l-emerald-500"
                    }`}>
                      <div className="absolute top-4 right-4 flex items-center gap-1.5">
                        <Badge 
                          variant={msg.report.urgency === "Critical" ? "destructive" : msg.report.urgency === "Moderate" ? "warning" : "default"}
                          className="font-extrabold uppercase tracking-wider text-[8px] px-2 py-0.5"
                        >
                          {msg.report.urgency}
                        </Badge>
                      </div>

                      <CardHeader className="pb-3 border-b border-white/5 pr-24">
                        <span className="text-[8px] uppercase font-bold text-primary tracking-wider block">{t.cardTitle}</span>
                        <CardTitle className="text-sm font-extrabold text-white mt-1 leading-tight">{msg.report.diagnostic}</CardTitle>
                      </CardHeader>

                      <CardContent className="pt-4 flex flex-col gap-4 text-xs">
                        <div>
                          <h4 className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider mb-2">{t.actionsLabel}</h4>
                          <ul className="flex flex-col gap-1.5">
                            {msg.report.actions.map((act: string, idx: number) => (
                              <li key={idx} className="flex gap-2 items-start text-[11px] text-foreground/90 font-medium">
                                {msg.report?.urgency === "Critical" ? (
                                  <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                                ) : (
                                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                )}
                                <span>{act}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="pt-3 border-t border-white/5">
                          <h4 className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider mb-2">{t.specialistLabel}</h4>
                          {MOCK_DOCTORS.filter(d => d.specialty.toLowerCase() === msg.report?.recommendedSpecialty.toLowerCase()).slice(0, 1).map((doc) => (
                            <div key={doc.id} className="p-3 bg-[#0d121f]/50 border border-white/5 rounded-xl flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <img src={doc.avatar} alt={doc.name} className="h-7 w-7 rounded-full object-cover border border-white/10 shrink-0" />
                                <div>
                                  <h5 className="text-[11px] font-bold text-white leading-none">{doc.name}</h5>
                                  <span className="text-[9px] text-muted-foreground mt-0.5 block">{doc.hospital.split(",")[0]}</span>
                                </div>
                              </div>
                              <Link href="/doctors">
                                <Button size="sm" className="h-7 text-[10px] font-bold px-3 rounded-lg flex items-center gap-1.5">
                                  {t.bookBtn}
                                  <ArrowRight className="h-3 w-3" />
                                </Button>
                              </Link>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Typing/Analyzing Loader */}
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 max-w-[80%]"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-[10px] font-bold">
                A
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="bg-[#0b101c]/80 border border-white/5 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-muted-foreground flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>{activeStages[currentStage]}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={chatBottomRef} />
      </div>

      {/* Input controls panel */}
      <div className="p-4 bg-[#0b101c]/90 border-t border-white/5 flex flex-col gap-3.5 z-10">
        
        {/* Presets suggestions tags */}
        {messages.length <= 1 && (
          <div className="flex flex-col gap-2">
            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              {t.presetsTitle}
            </span>
            <div className="flex flex-wrap gap-2">
              {activePresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePresetSelect(preset.text)}
                  className="px-3 py-1.5 rounded-lg border border-white/5 bg-black/40 hover:bg-white/5 text-[10px] font-bold text-white transition-all"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          
          <Button
            type="button"
            onClick={handleReset}
            variant="outline"
            className="border-white/5 bg-black/35 hover:bg-white/5 h-10 w-10 p-0 rounded-xl shrink-0"
            title="Reset Chat"
          >
            <RotateCcw className="h-4.5 w-4.5" />
          </Button>

          <div className="flex-1 relative glass-panel bg-card/65 rounded-xl border border-white/5 flex items-center p-1.5 focus-within:border-primary/50 transition-all">
            <input
              type="text"
              placeholder={t.placeholder}
              value={symptomText}
              onChange={(e) => setSymptomText(e.target.value)}
              className="flex-1 bg-transparent border-0 text-xs text-white focus:outline-none placeholder:text-muted-foreground/60 px-2.5 h-7"
            />
            
            {/* Voice Capture */}
            <Button
              type="button"
              onClick={handleVoiceToggle}
              variant="outline"
              className={`h-7 w-7 p-0 rounded-lg shrink-0 border-white/5 transition-all ${
                isRecording ? "bg-rose-500/20 text-rose-400 animate-pulse border-rose-500/30" : "bg-black/35 hover:bg-white/5"
              }`}
            >
              <Mic className="h-3.5 w-3.5" />
            </Button>
          </div>

          <Button
            type="submit"
            disabled={!symptomText.trim() || isAnalyzing}
            className="h-10 px-4 rounded-xl bg-primary hover:bg-emerald-600 font-bold shrink-0 flex items-center justify-center"
          >
            <Send className="h-4 w-4" />
          </Button>

        </form>
      </div>

    </div>
  );
}
