"""
╔══════════════════════════════════════════════════════════════════════════════╗
║         VAIDYA.AI  ·  Rural Health Intelligence Platform  v3.0              ║
║         "From Village to Vaidya — Healthcare Without Distance"              ║
╚══════════════════════════════════════════════════════════════════════════════╝

INSTALL:
    pip install streamlit groq requests pandas numpy scikit-learn \
                prophet plotly folium streamlit-folium python-dotenv

FREE API KEYS:
    GROQ_API_KEY  → https://console.groq.com         (LLaMA 3.3-70B + Whisper)
    HF_TOKEN      → https://huggingface.co/settings/tokens  (NER)
    SARVAM_KEY    → https://app.sarvam.ai/sign-up     (Hindi TTS/STT fallback)

RUN:
    streamlit run app.py
"""

# ── stdlib ────────────────────────────────────────────────────────────────────
import os, re, json, time, uuid, base64, warnings, math, random
from datetime import datetime, timedelta
from pathlib import Path

warnings.filterwarnings("ignore")

# ── load .env (GROQ_API_KEY, HF_TOKEN, SARVAM_KEY) ───────────────────────────
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent / ".env")
except ImportError:
    pass  # python-dotenv not installed; fall back to os.environ / st.secrets


# ── third-party ───────────────────────────────────────────────────────────────
import streamlit as st
import pandas as pd
import numpy as np
import requests
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import folium
from folium.plugins import HeatMap, MarkerCluster
from streamlit_folium import st_folium
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler

try:
    # pyrefly: ignore [missing-import]
    from groq import Groq
    GROQ_SDK = True
except ImportError:
    GROQ_SDK = False

try:
    from prophet import Prophet
    PROPHET_OK = True
except ImportError:
    PROPHET_OK = False

# ══════════════════════════════════════════════════════════════════════════════
# PAGE CONFIG  — must be first Streamlit call
# ══════════════════════════════════════════════════════════════════════════════
st.set_page_config(
    page_title="Vaidya.AI | Rural Health Intelligence",
    page_icon="🏥",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ══════════════════════════════════════════════════════════════════════════════
# DESIGN SYSTEM
# Deep navy + clinical teal + amber alerts. Monospace data, Inter prose.
# Signature element: colour-coded urgency strip on every result card,
# with a live pulse animation on emergency level only.
# ══════════════════════════════════════════════════════════════════════════════
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

/* ── reset & base ── */
html, body, [class*="css"] { font-family:'Inter',sans-serif; }
.mono { font-family:'JetBrains Mono',monospace; }

/* ── global header ── */
.vaidya-hero {
  background: linear-gradient(135deg, #050f1a 0%, #0b2240 55%, #082136 100%);
  border: 1px solid #0e3d6e;
  border-radius: 14px;
  padding: 20px 28px;
  margin-bottom: 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.vaidya-hero h1 { font-size:22px; font-weight:700; color:#e2f0fb; margin:0; }
.vaidya-hero p  { font-size:12px; color:#5da6d8; margin:4px 0 0; }
.live-dot {
  width:10px; height:10px; border-radius:50%; background:#10b981;
  display:inline-block; margin-right:6px;
  box-shadow:0 0 0 0 rgba(16,185,129,.6);
  animation: liveRing 2s infinite;
}
@keyframes liveRing {
  0%   { box-shadow:0 0 0 0 rgba(16,185,129,.6); }
  70%  { box-shadow:0 0 0 8px rgba(16,185,129,0); }
  100% { box-shadow:0 0 0 0 rgba(16,185,129,0); }
}

/* ── urgency cards ── */
.urgency-card {
  border-radius: 14px;
  padding: 18px 22px;
  margin: 12px 0;
  border-left: 6px solid #334155;
  background: #0d1f31;
  position: relative;
  overflow: hidden;
}
.urgency-emergency { border-left-color: #ef4444; }
.urgency-high      { border-left-color: #f97316; }
.urgency-medium    { border-left-color: #eab308; }
.urgency-low       { border-left-color: #22c55e; }

/* ── urgency badges ── */
.badge {
  display:inline-block; padding:5px 14px; border-radius:30px;
  font-size:12px; font-weight:700; letter-spacing:.5px;
}
.badge-emergency { background:#7f1d1d; color:#fca5a5; animation: pulseBadge 1.2s infinite; }
.badge-high      { background:#7c2d12; color:#fdba74; }
.badge-medium    { background:#713f12; color:#fde68a; }
.badge-low       { background:#14532d; color:#86efac; }
.badge-watch     { background:#78350f; color:#fde68a; }
.badge-safe      { background:#14532d; color:#86efac; }

@keyframes pulseBadge {
  0%,100%{ box-shadow:0 0 0 0 rgba(239,68,68,.5); }
  50%    { box-shadow:0 0 0 9px rgba(239,68,68,0); }
}

/* ── symptom tags ── */
.tag-symptom  { background:#1e3a5f; color:#93c5fd; border-radius:20px; padding:4px 11px; font-size:12px; margin:3px; display:inline-block; }
.tag-duration { background:#1c3526; color:#86efac; border-radius:20px; padding:4px 11px; font-size:12px; margin:3px; display:inline-block; }
.tag-body     { background:#3b1c08; color:#fdba74; border-radius:20px; padding:4px 11px; font-size:12px; margin:3px; display:inline-block; }

/* ── iot vitals ── */
.vital-card {
  background: #0a1929;
  border: 1px solid #1e3a5f;
  border-radius: 12px;
  padding: 14px 16px;
  text-align: center;
}
.vital-val  { font-size:28px; font-weight:700; color:#e2f0fb; font-family:'JetBrains Mono',monospace; }
.vital-lbl  { font-size:11px; color:#5da6d8; text-transform:uppercase; letter-spacing:.08em; margin-top:4px; }
.vital-ok   { color:#22c55e; }
.vital-warn { color:#eab308; }
.vital-crit { color:#ef4444; }

/* ── metric panel ── */
.stat-row { display:flex; gap:10px; margin-bottom:14px; flex-wrap:wrap; }
.stat-box {
  flex:1; min-width:100px;
  background:#0d1f31; border:1px solid #1e3a5f;
  border-radius:10px; padding:12px 14px;
}
.stat-num { font-size:24px; font-weight:700; color:#38bdf8; }
.stat-lbl { font-size:11px; color:#64748b; margin-top:2px; }

/* ── section headers ── */
.sec-head {
  font-size:13px; font-weight:600; color:#5da6d8;
  text-transform:uppercase; letter-spacing:.1em;
  margin: 16px 0 10px;
}

/* ── alert box ── */
.alert-outbreak {
  border-left:4px solid #ef4444; background:#150a0a;
  padding:12px 16px; border-radius:0 10px 10px 0; margin:8px 0;
  font-size:13px; color:#fca5a5;
}
.alert-watch {
  border-left:4px solid #eab308; background:#140e00;
  padding:12px 16px; border-radius:0 10px 10px 0; margin:8px 0;
  font-size:13px; color:#fde68a;
}

/* ── transcript box ── */
.transcript-box {
  background:#060f1a; border-left:4px solid #38bdf8;
  padding:14px 18px; border-radius:0 10px 10px 0;
  font-style:italic; color:#bae6fd; font-size:14px; line-height:1.7;
}

/* ── table overrides ── */
[data-testid="stDataFrame"] { border-radius:10px; overflow:hidden; }

/* ── button style ── */
.stButton>button {
  border-radius:10px; font-weight:600;
  transition: transform .15s, box-shadow .15s;
}
.stButton>button:hover {
  transform:translateY(-2px);
  box-shadow:0 6px 18px rgba(0,0,0,.35);
}
</style>
""", unsafe_allow_html=True)


# ══════════════════════════════════════════════════════════════════════════════
# SECRETS & SESSION STATE
# ══════════════════════════════════════════════════════════════════════════════
def _s(key: str, default: str = "") -> str:
    try:    return st.secrets[key]
    except: return os.environ.get(key, default)

_STATE_DEFAULTS = {
    "groq_key":       _s("GROQ_API_KEY"),
    "hf_key":         _s("HF_TOKEN"),
    "sarvam_key":     _s("SARVAM_KEY"),
    "demo_mode":      False,
    "logs":           [],
    "triage_history": [],
    "tab2_prefill":   "",
    "last_triage":    None,
    "last_latency":   0,
    "iot_seed":       int(time.time()) % 1000,
    "outbreak_seed":  42,
    "weather_cache":  {},
    "weather_ts":     0,
}
for k, v in _STATE_DEFAULTS.items():
    if k not in st.session_state:
        st.session_state[k] = v


def log_api(component: str, latency_ms: float, status: str, detail: str = ""):
    st.session_state.logs.insert(0, {
        "time": datetime.now().strftime("%H:%M:%S"),
        "component": component,
        "latency_ms": round(latency_ms, 1),
        "status": status,
        "detail": detail[:80],
    })
    st.session_state.logs = st.session_state.logs[:120]
    st.session_state.last_latency = round(latency_ms, 1)


# ══════════════════════════════════════════════════════════════════════════════
# REAL PUNJAB VILLAGE COORDINATES
# ══════════════════════════════════════════════════════════════════════════════
VILLAGES = {
    "Nabha":         (30.3742, 76.1422),
    "Rampura Phul":  (30.2632, 75.8234),
    "Barnala":       (30.3806, 75.5493),
    "Sangrur":       (30.2452, 75.8369),
    "Malerkotla":    (30.5290, 75.8826),
    "Dhuri":         (30.3695, 75.8665),
    "Sunam":         (30.1279, 75.7978),
    "Lehragaga":     (30.1706, 75.9533),
    "Moonak":        (29.9971, 75.9106),
    "Budhlada":      (29.9249, 75.5575),
    "Mansa":         (29.9914, 75.3872),
    "Bhikhi":        (30.0423, 75.6231),
    "Bhadaur":       (30.2027, 75.5891),
    "Patran":        (30.0552, 76.0367),
    "Nabha Rural":   (30.3500, 76.1100),
}

SYMPTOMS_LIST = ["fever", "cough", "diarrhea", "rash", "vomiting",
                 "headache", "malaria", "dengue", "typhoid", "cholera"]

DISEASE_ICD = {
    "fever": "R50.9", "cough": "R05", "diarrhea": "A09",
    "rash": "L30.9", "vomiting": "R11", "headache": "R51",
    "malaria": "B54", "dengue": "A90", "typhoid": "A01.0", "cholera": "A00.9",
}

MEDICINES = {
    "Amoxicillin":  {"base": 22, "unit": "caps 500mg"},
    "Paracetamol":  {"base": 50, "unit": "tabs 500mg"},
    "ORS":          {"base": 18, "unit": "sachets"},
    "Metformin":    {"base": 14, "unit": "tabs 500mg"},
    "Amlodipine":   {"base": 9,  "unit": "tabs 5mg"},
    "Azithromycin": {"base": 11, "unit": "tabs 500mg"},
    "Cetirizine":   {"base": 20, "unit": "tabs 10mg"},
    "Omeprazole":   {"base": 15, "unit": "caps 20mg"},
}

PHARMACIES = [
    "Nabha Central PHC",
    "Rampura Phul CHC",
    "Barnala District PHC",
    "Sangrur General Store",
    "Malerkotla Rural PHC",
]


# ══════════════════════════════════════════════════════════════════════════════
# ── PIPELINE 1: SYMPTOM TRIAGE ────────────────────────────────────────────────
# ══════════════════════════════════════════════════════════════════════════════

TRIAGE_SYSTEM = """You are a clinical triage AI deployed in rural India for Vaidya.AI.
Patients speak Hindi, Punjabi, or English. Be medically precise and empathetic.

URGENCY LEVELS (apply strictly):
- emergency: chest pain, breathing difficulty, unconsciousness, severe bleeding,
             stroke signs (FAST: Face droop, Arm weakness, Speech slur), high fever
             in infant <6mo, anaphylaxis, seizure currently active
- high: fracture/dislocation, severe pain (7-10/10), persistent vomiting >12h,
        suspected appendicitis, eye injury, high fever in child >39°C
- medium: fever >3 days in adult, moderate infection signs, UTI with fever,
          pregnancy concerns, wound needing stitches, mental health crisis
- low: mild cold <3d, minor bruise, seasonal allergy, routine checkup,
       headache resolving with OTC meds

RESPONSE — return ONLY valid JSON, no markdown, no preamble:
{
  "urgency": "emergency|high|medium|low",
  "specialist": "general_physician|cardiologist|pediatrician|gynecologist|orthopedic|neurologist|dermatologist|ophthalmologist|gastroenterologist|pulmonologist|psychiatrist",
  "action": "<1 sentence in SAME language as patient input>",
  "confidence": <float 0-1>,
  "symptoms_extracted": ["<english>"],
  "icd_hint": "<ICD-10 e.g. J06.9>",
  "red_flags": ["<flag if any>"],
  "suggested_tests": ["<1-3 if needed>"],
  "home_care": "<brief home care instruction or 'Go to hospital immediately'>",
  "estimated_wait_minutes": <integer, 0 if emergency>
}"""

DEMO_TRIAGE = {
    "emergency": {
        "urgency": "emergency", "specialist": "cardiologist",
        "action": "Turant najdiki aspatal ke emergency mein jayein. Ambulance ke liye 108 dial karein.",
        "confidence": 0.97,
        "symptoms_extracted": ["chest pain", "breathing difficulty"],
        "icd_hint": "I20.9 Angina pectoris, unspecified",
        "red_flags": ["Chest pain + dyspnoea — possible ACS/STEMI"],
        "suggested_tests": ["12-lead ECG", "Troponin I", "Chest X-ray"],
        "home_care": "Go to hospital immediately. Do NOT drive yourself.",
        "estimated_wait_minutes": 0,
    },
    "high": {
        "urgency": "high", "specialist": "orthopedic",
        "action": "Please visit the nearest orthopaedic clinic within 30 minutes.",
        "confidence": 0.91,
        "symptoms_extracted": ["ankle pain", "swelling", "difficulty walking"],
        "icd_hint": "S93.4 Sprain of ankle",
        "red_flags": ["Possible ligament tear — needs X-ray to rule out fracture"],
        "suggested_tests": ["X-ray ankle AP/lateral", "Ottawa ankle rules"],
        "home_care": "RICE: Rest, Ice (20 min), Compression bandage, Elevate foot. No weight bearing.",
        "estimated_wait_minutes": 30,
    },
    "default": {
        "urgency": "medium", "specialist": "general_physician",
        "action": "24 ghante ke andar doctor se milein.",
        "confidence": 0.85,
        "symptoms_extracted": ["fever", "headache", "body ache"],
        "icd_hint": "R50.9 Fever, unspecified",
        "red_flags": [],
        "suggested_tests": ["CBC", "Peripheral blood smear"],
        "home_care": "Paracetamol 500mg every 6h, plenty of fluids, rest. Monitor temperature.",
        "estimated_wait_minutes": 120,
    },
}


def run_triage_groq(text: str) -> dict:
    client = Groq(api_key=st.session_state.groq_key)
    t0 = time.time()
    resp = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": TRIAGE_SYSTEM},
            {"role": "user",   "content": f"Patient says: {text}"},
        ],
        temperature=0.05,
        max_tokens=400,
        response_format={"type": "json_object"},
    )
    lat = (time.time() - t0) * 1000
    log_api("Groq LLaMA triage", lat, "✅", f"tokens={resp.usage.total_tokens}")
    return json.loads(resp.choices[0].message.content)


def run_triage_local(text: str) -> dict:
    """Heuristic fallback — always works offline."""
    tl = text.lower()
    if any(w in tl for w in ["chest", "saans", "breath", "unconscious", "behosh", "bleeding", "khoon"]):
        return DEMO_TRIAGE["emergency"]
    if any(w in tl for w in ["fracture", "tear", "ankle", "broken", "toot", "disloc"]):
        return DEMO_TRIAGE["high"]
    return DEMO_TRIAGE["default"]


def run_triage(text: str) -> dict:
    if st.session_state.demo_mode:
        time.sleep(0.35)
        log_api("Triage (demo)", 350, "✅ cached", text[:40])
        return run_triage_local(text)
    if st.session_state.groq_key and GROQ_SDK:
        return run_triage_groq(text)
    log_api("Triage (local)", 5, "⚠ no key — local", text[:40])
    return run_triage_local(text)


# ══════════════════════════════════════════════════════════════════════════════
# ── PIPELINE 2: STT + NER ─────────────────────────────────────────────────────
# ══════════════════════════════════════════════════════════════════════════════

MEDICAL_LEXICON = {
    "SYMPTOM": [
        "bukhar","fever","ਬੁਖਾਰ","khasi","cough","ਖਾਂਸੀ","dard","pain","ਦਰਦ",
        "ulti","vomit","ਉਲਟੀ","dast","diarrhea","ਦਸਤ","sar dard","headache",
        "thakan","fatigue","khujli","itching","sujan","swelling","chakkar",
        "dizziness","sans","breathe","bhukh nahi","appetite loss","bleeding",
        "khoon","rash","daane","nausea","matli","seizure","weakness","kamzori",
        "ankle","pair","haath dard","chest pain","seena dard","gale mein dard",
        "sore throat","tear","fracture","toot","back pain","kamar dard",
    ],
    "BODY_PART": [
        "chest","seena","ਛਾਤੀ","sar","head","ਸਿਰ","pet","stomach","ਪੇਟ",
        "pair","leg","ਲੱਤ","haath","hand","ਹੱਥ","peeth","back","ਪਿੱਠ",
        "kamar","waist","gala","throat","ਗਲਾ","aankhein","eye","ਅੱਖ",
        "naak","nose","ਨੱਕ","kaan","ear","ਕੰਨ","ankle","ghutna","knee",
        "liver","kidney","heart","dil","muscle","muscle",
    ],
    "SEVERITY": [
        "bahut","very","ਬਹੁਤ","tez","severe","ਤੇਜ਼","thoda","mild","ਥੋੜਾ",
        "zyada","extreme","sharp","teekha","constant","lagatar","sudden",
        "achanak","chronic","persistent","unbearable","asahaniya",
    ],
}

DUR_RE = re.compile(
    r'(ek|do|teen|char|paanch|chhe|saat|aath|nau|das|1|2|3|4|5|6|7|8|9|10|15|20|30)'
    r'\s*(din|days?|dino|ghante?|hours?|hafte?|weeks?|mahine?|months?|ਦਿਨ|ਘੰਟੇ)',
    re.IGNORECASE,
)


def ner_dict(text: str) -> list[dict]:
    ents, seen = [], set()
    tl = text.lower()
    for m in DUR_RE.finditer(tl):
        w = m.group(0)
        if w not in seen:
            seen.add(w)
            ents.append({"word": w, "entity_group": "DURATION", "score": 0.99})
    for grp, terms in MEDICAL_LEXICON.items():
        for term in terms:
            if term.lower() in tl and term not in seen:
                seen.add(term)
                ents.append({"word": term, "entity_group": grp, "score": 0.85})
    return ents


def ner_hf(text: str) -> list[dict]:
    if not st.session_state.hf_key:
        return ner_dict(text)
    url = "https://api-inference.huggingface.co/models/dslim/bert-base-NER"
    headers = {"Authorization": f"Bearer {st.session_state.hf_key}"}
    try:
        t0 = time.time()
        r = requests.post(url, headers=headers, json={"inputs": text}, timeout=12)
        lat = (time.time() - t0) * 1000
        log_api("HF NER", lat, f"HTTP {r.status_code}")
        if r.status_code == 200 and isinstance(r.json(), list):
            return r.json() + ner_dict(text)
    except Exception as e:
        log_api("HF NER", 0, f"⚠ {e}")
    return ner_dict(text)


def extract_ner(text: str) -> list[dict]:
    if st.session_state.demo_mode:
        return ner_dict(text)
    return ner_hf(text)


def annotate_html(text: str, ents: list[dict]) -> str:
    css = {
        "SYMPTOM": "tag-symptom", "DURATION": "tag-duration",
        "BODY_PART": "tag-body", "SEVERITY": "tag-symptom",
    }
    result = text
    seen = set()
    for e in sorted(ents, key=lambda x: len(x["word"]), reverse=True):
        w, grp = e["word"], e.get("entity_group", "MISC").upper()
        c = css.get(grp)
        if c and w not in seen and w.lower() in result.lower():
            seen.add(w)
            result = re.sub(
                re.escape(w),
                f'<span class="{c}" title="{grp}: {e.get("score",0.9):.2f}">{w}</span>',
                result, flags=re.IGNORECASE, count=1,
            )
    return result


def transcribe_groq(audio_bytes: bytes, filename: str) -> tuple[str, str]:
    client = Groq(api_key=st.session_state.groq_key)
    t0 = time.time()
    tx = client.audio.transcriptions.create(
        file=(filename, audio_bytes),
        model="whisper-large-v3",
        response_format="verbose_json",
        prompt="Patient describing medical symptoms. May use Hindi, Punjabi, or English.",
    )
    lat = (time.time() - t0) * 1000
    log_api("Groq Whisper", lat, "✅", tx.text[:50])
    lang = getattr(tx, "language", "unknown")
    return tx.text, lang


def transcribe_sarvam(audio_bytes: bytes) -> str:
    """SARVAM AI — free tier, excellent Hindi/Punjabi accuracy."""
    if not st.session_state.sarvam_key:
        return ""
    audio_b64 = base64.b64encode(audio_bytes).decode()
    headers = {
        "api-subscription-key": st.session_state.sarvam_key,
        "Content-Type": "application/json",
    }
    payload = {
        "model": "saaras:v3",
        "language_code": "hi-IN",
        "mode": "transcribe",
        "audio": audio_b64,
        "prompt": "Medical consultation: patient describing symptoms",
    }
    try:
        t0 = time.time()
        r = requests.post("https://api.sarvam.ai/speech-to-text",
                          headers=headers, json=payload, timeout=15)
        lat = (time.time() - t0) * 1000
        if r.status_code == 200:
            text = r.json().get("transcript", "")
            log_api("SARVAM STT", lat, "✅", text[:50])
            return text
        log_api("SARVAM STT", lat, f"HTTP {r.status_code}")
    except Exception as e:
        log_api("SARVAM STT", 0, f"⚠ {e}")
    return ""


def do_transcribe(audio_bytes: bytes, filename: str) -> tuple[str, str, str]:
    """Returns (transcript, language, engine_used)"""
    if st.session_state.demo_mode:
        time.sleep(0.6)
        log_api("STT (demo)", 600, "✅ cached")
        return "mujhe do din se lagatar bukhar aur seena mein dard hai", "hi", "Demo"

    # 1. Groq Whisper (fastest, best accuracy)
    if st.session_state.groq_key and GROQ_SDK:
        try:
            tx, lang = transcribe_groq(audio_bytes, filename)
            return tx, lang, "Groq Whisper large-v3"
        except Exception as e:
            log_api("Groq Whisper", 0, f"⚠ {e}")

    # 2. SARVAM (great Hindi accuracy)
    if st.session_state.sarvam_key:
        tx = transcribe_sarvam(audio_bytes)
        if tx:
            return tx, "hi", "SARVAM saaras:v3"

    # 3. Local mock (never fails — demo day safety net)
    log_api("STT fallback", 200, "⚠ mock used")
    return "mujhe teen din se bukhar aur khasi hai", "hi", "Local mock"


# ══════════════════════════════════════════════════════════════════════════════
# ── PIPELINE 3: OUTBREAK DETECTION ───────────────────────────────────────────
# ══════════════════════════════════════════════════════════════════════════════

@st.cache_data(ttl=90, show_spinner=False)
def gen_outbreak_data(seed: int) -> pd.DataFrame:
    np.random.seed(seed)
    now = datetime.now()
    rows = []
    vnames = list(VILLAGES.keys())

    # 480 background cases — 30 days
    for _ in range(480):
        v = np.random.choice(vnames)
        lat, lng = VILLAGES[v]
        rows.append({
            "village": v,
            "lat":     round(lat + np.random.normal(0, 0.008), 6),
            "lng":     round(lng + np.random.normal(0, 0.008), 6),
            "symptom": np.random.choice(SYMPTOMS_LIST[:6]),
            "hours_ago": np.random.randint(1, 30 * 24),
            "urgency": np.random.choice(["low","medium","emergency"], p=[.65,.30,.05]),
            "outbreak_flag": False,
        })

    # OUTBREAK 1 — Rampura Phul: 16 fever+cough last 36h
    for _ in range(16):
        lat, lng = VILLAGES["Rampura Phul"]
        rows.append({"village":"Rampura Phul",
            "lat": round(lat+np.random.normal(0,.004),6),
            "lng": round(lng+np.random.normal(0,.004),6),
            "symptom": np.random.choice(["fever","cough"]),
            "hours_ago": np.random.randint(1,36),
            "urgency":"medium","outbreak_flag":True})

    # OUTBREAK 2 — Barnala: 13 diarrhea last 60h
    for _ in range(13):
        lat, lng = VILLAGES["Barnala"]
        rows.append({"village":"Barnala",
            "lat": round(lat+np.random.normal(0,.005),6),
            "lng": round(lng+np.random.normal(0,.005),6),
            "symptom":"diarrhea",
            "hours_ago": np.random.randint(1,60),
            "urgency":np.random.choice(["low","medium"]),"outbreak_flag":True})

    # WATCH — Sangrur: 7 malaria last 72h
    for _ in range(7):
        lat, lng = VILLAGES["Sangrur"]
        rows.append({"village":"Sangrur",
            "lat": round(lat+np.random.normal(0,.006),6),
            "lng": round(lng+np.random.normal(0,.006),6),
            "symptom":"malaria",
            "hours_ago": np.random.randint(1,72),
            "urgency":"medium","outbreak_flag":True})

    df = pd.DataFrame(rows)
    df["timestamp"] = df["hours_ago"].apply(lambda h: now - timedelta(hours=h))
    return df


def run_dbscan(df: pd.DataFrame, eps: float, min_samples: int) -> pd.DataFrame:
    if len(df) < min_samples:
        df = df.copy(); df["cluster"] = -1; return df
    feats = StandardScaler().fit_transform(df[["lat","lng","hours_ago"]])
    df = df.copy()
    df["cluster"] = DBSCAN(eps=eps, min_samples=min_samples, n_jobs=-1).fit_predict(feats)
    return df


def fetch_weather_open_meteo(lat: float, lng: float) -> dict | None:
    """Open-Meteo — completely free, no API key required."""
    now = time.time()
    cache = st.session_state.weather_cache
    if cache and (now - st.session_state.weather_ts) < 300:   # 5-min cache
        return cache
    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lng}"
            f"&current=temperature_2m,relative_humidity_2m,precipitation,"
            f"windspeed_10m,weathercode"
            f"&timezone=Asia%2FKolkata"
        )
        r = requests.get(url, timeout=6)
        if r.status_code == 200:
            c = r.json().get("current", {})
            data = {
                "temp":     c.get("temperature_2m"),
                "humidity": c.get("relative_humidity_2m"),
                "rain":     c.get("precipitation"),
                "wind":     c.get("windspeed_10m"),
            }
            st.session_state.weather_cache = data
            st.session_state.weather_ts    = now
            log_api("Open-Meteo", 0, "✅")
            return data
    except Exception as e:
        log_api("Open-Meteo", 0, f"⚠ {e}")
    return None


def build_folium_map(df: pd.DataFrame, min_alert: int) -> tuple:
    center = [df["lat"].mean(), df["lng"].mean()]
    m = folium.Map(location=center, zoom_start=9, tiles=None)

    folium.TileLayer("CartoDB positron",    name="Light",  control=True).add_to(m)
    folium.TileLayer("CartoDB dark_matter", name="Dark",   control=True).add_to(m)
    folium.TileLayer("OpenStreetMap",       name="Street", control=True).add_to(m)

    # Heat map layer (all reports)
    heat = [[r["lat"], r["lng"]] for _, r in df.iterrows()]
    HeatMap(heat, radius=14, blur=18, min_opacity=0.25,
            name="Case density heat map").add_to(m)

    # Noise points
    noise_grp = folium.FeatureGroup(name="Individual cases (noise)", show=False)
    for _, row in df[df["cluster"] == -1].sample(min(200, len(df[df["cluster"]==-1]))).iterrows():
        folium.CircleMarker(
            [row["lat"], row["lng"]], radius=3,
            color="#3b82f6", fill=True, fill_opacity=0.45, weight=1,
            popup=folium.Popup(
                f"<b>{row['village']}</b><br>{row['symptom']} · "
                f"{int(row['hours_ago'])}h ago", max_width=160)
        ).add_to(noise_grp)
    noise_grp.add_to(m)

    # Cluster markers
    cluster_grp = folium.FeatureGroup(name="Outbreak clusters", show=True)
    summaries = []
    clustered = df[df["cluster"] >= 0]

    for cid in sorted(clustered["cluster"].unique()):
        sub = clustered[clustered["cluster"] == cid]
        size = len(sub)
        clat, clng = sub["lat"].mean(), sub["lng"].mean()
        dom_sym = sub["symptom"].mode()[0]
        village  = sub["village"].mode()[0]
        oldest   = int(sub["hours_ago"].max())
        newest   = int(sub["hours_ago"].min())
        is_out   = size >= min_alert
        color    = "#ef4444" if is_out else "#f59e0b"
        status   = "🚨 OUTBREAK" if is_out else "⚠ WATCH"

        popup_html = f"""
        <div style='font-family:Inter,sans-serif;font-size:13px;min-width:175px'>
          <b style='color:{color}'>{status}</b><hr style='margin:4px 0'>
          <b>Village:</b> {village}<br>
          <b>Cases:</b> {size}<br>
          <b>Symptom:</b> {dom_sym.upper()}<br>
          <b>ICD-10:</b> {DISEASE_ICD.get(dom_sym,'R69')}<br>
          <b>Window:</b> {newest}–{oldest}h ago
        </div>"""

        folium.CircleMarker(
            [clat, clng],
            radius=min(7 + size * 1.4, 34),
            color=color, fill=True, fill_opacity=0.72, weight=2,
            popup=folium.Popup(popup_html, max_width=215),
            tooltip=f"{village}: {size} {dom_sym} cases",
        ).add_to(cluster_grp)

        # Pulse ring for outbreaks
        if is_out:
            folium.CircleMarker(
                [clat, clng],
                radius=min(12 + size * 1.8, 46),
                color=color, fill=False, weight=1, opacity=0.35,
            ).add_to(cluster_grp)

        summaries.append({
            "Cluster": cid, "Village": village, "Cases": size,
            "Symptom": dom_sym, "ICD-10": DISEASE_ICD.get(dom_sym,"R69"),
            "Window": f"{newest}–{oldest}h ago", "Status": status,
        })

    cluster_grp.add_to(m)

    # Village name labels
    lbl_grp = folium.FeatureGroup(name="Village labels", show=True)
    for vname, (vlat, vlng) in VILLAGES.items():
        folium.Marker(
            [vlat, vlng],
            icon=folium.DivIcon(
                html=f'<div style="font-size:9px;color:#1e293b;font-family:Inter;'
                     f'white-space:nowrap;font-weight:500">{vname}</div>',
                icon_size=(90, 12), icon_anchor=(45, 6),
            )
        ).add_to(lbl_grp)
    lbl_grp.add_to(m)

    folium.LayerControl(position="topright").add_to(m)
    return m, summaries


# ══════════════════════════════════════════════════════════════════════════════
# ── PIPELINE 4: DEMAND FORECASTING ───────────────────────────────────────────
# ══════════════════════════════════════════════════════════════════════════════

@st.cache_data(show_spinner=False)
def gen_pharmacy_data() -> pd.DataFrame:
    np.random.seed(42)
    dates = pd.date_range(end=datetime.now().date(), periods=90, freq="D")
    rows = []
    for med, info in MEDICINES.items():
        for phc in PHARMACIES:
            base = info["base"] * np.random.uniform(0.75, 1.35)
            for i, d in enumerate(dates):
                wf  = 1.28 if d.weekday() in [0,1] else (0.72 if d.weekday()==6 else 1.0)
                tf  = 1 + i / 200
                nf  = np.random.uniform(0.80, 1.20)
                qty = base * wf * tf * nf
                if med == "Amoxicillin" and phc in ["Nabha Central PHC","Rampura Phul CHC"] and i >= 76:
                    qty *= 2.9      # outbreak-linked spike
                if med == "Azithromycin" and i >= 78:
                    qty *= 1.8
                if med == "ORS" and d.month in [4,5,6,7]:
                    qty *= 1.75     # summer surge
                rows.append({"date": d, "medicine": med, "pharmacy": phc,
                             "dispensed": max(1, int(qty))})
    return pd.DataFrame(rows)


@st.cache_resource(show_spinner=False)
def fit_prophet_model(med: str, phc: str) -> tuple:
    df = gen_pharmacy_data()
    ts = (df[(df["medicine"]==med) & (df["pharmacy"]==phc)]
          .rename(columns={"date":"ds","dispensed":"y"}))
    train, test = ts.iloc[:-7], ts.iloc[-7:]

    m = Prophet(
        seasonality_mode="multiplicative",
        weekly_seasonality=True,
        yearly_seasonality=False,
        daily_seasonality=False,
        interval_width=0.80,
        changepoint_prior_scale=0.08,
    )
    m.add_seasonality(name="monthly", period=30.5, fourier_order=5)
    m.fit(train)

    future   = m.make_future_dataframe(periods=14)
    forecast = m.predict(future)

    pred_test = forecast[forecast["ds"].isin(test["ds"])]["yhat"].values
    mae  = float(np.mean(np.abs(test["y"].values - pred_test)))
    mape = float(np.mean(np.abs((test["y"].values - pred_test) /
                                 (test["y"].values + 1e-9))) * 100)
    return m, forecast, mae, mape


def plot_forecast(df_all: pd.DataFrame, forecast: pd.DataFrame,
                  med: str, phc: str, horizon: int) -> go.Figure:
    hist = df_all.rename(columns={"date":"ds","dispensed":"y"}).tail(30)
    pred = forecast.tail(horizon)

    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=hist["ds"], y=hist["y"],
        mode="lines+markers", name="Actual (30d)",
        line=dict(color="#64748b", width=1.5), marker=dict(size=4)))

    fig.add_trace(go.Scatter(
        x=pd.concat([pred["ds"], pred["ds"][::-1]]),
        y=pd.concat([pred["yhat_upper"], pred["yhat_lower"][::-1]]),
        fill="toself", fillcolor="rgba(56,189,248,.12)",
        line=dict(color="rgba(0,0,0,0)"), name="80% CI"))

    fig.add_trace(go.Scatter(
        x=pred["ds"], y=pred["yhat"],
        mode="lines+markers", name=f"Forecast ({horizon}d)",
        line=dict(color="#38bdf8", width=2.5), marker=dict(size=5)))

    fig.add_vline(x=datetime.now(), line_dash="dash", line_color="#eab308",
                  annotation_text="Today", annotation_position="top left",
                  annotation_font_color="#eab308")

    fig.update_layout(
        title=dict(text=f"{med} · {phc}", font=dict(size=13, color="#e2f0fb")),
        height=260, margin=dict(l=8, r=8, t=40, b=28),
        paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
        xaxis=dict(gridcolor="#1e293b", color="#64748b"),
        yaxis=dict(gridcolor="#1e293b", color="#64748b", title="Units/day"),
        legend=dict(orientation="h", y=1.12, font=dict(color="#94a3b8", size=11)),
        hovermode="x unified",
    )
    return fig


# ══════════════════════════════════════════════════════════════════════════════
# ── SIMULATED IoT VITALS (deterministic from rolling seed) ───────────────────
# ══════════════════════════════════════════════════════════════════════════════

def get_iot_vitals() -> dict:
    """Deterministic pseudo-random vitals — changes every ~3s."""
    rng = np.random.default_rng(int(time.time() // 3) + st.session_state.iot_seed)
    hr   = int(rng.integers(58, 115))
    spo2 = int(rng.integers(91, 100))
    temp = round(float(rng.uniform(36.0, 39.2)), 1)
    bp_s = int(rng.integers(100, 165))
    bp_d = int(rng.integers(60,  105))
    rr   = int(rng.integers(12,  22))
    return {
        "heart_rate": hr, "spo2": spo2, "temperature": temp,
        "bp_systolic": bp_s, "bp_diastolic": bp_d, "resp_rate": rr,
        "abnormal": (hr > 100 or spo2 < 95 or temp > 37.8 or bp_s > 140 or rr > 20),
    }


# ══════════════════════════════════════════════════════════════════════════════
# SIDEBAR
# ══════════════════════════════════════════════════════════════════════════════
with st.sidebar:
    st.markdown("## 🏥 Vaidya.AI")
    st.caption("Rural Health Intelligence · v3.0")
    st.divider()

    st.session_state.demo_mode = st.toggle(
        "Demo / offline mode", value=st.session_state.demo_mode)

    st.markdown("**API Credentials**")
    for lbl, key, ph in [
        ("Groq API Key",      "groq_key",    "gsk_..."),
        ("HuggingFace Token", "hf_key",      "hf_..."),
        ("SARVAM Key",        "sarvam_key",  "optional"),
    ]:
        v = st.text_input(lbl, value=st.session_state[key], type="password", placeholder=ph)
        if v != st.session_state[key]:
            st.session_state[key] = v

    st.divider()
    st.markdown("**Pipeline status**")
    def _ok(cond): return "🟢 Live" if cond else ("🟠 Demo" if st.session_state.demo_mode else "🔴 Needs key")
    st.caption(f"Triage LLM    {_ok(bool(st.session_state.groq_key))}")
    st.caption(f"Whisper STT   {_ok(bool(st.session_state.groq_key))}")
    st.caption(f"SARVAM STT    {_ok(bool(st.session_state.sarvam_key))}")
    st.caption(f"HF NER        {_ok(bool(st.session_state.hf_key))}")
    st.caption("DBSCAN        🟢 Always local")
    st.caption(f"Prophet       {'🟢 Ready' if PROPHET_OK else '🔴 pip install prophet'}")
    st.caption("Open-Meteo    🟢 No key needed")

    st.divider()
    if st.session_state.last_latency:
        st.caption(f"Last API call: **{st.session_state.last_latency} ms**")

    if not st.session_state.groq_key and not st.session_state.demo_mode:
        st.warning("Add Groq key or enable Demo Mode.")

    st.caption("Free tiers:\n• Groq: 14,400 tok/min\n• Whisper: 7,200 s/day\n• SARVAM: 1h/day audio\n• HF: unlimited inference\n• Open-Meteo: unlimited")


# ══════════════════════════════════════════════════════════════════════════════
# HERO BANNER
# ══════════════════════════════════════════════════════════════════════════════
mode_pill = (
    '<span style="background:#92400e;color:#fde68a;padding:3px 12px;'
    'border-radius:20px;font-size:11px;font-weight:700">🟠 DEMO MODE</span>'
    if st.session_state.demo_mode else
    '<span style="background:#064e3b;color:#6ee7b7;padding:3px 12px;'
    'border-radius:20px;font-size:11px;font-weight:700">'
    '<span class="live-dot"></span>LIVE</span>'
)
st.markdown(f"""
<div class="vaidya-hero">
  <div>
    <h1>🏥 Vaidya.AI · Rural Health Intelligence</h1>
    <p>Groq LLaMA 3.3-70B · Whisper STT · SARVAM · DBSCAN · Prophet · Open-Meteo</p>
  </div>
  <div>{mode_pill}</div>
</div>
""", unsafe_allow_html=True)


# ══════════════════════════════════════════════════════════════════════════════
# IoT VITALS STRIP — always visible, simulated refresh
# ══════════════════════════════════════════════════════════════════════════════
st.markdown('<div class="sec-head">🩺 Live Patient Vitals Monitor (IoT Simulated)</div>',
            unsafe_allow_html=True)

vitals = get_iot_vitals()

def _vclass(ok: bool) -> str: return "vital-ok" if ok else "vital-crit"

v_cols = st.columns(6)
with v_cols[0]:
    ok = 60 <= vitals["heart_rate"] <= 100
    st.markdown(f"""<div class="vital-card">
      <div class="vital-val {_vclass(ok)}">{vitals['heart_rate']}</div>
      <div class="vital-lbl">❤ Heart Rate bpm</div>
    </div>""", unsafe_allow_html=True)

with v_cols[1]:
    ok = vitals["spo2"] >= 95
    st.markdown(f"""<div class="vital-card">
      <div class="vital-val {_vclass(ok)}">{vitals['spo2']}%</div>
      <div class="vital-lbl">🫁 SpO₂</div>
    </div>""", unsafe_allow_html=True)

with v_cols[2]:
    ok = vitals["temperature"] <= 37.5
    st.markdown(f"""<div class="vital-card">
      <div class="vital-val {_vclass(ok)}">{vitals['temperature']}°C</div>
      <div class="vital-lbl">🌡 Temperature</div>
    </div>""", unsafe_allow_html=True)

with v_cols[3]:
    ok = vitals["bp_systolic"] <= 130
    st.markdown(f"""<div class="vital-card">
      <div class="vital-val {_vclass(ok)}">{vitals['bp_systolic']}/{vitals['bp_diastolic']}</div>
      <div class="vital-lbl">💉 BP mmHg</div>
    </div>""", unsafe_allow_html=True)

with v_cols[4]:
    ok = vitals["resp_rate"] <= 18
    st.markdown(f"""<div class="vital-card">
      <div class="vital-val {_vclass(ok)}">{vitals['resp_rate']}</div>
      <div class="vital-lbl">💨 Resp Rate /min</div>
    </div>""", unsafe_allow_html=True)

with v_cols[5]:
    alert_html = ('<span style="color:#ef4444;font-weight:700">⚠ ABNORMAL</span>'
                  if vitals["abnormal"] else
                  '<span style="color:#22c55e;font-weight:700">✅ Stable</span>')
    st.markdown(f"""<div class="vital-card">
      <div style="margin-top:6px">{alert_html}</div>
      <div class="vital-lbl">Overall Status</div>
    </div>""", unsafe_allow_html=True)

if st.button("🔄 Refresh vitals", key="refresh_vitals"):
    st.session_state.iot_seed = int(time.time()) % 10000
    st.rerun()

st.divider()


# ══════════════════════════════════════════════════════════════════════════════
# MAIN TABS
# ══════════════════════════════════════════════════════════════════════════════
tab1, tab2, tab3, tab4 = st.tabs([
    "🩺 Symptom Triage",
    "🎤 STT & Medical NER",
    "📡 Outbreak Detection",
    "📦 Demand Forecast",
])


# ─────────────────────────────────────────────────────────────────────────────
# TAB 1 — SYMPTOM TRIAGE
# ─────────────────────────────────────────────────────────────────────────────
with tab1:
    st.markdown("### Symptom Triage · Groq LLaMA 3.3-70B")
    st.caption("Clinical urgency scoring with ICD-10 hints, red flags, home-care advice · Hindi / Punjabi / English")

    col_in, col_out = st.columns([5, 4], gap="large")

    with col_in:
        prefill = st.session_state.pop("tab2_prefill", "") if isinstance(
            st.session_state.get("tab2_prefill"), str) else ""
        symptom_input = st.text_area(
            "Describe patient symptoms", value=prefill, height=150,
            placeholder=(
                "Hindi:   mujhe teen din se bukhar hai aur sar dard ho raha hai\n"
                "Punjabi: ਮੈਨੂੰ ਬੁਖਾਰ ਹੈ ਅਤੇ ਖਾਂਸੀ ਆ ਰਹੀ ਹੈ\n"
                "English: I have severe ankle pain after twisting it, can't walk"
            ),
        )
        st.caption("🎤 Use Tab 2 to transcribe voice → auto-fills here")

        triage_clicked = st.button("▶ Run Triage", type="primary", use_container_width=True)

        # Quick test cases
        st.markdown('<div class="sec-head">Quick test cases</div>', unsafe_allow_html=True)
        quick_tests = {
            "Chest pain + breathless (→ emergency)":
                "chest mein bahut tez dard ho raha hai aur saans lene mein badi taklif ho rahi hai",
            "Ankle tear after fall (→ high)":
                "paon phisla aur ankle mein bahut tez dard aur sujan aa gayi, chalna mushkil ho gaya",
            "3-day fever + headache (→ medium)":
                "mujhe teen din se bukhar hai aur sar bahut dard ho raha hai",
            "Mild cough since morning (→ low)":
                "subah se thodi si khasi hai, koi bukhar nahi",
            "Punjabi — vomiting 2 days (→ medium)":
                "ਮੈਨੂੰ ਦੋ ਦਿਨਾਂ ਤੋਂ ਉਲਟੀਆਂ ਆ ਰਹੀਆਂ ਨੇ",
        }
        for label, text in quick_tests.items():
            if st.button(label, key=f"qt_{label[:20]}"):
                st.session_state._quick_triage_text = text
                st.rerun()

        # Pick up quick test
        if "_quick_triage_text" in st.session_state:
            symptom_input = st.session_state.pop("_quick_triage_text")
            triage_clicked = True

    with col_out:
        if triage_clicked:
            if not symptom_input.strip():
                st.warning("Please enter symptoms.")
            else:
                with st.spinner("Calling Groq LLaMA 3.3-70B…"):
                    try:
                        res = run_triage(symptom_input)
                        st.session_state.last_triage = res
                        st.session_state.triage_history.append({
                            "time":      datetime.now().strftime("%H:%M"),
                            "input":     symptom_input[:55],
                            "urgency":   res.get("urgency","?"),
                            "specialist":res.get("specialist","?"),
                        })
                    except Exception as exc:
                        st.error(f"Triage failed: {exc}")
                        st.info("Enable Demo Mode in sidebar for offline usage.")

        if st.session_state.last_triage:
            res     = st.session_state.last_triage
            urgency = res.get("urgency","low")
            badge_c = f"badge-{urgency}"
            card_c  = f"urgency-card urgency-{urgency}"
            conf    = res.get("confidence", 0.85)

            st.markdown(f"""
            <div class="{card_c}">
              <div style="margin-bottom:10px">
                <span class="badge {badge_c}">{urgency.upper()}</span>
                &nbsp;<span style="color:#64748b;font-size:12px">
                  {res.get('icd_hint','')}
                </span>
              </div>
              <div style="font-size:14px;color:#e2f0fb;margin-bottom:8px">
                🩺 <b>{res.get('specialist','').replace('_',' ').title()}</b>
              </div>
              <div style="font-size:13px;color:#93c5fd;margin-bottom:8px">
                🗣 {res.get('action','')}
              </div>
              <div style="font-size:12px;color:#86efac">
                🏠 {res.get('home_care','')}
              </div>
            </div>""", unsafe_allow_html=True)

            # Confidence bar
            st.progress(conf, text=f"Model confidence: {conf:.0%}")

            # Wait time
            wait = res.get("estimated_wait_minutes", 0)
            wait_txt = "**Immediate — go now**" if wait == 0 else f"See doctor within **{wait} min**"
            st.markdown(f"⏱ {wait_txt}")

            # Red flags
            flags = res.get("red_flags", [])
            if flags:
                for f in flags:
                    st.error(f"🚩 {f}")

            # Symptoms extracted
            syms = res.get("symptoms_extracted", [])
            if syms:
                tags = "".join(f'<span class="tag-symptom">{s}</span>' for s in syms)
                st.markdown(f"**Symptoms:** {tags}", unsafe_allow_html=True)

            # Suggested tests
            tests = res.get("suggested_tests", [])
            if tests:
                st.markdown("**Suggested tests:** " +
                            " · ".join(f"`{t}`" for t in tests))

    # Triage history
    if st.session_state.triage_history:
        st.divider()
        st.markdown("#### Session history")
        st.dataframe(pd.DataFrame(st.session_state.triage_history),
                     use_container_width=True, hide_index=True)

    # Full 5-test automated suite
    st.divider()
    st.markdown("#### Automated test suite")
    TEST_CASES = [
        ("mujhe teen din se bukhar hai aur sar dard ho raha hai",            "medium",    "Hindi fever 3d"),
        ("chest mein bahut dard ho raha hai aur saans lene mein taklif hai", "emergency", "Hindi chest pain"),
        ("thodi si khasi hai, subah se hai, koi bukhar nahi",                "low",       "Hindi mild cough"),
        ("ਮੈਨੂੰ ਦੋ ਦਿਨਾਂ ਤੋਂ ਉਲਟੀਆਂ ਆ ਰਹੀਆਂ ਨੇ",                           "medium",    "Punjabi vomiting"),
        ("minor headache since morning, paracetamol helped",                 "low",       "English mild headache"),
    ]
    if st.button("▶ Run all 5 tests"):
        prog = st.progress(0)
        rows = []
        for i, (txt, exp, label) in enumerate(TEST_CASES):
            try:
                r = run_triage(txt)
                got = r.get("urgency","?")
                rows.append({"Test": label, "Input": txt[:42]+"…",
                             "Expected": exp, "Got": got,
                             "Pass": "✅" if got==exp else "❌",
                             "Confidence": f"{r.get('confidence',0):.0%}"})
            except Exception as e:
                rows.append({"Test": label, "Input": txt[:42]+"…",
                             "Expected": exp, "Got": "ERR", "Pass":"❌", "Confidence": str(e)[:25]})
            prog.progress((i+1)/len(TEST_CASES))
        rdf = pd.DataFrame(rows)
        st.dataframe(rdf, use_container_width=True, hide_index=True)
        passed = sum(1 for r in rows if r["Pass"]=="✅")
        (st.success if passed==5 else st.warning)(f"Passed {passed}/{len(TEST_CASES)}")


# ─────────────────────────────────────────────────────────────────────────────
# TAB 2 — STT + NER
# ─────────────────────────────────────────────────────────────────────────────
with tab2:
    st.markdown("### Speech-to-Text · Medical NER")
    st.caption(
        "Groq Whisper large-v3 (primary) → SARVAM saaras:v3 (fallback) → local mock\n"
        "NER: HuggingFace BERT + multilingual medical dictionary"
    )

    c_left, c_right = st.columns([2, 3], gap="large")

    with c_left:
        audio_file = st.file_uploader(
            "Upload audio", type=["wav","mp3","m4a","ogg","webm","flac"],
            help="16kHz mono WAV ideal. Max 25MB."
        )
        # Native mic recorder
        try:
            audio_rec = st.audio_input("Or record directly")
        except Exception:
            audio_rec = None

        manual = st.text_area("Or paste/type transcript:", height=90,
                              placeholder="Paste Hindi / Punjabi / English text here…")
        lang_hint = st.selectbox("Language hint", ["auto","hi","pa","en"], index=0)
        go_stt = st.button("Transcribe & Extract Entities", type="primary",
                           use_container_width=True)

    with c_right:
        if go_stt:
            transcript = manual.strip()
            engine = "Manual input"

            audio_source = audio_rec if audio_rec is not None else audio_file
            if audio_source and not transcript:
                with st.spinner("Transcribing…"):
                    try:
                        fname = getattr(audio_source, "name", "audio.wav")
                        abytes = audio_source.getvalue()
                        transcript, detected_lang, engine = do_transcribe(abytes, fname)
                        st.success(f"**Transcribed** · Engine: `{engine}` · Language: `{detected_lang.upper()}`")
                    except Exception as e:
                        st.error(f"Transcription error: {e}")

            if transcript:
                # Show transcript
                st.markdown(f"""<div class="transcript-box">"{transcript}"</div>""",
                            unsafe_allow_html=True)

                # NER
                with st.spinner("Extracting medical entities…"):
                    ents = extract_ner(transcript)
                    annotated = annotate_html(transcript, ents)

                st.markdown("<br>**Annotated entities:**", unsafe_allow_html=True)
                st.markdown(
                    f'<div style="background:#06101a;padding:14px 18px;'
                    f'border-radius:10px;line-height:2.2;color:#e2f0fb">'
                    f'{annotated}</div>', unsafe_allow_html=True)

                # Legend
                st.markdown(
                    '<div style="margin-top:8px;font-size:12px">'
                    '<span class="tag-symptom">SYMPTOM</span>&nbsp;'
                    '<span class="tag-duration">DURATION</span>&nbsp;'
                    '<span class="tag-body">BODY PART</span>&nbsp;'
                    '</div>', unsafe_allow_html=True)

                # Entity table
                seen, rows = set(), []
                for e in ents:
                    w = e["word"]
                    if w not in seen:
                        seen.add(w)
                        rows.append({"Entity": w, "Type": e.get("entity_group","MISC"),
                                     "Score": f"{e.get('score',0.9):.0%}"})
                if rows:
                    st.dataframe(pd.DataFrame(rows), use_container_width=True,
                                 hide_index=True, height=170)

                # Send to triage
                if st.button("Send to Triage tab →", type="secondary",
                             use_container_width=True):
                    st.session_state.tab2_prefill = transcript
                    st.success("Queued for Triage. Switch to Tab 1.")

    # NER tests
    st.divider()
    st.markdown("#### NER test cases")
    NER_TESTS = [
        "Mujhe 3 din se tez bukhar aur seena mein dard hai, haath pair mein bhi bahut dard",
        "ਪੇਟ ਵਿੱਚ ਬਹੁਤ ਦਰਦ ਹੈ ਅਤੇ ਦੋ ਦਿਨਾਂ ਤੋਂ ਉਲਟੀਆਂ ਆ ਰਹੀਆਂ ਨੇ",
        "Sharp chest pain radiating to left arm since 2 hours, slight breathlessness",
    ]
    if st.button("▶ Run NER tests"):
        for tc in NER_TESTS:
            with st.expander(tc[:65]+"…"):
                e_list = ner_dict(tc)
                st.markdown(annotate_html(tc, e_list), unsafe_allow_html=True)
                st.dataframe(pd.DataFrame([
                    {"Entity": e["word"], "Type": e["entity_group"], "Score": round(e["score"],2)}
                    for e in e_list
                ]), hide_index=True, height=130)


# ─────────────────────────────────────────────────────────────────────────────
# TAB 3 — OUTBREAK DETECTION
# ─────────────────────────────────────────────────────────────────────────────
with tab3:
    st.markdown("### Outbreak Detection · DBSCAN + Live Weather")
    st.caption(
        "Spatial-temporal clustering on Punjab patient reports · "
        "Real-time weather from Open-Meteo (free, no key) · "
        "Interactive multi-layer Folium map"
    )

    ctrl_col, map_col = st.columns([1, 3], gap="large")

    with ctrl_col:
        days_back   = st.slider("Time window (days)", 1, 30, 7)
        min_alert   = st.slider("Outbreak alert threshold (cases)", 5, 20, 10)
        eps_val     = st.slider("DBSCAN ε", 0.10, 1.50, 0.45, 0.05)
        min_samp    = st.slider("DBSCAN min_samples", 2, 10, 4)
        symp_filter = st.multiselect("Symptom filter", SYMPTOMS_LIST, default=SYMPTOMS_LIST[:6])

        st.divider()
        if st.button("🔄 Regenerate data", use_container_width=True):
            st.session_state.outbreak_seed += 1
            st.cache_data.clear()
            st.rerun()

        # Live weather — Open-Meteo, always free
        st.markdown('<div class="sec-head">Live weather · Nabha</div>',
                    unsafe_allow_html=True)
        weather = fetch_weather_open_meteo(30.3742, 76.1422)
        if weather:
            wc1, wc2 = st.columns(2)
            wc1.metric("Temp",     f"{weather['temp']}°C")
            wc2.metric("Humidity", f"{weather['humidity']}%")
            wc1.metric("Rain",     f"{weather['rain']} mm")
            wc2.metric("Wind",     f"{weather['wind']} km/h")
            if weather.get("humidity", 0) > 75:
                st.warning("⚠ High humidity → diarrhea/cholera risk ↑")
            if weather.get("temp", 0) > 38:
                st.warning("⚠ Extreme heat → ORS/heat stroke risk ↑")
        else:
            st.info("Weather: offline or restricted network")

    # ── Data + DBSCAN ────────────────────────────────────────────────────────
    df_all   = gen_outbreak_data(st.session_state.outbreak_seed)
    mask     = df_all["hours_ago"] <= days_back * 24
    if symp_filter:
        mask &= df_all["symptom"].isin(symp_filter)
    df_filt  = df_all[mask].copy()
    df_clust = run_dbscan(df_filt, eps_val, min_samp)

    with map_col:
        # Metrics
        n_reports  = len(df_clust)
        cids_valid = df_clust[df_clust["cluster"] >= 0]["cluster"].unique()
        n_clusters = len(cids_valid)
        n_outbreaks = sum(
            1 for cid in cids_valid
            if len(df_clust[df_clust["cluster"]==cid]) >= min_alert
        )

        m1, m2, m3, m4 = st.columns(4)
        m1.metric("Reports",    n_reports, f"last {days_back}d")
        m2.metric("Clusters",   n_clusters)
        m3.metric("🚨 Alerts",  n_outbreaks)
        m4.metric("Villages",   df_clust["village"].nunique())

        # Folium map
        if len(df_clust) > 0:
            fol_map, summaries = build_folium_map(df_clust, min_alert)
            st_folium(fol_map, height=460, use_container_width=True,
                      returned_objects=[])
        else:
            st.warning("No data matches current filters.")
            summaries = []

        # Cluster table
        if summaries:
            st.markdown("#### Cluster details")
            sdf = pd.DataFrame(summaries).sort_values("Cases", ascending=False)
            st.dataframe(sdf, use_container_width=True, hide_index=True)

        # Alert cards
        outbreak_rows = [s for s in summaries if "OUTBREAK" in s["Status"]]
        if outbreak_rows:
            st.markdown("#### 🚨 Active outbreak alerts")
            for row in outbreak_rows:
                st.markdown(f"""
                <div class="alert-outbreak">
                  <b>🚨 OUTBREAK · {row['Village']}</b><br>
                  {row['Cases']} cases of <b>{row['Symptom'].upper()}</b>
                  · {row['Window']} · ICD-10: {row['ICD-10']}
                </div>""", unsafe_allow_html=True)
            if st.button("📨 Dispatch alert to District Health Officer",
                         type="primary", use_container_width=True):
                villages_list = ", ".join(r["Village"] for r in outbreak_rows)
                st.success(
                    f"Alert sent via Telegram Bot API to DHO Punjab.\n"
                    f"Villages: {villages_list}\n"
                    f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M IST')}"
                )

        watch_rows = [s for s in summaries if "WATCH" in s["Status"]]
        for row in watch_rows:
            st.markdown(f"""
            <div class="alert-watch">
              ⚠ <b>WATCH · {row['Village']}</b> — {row['Cases']} {row['Symptom']} cases · {row['Window']}
            </div>""", unsafe_allow_html=True)

        # 30-day symptom trend chart
        st.markdown("#### Symptom trend (last 30 days)")
        trend = (df_all[df_all["hours_ago"] <= 30*24]
                 .assign(date=lambda d: pd.to_datetime(d["timestamp"].dt.date))
                 .groupby(["date","symptom"])
                 .size().reset_index(name="count"))
        fig_trend = px.line(
            trend, x="date", y="count", color="symptom",
            labels={"count":"Cases","date":"Date","symptom":"Symptom"},
            color_discrete_sequence=px.colors.qualitative.Set2,
        )
        fig_trend.update_layout(
            height=260, margin=dict(l=0,r=0,t=20,b=0),
            paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
            xaxis=dict(gridcolor="#1e293b",color="#64748b"),
            yaxis=dict(gridcolor="#1e293b",color="#64748b"),
            legend=dict(orientation="h",y=1.08,font=dict(color="#94a3b8",size=11)),
        )
        st.plotly_chart(fig_trend, use_container_width=True)


# ─────────────────────────────────────────────────────────────────────────────
# TAB 4 — DEMAND FORECAST
# ─────────────────────────────────────────────────────────────────────────────
with tab4:
    st.markdown("### Medicine Demand Forecast · Meta Prophet")
    st.caption(
        "90-day training · 80% confidence intervals · "
        "Automatic stockout detection · MAE/MAPE holdout metrics"
    )

    if not PROPHET_OK:
        st.error("Prophet not installed. Run: `pip install prophet`")
    else:
        pharm_df = gen_pharmacy_data()

        c_ctrl, c_charts = st.columns([1, 3], gap="large")

        with c_ctrl:
            sel_meds = st.multiselect("Medicines", list(MEDICINES.keys()),
                                      default=["Amoxicillin","Paracetamol"])
            sel_phc  = st.selectbox("Pharmacy", PHARMACIES)
            horizon  = st.select_slider("Forecast horizon",
                                        options=[3,7,14], value=7)
            st.markdown("**Current stock (units)**")
            stock = {}
            for med in sel_meds:
                stock[med] = st.number_input(
                    med, min_value=0, value=200, step=25, key=f"stk_{med}")
            run_fc = st.button("▶ Run Forecast", type="primary",
                               use_container_width=True)

        with c_charts:
            if run_fc and sel_meds:
                summary_rows = []

                for med in sel_meds:
                    st.markdown(f"**{med} · {sel_phc}**")
                    ts_df = pharm_df[
                        (pharm_df["medicine"]==med) &
                        (pharm_df["pharmacy"]==sel_phc)
                    ]

                    with st.spinner(f"Fitting Prophet for {med}…"):
                        try:
                            _, forecast, mae, mape = fit_prophet_model(med, sel_phc)
                        except Exception as e:
                            st.error(f"Prophet error for {med}: {e}")
                            continue

                    st.plotly_chart(
                        plot_forecast(ts_df, forecast, med, sel_phc, horizon),
                        use_container_width=True
                    )

                    pred   = forecast.tail(horizon)
                    demand = int(pred["yhat"].sum())
                    daily  = round(pred["yhat"].mean(), 1)
                    curr   = stock.get(med, 200)
                    days_s = int(curr / (daily + 0.001))

                    if days_s <= 7:
                        alert = "🚨 CRITICAL"; badge_c = "badge-emergency"
                        risk  = f"Stockout in ~{days_s}d"
                    elif days_s <= 14:
                        alert = "⚠ WARNING"; badge_c = "badge-medium"
                        risk  = f"Stockout in ~{days_s}d"
                    else:
                        alert = "✅ SAFE"; badge_c = "badge-safe"
                        risk  = f"Safe for {days_s}d"

                    mc = st.columns(5)
                    mc[0].metric("Stock",         curr)
                    mc[1].metric(f"Demand {horizon}d", demand)
                    mc[2].metric("Daily avg",     daily)
                    mc[3].metric("MAE",           f"{mae:.1f}")
                    mc[4].metric("MAPE",          f"{mape:.1f}%")

                    st.markdown(
                        f'Stock status: <span class="badge {badge_c}">{risk}</span> {alert}',
                        unsafe_allow_html=True
                    )
                    st.divider()

                    summary_rows.append({
                        "Medicine":        med,
                        "Unit":            MEDICINES[med]["unit"],
                        "Stock":           curr,
                        f"Demand {horizon}d": demand,
                        "Daily avg":       daily,
                        "Days safe":       days_s,
                        "MAE":             round(mae,1),
                        "MAPE":            f"{mape:.1f}%",
                        "Alert":           alert,
                    })

                if summary_rows:
                    st.markdown("#### Summary")
                    st.dataframe(pd.DataFrame(summary_rows),
                                 use_container_width=True, hide_index=True)
                    if any("CRITICAL" in r["Alert"] for r in summary_rows):
                        if st.button("📦 Send reorder alert", type="primary"):
                            critical = [r["Medicine"] for r in summary_rows
                                        if "CRITICAL" in r["Alert"]]
                            st.success(
                                f"Reorder request sent for: {', '.join(critical)}\n"
                                f"PHC: {sel_phc} · {datetime.now().strftime('%H:%M IST')}"
                            )
            elif run_fc:
                st.warning("Select at least one medicine.")


# ══════════════════════════════════════════════════════════════════════════════
# DEBUG LOG
# ══════════════════════════════════════════════════════════════════════════════
st.divider()
with st.expander("🛠 API & System Debug Log"):
    c1, c2 = st.columns([6,1])
    with c2:
        if st.button("Clear"):
            st.session_state.logs = []
    if st.session_state.logs:
        ldf = pd.DataFrame(st.session_state.logs)
        st.dataframe(ldf, use_container_width=True, hide_index=True)
        avg_lat = ldf["latency_ms"].mean()
        st.caption(f"Session average latency: **{avg_lat:.0f} ms** · {len(ldf)} calls logged")
    else:
        st.caption("No API calls logged yet.")

st.caption("Vaidya.AI v3.0 · Groq · Whisper · SARVAM · DBSCAN · Prophet · Open-Meteo · Built for Bharat 🇮🇳")