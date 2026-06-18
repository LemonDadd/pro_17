import { useMemo } from 'react';
import { Type } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { generateTypographySteps } from '@/utils/export';
import { TYPOGRAPHY_RATIO_PRESETS } from '@/types';

export default function TypographyScaleEditor() {
  const { projects, activeProjectId, updateTypography } = useStore();
  const activeProject = projects.find((p) => p.id === activeProjectId);

  const typographySteps = useMemo(() => {
    if (!activeProject) return [];
    return generateTypographySteps(activeProject);
  }, [activeProject]);

  if (!activeProject) return null;

  return (
    <div className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
      <h3 className="flex items-center gap-2 text-sm font-medium text-zinc-300">
        <Type className="h-4 w-4" />
        Typography Scale 字阶生成器
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-xs text-zinc-400">基准字号 (px)</label>
          <input
            type="number"
            min={10}
            max={32}
            value={activeProject.typography.baseFontSize}
            onChange={(e) =>
              updateTypography({ baseFontSize: Number(e.target.value) || 16 })
            }
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-zinc-500 focus:outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs text-zinc-400">字体比例</label>
          <select
            value={activeProject.typography.ratio}
            onChange={(e) =>
              updateTypography({ ratio: Number(e.target.value) })
            }
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-zinc-500 focus:outline-none"
          >
            {TYPOGRAPHY_RATIO_PRESETS.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label} — {preset.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2 pt-2">
        {typographySteps.map((step) => (
          <div
            key={step.key}
            className="group flex items-center justify-between gap-4 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="inline-flex h-6 min-w-[56px] shrink-0 items-center justify-center rounded bg-zinc-800 px-2 font-mono text-[10px] font-medium text-zinc-400"
              >
                {step.key}
              </span>
              <span
                className="truncate text-zinc-200"
                style={{
                  fontSize: `${Math.min(step.fontSizePx, 48)}px`,
                  lineHeight: step.lineHeight,
                  fontFamily: 'Sora, sans-serif',
                }}
              >
                Aa 敏捷的棕色狐狸
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-3 font-mono text-[11px] text-zinc-500">
              <span>{step.fontSizePx}px</span>
              <span className="text-zinc-700">/</span>
              <span>{step.fontSizeRem}rem</span>
              <span className="text-zinc-700">/</span>
              <span>lh {step.lineHeight}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
