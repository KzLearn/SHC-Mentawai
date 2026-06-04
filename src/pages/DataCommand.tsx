import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Menu, X, Home, FileText, BarChart3, Bell,
  TrendingUp, AlertTriangle, Pill, Users, Truck, Siren,
  Activity, Clock, CheckCircle2, AlertCircle
} from 'lucide-react';

const SIDEBAR_ITEMS = [
  { icon: Home, label: 'Dashboard', id: 'dashboard' },
  { icon: BarChart3, label: 'Epidemiologi', id: 'epidemiology' },
  { icon: Pill, label: 'Logistik Obat', id: 'logistics' },
  { icon: Users, label: 'SDM Medis', id: 'sdm' },
  { icon: FileText, label: 'Laporan', id: 'reports' },
];

interface BarChartData {
  sector: string;
  cases: number;
}

interface LineChartData {
  date: string;
  basic: number;
  emergency: number;
}

const SEKTOR_DATA: BarChartData[] = [
  { sector: 'Siberut', cases: 156 },
  { sector: 'Sipora', cases: 210 },
  { sector: 'Sikakap', cases: 87 },
  { sector: 'Pagai Utara', cases: 65 },
];

const TREND_DATA: LineChartData[] = [
  { date: 'Mon', basic: 120, emergency: 25 },
  { date: 'Tue', basic: 145, emergency: 32 },
  { date: 'Wed', basic: 158, emergency: 28 },
  { date: 'Thu', basic: 172, emergency: 41 },
  { date: 'Fri', basic: 195, emergency: 48 },
  { date: 'Sat', basic: 201, emergency: 52 },
  { date: 'Sun', basic: 218, emergency: 61 },
];

const MAX_CASES = Math.max(...SEKTOR_DATA.map(d => d.cases), 1);
const MAX_TREND = Math.max(...TREND_DATA.flatMap(d => [d.basic, d.emergency]), 1);

function BarChart({ data }: { data: BarChartData[] }) {
  return (
    <div className="flex items-end justify-around h-40 gap-4 px-4">
      {data.map(item => (
        <div key={item.sector} className="flex flex-col items-center gap-2 flex-1">
          <div className="w-full max-w-12 bg-gradient-to-t from-teal-600 to-teal-400 rounded-t-lg" style={{ height: `${(item.cases / MAX_CASES) * 120}px` }} />
          <span className="text-xs text-slate-500 font-medium">{item.sector}</span>
          <span className="text-xs font-bold text-slate-300">{item.cases}</span>
        </div>
      ))}
    </div>
  );
}

function LineChart({ data }: { data: LineChartData[] }) {
  const W = 400, H = 120, PAD = 20;
  const chartW = W - PAD * 2;
  const chartH = H - PAD;

  function getPath(key: 'basic' | 'emergency') {
    return data.map((d, i) => {
      const x = PAD + (i / (data.length - 1)) * chartW;
      const y = PAD + chartH - (d[key] / MAX_TREND) * chartH;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  }

  return (
    <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full h-auto">
      {[0, 0.5, 1].map(pct => (
        <line key={pct} x1={PAD} y1={PAD + chartH * (1 - pct)} x2={W - PAD} y2={PAD + chartH * (1 - pct)} stroke="#1e293b" strokeWidth="1" strokeDasharray="2,2" />
      ))}
      <path d={getPath('basic')} fill="none" stroke="#14b8a6" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <path d={getPath('emergency')} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <text key={i} x={PAD + (i / (data.length - 1)) * chartW} y={H + 16} fill="#64748b" fontSize="10" textAnchor="middle">{d.date}</text>
      ))}
    </svg>
  );
}

export default function DataCommand() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'epidemiology' | 'logistics' | 'sdm' | 'reports'>('dashboard');
  const [syncingApi, setSyncingApi] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleSyncApi = async () => {
    setSyncingApi(true);
    await new Promise(r => setTimeout(r, 2000));
    setSyncingApi(false);
    setToast('Sinkronisasi SatuSehat berhasil — data nasional diperbarui.');
    setTimeout(() => setToast(null), 3000);
  };

  const handleSendLogistics = async () => {
    setToast('SPK Pengiriman Logistik Darurat diterbitkan ke Siberut — ETA 4 jam.');
    setTimeout(() => setToast(null), 3000);
  };

  const handleMobilizeTeam = async () => {
    setToast('Surat Perintah Tugas (SPT) Tim Reaksi Cepat dikirim — siap deploy dalam 2 jam.');
    setTimeout(() => setToast(null), 3000);
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'epidemiology':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white">Analisis Epidemiologi</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-slate-200 mb-4">Distribusi Kasus Berdasarkan Sektor</h3>
                <BarChart data={SEKTOR_DATA} />
                <div className="text-center mt-4 text-xs text-slate-600">Total Pasien: 518 kasus</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-slate-200 mb-4">Tren Penyakit: Dasar vs Darurat (7 Hari)</h3>
                <div className="flex items-center gap-4 mb-4 justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-teal-500" />
                    <span className="text-xs text-slate-400">Penyakit Dasar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-xs text-slate-400">Penyakit Darurat</span>
                  </div>
                </div>
                <LineChart data={TREND_DATA} />
              </div>
            </div>
          </div>
        );
      case 'logistics':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Manajemen Logistik Obat</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-500" />
                Penyaluran Logistik Medis
              </h3>
              <div className="space-y-3">
                <div className="bg-red-950/30 border border-red-900/60 rounded-xl p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-red-300">
                    <p className="font-semibold mb-0.5">Stok Obat Diare Menipis di Sektor Siberut</p>
                    <p>Sisa: 240 paket. Prediksi habis dalam 3 hari jika tidak diisi ulang.</p>
                  </div>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Lokasi Pengiriman</span>
                    <span className="text-xs font-semibold text-white">Puskesmas Sikabaluan, Siberut Utara</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Kebutuhan Obat</span>
                    <span className="text-xs font-semibold text-white">500 paket Oralit + 300 tablet loperamid</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">ETA</span>
                    <span className="text-xs font-semibold text-amber-400">4 jam via Kapal Cepat</span>
                  </div>
                </div>
                <button
                  onClick={handleSendLogistics}
                  className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
                >
                  <Truck className="w-4 h-4" />
                  Otorisasi Pengiriman Logistik Darurat
                </button>
              </div>
            </div>
          </div>
        );
      case 'sdm':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Mobilisasi SDM Medis</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                <Siren className="w-4 h-4 text-red-500" />
                Tim Reaksi Cepat
              </h3>
              <div className="space-y-3">
                <div className="bg-red-950/30 border border-red-900/60 rounded-xl p-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-red-300">
                    <p className="font-semibold mb-0.5">Kekurangan Tenaga Medis — Zona Merah ISPA</p>
                    <p>Puskesmas Sikabaluan (Siberut): Hanya 2 dari 4 perawat aktif. Kebutuhan mendesak untuk menangani lonjakan kasus ISPA 210 pasien/hari.</p>
                  </div>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Tim yang Diperlukan</span>
                    <span className="text-xs font-semibold text-white">1 Dokter + 2 Perawat</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Durasi Deploy</span>
                    <span className="text-xs font-semibold text-white">5 hari (dapat diperpanjang)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Sumber</span>
                    <span className="text-xs font-semibold text-white">Puskesmas Tuapejat + RSUD Standby</span>
                  </div>
                </div>
                <button
                  onClick={handleMobilizeTeam}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
                >
                  <Siren className="w-4 h-4" />
                  Kirim SPT Tim Reaksi Cepat
                </button>
              </div>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Laporan Komprehensif</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="border-b border-slate-700 pb-3">
                <p className="text-xs text-slate-500 mb-1">Laporan Harian Epidemiologi</p>
                <button className="text-sm text-teal-400 hover:text-teal-300 transition-colors font-medium">
                  Download PDF • 2026-06-03
                </button>
              </div>
              <div className="border-b border-slate-700 pb-3">
                <p className="text-xs text-slate-500 mb-1">Rekapitulasi Mingguan</p>
                <button className="text-sm text-teal-400 hover:text-teal-300 transition-colors font-medium">
                  Lihat Laporan Minggu 22 (2026)
                </button>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Analisis SDM & Logistik</p>
                <button className="text-sm text-teal-400 hover:text-teal-300 transition-colors font-medium">
                  Generate Report Bulanan
                </button>
              </div>
            </div>
          </div>
        );
      case 'dashboard':
      default:
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white">Dashboard Epidemiologi & Logistik</h2>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-slate-500">Total Pasien Aktif</p>
                  <Activity className="w-4 h-4 text-sky-500" />
                </div>
                <p className="text-3xl font-bold text-white">518</p>
                <p className="text-xs text-slate-600 mt-1">7 Hari Terakhir</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-slate-500">Rasio Rujukan ke RSUD</p>
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-3xl font-bold text-white">18.2%</p>
                <p className="text-xs text-slate-600 mt-1">↑ +2.1% vs minggu lalu</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-slate-500">Stok Obat Darurat</p>
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
                <p className="text-3xl font-bold text-white">62%</p>
                <p className="text-xs text-red-500 mt-1">Diare: MENIPIS di Siberut</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-slate-500">Tenaga Medis Siap</p>
                  <Users className="w-4 h-4 text-teal-500" />
                </div>
                <p className="text-3xl font-bold text-white">34/42</p>
                <p className="text-xs text-slate-600 mt-1">8 Tidak Siap (Cuti/Sakit)</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-slate-200 mb-4">Distribusi Kasus Berdasarkan Sektor</h3>
                <BarChart data={SEKTOR_DATA} />
                <div className="text-center mt-4 text-xs text-slate-600">Total Pasien: 518 kasus</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-slate-200 mb-4">Tren Penyakit: Dasar vs Darurat (7 Hari)</h3>
                <div className="flex items-center gap-4 mb-4 justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-teal-500" />
                    <span className="text-xs text-slate-400">Penyakit Dasar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-xs text-slate-400">Penyakit Darurat</span>
                  </div>
                </div>
                <LineChart data={TREND_DATA} />
              </div>
            </div>

            {/* Action panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-500" />
                  Penyaluran Logistik Medis
                </h3>
                <div className="space-y-3">
                  <div className="bg-red-950/30 border border-red-900/60 rounded-xl p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-red-300">
                      <p className="font-semibold mb-0.5">Stok Obat Diare Menipis di Sektor Siberut</p>
                      <p>Sisa: 240 paket. Prediksi habis dalam 3 hari jika tidak diisi ulang.</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSendLogistics}
                    className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
                  >
                    <Truck className="w-4 h-4" />
                    Otorisasi Pengiriman Logistik Darurat
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                  <Siren className="w-4 h-4 text-red-500" />
                  Mobilisasi SDM Medis
                </h3>
                <div className="space-y-3">
                  <div className="bg-red-950/30 border border-red-900/60 rounded-xl p-3 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-red-300">
                      <p className="font-semibold mb-0.5">Kekurangan Tenaga Medis — Zona Merah ISPA</p>
                      <p>Puskesmas Sikabaluan (Siberut): Hanya 2 dari 4 perawat aktif.</p>
                    </div>
                  </div>
                  <button
                    onClick={handleMobilizeTeam}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
                  >
                    <Siren className="w-4 h-4" />
                    Kirim SPT Tim Reaksi Cepat
                  </button>
                </div>
              </div>
            </div>

            {/* Sync button */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Sinkronisasi Data SatuSehat</h3>
                <p className="text-xs text-slate-500 mt-1">Terakhir diperbaharui: {new Date().toLocaleTimeString('id-ID')}</p>
              </div>
              <button
                onClick={handleSyncApi}
                disabled={syncingApi}
                className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
              >
                {syncingApi ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sinkronisasi...
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    Sinkronisasi API SatuSehat
                  </>
                )}
              </button>
            </div>
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
            <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center">
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
                  ? 'bg-sky-950/60 text-sky-300 border border-sky-800'
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
            <p className="text-xs font-semibold text-slate-300">Drs. Hendra Wijaya</p>
            <p className="text-xs text-slate-600">Kepala Dinkes Mentawai</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center justify-center gap-2 bg-teal-800 hover:bg-teal-700 text-slate-300 px-4 py-2 rounded-xl text-sm transition-colors"
          >
            <FileText className="w-4 h-4" />
            Akses Faskes Dashboard
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm sticky top-0 z-40">
          <div className="px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-slate-500 hover:text-white">
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-sm font-bold text-white">Dashboard Epidemiologi & Logistik</h1>
                <p className="text-xs text-slate-500 leading-none">Kepulauan Mentawai</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-300 transition-colors">
                <Bell className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-500">{new Date().toLocaleDateString('id-ID')}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 max-w-md bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 shadow-xl z-50 flex items-start gap-3 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-300">{toast}</p>
        </div>
      )}
    </div>
  );
}
