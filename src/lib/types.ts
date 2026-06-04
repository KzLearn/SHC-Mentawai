export type UserRole = 'nakes' | 'admin' | 'public';

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  role: UserRole;
  faskes_name: string;
  created_at: string;
}

export interface Patient {
  id: string;
  nik: string;
  full_name: string;
  birth_date: string;
  gender: 'L' | 'P';
  address: string;
  village: string;
  blood_type: string;
  bpjs_number: string;
  created_at: string;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  visit_date: string;
  chief_complaint: string;
  anamnesis: string;
  blood_pressure_systolic: number;
  blood_pressure_diastolic: number;
  heart_rate: number;
  temperature: number;
  respiratory_rate: number;
  oxygen_saturation: number;
  weight: number;
  ml_diagnosis_code: string;
  ml_diagnosis_name: string;
  ml_probability: number;
  ml_recommendation: string;
  ml_basis: string;
  decision: 'pending' | 'validated' | 'referred' | 'tele_expertise' | 'manual';
  final_diagnosis_code: string;
  final_diagnosis_name: string;
  ina_cbg_code: string;
  bpjs_status: string;
  sync_status: 'local' | 'synced' | 'conflict';
  created_at: string;
  patients?: Patient;
}

export interface Referral {
  id: string;
  medical_record_id: string;
  patient_id: string;
  doctor_id: string;
  referral_type: 'physical' | 'tele_expertise';
  destination: string;
  reason: string;
  urgency: 'emergency' | 'urgent' | 'normal';
  status: 'sent' | 'received' | 'completed' | 'cancelled';
  fhir_bundle_sent: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DiseaseTrend {
  id: string;
  disease_code: string;
  disease_name: string;
  region: string;
  count: number;
  record_date: string;
}

export interface LiteracyContent {
  id: string;
  title: string;
  content: string;
  category: string;
  image_url: string;
  video_url: string;
  priority: number;
  is_featured: boolean;
  is_active: boolean;
  disease_code: string;
  created_at: string;
}

export interface TriageResult {
  diagnosisCode: string;
  diagnosisName: string;
  probability: number;
  recommendation: 'Tuntas di Faskes' | 'Pertimbangkan Rujukan' | 'Rujuk Segera';
  basis: string;
  inaCbgCode: string;
}
