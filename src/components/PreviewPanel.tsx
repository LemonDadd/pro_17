import { Sun, Moon, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { generatePalette, contrastPass } from '@/utils/color';
import type { GradientStop, ShadowLayer } from '@/types';

function gradientToCSS(type: 'linear' | 'radial', angle: number, stops: GradientStop[]) {
  const s = [...stops].sort((a, b) => a.position - b.position).map((st) => `${st.color} ${st.position}%`).join(', ');
  return type === 'linear' ? `linear-gradient(${angle}deg, ${s})` : `radial-gradient(circle, ${s})`;
}

function shadowToCSS(layers: ShadowLayer[]) {
  return layers.map((l) => {
    const inset = l.inset ? 'inset ' : '';
    return `${inset}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${l.color}`;
  }).join(', ');
}

export default function PreviewPanel() {
  const projects = useStore((s) => s.projects);
  const activeProjectId = useStore((s) => s.activeProjectId);
  const previewMode = useStore((s) => s.previewMode);
  const setPreviewMode = useStore((s) => s.setPreviewMode);

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const brandColor = activeProject?.brandColor ?? '#6366f1';
  const palette = generatePalette(brandColor);
  const isLight = previewMode === 'light';

  const gradient = activeProject?.gradient;
  const shadows = activeProject?.shadows ?? [];
  const glass = activeProject?.glassmorphism;

  const gradientCSS = gradient ? gradientToCSS(gradient.type, gradient.angle, gradient.stops) : '';
  const shadowCSS = shadowToCSS(shadows);

  const bg = isLight ? '#ffffff' : '#09090b';
  const cardBg = isLight ? palette['50'] : palette['900'];
  const textPrimary = isLight ? '#18181b' : '#f4f4f5';
  const textSecondary = isLight ? '#52525b' : '#a1a1aa';
  const border = isLight ? palette['300'] : palette['700'];

  const gradientTextColor = gradient && gradient.stops.length > 0
    ? contrastPass(gradient.stops[Math.floor(gradient.stops.length / 2)].color).white
      ? '#ffffff'
      : '#000000'
    : '#ffffff';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-300 tracking-wide uppercase">预览</h3>
        <div className="flex gap-1 bg-zinc-800 rounded-lg p-0.5">
          <button
            onClick={() => setPreviewMode('light')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              isLight ? 'bg-zinc-100 text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            <Sun className="w-3.5 h-3.5" />
            浅色
          </button>
          <button
            onClick={() => setPreviewMode('dark')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              !isLight ? 'bg-zinc-100 text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            <Moon className="w-3.5 h-3.5" />
            深色
          </button>
        </div>
      </div>

      <div
        className="rounded-xl p-5 space-y-5 border transition-colors"
        style={{ backgroundColor: bg, borderColor: border }}
      >
        <div className="flex gap-2 flex-wrap">
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
            style={{ backgroundColor: palette['500'], boxShadow: shadowCSS }}
          >
            主要按钮
          </button>
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all hover:bg-opacity-10"
            style={{
              color: palette['500'],
              borderColor: palette['500'],
              borderWidth: '1.5px',
              borderStyle: 'solid',
              backgroundColor: 'transparent',
            }}
          >
            次要按钮
          </button>
          {gradient && (
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all hover:shadow-lg hover:brightness-105"
              style={{ background: gradientCSS, color: gradientTextColor, boxShadow: shadowCSS }}
            >
              渐变按钮
            </button>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: textSecondary }}>
            输入框
          </label>
          <input
            readOnly
            value="示例文本内容"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-shadow"
            style={{
              backgroundColor: isLight ? '#ffffff' : '#18181b',
              color: textPrimary,
              borderColor: border,
              borderWidth: '1.5px',
              borderStyle: 'solid',
              boxShadow: 'none',
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: cardBg, boxShadow: shadowCSS, border: `1px solid ${border}` }}
          >
            <h4 className="text-sm font-semibold mb-1" style={{ color: textPrimary }}>阴影卡片</h4>
            <p className="text-xs leading-relaxed" style={{ color: textSecondary }}>
              应用当前阴影配置的卡片效果
            </p>
          </div>

          {gradient && (
            <div
              className="rounded-xl p-4"
              style={{ background: gradientCSS, boxShadow: shadowCSS }}
            >
              <h4 className="text-sm font-semibold mb-1" style={{ color: gradientTextColor }}>渐变卡片</h4>
              <p className="text-xs leading-relaxed" style={{ color: gradientTextColor, opacity: 0.9 }}>
                应用当前渐变配置
              </p>
            </div>
          )}
        </div>

        {glass && (
          <div
            className="relative h-24 rounded-xl overflow-hidden flex items-center justify-center"
            style={{ background: gradientCSS || `linear-gradient(135deg, ${palette['400']}, ${palette['600']})` }}
          >
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, white 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
            <div
              className="relative w-40 rounded-xl py-3 flex items-center justify-center"
              style={{
                backdropFilter: `blur(${glass.blur}px)`,
                WebkitBackdropFilter: `blur(${glass.blur}px)`,
                backgroundColor: glass.backgroundColor,
                border: `1px solid ${glass.borderColor}`,
              }}
            >
              <span className="text-white text-xs font-medium">玻璃态效果</span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2.5"
            style={{ backgroundColor: isLight ? '#f0fdf4' : '#14532d' }}
          >
            <CheckCircle className="w-4 h-4 shrink-0" style={{ color: '#22c55e' }} />
            <span className="text-xs font-medium" style={{ color: isLight ? '#15803d' : '#86efac' }}>
              操作成功完成
            </span>
          </div>
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2.5"
            style={{ backgroundColor: isLight ? '#eff6ff' : '#1e3a5f' }}
          >
            <Info className="w-4 h-4 shrink-0" style={{ color: palette['500'] }} />
            <span className="text-xs font-medium" style={{ color: isLight ? palette['600'] : palette['300'] }}>
              这是一条提示信息
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
