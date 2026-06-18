import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useStore } from '@/store/useStore';

function rgbaToHex(rgba: string): string {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return '#ffffff';
  const r = parseInt(match[1]).toString(16).padStart(2, '0');
  const g = parseInt(match[2]).toString(16).padStart(2, '0');
  const b = parseInt(match[3]).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

function hexAndAlphaToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function extractAlpha(rgba: string): number {
  const match = rgba.match(/rgba?\([^)]*,\s*([\d.]+)\)/);
  return match ? parseFloat(match[1]) : 1;
}

export default function GlassmorphismEditor() {
  const project = useStore((s) => s.projects.find((p) => p.id === s.activeProjectId));
  const updateGlassmorphism = useStore((s) => s.updateGlassmorphism);
  const [copied, setCopied] = useState(false);

  if (!project) return null;

  const glass = project.glassmorphism;
  const bgHex = rgbaToHex(glass.backgroundColor);
  const bgAlpha = extractAlpha(glass.backgroundColor);
  const borderHex = rgbaToHex(glass.borderColor);
  const borderAlpha = extractAlpha(glass.borderColor);

  const bgGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

  const previewStyle: React.CSSProperties = {
    backdropFilter: `blur(${glass.blur}px)`,
    WebkitBackdropFilter: `blur(${glass.blur}px)`,
    backgroundColor: glass.backgroundColor,
    border: `1px solid ${glass.borderColor}`,
  };

  const cssCode = [
    `backdrop-filter: blur(${glass.blur}px);`,
    `-webkit-backdrop-filter: blur(${glass.blur}px);`,
    `background: ${glass.backgroundColor};`,
    `border: 1px solid ${glass.borderColor};`,
  ].join('\n');

  const copyCSS = () => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-4">
      <div
        className="relative h-48 rounded-xl overflow-hidden flex items-center justify-center"
        style={{ background: bgGradient }}
      >
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div
          style={previewStyle}
          className="relative w-48 h-28 rounded-xl flex items-center justify-center"
        >
          <span className="text-white text-sm font-medium">毛玻璃预览</span>
        </div>
      </div>

      <div className="space-y-3 bg-zinc-900 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400 w-20">背景模糊</span>
          <input
            type="range" min={0} max={40} value={glass.blur}
            onChange={(e) => updateGlassmorphism({ blur: Number(e.target.value) })}
            className="flex-1 accent-zinc-400"
          />
          <span className="text-xs text-zinc-300 font-mono w-10 text-right">{glass.blur}px</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400 w-20">背景颜色</span>
          <input
            type="color" value={bgHex}
            onChange={(e) => updateGlassmorphism({ backgroundColor: hexAndAlphaToRgba(e.target.value, bgAlpha) })}
            className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
          />
          <span className="text-xs text-zinc-500 font-mono">{bgHex}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400 w-20">背景透明度</span>
          <input
            type="range" min={0} max={100} value={Math.round(bgAlpha * 100)}
            onChange={(e) => updateGlassmorphism({ backgroundColor: hexAndAlphaToRgba(bgHex, Number(e.target.value) / 100), opacity: Number(e.target.value) / 100 })}
            className="flex-1 accent-zinc-400"
          />
          <span className="text-xs text-zinc-300 font-mono w-10 text-right">{Math.round(bgAlpha * 100)}%</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400 w-20">边框颜色</span>
          <input
            type="color" value={borderHex}
            onChange={(e) => updateGlassmorphism({ borderColor: hexAndAlphaToRgba(e.target.value, borderAlpha) })}
            className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
          />
          <span className="text-xs text-zinc-500 font-mono">{borderHex}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400 w-20">边框透明度</span>
          <input
            type="range" min={0} max={100} value={Math.round(borderAlpha * 100)}
            onChange={(e) => updateGlassmorphism({ borderColor: hexAndAlphaToRgba(borderHex, Number(e.target.value) / 100) })}
            className="flex-1 accent-zinc-400"
          />
          <span className="text-xs text-zinc-300 font-mono w-10 text-right">{Math.round(borderAlpha * 100)}%</span>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-lg p-3 flex items-start gap-2">
        <code className="text-xs text-zinc-300 font-mono flex-1 whitespace-pre-wrap">{cssCode}</code>
        <button onClick={copyCSS} className="text-zinc-500 hover:text-zinc-300 shrink-0 mt-0.5">
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}
