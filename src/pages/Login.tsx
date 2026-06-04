import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, BarChart2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../lib/types';

const ROLE_CONFIG = {
  nakes: {
    label: 'Tenaga Medis Faskes 1',
    description: 'Dokter, Perawat, Bidan — Akses Dashboard Klinis',
    icon: Shield,
    redirect: '/dashboard',
  },
  admin: {
    label: 'Admin / Kepala Dinkes',
    description: 'Akses Pusat Komando Data Epidemiologi',
    icon: BarChart2,
    redirect: '/command',
  },
};

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, profile } = useAuth();

  const defaultRole = (searchParams.get('role') as UserRole) || 'nakes';
  const [role, setRole] = useState<'nakes' | 'admin'>(defaultRole === 'admin' ? 'admin' : 'nakes');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      const dest = ROLE_CONFIG[profile.role as 'nakes' | 'admin']?.redirect || '/';
      navigate(dest, { replace: true });
    }
  }, [profile, navigate]);

  async function handleLogin() {
    setLoading(true);
    await login(`user_${Date.now()}`, `pass_${Date.now()}`, role);
    setLoading(false);
  }

  const cfg = ROLE_CONFIG[role];
  const Icon = cfg.icon;
  const colorClass = role === 'nakes' ? 'teal' : 'sky';
  const colorClasses = {
    teal: { btn: 'bg-teal-500 hover:bg-teal-400', icon: 'text-teal-400', badge: 'bg-teal-900/50 border-teal-700 text-teal-300' },
    sky: { btn: 'bg-sky-500 hover:bg-sky-400', icon: 'text-sky-400', badge: 'bg-sky-900/50 border-sky-700 text-sky-300' },
  };
  const c = colorClasses[colorClass as keyof typeof colorClasses];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Portal
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-3">
              <Icon className={`w-7 h-7 ${c.icon}`} />
            </div>
            <h1 className="text-lg font-bold text-white">Portal Login</h1>
            <p className="text-slate-500 text-xs mt-1 text-center">Sistem Informasi Kesehatan Mentawai</p>
          </div>

          <div className="flex gap-2 mb-6 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(['nakes', 'admin'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                  role === r
                    ? `${r === 'nakes' ? 'bg-teal-900/60 text-teal-300 border border-teal-800' : 'bg-sky-900/60 text-sky-300 border border-sky-800'}`
                    : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                {ROLE_CONFIG[r].label}
              </button>
            ))}
          </div>

          <div className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 mb-5 ${c.badge}`}>
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs">{cfg.description}</span>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full ${c.btn} text-white font-semibold py-3 rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Memproses...
              </span>
            ) : 'Masuk'}
          </button>
        </div>

        <p className="text-center text-xs text-slate-700 mt-4">
          Akses ini dilindungi UU No.17/2023 • Data terenkripsi HL7 FHIR
        </p>
      </div>
    </div>
  );
}
