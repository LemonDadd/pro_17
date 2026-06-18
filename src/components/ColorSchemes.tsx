import { useMemo } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { generateColorScheme, simulateColorBlind, hexToOklch } from '@/utils/color';
import type { ColorSchemeType, ColorBlindType } from '@/types';

const SCHEME_LABELS: Record<ColorSchemeType, string> = {
  analogous: '类似',
  complementary: '互补',
  triadic: '三角',
  tetradic: '四元',
};

const SCHEME_TYPES: ColorSchemeType[] = ['analogous', 'complementary', 'triadic', 'tetradic'];

const BLIND_OPTIONS: { value: ColorBlindType; label: string }[] = [
  { value: 'none', label: '无' },
  { value: 'protan', label: '红色盲' },
  { value: 'deutan', label: '绿色盲' },
];

export default function ColorSchemes() {
  const projects = useStore((s) => s.projects);
  const activeProjectId = useStore((s) => s.activeProjectId);
  const updateColorSchemeType = useStore((s) => s.updateColorSchemeType);
  const colorBlindMode = useStore((s) => s.colorBlindMode);
  const setColorBlindMode = useStore((s) => s.setColorBlindMode);

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const brandColor = activeProject?.brandColor ?? '#6366f1';
  const schemeType = activeProject?.colorSchemeType ?? 'complementary';

  const schemeColors = useMemo(
    () => generateColorScheme(brandColor, schemeType),
    [brandColor, schemeType]
  );

  const displayColors = useMemo(
    () =>
      colorBlindMode === 'none'
        ? schemeColors
        : schemeColors.map((c) => simulateColorBlind(c, colorBlindMode)),
    [schemeColors, colorBlindMode]
  );

  const hue = hexToOklch(brandColor).h;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-zinc-300 tracking-wide uppercase">色彩方案</h3>

      <div className="flex gap-1.5">
        {SCHEME_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => updateColorSchemeType(type)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              schemeType === type
                ? 'bg-zinc-100 text-zinc-900 shadow-sm'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
            )}
          >
            {SCHEME_LABELS[type]}
          </button>
        ))}
      </div>

      <div className="flex justify-center">
        <ColorWheelSVG hue={hue} schemeType={schemeType} />
      </div>

      <div className="flex gap-2 justify-center">
        {displayColors.map((color, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div
              className="w-14 h-14 rounded-xl border-2 border-zinc-700 shadow-lg transition-all hover:scale-105"
              style={{ backgroundColor: color }}
            />
            <span className="text-[10px] font-mono text-zinc-500">{color.toUpperCase()}</span>
          </div>
        ))}
      </div>

      {colorBlindMode !== 'none' && (
        <div className="flex items-center gap-2 justify-center">
          <EyeOff className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs text-amber-400">色盲模拟已开启</span>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-xs text-zinc-400">色盲模拟</span>
        </div>
        <div className="flex gap-1.5">
          {BLIND_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setColorBlindMode(opt.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                colorBlindMode === opt.value
                  ? 'bg-zinc-100 text-zinc-900 shadow-sm'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ColorWheelSVG({ hue, schemeType }: { hue: number; schemeType: ColorSchemeType }) {
  const markers = useMemo(() => {
    switch (schemeType) {
      case 'analogous':
        return [(hue - 30 + 360) % 360, hue, (hue + 30) % 360];
      case 'complementary':
        return [hue, (hue + 180) % 360];
      case 'triadic':
        return [hue, (hue + 120) % 360, (hue + 240) % 360];
      case 'tetradic':
        return [hue, (hue + 90) % 360, (hue + 180) % 360, (hue + 270) % 360];
      default:
        return [hue];
    }
  }, [hue, schemeType]);

  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <defs>
        <linearGradient id="hueGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff0000" />
          <stop offset="16.7%" stopColor="#ffff00" />
          <stop offset="33.3%" stopColor="#00ff00" />
          <stop offset="50%" stopColor="#00ffff" />
          <stop offset="66.7%" stopColor="#0000ff" />
          <stop offset="83.3%" stopColor="#ff00ff" />
          <stop offset="100%" stopColor="#ff0000" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="50" fill="none" stroke="url(#hueGrad)" strokeWidth="8" opacity="0.6" />
      {markers.map((h, i) => {
        const rad = (h - 90) * (Math.PI / 180);
        const cx = 60 + 50 * Math.cos(rad);
        const cy = 60 + 50 * Math.sin(rad);
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={i === 0 ? 6 : 4}
            fill={i === 0 ? '#fff' : '#ddd'}
            stroke={i === 0 ? '#000' : '#555'}
            strokeWidth={2}
          />
        );
      })}
      <circle cx="60" cy="60" r="20" fill="#18181b" />
      <text x="60" y="64" textAnchor="middle" className="fill-zinc-500 text-[10px] font-mono">
        {Math.round(hue)}°
      </text>
    </svg>
  );
}
