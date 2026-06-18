import { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { generateColorScheme, simulateColorBlind, hexToOklch, oklchToHex } from '@/utils/color';
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

const WHEEL_SIZE = 140;
const WHEEL_RADIUS = 55;
const WHEEL_CENTER = WHEEL_SIZE / 2;

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

  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const calculateHue = useCallback((clientX: number, clientY: number): number | null => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const x = clientX - rect.left - WHEEL_CENTER;
    const y = clientY - rect.top - WHEEL_CENTER;
    const dist = Math.sqrt(x * x + y * y);
    if (dist < WHEEL_RADIUS - 20 || dist > WHEEL_RADIUS + 20) return null;
    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    return angle % 360;
  }, []);

  const handleInteraction = useCallback(
    (clientX: number, clientY: number) => {
      const newHue = calculateHue(clientX, clientY);
      if (newHue === null) return;
      const newColor = oklchToHex(oklch.l, oklch.c, newHue);
      updateBrandColor(newColor);
    },
    [calculateHue, oklch.l, oklch.c, updateBrandColor]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      handleInteraction(e.clientX, e.clientY);
    },
    [handleInteraction]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleInteraction(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleInteraction]);

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

  const conicGradient = useMemo(() => {
    const stops = [];
    for (let i = 0; i <= 360; i += 30) {
      const color = oklchToHex(oklch.l, oklch.c, i);
      stops.push(`${color} ${i}deg`);
    }
    return `conic-gradient(from -90deg, ${stops.join(', ')})`;
  }, [oklch.l, oklch.c]);

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
          <svg
            ref={svgRef}
            width={WHEEL_SIZE}
            height={WHEEL_SIZE}
            viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
            onMouseDown={handleMouseDown}
            className={cn('cursor-crosshair select-none', isDragging && 'cursor-grabbing')}
          >
            <defs>
              <mask id="wheelMask">
                <circle cx={WHEEL_CENTER} cy={WHEEL_CENTER} r={WHEEL_RADIUS} fill="white" />
                <circle cx={WHEEL_CENTER} cy={WHEEL_CENTER} r={WHEEL_RADIUS - 16} fill="black" />
              </mask>
            </defs>
            <foreignObject
              x={WHEEL_CENTER - WHEEL_RADIUS}
              y={WHEEL_CENTER - WHEEL_RADIUS}
              width={WHEEL_RADIUS * 2}
              height={WHEEL_RADIUS * 2}
              mask="url(#wheelMask)"
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: conicGradient,
                }}
              />
            </foreignObject>
            {markers.map((h, i) => {
              const rad = (h - 90) * (Math.PI / 180);
              const cx = WHEEL_CENTER + WHEEL_RADIUS * Math.cos(rad);
              const cy = WHEEL_CENTER + WHEEL_RADIUS * Math.sin(rad);
              return (
                <g key={i}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={i === 0 ? 9 : 6}
                    fill="white"
                    stroke="#18181b"
                    strokeWidth={2}
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                  />
                  {i === 0 && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill={brandColor}
                    />
                  )}
                </g>
              );
            })}
            <circle
              cx={WHEEL_CENTER}
              cy={WHEEL_CENTER}
              r={WHEEL_RADIUS - 20}
              fill="#18181b"
              stroke="#27272a"
              strokeWidth={1}
            />
            <text
              x={WHEEL_CENTER}
              y={WHEEL_CENTER + 4}
              textAnchor="middle"
              className="fill-zinc-400 text-[11px] font-mono"
            >
              {Math.round(hue)}°
            </text>
          </svg>
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
