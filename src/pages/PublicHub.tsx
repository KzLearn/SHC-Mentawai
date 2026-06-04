import { useNavigate } from 'react-router-dom';
import { Shield, BarChart2, BookOpen, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import MentawaiMap from '../components/MentawaiMap';

const STATS = [
  { label: 'Kasus Aktif Hari Ini', value: '421', color: 'text-amber-400' },
  { label: 'Pasien Selesai di Faskes', value: '318', color: 'text-teal-400' },
  { label: 'Dirujuk ke RSUD', value: '47', color: 'text-red-400' },
  { label: 'Puskesmas Aktif', value: '11', color: 'text-sky-400' },
];

const ALERT = {
  disease: 'Diare',
  code: 'A09',
  change: '+32%',
  region: 'Sipora / Tuapejat',
};

export default function PublicHub() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top bar */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
              <span className="text-slate-950 font-black text-sm">M</span>
            </div>
            <div>
              <span className="font-bold text-white text-sm">MentawaiSehat</span>
              <span className="text-slate-500 text-xs block leading-none">Sistem Informasi Kesehatan Terpadu</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-teal-400">
              <Wifi className="w-3.5 h-3.5" />
              <span>Mode Online</span>
            </div>
            <div className="text-xs text-slate-500">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Alert banner */}
        <div className="mb-6 bg-amber-950/50 border border-amber-700/60 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300 font-semibold text-sm">Peningkatan Kasus {ALERT.disease} ({ALERT.code})</p>
            <p className="text-amber-500 text-xs mt-0.5">Lonjakan {ALERT.change} dalam 7 hari terakhir di wilayah {ALERT.region}. Waspada dan terapkan protokol higiene.</p>
          </div>
          <button onClick={() => navigate('/literasi')} className="ml-auto shrink-0 text-xs bg-amber-700/50 hover:bg-amber-700 text-amber-200 px-3 py-1.5 rounded-lg transition-colors">
            Baca Panduan
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          {/* Left: Hero + Map */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                Portal Hub Terpadu<br />
                <span className="text-teal-400">Kepulauan Mentawai</span>
              </h1>
              <p className="text-slate-400 mt-2 text-sm leading-relaxed">
                Sistem manajemen kesehatan berbasis <strong className="text-slate-300">Offline-First</strong> untuk wilayah 3T.
                Integrasi rekam medis cerdas, triase berbasis ML, dan edukasi publik real-time.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {STATS.map(s => (
                <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-slate-500 text-xs mt-1 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Offline mode info */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                <WifiOff className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-300">Mode Offline-First Aktif</p>
                <p className="text-xs text-slate-500 mt-0.5">Triase ML tetap berjalan lokal saat blank spot. Sinkronisasi otomatis saat koneksi kembali.</p>
              </div>
            </div>
          </div>

          {/* Right: Heatmap */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-200">Radar Peta Panas Penyakit</h2>
                <p className="text-xs text-slate-500 mt-0.5">Titik kerawanan real-time</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-teal-400 bg-teal-950/50 border border-teal-900/60 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                Live
              </div>
            </div>
            <MentawaiMap />
          </div>
        </div>

        {/* 3 access buttons */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Button 1: Tenaga Medis */}
          <button
            onClick={() => navigate('/login?role=nakes')}
            className="group relative overflow-hidden bg-teal-950/40 hover:bg-teal-950/60 border border-teal-800/50 hover:border-teal-600 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-lg hover:shadow-teal-900/30"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-xl bg-teal-900/60 border border-teal-800 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-teal-400" />
            </div>
            <h3 className="font-bold text-white mb-1">Akses Tenaga Medis</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Portal klinis untuk dokter & perawat Faskes 1. Rekam medis, triase ML, dan manajemen pasien.</p>
            <div className="mt-4 flex items-center gap-1.5 text-teal-400 text-sm font-medium">
              <span>Masuk ke Dashboard</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>

          {/* Button 2: Radar Data */}
          <button
            onClick={() => navigate('/login?role=admin')}
            className="group relative overflow-hidden bg-sky-950/40 hover:bg-sky-950/60 border border-sky-800/50 hover:border-sky-600 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-lg hover:shadow-sky-900/30"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-xl bg-sky-900/60 border border-sky-800 flex items-center justify-center mb-4">
              <BarChart2 className="w-6 h-6 text-sky-400" />
            </div>
            <h3 className="font-bold text-white mb-1">Radar Data Epidemiologi</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Pusat komando data untuk Kepala Dinkes & Admin. Komparasi tren penyakit lintas wilayah.</p>
            <div className="mt-4 flex items-center gap-1.5 text-sky-400 text-sm font-medium">
              <span>Masuk ke Komando</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>

          {/* Button 3: Literasi */}
          <button
            onClick={() => navigate('/literasi')}
            className="group relative overflow-hidden bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-800/50 hover:border-emerald-600 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-lg hover:shadow-emerald-900/30"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-xl bg-emerald-900/60 border border-emerald-800 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="font-bold text-white mb-1">Pusat Literasi & Edukasi</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Portal publik masyarakat Mentawai. Panduan kesehatan, pertolongan pertama, dan edukasi wabah.</p>
            <div className="mt-4 flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
              <span>Akses Langsung</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>
        </div>

        {/* Footer compliance badges */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="flex flex-wrap gap-3 items-center justify-center">
            {['HL7 FHIR Compliant', 'ICD-10 Coded', 'BPJS/INA-CBG Ready', 'SatuSehat Integrated', 'UU No.17/2023'].map(badge => (
              <span key={badge} className="text-xs text-slate-500 border border-slate-800 px-3 py-1 rounded-full">
                {badge}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
