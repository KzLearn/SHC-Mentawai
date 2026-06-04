import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { LiteracyContent } from '../lib/types';
import { ArrowLeft, BookOpen, PlayCircle, Shield, ChevronRight, Search, AlertTriangle, Heart, Droplets, Wind, Thermometer, X } from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  umum: 'Umum',
  wabah: 'Wabah',
  pencegahan: 'Pencegahan',
  pertolongan_pertama: 'Pertolongan Pertama',
  panduan_faskes: 'Panduan Faskes',
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  umum: { bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700' },
  wabah: { bg: 'bg-red-950/50', text: 'text-red-300', border: 'border-red-800' },
  pencegahan: { bg: 'bg-teal-950/50', text: 'text-teal-300', border: 'border-teal-800' },
  pertolongan_pertama: { bg: 'bg-amber-950/50', text: 'text-amber-300', border: 'border-amber-800' },
  panduan_faskes: { bg: 'bg-sky-950/50', text: 'text-sky-300', border: 'border-sky-800' },
};

const FIRST_AID_ITEMS = [
  { title: 'Demam Tinggi', icon: Thermometer, color: 'text-red-400', steps: ['Kompres hangat di dahi & ketiak', 'Minum paracetamol sesuai dosis', 'Perbanyak minum air putih', 'Ke puskesmas jika >40°C atau tidak membaik 2 hari'] },
  { title: 'Diare & Dehidrasi', icon: Droplets, color: 'text-sky-400', steps: ['Minum oralit setiap kali BAB', 'Hindari makanan berminyak & pedas', 'Cuci tangan dengan sabun', 'Ke puskesmas jika ada darah atau >2 hari'] },
  { title: 'Sesak Napas', icon: Wind, color: 'text-teal-400', steps: ['Duduk tegak atau setengah berbaring', 'Longgarkan pakaian', 'Hindari pemicu (asap, debu)', 'Segera ke puskesmas — jangan tunggu'] },
  { title: 'Luka & Perdarahan', icon: Heart, color: 'text-pink-400', steps: ['Tekan luka dengan kain bersih', 'Angkat bagian yang luka lebih tinggi', 'Jangan cabut benda yang menancap', 'Ke puskesmas untuk jahit & vaksin tetanus'] },
];

const VIDEO_TUTORIAL = {
  title: 'Cara Pakai Puskesmas Digital Mentawai',
  duration: '3:24',
  thumbnail: 'https://images.pexels.com/photos/6129507/pexels-photo-6129507.jpeg',
  description: 'Animasi tutorial lengkap tentang alur berobat di sistem puskesmas digital baru Mentawai.',
};

export default function LiterasiPortal() {
  const navigate = useNavigate();
  const [contents, setContents] = useState<LiteracyContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContent, setSelectedContent] = useState<LiteracyContent | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [showFirstAid, setShowFirstAid] = useState(false);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('literacy_content')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });
    setContents(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  const featured = contents.find(c => c.is_featured) || contents[0];
  const isOutbreak = featured?.category === 'wabah';

  const filtered = contents.filter(c => {
    const matchCat = selectedCategory === 'all' || c.category === selectedCategory;
    const matchSearch = !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch && c.id !== featured?.id;
  });

  const categories = ['all', ...Array.from(new Set(contents.map(c => c.category)))];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="text-slate-500 hover:text-slate-300 transition-colors p-1.5 hover:bg-slate-800 rounded-lg">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-bold text-white">Portal Literasi Kesehatan</span>
            </div>
          </div>
          <span className="text-xs text-slate-500 hidden sm:block">Mentawai Sehat — Edukasi untuk Semua</span>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-6 w-full">

        {/* Featured banner — dynamic based on Sector 3 priority */}
        {!loading && featured && (
          <div
            className={`relative rounded-2xl overflow-hidden mb-8 cursor-pointer group ${isOutbreak ? 'border-2 border-red-700' : 'border border-slate-700'}`}
            onClick={() => setSelectedContent(featured)}
          >
            <div className="absolute inset-0">
              {featured.image_url && (
                <img src={featured.image_url} alt={featured.title} className="w-full h-full object-cover opacity-25 group-hover:opacity-30 transition-opacity" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
            </div>
            <div className="relative p-6 sm:p-8">
              {isOutbreak && (
                <div className="inline-flex items-center gap-2 bg-red-900/70 border border-red-700 text-red-300 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
                  <AlertTriangle className="w-3 h-3" />
                  WABAH AKTIF — WASPADA
                </div>
              )}
              <div className="inline-flex items-center gap-1.5 mb-3">
                <span className={`text-xs px-2.5 py-1 rounded-full border ${(CATEGORY_COLORS[featured.category] || CATEGORY_COLORS.umum).bg} ${(CATEGORY_COLORS[featured.category] || CATEGORY_COLORS.umum).text} ${(CATEGORY_COLORS[featured.category] || CATEGORY_COLORS.umum).border}`}>
                  {CATEGORY_LABELS[featured.category] || featured.category}
                </span>
              </div>
              <h1 className="text-xl sm:text-3xl font-black text-white mb-2 leading-tight">{featured.title}</h1>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl line-clamp-2">{featured.content}</p>
              <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm font-medium group-hover:gap-3 transition-all">
                <span>Baca Panduan Lengkap</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}

        {/* Quick action buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <button
            onClick={() => setShowVideo(true)}
            className="group flex items-center gap-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-900/50 border border-sky-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <PlayCircle className="w-5 h-5 text-sky-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-white">Tutorial Video</p>
              <p className="text-xs text-slate-500">Cara pakai puskesmas digital</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 ml-auto" />
          </button>

          <button
            onClick={() => setShowFirstAid(true)}
            className="group flex items-center gap-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-900/50 border border-amber-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-white">Arsip Pertolongan Pertama</p>
              <p className="text-xs text-slate-500">Panduan A-Z penanganan mandiri</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 ml-auto" />
          </button>

          <button
            onClick={() => navigate('/login?role=nakes')}
            className="group flex items-center gap-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-900/50 border border-teal-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-teal-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-white">Akses Tenaga Medis</p>
              <p className="text-xs text-slate-500">Portal klinis puskesmas</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 ml-auto" />
          </button>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari artikel kesehatan..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-emerald-600 focus:outline-none transition-colors"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 text-xs px-3 py-2 rounded-xl border transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-900/50 text-emerald-300 border-emerald-800'
                    : 'bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-700 hover:text-slate-400'
                }`}
              >
                {cat === 'all' ? 'Semua' : (CATEGORY_LABELS[cat] || cat)}
              </button>
            ))}
          </div>
        </div>

        {/* Content grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(item => {
              const catStyle = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.umum;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedContent(item)}
                  className="group bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden text-left transition-all"
                >
                  {item.image_url && (
                    <div className="h-36 overflow-hidden">
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-4">
                    <span className={`inline-block text-xs px-2.5 py-1 rounded-full border mb-2.5 ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                      {CATEGORY_LABELS[item.category] || item.category}
                    </span>
                    <h3 className="text-sm font-bold text-white leading-tight mb-1.5 line-clamp-2">{item.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{item.content}</p>
                    <div className="mt-3 flex items-center gap-1 text-emerald-500 text-xs font-medium">
                      <span>Baca selengkapnya</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {filtered.length === 0 && !loading && (
          <div className="text-center py-12">
            <BookOpen className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-slate-600 text-sm">Tidak ada artikel ditemukan</p>
          </div>
        )}
      </main>

      {/* Article detail modal */}
      {selectedContent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl my-4 shadow-2xl overflow-hidden">
            {selectedContent.image_url && (
              <div className="h-48 overflow-hidden relative">
                <img src={selectedContent.image_url} alt={selectedContent.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <span className={`inline-block text-xs px-2.5 py-1 rounded-full border mb-2 ${(CATEGORY_COLORS[selectedContent.category] || CATEGORY_COLORS.umum).bg} ${(CATEGORY_COLORS[selectedContent.category] || CATEGORY_COLORS.umum).text} ${(CATEGORY_COLORS[selectedContent.category] || CATEGORY_COLORS.umum).border}`}>
                    {CATEGORY_LABELS[selectedContent.category] || selectedContent.category}
                  </span>
                  <h2 className="text-xl font-bold text-white leading-tight">{selectedContent.title}</h2>
                </div>
                <button onClick={() => setSelectedContent(null)} className="text-slate-500 hover:text-white transition-colors shrink-0 p-1.5 hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="prose prose-sm prose-invert max-w-none">
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedContent.content}</p>
              </div>
              {selectedContent.disease_code && (
                <div className="mt-4 bg-slate-800/60 border border-slate-700 rounded-xl p-3">
                  <span className="text-xs text-slate-500">Kode ICD-10: </span>
                  <span className="text-xs text-teal-400 font-medium">[{selectedContent.disease_code}]</span>
                </div>
              )}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setSelectedContent(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 text-sm transition-colors"
                >
                  Tutup
                </button>
                <button
                  onClick={() => { setSelectedContent(null); navigate('/login?role=nakes'); }}
                  className="flex-1 flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-2.5 rounded-xl text-sm transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  Hubungi Puskesmas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video tutorial modal */}
      {showVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
              <h2 className="font-bold text-white">{VIDEO_TUTORIAL.title}</h2>
              <button onClick={() => setShowVideo(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="relative">
              <img src={VIDEO_TUTORIAL.thumbnail} alt={VIDEO_TUTORIAL.title} className="w-full h-56 object-cover" />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors">
                  <PlayCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">{VIDEO_TUTORIAL.duration}</div>
            </div>
            <div className="p-5">
              <p className="text-slate-400 text-sm">{VIDEO_TUTORIAL.description}</p>
              <div className="mt-4 bg-amber-950/40 border border-amber-900/60 rounded-xl p-3">
                <p className="text-xs text-amber-400">Tutorial video tersedia secara offline di seluruh perangkat puskesmas. Minta petugas untuk memutar video ini saat kunjungan Anda.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* First aid directory modal */}
      {showFirstAid && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl my-4 shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700 sticky top-0 bg-slate-900 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-amber-400" />
                <h2 className="font-bold text-white">Arsip Pertolongan Pertama</h2>
              </div>
              <button onClick={() => setShowFirstAid(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FIRST_AID_ITEMS.map(item => (
                <div key={item.title} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <h3 className="font-bold text-white text-sm">{item.title}</h3>
                  </div>
                  <ol className="space-y-2">
                    {item.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-slate-700 text-slate-400 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">{i + 1}</span>
                        <span className="text-xs text-slate-400 leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
            <div className="px-5 pb-5">
              <div className="bg-red-950/40 border border-red-900/60 rounded-xl p-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300">Pertolongan pertama hanya bersifat sementara. Segera kunjungi Puskesmas Mentawai terdekat untuk penanganan medis profesional.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
