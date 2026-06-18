import { Sun, Moon, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { generatePalette } from '@/utils/color';

export default function PreviewPanel() {
  const projects = useStore((s) => s.projects);
  const activeProjectId = useStore((s) => s.activeProjectId);
  const previewMode = useStore((s) => s.previewMode);
  const setPreviewMode = useStore((s) => s.setPreviewMode);

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const brandColor = activeProject?.brandColor ?? '#6366f1';
  const palette = generatePalette(brandColor);
  const isLight = previewMode === 'light';

  const bg = isLight ? '#ffffff' : '#09090b';
  const cardBg = isLight ? palette['50'] : palette['900'];
  const textPrimary = isLight ? '#18181b' : '#f4f4f5';
  const textSecondary = isLight ? '#52525b' : '#a1a1aa';
  const border = isLight ? palette['300'] : palette['700'];

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
        className="rounded-xl p-5 space-y-4 border transition-colors"
        style={{ backgroundColor: bg, borderColor: border }}
      >
        <div className="flex gap-2">
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
            style={{ backgroundColor: palette['500'] }}
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
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: textSecondary }}>
            输入框
          </label>
          <input
            readOnly
            value="示例文本内容"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-shadow focus:ring-2"
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

        <div
          className="rounded-xl p-4 shadow-md"
          style={{ backgroundColor: cardBg, borderColor: border, borderWidth: '1px', borderStyle: 'solid' }}
        >
          <h4 className="text-sm font-semibold mb-1" style={{ color: textPrimary }}>卡片标题</h4>
          <p className="text-xs leading-relaxed" style={{ color: textSecondary }}>
            这是一个使用当前调色板生成的卡片组件预览。文字颜色和背景颜色都基于品牌色自动计算。
          </p>
        </div>

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
