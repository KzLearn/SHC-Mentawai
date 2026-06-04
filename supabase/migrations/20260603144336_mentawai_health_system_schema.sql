/*
  # Mentawai Smart Health System - Complete Schema

  ## Overview
  Full schema for a medical information system serving Kepulauan Mentawai 3T region.
  Supports Offline-First operations, ML triage classification, and public health literacy.

  ## Tables
  1. `profiles` — Extended user info linked to auth.users (role, username, faskes)
  2. `patients` — Patient master data (NIK, demographics)
  3. `medical_records` — Electronic Medical Records (RME) with vitals and ML diagnosis
  4. `referrals` — Rujukan/referral records to RSUD
  5. `audit_logs` — Medico-legal audit trail (immutable)
  6. `disease_trends` — Aggregated disease count data per region/date
  7. `literacy_content` — Dynamic public education content (controlled by Sector 3)

  ## Security
  - RLS enabled on all tables
  - Role-based access: nakes, admin, public
  - Audit logs are insert-only (no update/delete)
*/

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  display_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'nakes' CHECK (role IN ('nakes', 'admin', 'public')),
  faskes_name text DEFAULT 'Puskesmas Mentawai',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- PATIENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nik text UNIQUE,
  full_name text NOT NULL,
  birth_date date,
  gender text CHECK (gender IN ('L', 'P')),
  address text DEFAULT '',
  village text DEFAULT '',
  blood_type text DEFAULT '',
  bpjs_number text DEFAULT '',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nakes can view patients"
  ON patients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('nakes', 'admin')
    )
  );

CREATE POLICY "Nakes can insert patients"
  ON patients FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('nakes', 'admin')
    )
  );

CREATE POLICY "Nakes can update patients"
  ON patients FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('nakes', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('nakes', 'admin')
    )
  );

-- ============================================================
-- MEDICAL RECORDS (RME)
-- ============================================================
CREATE TABLE IF NOT EXISTS medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id),
  doctor_id uuid NOT NULL REFERENCES auth.users(id),
  visit_date timestamptz DEFAULT now(),

  -- Chief complaint & anamnesis
  chief_complaint text NOT NULL DEFAULT '',
  anamnesis text DEFAULT '',

  -- Vitals
  blood_pressure_systolic integer DEFAULT 0,
  blood_pressure_diastolic integer DEFAULT 0,
  heart_rate integer DEFAULT 0,
  temperature numeric(4,1) DEFAULT 36.5,
  respiratory_rate integer DEFAULT 0,
  oxygen_saturation integer DEFAULT 98,
  weight numeric(5,1) DEFAULT 0,

  -- ML Triage Output
  ml_diagnosis_code text DEFAULT '',
  ml_diagnosis_name text DEFAULT '',
  ml_probability integer DEFAULT 0,
  ml_recommendation text DEFAULT '',
  ml_basis text DEFAULT 'PPK Kemenkes',

  -- Doctor Decision
  decision text DEFAULT 'pending' CHECK (decision IN ('pending', 'validated', 'referred', 'tele_expertise', 'manual')),
  final_diagnosis_code text DEFAULT '',
  final_diagnosis_name text DEFAULT '',
  ina_cbg_code text DEFAULT '',
  bpjs_status text DEFAULT 'pending',

  -- Sync status for Offline-First
  sync_status text DEFAULT 'local' CHECK (sync_status IN ('local', 'synced', 'conflict')),
  synced_at timestamptz,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nakes can view medical records"
  ON medical_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('nakes', 'admin')
    )
  );

CREATE POLICY "Nakes can insert medical records"
  ON medical_records FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('nakes', 'admin')
    )
  );

CREATE POLICY "Nakes can update medical records"
  ON medical_records FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('nakes', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('nakes', 'admin')
    )
  );

-- ============================================================
-- REFERRALS
-- ============================================================
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_record_id uuid NOT NULL REFERENCES medical_records(id),
  patient_id uuid NOT NULL REFERENCES patients(id),
  doctor_id uuid NOT NULL REFERENCES auth.users(id),
  referral_type text NOT NULL DEFAULT 'physical' CHECK (referral_type IN ('physical', 'tele_expertise')),
  destination text DEFAULT 'RSUD Tuapejat',
  reason text NOT NULL DEFAULT '',
  urgency text DEFAULT 'normal' CHECK (urgency IN ('emergency', 'urgent', 'normal')),
  status text DEFAULT 'sent' CHECK (status IN ('sent', 'received', 'completed', 'cancelled')),
  fhir_bundle_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nakes can view referrals"
  ON referrals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('nakes', 'admin')
    )
  );

CREATE POLICY "Nakes can insert referrals"
  ON referrals FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('nakes', 'admin')
    )
  );

CREATE POLICY "Nakes can update referrals"
  ON referrals FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('nakes', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('nakes', 'admin')
    )
  );

-- ============================================================
-- AUDIT LOGS (Medico-Legal - Insert Only)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  metadata jsonb DEFAULT '{}',
  ip_address text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Nakes can view own audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- DISEASE TRENDS (Aggregated Data)
-- ============================================================
CREATE TABLE IF NOT EXISTS disease_trends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disease_code text NOT NULL,
  disease_name text NOT NULL,
  region text NOT NULL DEFAULT 'Mentawai',
  count integer NOT NULL DEFAULT 0,
  record_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE disease_trends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view disease trends"
  ON disease_trends FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('nakes', 'admin')
    )
  );

CREATE POLICY "Admins can insert disease trends"
  ON disease_trends FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update disease trends"
  ON disease_trends FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- LITERACY CONTENT (Dynamic Public Education)
-- ============================================================
CREATE TABLE IF NOT EXISTS literacy_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'umum' CHECK (category IN ('umum', 'wabah', 'pencegahan', 'pertolongan_pertama', 'panduan_faskes')),
  image_url text DEFAULT '',
  video_url text DEFAULT '',
  priority integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  disease_code text DEFAULT '',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE literacy_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active literacy content"
  ON literacy_content FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can insert literacy content"
  ON literacy_content FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update literacy content"
  ON literacy_content FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- SEED DATA: Disease Trends
-- ============================================================
INSERT INTO disease_trends (disease_code, disease_name, region, count, record_date) VALUES
  ('J06.9', 'ISPA', 'Mentawai', 142, CURRENT_DATE - INTERVAL '6 days'),
  ('J06.9', 'ISPA', 'Mentawai', 158, CURRENT_DATE - INTERVAL '5 days'),
  ('J06.9', 'ISPA', 'Mentawai', 171, CURRENT_DATE - INTERVAL '4 days'),
  ('J06.9', 'ISPA', 'Mentawai', 165, CURRENT_DATE - INTERVAL '3 days'),
  ('J06.9', 'ISPA', 'Mentawai', 180, CURRENT_DATE - INTERVAL '2 days'),
  ('J06.9', 'ISPA', 'Mentawai', 195, CURRENT_DATE - INTERVAL '1 days'),
  ('J06.9', 'ISPA', 'Mentawai', 210, CURRENT_DATE),
  ('A09', 'Diare', 'Mentawai', 88, CURRENT_DATE - INTERVAL '6 days'),
  ('A09', 'Diare', 'Mentawai', 95, CURRENT_DATE - INTERVAL '5 days'),
  ('A09', 'Diare', 'Mentawai', 120, CURRENT_DATE - INTERVAL '4 days'),
  ('A09', 'Diare', 'Mentawai', 135, CURRENT_DATE - INTERVAL '3 days'),
  ('A09', 'Diare', 'Mentawai', 148, CURRENT_DATE - INTERVAL '2 days'),
  ('A09', 'Diare', 'Mentawai', 162, CURRENT_DATE - INTERVAL '1 days'),
  ('A09', 'Diare', 'Mentawai', 178, CURRENT_DATE),
  ('B54', 'Malaria', 'Mentawai', 45, CURRENT_DATE - INTERVAL '6 days'),
  ('B54', 'Malaria', 'Mentawai', 52, CURRENT_DATE - INTERVAL '5 days'),
  ('B54', 'Malaria', 'Mentawai', 48, CURRENT_DATE - INTERVAL '4 days'),
  ('B54', 'Malaria', 'Mentawai', 61, CURRENT_DATE - INTERVAL '3 days'),
  ('B54', 'Malaria', 'Mentawai', 58, CURRENT_DATE - INTERVAL '2 days'),
  ('B54', 'Malaria', 'Mentawai', 67, CURRENT_DATE - INTERVAL '1 days'),
  ('B54', 'Malaria', 'Mentawai', 72, CURRENT_DATE),
  ('J06.9', 'ISPA', 'Sumbar', 1840, CURRENT_DATE),
  ('A09', 'Diare', 'Sumbar', 920, CURRENT_DATE),
  ('B54', 'Malaria', 'Sumbar', 310, CURRENT_DATE),
  ('J06.9', 'ISPA', 'Nasional', 45200, CURRENT_DATE),
  ('A09', 'Diare', 'Nasional', 28100, CURRENT_DATE),
  ('B54', 'Malaria', 'Nasional', 8700, CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DATA: Literacy Content
-- ============================================================
INSERT INTO literacy_content (title, content, category, image_url, priority, is_featured, is_active, disease_code) VALUES
  (
    'Waspada Diare: Lakukan Ini Sekarang!',
    'Diare adalah kondisi buang air besar lebih dari 3 kali sehari dengan tinja cair. Penyebab utama: kurang higienis, air minum tercemar. Penanganan: minum oralit setiap BAB, jaga kebersihan tangan, hindari makanan mentah. Segera ke puskesmas jika: dehidrasi berat, tinja berdarah, demam tinggi, tidak membaik dalam 2 hari.',
    'wabah',
    'https://images.pexels.com/photos/3952234/pexels-photo-3952234.jpeg',
    10,
    true,
    true,
    'A09'
  ),
  (
    'Panduan Menggunakan Puskesmas Digital Mentawai',
    'Sistem baru Puskesmas Digital Mentawai memudahkan proses berobat. Langkah: 1) Datang ke puskesmas dengan KTP/KK, 2) Petugas akan scan data Anda, 3) Tunggu panggilan dokter, 4) Dokter menggunakan sistem komputer untuk diagnosis akurat, 5) Resep otomatis tercetak. Sistem ini terhubung langsung dengan BPJS sehingga klaim lebih cepat.',
    'panduan_faskes',
    'https://images.pexels.com/photos/6129507/pexels-photo-6129507.jpeg',
    8,
    false,
    true,
    ''
  ),
  (
    'Pertolongan Pertama: Demam Tinggi',
    'Demam di atas 38.5°C butuh penanganan segera. Cara penanganan mandiri: kompres hangat di dahi dan ketiak, minum paracetamol sesuai dosis, perbanyak minum air putih, istirahat total. Segera ke puskesmas jika: demam di atas 40°C, kejang, tidak turun setelah 2 hari, disertai bercak merah di kulit.',
    'pertolongan_pertama',
    'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg',
    7,
    false,
    true,
    'R50.9'
  ),
  (
    'Mencegah ISPA di Musim Hujan',
    'ISPA (Infeksi Saluran Pernapasan Akut) sangat umum di Mentawai saat musim hujan. Pencegahan: cuci tangan rutin dengan sabun, gunakan masker saat batuk/pilek, jaga ventilasi rumah, tingkatkan imun dengan makanan bergizi. Anak-anak dan lansia paling rentan. Vaksin influenza tersedia gratis di Puskesmas Mentawai.',
    'pencegahan',
    'https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg',
    6,
    false,
    true,
    'J06.9'
  ),
  (
    'Kenali Gejala Malaria Sejak Dini',
    'Malaria ditularkan nyamuk Anopheles. Gejala: demam tinggi berulang disertai menggigil, berkeringat, nyeri kepala, mual. Pencegahan: tidur dengan kelambu, gunakan obat nyamuk, bersihkan genangan air. Penting: pemeriksaan RDT (Rapid Diagnostic Test) tersedia gratis di Puskesmas. Jangan tunda berobat!',
    'pencegahan',
    'https://images.pexels.com/photos/3993212/pexels-photo-3993212.jpeg',
    5,
    false,
    true,
    'B54'
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_doctor_id ON medical_records(doctor_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_visit_date ON medical_records(visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_medical_records_decision ON medical_records(decision);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_disease_trends_region ON disease_trends(region);
CREATE INDEX IF NOT EXISTS idx_disease_trends_date ON disease_trends(record_date DESC);
CREATE INDEX IF NOT EXISTS idx_literacy_content_category ON literacy_content(category);
CREATE INDEX IF NOT EXISTS idx_literacy_content_priority ON literacy_content(priority DESC);
