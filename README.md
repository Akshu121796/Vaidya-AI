# 🩺 Vaidya.AI
### *Healthcare Without Distance – Bridging Rural India with Intelligent Digital Healthcare*

Vaidya.AI is an AI-powered healthcare ecosystem designed to improve healthcare accessibility in rural and semi-urban communities. Inspired by real-world challenges faced by understaffed healthcare systems, the platform enables digital consultations, intelligent triage, offline-first patient management, prescription digitization, and seamless communication between patients, doctors, ASHA workers, pharmacies, and healthcare administrators.

---

## 📌 Problem Statement
Rural communities often face significant barriers in accessing timely healthcare services, including:

* Long travel distances to hospitals
* Shortage of specialist doctors
* Lack of medicine availability visibility
* Fragmented patient records
* Limited internet connectivity
* Difficulty in patient follow-ups
* Manual and paper-based healthcare workflows

Patients frequently travel hours to healthcare centers only to encounter unavailable doctors, medicine shortages, or prolonged waiting periods.
Vaidya.AI aims to reduce these gaps by providing an integrated digital healthcare platform optimized for Bharat.

---

# 🚀 Features
## 👩🏻‍⚕️ AI Symptom Triage

Patients can describe symptoms in natural language.
The AI system:

* Analyzes symptoms
* Estimates urgency level
* Suggests appropriate specialists
* Recommends consultation actions
* Supports multilingual interactions

---

## 🏥 Smart Appointment System

Features include:
* Doctor discovery
* Specialist availability
* Appointment booking
* Teleconsultation scheduling
* Appointment cancellation
* Doctor queue management

---

## 👩🏻‍⚕️ ASHA Companion Dashboard

Designed for healthcare workers operating in low-connectivity environments.
Capabilities:

* Patient registration
* Symptom reporting
* Vital collection
* Appointment scheduling
* Offline-first sync mechanism
* Batch synchronization when internet becomes available

---

## 📄 Digital Prescriptions

Doctors can:
* Generate e-prescriptions
* Record medication details
* Manage dispensing status
* Maintain digital treatment history
Patients can securely access prescriptions through their Health Locker.

---

## 🔐 Health Locker

Centralized patient records including:
* Prescriptions
* Symptom reports
* Medical history
* Allergies
* Blood groups
* Emergency directives

---

## 🪪 Smart Health Card

Features:
* QR-enabled patient identification
* Quick profile retrieval
* Offline accessibility
* Emergency medical information

---

## 💊 Medicine Intelligence

Patients can:
* Search medicines
* View availability information
* Access dosage instructions
* Maintain medication history

---

## 🔔 Notification Engine

Integrated notification system powered by BullMQ.
Supports:

* Appointment reminders
* Follow-up notifications
* Clinical alerts
* Telegram integrations *(in progress)*

---

## 📊 Admin Analytics Dashboard

Healthcare administrators can monitor:
* Disease trends
* Patient statistics
* Appointment loads
* Resource utilization
* Community health patterns

---

# 🛠 Tech Stack
### Frontend

* Next.js 15
* TypeScript
* TailwindCSS
* Zustand

### Backend
* Fastify
* TypeScript
* Zod
* BullMQ

### Database
* Supabase PostgreSQL

### AI Layer

* Python
* FastAPI
* Groq API
* HuggingFace

### Queue & Messaging
* Upstash Redis
* Telegram Bot API

### Deployment
* Vercel *(Frontend)*
* Railway *(Backend)*

---

# 🧩 Project Architecture
VaidyaAI/
│
├── README.md
├── .gitignore
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── store/
│   ├── lib/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── jobs/
│   │   ├── schemas/
│   │   └── utils/
│   │
│   ├── migrations/
│   └── package.json
│
├── aiml/
│   ├── app.py
│   ├── models/
│   ├── services/
└── .env.example

---

# 🎯 Expected Impact

* Reduce unnecessary travel for rural patients
* Improve healthcare accessibility
* Digitize patient records
* Enable low-bandwidth healthcare delivery
* Strengthen community healthcare systems
* Improve continuity of care

---

# 🔮 Future Scope

* ABHA Integration
* Voice-to-Prescription
* Predictive Scheduling
* Medicine Demand Forecasting
* Wearable Device Support
* WhatsApp Notifications
* Panchakarma & Ayurveda Modules
* Regional Language Expansion

---

# 👥 Contributors
Built with the vision of making healthcare more accessible, intelligent, and inclusive for Bharat.
