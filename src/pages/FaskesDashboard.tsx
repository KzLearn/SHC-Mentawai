import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { TriageResult } from '../lib/types';
import TriageModal from '../components/TriageModal';
import { runMlTriage } from '../lib/mlTriage';
import {
  LogOut, Menu, X, Home, FileText, Cpu, TrendingUp,
  Thermometer, Heart, Wind, Activity, AlertCircle, Check, Send, Edit3,
  Clock, User, Droplet, Zap, Users, Search
} from 'lucide-react';

interface FormData {
  patientName: string;
  nik: string;
  age: number;
  bpjsStatus: string;
  chiefComplaint: string;
  symptoms: string[];
  systolic: number;
  diastolic: number;
  temperature: number;
  heartRate: number;
  oxygenSaturation: number;
}

const DEFAULT_FORM: FormData = {
  patientName: '',
  nik: '',
  age: 0,
  bpjsStatus: '',
  chiefComplaint: 'Demam 3 hari, batuk, pilek',
  symptoms: ['Demam', 'Batuk', 'Pilek', 'Sakit tenggorok'],
  systolic: 128,
  diastolic: 82,
  temperature: 38.5,
  heartRate: 88,
  oxygenSaturation: 97,
};

const SYMPTOM_OPTIONS = [
  'Demam', 'Batuk', 'Pilek', 'Sakit tenggorok', 'Sakit kepala',
  'Mual', 'Muntah', 'Diare', 'Sesak napas', 'Nyeri dada',
  'Nyeri perut', 'Menggigil', 'Keringat dingin'
];

const SIDEBAR_ITEMS = [
  { icon: Home, label: 'Dashboard', id: 'dashboard' },
  { icon: FileText, label: 'RME (Rekam Medis)', id: 'rme' },
  { icon: Cpu, label: 'Triase ML', id: 'triage' },
  { icon: TrendingUp, label: 'Laporan Harian', id: 'report' },
];

export default function FaskesDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'rme' | 'triage' | 'report'>('rme');
  const [patientInput, setPatientInput] = useState({ name: '', nik: '', age: '' });
  const [patientChecked, setPatientChecked] = useState(false);
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM);
  const [showTriage, setShowTriage] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const handleCheckPatient = () => {
    if (!patientInput.name.trim() || !patientInput.nik.trim() || !patientInput.age) {
      setToast('Mohon isi semua data pasien');
      setTimeout(() => setToast(null), 2000);
      return;
    }
    setFormData(f => ({
      ...f,
      patientName: patientInput.name,
      nik: patientInput.nik,
      age: parseInt(patientInput.age),
      bpjsStatus: 'Aktif (No. 000119283120)',
    }));
    setPatientChecked(true);
    setToast('Data pasien ditemukan — siap input medis');
    setTimeout(() => setToast(null), 2000);
  };

  const handleRunTriage = useCallback(() => {
    const result = runMlTriage({
      systolic: formData.systolic,
      diastolic: formData.diastolic,
      heartRate: formData.heartRate,
      temperature: formData.temperature,
      respiratoryRate: 18,
      oxygenSaturation: formData.oxygenSaturation,
      chiefComplaint: formData.chiefComplaint,
    });
    setTriageResult(result);
    setShowTriage(true);
  }, [formData]);

  async function handleValidate() {
    if (triageResult) {
      await supabase.from('audit_logs').insert({
        user_id: 'user_1',
        action: 'TRIASE_VALIDATED',
        entity_type: 'rme',
        metadata: { diagnosis: triageResult.diagnosisCode },
      });
      setShowTriage(false);
      setTriageResult(null);
      setToast('Diagnosis divalidasi dan tersimpan ke sistem.');
      setTimeout(() => setToast(null), 3000);
    }
  }

  async function handleRefer() {
    if (triageResult) {
      await supabase.from('audit_logs').insert({
        user_id: 'user_1',
        action: 'TRIASE_REFERRED',
        entity_type: 'rme',
        metadata: { diagnosis: triageResult.diagnosisCode, referred_to: 'RSUD' },
      });
      setShowTriage(false);
      setTriageResult(null);
      setToast('Pasien dirujuk ke RSUD — HL7 FHIR dikirim.');
      setTimeout(() => setToast(null), 3000);
    }
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Dashboard Faskes 1</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Pasien Hari Ini</p>
                <p className="text-2xl font-bold text-teal-400">47</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Selesai di Faskes</p>
                <p className="text-2xl font-bold text-green-400">38</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Dirujuk ke RSUD</p>
                <p className="text-2xl font-bold text-red-400">9</p>
              </div>
            </div>
          </div>
        );
      case 'report':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Laporan Harian</h2>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                  <span className="text-sm text-slate-400">Total Kunjungan</span>
                  <span className="text-lg font-bold text-white">47 pasien</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                  <span className="text-sm text-slate-400">Rata-rata Waktu Layanan</span>
                  <span className="text-lg font-bold text-white">18 menit</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                  <span className="text-sm text-slate-400">Diagnosis Terbanyak</span>
                  <span className="text-lg font-bold text-white">ISPA (J06.9)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Tingkat Rujukan</span>
                  <span className="text-lg font-bold text-red-400">19.1%</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'triage':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Riwayat Triase ML</h2>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Siti Nurhaliza</p>
                  <p className="text-xs text-slate-500">130****6789 • 34 thn</p>
                  <p className="text-xs text-teal-400 mt-1">ISPA [J06.9] • Tuntas di Faskes</p>
                </div>
                <span className="text-xs bg-teal-900/50 text-teal-300 px-2 py-1 rounded">14:32</span>
              </div>
              <div className="border-t border-slate-700 pt-3 flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Budi Santoso</p>
                  <p className="text-xs text-slate-500">130****7890 • 28 thn</p>
                  <p className="text-xs text-red-400 mt-1">Demam Tifoid [A01.0] • Rujuk RSUD</p>
                </div>
                <span className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded">12:15</span>
              </div>
            </div>
          </div>
        );
      case 'rme':
      default:
        return (
          <div className="space-y-6">
            {/* Patient lookup */}
            {!patientChecked && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Search className="w-4 h-4 text-teal-400" />
                  Pencarian & Verifikasi Pasien
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Nama Lengkap"
                    value={patientInput.name}
                    onChange={e => setPatientInput(p => ({ ...p, name: e.target.value }))}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-teal-600 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="NIK"
                    value={patientInput.nik}
                    onChange={e => setPatientInput(p => ({ ...p, nik: e.target.value }))}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-teal-600 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Usia"
                    value={patientInput.age}
                    onChange={e => setPatientInput(p => ({ ...p, age: e.target.value }))}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-teal-600 focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleCheckPatient}
                  className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
                >
                  <Search className="w-4 h-4" />
                  Cek Data Pasien
                </button>
              </div>
            )}

            {patientChecked && (
              <>
                {/* Identitas Pasien */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <User className="w-4 h-4 text-teal-400" />
                      Identitas Pasien
                    </h2>
                    <button
                      onClick={() => {
                        setPatientChecked(false);
                        setPatientInput({ name: '', nik: '', age: '' });
                      }}
                      className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      Ubah Pasien
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-800/40 border border-slate-800 rounded-xl p-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Nama Lengkap</p>
                      <p className="text-sm font-semibold text-white">{formData.patientName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">NIK</p>
                      <p className="text-sm font-semibold text-white font-mono">{formData.nik}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Usia</p>
                      <p className="text-sm font-semibold text-white">{formData.age} tahun</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Status BPJS</p>
                      <span className="inline-block text-xs bg-teal-950/50 text-teal-300 border border-teal-800 px-2 py-1 rounded-full">{formData.bpjsStatus}</span>
                    </div>
                  </div>
                </div>

                {/* Keluhan & Gejala */}
                <div className="border-t border-slate-800 pt-6">
                  <h2 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    Indikasi Klinis
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-slate-400 font-medium mb-2">Keluhan Utama</label>
                      <textarea
                        value={formData.chiefComplaint}
                        onChange={e => setFormData(f => ({ ...f, chiefComplaint: e.target.value }))}
                        rows={2}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-teal-600 focus:outline-none transition-colors resize-none"
                        placeholder="Deskripsikan keluhan utama pasien..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 font-medium mb-2">Gejala Klinis & Indikasi</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                        {SYMPTOM_OPTIONS.map(symptom => (
                          <button
                            key={symptom}
                            onClick={() => setFormData(f => ({
                              ...f,
                              symptoms: f.symptoms.includes(symptom)
                                ? f.symptoms.filter(s => s !== symptom)
                                : [...f.symptoms, symptom]
                            }))}
                            className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                              formData.symptoms.includes(symptom)
                                ? 'bg-teal-900/50 border-teal-700 text-teal-300'
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                            }`}
                          >
                            {symptom}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tanda Vital */}
                <div className="border-t border-slate-800 pt-6">
                  <h2 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-400" />
                    Tanda-Tanda Vital (TTV)
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { key: 'systolic', label: 'TD Sistolik', icon: Heart, unit: 'mmHg', min: 60, max: 250 },
                      { key: 'diastolic', label: 'TD Diastolik', icon: Heart, unit: 'mmHg', min: 40, max: 180 },
                      { key: 'temperature', label: 'Suhu Tubuh', icon: Thermometer, unit: '°C', min: 35, max: 42, step: 0.1 },
                      { key: 'heartRate', label: 'Detak Jantung', icon: Zap, unit: 'bpm', min: 30, max: 200 },
                      { key: 'oxygenSaturation', label: 'Saturasi Oksigen', icon: Droplet, unit: '%', min: 50, max: 100 },
                    ].map(field => (
                      <div key={field.key} className="bg-slate-800/60 border border-slate-700 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <field.icon className="w-3.5 h-3.5 text-teal-500" />
                          <span className="text-xs text-slate-500">{field.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={formData[field.key as keyof typeof formData] as number}
                            onChange={e => setFormData(f => ({ ...f, [field.key]: parseFloat(e.target.value) || 0 }))}
                            min={field.min}
                            max={field.max}
                            step={(field as any).step || 1}
                            className="flex-1 bg-transparent text-lg font-bold text-white focus:outline-none"
                          />
                          <span className="text-xs text-slate-600 shrink-0">{field.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="border-t border-slate-800 pt-6 flex gap-3">
                  <button
                    onClick={handleRunTriage}
                    className="flex-1 flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-3 rounded-xl text-sm transition-colors shadow-lg shadow-teal-900/30"
                  >
                    <Cpu className="w-4 h-4" />
                    Jalankan Analisis Triase ML
                  </button>
                  <button className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-3 rounded-xl text-sm transition-colors border border-slate-700">
                    <Edit3 className="w-4 h-4" />
                    Simpan RME
                  </button>
                </div>

                {/* Hasil triase preview */}
                {triageResult && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-sm font-bold text-slate-200 mb-4">Hasil Analisis Triase ML</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-slate-800/60 rounded-xl p-4">
                        <p className="text-xs text-slate-500 mb-2">Diagnosis Prediktif</p>
                        <p className="text-lg font-bold text-white">[{triageResult.diagnosisCode}]</p>
                        <p className="text-sm text-slate-400 mt-1">{triageResult.diagnosisName}</p>
                        <p className="text-2xl font-black text-teal-400 mt-3">{triageResult.probability}%</p>
                      </div>
                      <div className="bg-slate-800/60 rounded-xl p-4 flex flex-col justify-between">
                        <div>
                          <p className="text-xs text-slate-500 mb-2">Rekomendasi Tindakan</p>
                          <p className={`text-sm font-bold ${triageResult.recommendation === 'Tuntas di Faskes' ? 'text-teal-400' : triageResult.recommendation === 'Pertimbangkan Rujukan' ? 'text-amber-400' : 'text-red-400'}`}>
                            {triageResult.recommendation}
                          </p>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button onClick={handleValidate} className="flex-1 bg-teal-900/50 hover:bg-teal-900 text-teal-300 border border-teal-800 px-3 py-2 rounded-lg text-xs font-medium transition-colors">
                            Validasi
                          </button>
                          <button onClick={handleRefer} className="flex-1 bg-red-900/50 hover:bg-red-900 text-red-300 border border-red-800 px-3 py-2 rounded-lg text-xs font-medium transition-colors">
                            Rujuk
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-60 bg-slate-900 border-r border-slate-800 p-4 transition-all z-50 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center">
              <span className="text-slate-950 font-black text-xs">M</span>
            </div>
            <span className="font-bold text-white">MentawaiSehat</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1 mb-8">
          {SIDEBAR_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentTab(item.id as any);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${
                currentTab === item.id
                  ? 'bg-teal-950/60 text-teal-300 border border-teal-800'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800 bg-slate-950">
          <div className="bg-slate-800/40 rounded-xl p-3 mb-3">
            <p className="text-xs text-slate-500 mb-0.5">Login Sebagai</p>
            <p className="text-xs font-semibold text-slate-300">Dr. Bambang Irawan</p>
            <p className="text-xs text-slate-600">Tenaga Medis Faskes 1</p>
          </div>
          <button
            onClick={() => navigate('/command')}
            className="w-full flex items-center justify-center gap-2 bg-sky-800 hover:bg-sky-700 text-slate-300 px-4 py-2 rounded-xl text-sm transition-colors"
          >
            <Users className="w-4 h-4" />
            Akses Command Center
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm sticky top-0 z-40">
          <div className="px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-slate-500 hover:text-white">
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-sm font-bold text-white">Rekam Medis Elektronik (RME)</h1>
                <p className="text-xs text-slate-500 leading-none">Faskes 1 Kepulauan Mentawai</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-xs text-slate-500">{new Date().toLocaleDateString('id-ID')}</span>
              <div className="flex items-center gap-1.5 text-xs text-teal-400 bg-teal-950/50 border border-teal-900 px-2 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                Online
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>

      {/* Triage modal */}
      {showTriage && triageResult && (
        <TriageModal
          formData={{
            systolic: formData.systolic,
            diastolic: formData.diastolic,
            heartRate: formData.heartRate,
            temperature: formData.temperature,
            respiratoryRate: 18,
            oxygenSaturation: formData.oxygenSaturation,
            chiefComplaint: formData.chiefComplaint,
            patientName: formData.patientName,
          }}
          onValidate={handleValidate}
          onTeleExpertise={handleValidate}
          onRefer={handleRefer}
          onManualCorrect={() => setShowTriage(false)}
          onClose={() => { setShowTriage(false); setTriageResult(null); }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 max-w-sm bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 shadow-xl z-50 flex items-start gap-3 animate-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-300">{toast}</p>
        </div>
      )}
    </div>
  );
}
