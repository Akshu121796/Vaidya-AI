-- ============================================================
-- VAIDYA.AI — Supabase Migration SQL  (Sprint 1 & 2)
-- Run this in Supabase Dashboard → SQL Editor
-- Each section is safe to re-run (uses IF NOT EXISTS / OR REPLACE)
-- ============================================================

-- ── 1. Add qr_token to patients table ──────────────────────
ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS qr_token UUID DEFAULT gen_random_uuid() UNIQUE;

-- Back-fill existing rows
UPDATE patients SET qr_token = gen_random_uuid() WHERE qr_token IS NULL;

-- Enforce NOT NULL after back-fill
ALTER TABLE patients ALTER COLUMN qr_token SET NOT NULL;


-- ── 2. prescriptions table (Sprint 3 ready) ────────────────
CREATE TABLE IF NOT EXISTS prescriptions (
  prescription_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id   UUID REFERENCES appointments(appointment_id) ON DELETE CASCADE,
  patient_id       UUID REFERENCES patients(patient_id)         ON DELETE CASCADE,
  doctor_id        UUID REFERENCES doctors(doctor_id)           ON DELETE CASCADE,
  medicines        JSONB NOT NULL DEFAULT '[]',
  notes            TEXT,
  is_dispensed     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── 3. medicines catalogue table ───────────────────────────
CREATE TABLE IF NOT EXISTS medicines (
  medicine_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  generic_name          TEXT,
  category              TEXT,
  manufacturer          TEXT,
  description           TEXT,
  indications           TEXT[],
  side_effects          TEXT[],
  price                 NUMERIC(10,2),
  prescription_required BOOLEAN NOT NULL DEFAULT TRUE,
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── 4. pharmacy inventory table ────────────────────────────
CREATE TABLE IF NOT EXISTS pharmacy_inventory (
  inventory_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id    UUID REFERENCES pharmacies(pharmacy_id) ON DELETE CASCADE,
  medicine_id    UUID REFERENCES medicines(medicine_id)  ON DELETE CASCADE,
  quantity       INTEGER NOT NULL DEFAULT 0,
  unit_price     NUMERIC(10,2),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (pharmacy_id, medicine_id)
);


-- ── 5. Performance indexes ─────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_patients_qr_token      ON patients(qr_token);
CREATE INDEX IF NOT EXISTS idx_appointments_patient    ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor     ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status     ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_symptom_reports_patient ON symptom_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_symptom_reports_village ON symptom_reports(village_id);
CREATE INDEX IF NOT EXISTS idx_symptom_reports_created ON symptom_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_medicines_name          ON medicines(name);
CREATE INDEX IF NOT EXISTS idx_medicines_category      ON medicines(category);


-- ── 6. Auto-update trigger for updated_at columns ──────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to new tables
DROP TRIGGER IF EXISTS trg_prescriptions_updated  ON prescriptions;
CREATE TRIGGER trg_prescriptions_updated
  BEFORE UPDATE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_inventory_updated ON pharmacy_inventory;
CREATE TRIGGER trg_inventory_updated
  BEFORE UPDATE ON pharmacy_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ── 7. Admin stats view ────────────────────────────────────
CREATE OR REPLACE VIEW admin_stats AS
SELECT
  (SELECT COUNT(*) FROM patients)              AS "totalPatients",
  (SELECT COUNT(*) FROM doctors)               AS "totalDoctors",
  (SELECT COUNT(*) FROM appointments)          AS "totalAppointments",
  (SELECT COUNT(*) FROM symptom_reports
   WHERE created_at >= NOW() - INTERVAL '24h') AS "triageToday",
  (SELECT COUNT(*) FROM outbreak_alerts
   WHERE status = 'active')                    AS "activeOutbreaks";


-- ── 8. RLS policies ────────────────────────────────────────
-- Note: Backend uses SUPABASE_SERVICE_KEY which bypasses RLS.
-- These protect any future direct browser calls.

ALTER TABLE medicines          ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions      ENABLE ROW LEVEL SECURITY;

-- Anyone can read medicines (no PII)
DROP POLICY IF EXISTS "public_read_medicines" ON medicines;
CREATE POLICY "public_read_medicines" ON medicines
  FOR SELECT USING (true);

-- Patients read their own prescriptions
DROP POLICY IF EXISTS "patient_read_own_prescriptions" ON prescriptions;
CREATE POLICY "patient_read_own_prescriptions" ON prescriptions
  FOR SELECT USING (
    patient_id IN (
      SELECT patient_id FROM patients WHERE user_id = auth.uid()
    )
  );

-- Doctors read prescriptions they wrote
DROP POLICY IF EXISTS "doctor_read_own_prescriptions" ON prescriptions;
CREATE POLICY "doctor_read_own_prescriptions" ON prescriptions
  FOR SELECT USING (
    doctor_id IN (
      SELECT doctor_id FROM doctors WHERE user_id = auth.uid()
    )
  );


-- ── 9. Seed medicines (10 common rural-India drugs) ────────
INSERT INTO medicines (name, generic_name, category, manufacturer, description, indications, side_effects, price, prescription_required)
VALUES
  ('Metformin 500mg',      'Metformin',      'Antidiabetic',    'Generic',         'Type-2 diabetes management',         ARRAY['Type-2 Diabetes'],             ARRAY['Nausea','Diarrhea'],            35,  TRUE),
  ('Amoxicillin 500mg',    'Amoxicillin',    'Antibiotic',      'Generic',         'Broad-spectrum bacterial infections', ARRAY['Respiratory','UTI'],            ARRAY['Rash','Diarrhea'],              80,  TRUE),
  ('Atorvastatin 10mg',    'Atorvastatin',   'Statin',          'Generic',         'Cholesterol management',             ARRAY['Hyperlipidemia'],              ARRAY['Muscle pain','Liver changes'],  60,  TRUE),
  ('Paracetamol 500mg',    'Paracetamol',    'Analgesic',       'Generic',         'Fever and mild pain relief',         ARRAY['Fever','Headache','Pain'],     ARRAY['Rare liver toxicity'],          10,  FALSE),
  ('ORS Sachet',           'ORS',            'Rehydration',     'WHO Formula',     'Oral rehydration for diarrhoea',     ARRAY['Diarrhoea','Dehydration'],     ARRAY['None significant'],             5,   FALSE),
  ('Chloroquine 250mg',    'Chloroquine',    'Antimalarial',    'Generic',         'Malaria treatment and prevention',   ARRAY['Malaria'],                     ARRAY['Nausea','Vision changes'],      45,  TRUE),
  ('Azithromycin 500mg',   'Azithromycin',   'Antibiotic',      'Generic',         'Respiratory tract infections',       ARRAY['Pneumonia','Typhoid'],         ARRAY['GI upset'],                    120, TRUE),
  ('Amlodipine 5mg',       'Amlodipine',     'Antihypertensive','Generic',         'Hypertension management',            ARRAY['Hypertension','Chest pain'],   ARRAY['Oedema','Headache'],            30,  TRUE),
  ('Iron Folic Acid Tab',  'Ferrous Sulphate','Supplement',     'Generic',         'Anaemia prevention in pregnancy',    ARRAY['Anaemia','Pregnancy'],         ARRAY['Constipation','Dark stools'],   8,   FALSE),
  ('Salbutamol 2mg',       'Salbutamol',     'Bronchodilator',  'Generic',         'Acute asthma and COPD relief',       ARRAY['Asthma','COPD'],              ARRAY['Tremor','Palpitations'],        25,  TRUE)
ON CONFLICT DO NOTHING;


-- ── DONE ─────────────────────────────────────────────────────
-- ✅ qr_token added to patients
-- ✅ prescriptions, medicines, pharmacy_inventory tables created
-- ✅ Admin stats view created
-- ✅ RLS policies set
-- ✅ 10 seed medicines inserted
-- Restart backend after running to pick up admin_stats view.
