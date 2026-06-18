import { useMemo } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { generateColorScheme, simulateColorBlind, hexToOklch, oklchToHex } from '@/utils/color';
import ColorWheel from '@/components/ColorWheel';
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
  const updateBrandColor = useStore((s) => s.updateBrandColor);
  const updateColorSchemeType = useStore((s) => s.updateColorSchemeType);
  const colorBlindMode = useStore((s) => s.colorBlindMode);
  const setColorBlindMode = useStore((s) => s.setColorBlindMode);

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const brandColor = activeProject?.brandColor ?? '#6366f1';
  const schemeType = activeProject?.colorSchemeType ?? 'complementary';

  const oklch = useMemo(() => hexToOklch(brandColor), [brandColor]);
  const hue = oklch.h;

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

  const markers = useMemo(() => {
    switch (schemeType) {
      case 'analogous':
        return [(hue - 30 + 360) % 360, (hue + 30) % 360];
      case 'complementary':
        return [(hue + 180) % 360];
      case 'triadic':
        return [(hue + 120) % 360, (hue + 240) % 360];
      case 'tetradic':
        return [(hue + 90) % 360, (hue + 180) % 360, (hue + 270) % 360];
      default:
        return [];
    }
  }, [hue, schemeType]);

  const handleHueChange = (newHue: number) => {
    const newColor = oklchToHex(oklch.l, oklch.c, newHue);
    updateBrandColor(newColor);
  };

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
        <div className="relative">
          <ColorWheel
            hue={hue}
            lightness={oklch.l}
            chroma={oklch.c}
            onChange={handleHueChange}
            markers={markers}
          />
          <p className="text-center text-[10px] text-zinc-600 mt-2">
            拖拽或点击色轮调整主色
          </p>
        </div>
      </div>

      <div className="flex gap-2 justify-center flex-wrap">
        {displayColors.map((color, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div
              className="w-12 h-12 rounded-xl border-2 border-zinc-700 shadow-lg transition-all hover:scale-105 cursor-pointer"
              style={{ backgroundColor: color }}
              onClick={() => updateBrandColor(color)}
              title={`设为主色: ${color}`}
            />
            <span className="text-[10px] font-mono text-zinc-500">{color.toUpperCase().slice(0, 7)}</span>
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
