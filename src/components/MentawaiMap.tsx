interface HotspotData {
  island: string;
  x: number;
  y: number;
  risk: 'low' | 'medium' | 'high' | 'critical';
  label: string;
  cases: number;
}

const HOTSPOTS: HotspotData[] = [
  { island: 'Siberut Utara', x: 120, y: 95, risk: 'high', label: 'Siberut Utara', cases: 142 },
  { island: 'Siberut Selatan', x: 145, y: 155, risk: 'medium', label: 'Siberut Selatan', cases: 87 },
  { island: 'Sipora', x: 220, y: 230, risk: 'critical', label: 'Sipora / Tuapejat', cases: 210 },
  { island: 'Pagai Utara', x: 285, y: 285, risk: 'medium', label: 'Pagai Utara', cases: 63 },
  { island: 'Pagai Selatan', x: 330, y: 350, risk: 'low', label: 'Pagai Selatan', cases: 28 },
];

const RISK_COLORS: Record<string, { fill: string; ring: string; label: string }> = {
  low: { fill: '#22c55e', ring: '#16a34a', label: 'Rendah' },
  medium: { fill: '#f59e0b', ring: '#d97706', label: 'Sedang' },
  high: { fill: '#ef4444', ring: '#dc2626', label: 'Tinggi' },
  critical: { fill: '#7f1d1d', ring: '#ef4444', label: 'Kritis' },
};

interface MentawaiMapProps {
  onHotspotClick?: (hotspot: HotspotData) => void;
}

export default function MentawaiMap({ onHotspotClick }: MentawaiMapProps) {
  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 480 480"
        className="w-full h-auto max-h-[420px]"
        style={{ filter: 'drop-shadow(0 4px 24px rgba(0,150,200,0.15))' }}
      >
        {/* Ocean background */}
        <defs>
          <radialGradient id="oceanGrad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#0e4f6e" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#062940" stopOpacity="1" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <rect width="480" height="480" fill="url(#oceanGrad)" rx="16" />

        {/* Grid lines */}
        {[80, 160, 240, 320, 400].map(v => (
          <g key={v}>
            <line x1={v} y1="0" x2={v} y2="480" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1" />
            <line x1="0" y1={v} x2="480" y2={v} stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1" />
          </g>
        ))}

        {/* Pulau Siberut */}
        <path
          d="M 85 60 C 95 50 115 48 130 55 C 145 62 155 75 162 92 C 170 112 168 138 162 158 C 156 178 145 192 132 200 C 118 208 102 206 92 196 C 80 185 74 166 72 145 C 70 124 72 100 80 80 Z"
          fill="#1d6b4f"
          stroke="#2d9b6f"
          strokeWidth="1.5"
          opacity="0.85"
        />

        {/* Pulau Sipora */}
        <path
          d="M 188 205 C 198 198 215 196 228 202 C 242 208 252 220 256 236 C 260 252 256 268 248 278 C 240 288 226 292 214 288 C 202 284 192 274 188 260 C 184 246 184 228 188 212 Z"
          fill="#1a5e42"
          stroke="#2d9b6f"
          strokeWidth="1.5"
          opacity="0.85"
        />

        {/* Pulau Pagai Utara */}
        <path
          d="M 258 262 C 268 255 282 254 294 260 C 306 266 313 278 314 292 C 315 306 308 318 298 325 C 288 332 275 332 266 326 C 257 320 252 308 252 294 C 252 280 255 270 258 268 Z"
          fill="#1a5e42"
          stroke="#2d9b6f"
          strokeWidth="1.5"
          opacity="0.85"
        />

        {/* Pulau Pagai Selatan */}
        <path
          d="M 308 320 C 318 312 332 310 344 316 C 356 322 363 335 363 350 C 363 365 356 377 345 383 C 334 389 320 388 311 382 C 302 376 297 365 297 350 C 297 338 302 328 308 326 Z"
          fill="#174f38"
          stroke="#2d9b6f"
          strokeWidth="1.5"
          opacity="0.85"
        />

        {/* Island Labels */}
        <text x="105" y="45" fill="#7dd3a8" fontSize="9" fontFamily="system-ui" textAnchor="middle" opacity="0.8">P. SIBERUT</text>
        <text x="222" y="194" fill="#7dd3a8" fontSize="9" fontFamily="system-ui" textAnchor="middle" opacity="0.8">P. SIPORA</text>
        <text x="283" y="252" fill="#7dd3a8" fontSize="9" fontFamily="system-ui" textAnchor="middle" opacity="0.8">P. PAGAI UTARA</text>
        <text x="330" y="310" fill="#7dd3a8" fontSize="9" fontFamily="system-ui" textAnchor="middle" opacity="0.8">P. PAGAI SELATAN</text>

        {/* Hotspot pulsing rings */}
        {HOTSPOTS.map((h) => {
          const c = RISK_COLORS[h.risk];
          return (
            <g key={h.island} className="cursor-pointer" onClick={() => onHotspotClick?.(h)}>
              <circle cx={h.x} cy={h.y} r="20" fill={c.fill} fillOpacity="0.12" className="animate-ping" style={{ animationDuration: '2s' }} />
              <circle cx={h.x} cy={h.y} r="14" fill={c.fill} fillOpacity="0.2" />
              <circle cx={h.x} cy={h.y} r="8" fill={c.fill} stroke={c.ring} strokeWidth="2" filter="url(#glow)" />
              <text x={h.x + 12} y={h.y - 10} fill="#e2f4ff" fontSize="8" fontFamily="system-ui" fontWeight="bold" opacity="0.9">{h.cases}</text>
            </g>
          );
        })}

        {/* Compass */}
        <g transform="translate(440, 40)">
          <circle cx="0" cy="0" r="16" fill="#0a3550" stroke="#1d7faa" strokeWidth="1" opacity="0.8" />
          <text x="0" y="-6" fill="#94d4f0" fontSize="8" fontFamily="system-ui" textAnchor="middle" fontWeight="bold">U</text>
          <text x="0" y="12" fill="#94d4f0" fontSize="7" fontFamily="system-ui" textAnchor="middle">S</text>
          <text x="-10" y="4" fill="#94d4f0" fontSize="7" fontFamily="system-ui" textAnchor="middle">B</text>
          <text x="10" y="4" fill="#94d4f0" fontSize="7" fontFamily="system-ui" textAnchor="middle">T</text>
          <polygon points="0,-12 2,0 0,3 -2,0" fill="#e2f4ff" />
        </g>

        {/* Title */}
        <text x="240" y="460" fill="#7dd3a8" fontSize="9" fontFamily="system-ui" textAnchor="middle" opacity="0.6">
          KEPULAUAN MENTAWAI — RADAR PANAS PENYAKIT REAL-TIME
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center mt-3">
        {Object.entries(RISK_COLORS).map(([risk, c]) => (
          <div key={risk} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.fill }} />
            <span className="text-xs text-slate-400">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
