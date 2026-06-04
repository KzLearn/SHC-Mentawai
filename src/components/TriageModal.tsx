import { useState } from 'react';
import type { TriageResult } from '../lib/types';
import { runMlTriage } from '../lib/mlTriage';
import { X, Cpu, CheckCircle, Share2, Navigation, Edit3, AlertTriangle, Info } from 'lucide-react';

interface TriageModalProps {
  formData: {
    systolic: number;
    diastolic: number;
    heartRate: number;
    temperature: number;
    respiratoryRate: number;
    oxygenSaturation: number;
    chiefComplaint: string;
    patientName: string;
  };
  onValidate: (result: TriageResult) => void;
  onTeleExpertise: (result: TriageResult) => void;
  onRefer: (result: TriageResult) => void;
  onManualCorrect: () => void;
  onClose: () => void;
}

const RECOMMENDATION_COLORS = {
  'Tuntas di Faskes': { bg: 'bg-teal-950/60', border: 'border-teal-700', text: 'text-teal-300', icon: CheckCircle, iconColor: 'text-teal-400' },
  'Pertimbangkan Rujukan': { bg: 'bg-amber-950/60', border: 'border-amber-700', text: 'text-amber-300', icon: AlertTriangle, iconColor: 'text-amber-400' },
  'Rujuk Segera': { bg: 'bg-red-950/60', border: 'border-red-700', text: 'text-red-300', icon: AlertTriangle, iconColor: 'text-red-400' },
};

export default function TriageModal({ formData, onValidate, onTeleExpertise, onRefer, onManualCorrect, onClose }: TriageModalProps) {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);

  function runTriage() {
    setProcessing(true);
    setTimeout(() => {
      const r = runMlTriage(formData);
      setResult(r);
      setProcessing(false);
    }, 1800);
  }

  if (!result && !processing) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white">Mesin Triase Cerdas</h2>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-4 mb-4">
            <p className="text-xs text-slate-400 mb-3 font-medium uppercase tracking-wide">Data yang akan diproses</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['Pasien', formData.patientName],
                ['Keluhan', formData.chiefComplaint],
                ['TD', `${formData.systolic}/${formData.diastolic} mmHg`],
                ['Nadi', `${formData.heartRate} bpm`],
                ['Suhu', `${formData.temperature}°C`],
                ['SpO2', `${formData.oxygenSaturation}%`],
              ].map(([k, v]) => (
                <div key={k}>
                  <span className="text-xs text-slate-500">{k}</span>
                  <p className="text-xs text-slate-200 font-medium truncate">{v || '-'}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-start gap-2 bg-sky-950/40 border border-sky-900/60 rounded-xl p-3 mb-5">
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <p className="text-xs text-sky-300">Model ML akan memproses data klinis berdasarkan Panduan Praktik Klinis (PPK) Kemenkes. Keputusan akhir tetap di tangan dokter.</p>
          </div>
          <button
            onClick={runTriage}
            className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Cpu className="w-4 h-4" />
            Jalankan Triase ML
          </button>
        </div>
      </div>
    );
  }

  if (processing) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-8 shadow-2xl flex flex-col items-center text-center">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 border-2 border-teal-500/30 rounded-full" />
            <div className="absolute inset-0 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <Cpu className="absolute inset-0 m-auto w-7 h-7 text-teal-400" />
          </div>
          <h3 className="text-white font-bold mb-1">Memproses Triase ML</h3>
          <p className="text-slate-500 text-sm">Mencocokkan dengan database ICD-10 & PPK...</p>
          <div className="mt-4 w-full space-y-1.5">
            {['Ekstraksi parameter vital...', 'Menjalankan klasifikasi...', 'Memvalidasi terhadap PPK...'].map((step, i) => (
              <div key={step} className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;
  const recStyle = RECOMMENDATION_COLORS[result.recommendation];
  const RecIcon = recStyle.icon;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-800/60 px-6 py-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-teal-400" />
            <h2 className="font-bold text-white">Hasil Klasifikasi ML</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6">
          {/* Main diagnosis result */}
          <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 mb-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wide">Diagnosis Prediktif</span>
                <p className="text-white font-bold text-base mt-0.5">[{result.diagnosisCode}]</p>
                <p className="text-slate-300 text-sm">{result.diagnosisName}</p>
              </div>
              <div className="text-center shrink-0">
                <div className="text-2xl font-black text-teal-400">{result.probability}%</div>
                <div className="text-xs text-slate-500">Probabilitas</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-md">INA-CBG: {result.inaCbgCode}</span>
              <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-md truncate max-w-full">{result.basis}</span>
            </div>
          </div>

          {/* Recommendation */}
          <div className={`flex items-center gap-3 rounded-xl border p-4 mb-5 ${recStyle.bg} ${recStyle.border}`}>
            <RecIcon className={`w-5 h-5 shrink-0 ${recStyle.iconColor}`} />
            <div>
              <p className={`font-bold text-sm ${recStyle.text}`}>Rekomendasi: {result.recommendation}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {result.recommendation === 'Tuntas di Faskes' ? 'Kondisi dapat ditangani di Faskes 1. Tidak memerlukan rujukan.' :
                 result.recommendation === 'Pertimbangkan Rujukan' ? 'Pertimbangkan tele-expertise atau rujukan berdasarkan penilaian klinis dokter.' :
                 'Kondisi berat. Siapkan rujukan fisik ke RSUD segera.'}
              </p>
            </div>
          </div>

          {/* Audit notice */}
          <div className="bg-amber-950/30 border border-amber-900/50 rounded-xl p-3 mb-4 flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-600">Setiap keputusan di bawah ini memicu <strong>Log Audit Medikolegal</strong> otomatis — merekam waktu, identitas dokter, dan jenis keputusan secara permanen.</p>
          </div>

          {/* Decision buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onValidate(result)}
              className="flex flex-col items-start bg-teal-950/50 hover:bg-teal-950 border border-teal-800 hover:border-teal-600 rounded-xl p-3.5 transition-all text-left"
            >
              <CheckCircle className="w-4 h-4 text-teal-400 mb-2" />
              <span className="text-xs font-bold text-teal-300">Validasi & Generate</span>
              <span className="text-xs text-slate-500 mt-0.5">Kode INA-CBG, klaim BPJS otomatis</span>
            </button>

            <button
              onClick={() => onTeleExpertise(result)}
              className="flex flex-col items-start bg-sky-950/50 hover:bg-sky-950 border border-sky-800 hover:border-sky-600 rounded-xl p-3.5 transition-all text-left"
            >
              <Share2 className="w-4 h-4 text-sky-400 mb-2" />
              <span className="text-xs font-bold text-sky-300">Tele-Expertise Spesialis</span>
              <span className="text-xs text-slate-500 mt-0.5">Ping RSUD untuk opini kedua</span>
            </button>

            <button
              onClick={() => onRefer(result)}
              className="flex flex-col items-start bg-red-950/50 hover:bg-red-950 border border-red-800 hover:border-red-600 rounded-xl p-3.5 transition-all text-left"
            >
              <Navigation className="w-4 h-4 text-red-400 mb-2" />
              <span className="text-xs font-bold text-red-300">Rujuk Fisik ke RSUD</span>
              <span className="text-xs text-slate-500 mt-0.5">Kirim data HL7 FHIR ke Tuapejat</span>
            </button>

            <button
              onClick={onManualCorrect}
              className="flex flex-col items-start bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl p-3.5 transition-all text-left"
            >
              <Edit3 className="w-4 h-4 text-slate-400 mb-2" />
              <span className="text-xs font-bold text-slate-300">Koreksi Diagnosis Manual</span>
              <span className="text-xs text-slate-500 mt-0.5">Abaikan ML, input manual</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
