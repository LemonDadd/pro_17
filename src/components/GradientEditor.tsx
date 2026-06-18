import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Copy, Check, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import type { GradientStop } from '@/types';

const PRESETS: { name: string; stops: Omit<GradientStop, 'id'>[] }[] = [
  { name: '极光', stops: [{ color: '#00d2ff', position: 0 }, { color: '#3a7bd5', position: 50 }, { color: '#a8edea', position: 100 }] },
  { name: '日落', stops: [{ color: '#f12711', position: 0 }, { color: '#f5af19', position: 100 }] },
  { name: '海洋', stops: [{ color: '#2193b0', position: 0 }, { color: '#6dd5ed', position: 100 }] },
  { name: '森林', stops: [{ color: '#134e5e', position: 0 }, { color: '#71b280', position: 100 }] },
  { name: '浆果', stops: [{ color: '#8e2de2', position: 0 }, { color: '#4a00e0', position: 100 }] },
  { name: '火焰', stops: [{ color: '#f83600', position: 0 }, { color: '#f9d423', position: 100 }] },
];

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function toGradientCSS(type: 'linear' | 'radial', angle: number, centerX: number, centerY: number, stops: GradientStop[]) {
  const s = [...stops].sort((a, b) => a.position - b.position).map((st) => `${st.color} ${st.position}%`).join(', ');
  return type === 'linear'
    ? `linear-gradient(${angle}deg, ${s})`
    : `radial-gradient(circle at ${centerX}% ${centerY}%, ${s})`;
}

export default function GradientEditor() {
  const project = useStore((s) => s.projects.find((p) => p.id === s.activeProjectId));
  const updateGradient = useStore((s) => s.updateGradient);
  const updateGradientStops = useStore((s) => s.updateGradientStops);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const projectGradient = project?.gradient;
  const stops = useMemo(() => projectGradient?.stops ?? [], [projectGradient]);
  const type = projectGradient?.type ?? 'linear';
  const angle = projectGradient?.angle ?? 135;
  const centerX = projectGradient?.centerX ?? 50;
  const centerY = projectGradient?.centerY ?? 50;
  const selectedStop = stops.find((s) => s.id === selectedId);
  const css = projectGradient ? toGradientCSS(type, angle, centerX, centerY, stops) : '';

  const calcPosition = useCallback((clientX: number) => {
    if (!barRef.current) return 0;
    const rect = barRef.current.getBoundingClientRect();
    return Math.round(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
  }, []);

  useEffect(() => {
    if (!draggingId) return;
    const onMove = (e: MouseEvent) => {
      const pos = calcPosition(e.clientX);
      updateGradientStops(stops.map((s) => s.id === draggingId ? { ...s, position: pos } : s));
    };
    const onUp = () => setDraggingId(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [draggingId, stops, updateGradientStops, calcPosition]);

  if (!project) return null;

  const addStop = (position: number) => {
    const sorted = [...stops].sort((a, b) => a.position - b.position);
    let color = '#ffffff';
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].position <= position && sorted[i + 1].position >= position) {
        color = sorted[i].color;
        break;
      }
    }
    const newStop: GradientStop = { id: genId(), color, position };
    updateGradientStops([...stops, newStop]);
    setSelectedId(newStop.id);
  };

  const removeStop = (id: string) => {
    if (stops.length <= 2) return;
    updateGradientStops(stops.filter((s) => s.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const updateStop = (id: string, patch: Partial<GradientStop>) => {
    updateGradientStops(stops.map((s) => s.id === id ? { ...s, ...patch } : s));
  };

  const applyPreset = (preset: typeof PRESETS[number]) => {
    const newStops: GradientStop[] = preset.stops.map((s) => ({ ...s, id: genId() }));
    updateGradientStops(newStops);
    setSelectedId(newStops[0].id);
  };

  const copyCSS = () => {
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-4">
      <div
        className="h-28 rounded-xl border border-zinc-800"
        style={{ background: css }}
      />

      <div
        ref={barRef}
        className="relative h-8 rounded-lg border border-zinc-700 cursor-crosshair"
        style={{ background: css }}
        onClick={(e) => {
          if (e.target === barRef.current || (e.target as HTMLElement).dataset.bar === 'true') {
            addStop(calcPosition(e.clientX));
          }
        }}
      >
        <div data-bar="true" className="absolute inset-0" />
        {stops.map((stop) => (
          <div
            key={stop.id}
            className={cn(
              'absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 cursor-grab active:cursor-grabbing shadow-md',
              selectedId === stop.id ? 'border-white scale-125' : 'border-zinc-400'
            )}
            style={{ left: `${stop.position}%`, backgroundColor: stop.color }}
            onMouseDown={(e) => { e.stopPropagation(); setSelectedId(stop.id); setDraggingId(stop.id); }}
          />
        ))}
      </div>

      {selectedStop && (
        <div className="flex items-center gap-3 bg-zinc-900 p-3 rounded-lg">
          <input
            type="color"
            value={selectedStop.color}
            onChange={(e) => updateStop(selectedStop.id, { color: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
          />
          <div className="flex-1">
            <label className="text-xs text-zinc-400">位置</label>
            <input
              type="range" min={0} max={100} value={selectedStop.position}
              onChange={(e) => updateStop(selectedStop.id, { position: Number(e.target.value) })}
              className="w-full accent-zinc-400"
            />
          </div>
          <span className="text-xs text-zinc-300 font-mono w-8 text-right">{selectedStop.position}%</span>
          <button onClick={() => removeStop(selectedStop.id)} className="text-zinc-500 hover:text-red-400">
            <Trash2 size={14} />
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          className={cn('px-3 py-1.5 text-xs rounded-md', type === 'linear' ? 'bg-zinc-700 text-white' : 'bg-zinc-900 text-zinc-400')}
          onClick={() => updateGradient({ type: 'linear' })}
        >线性</button>
        <button
          className={cn('px-3 py-1.5 text-xs rounded-md', type === 'radial' ? 'bg-zinc-700 text-white' : 'bg-zinc-900 text-zinc-400')}
          onClick={() => updateGradient({ type: 'radial' })}
        >径向</button>
        {type === 'linear' ? (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-zinc-400">角度</span>
            <input
              type="range" min={0} max={360} value={angle}
              onChange={(e) => updateGradient({ angle: Number(e.target.value) })}
              className="w-24 accent-zinc-400"
            />
            <span className="text-xs text-zinc-300 font-mono w-8 text-right">{angle}°</span>
          </div>
        ) : (
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">X</span>
              <input
                type="range" min={0} max={100} value={centerX}
                onChange={(e) => updateGradient({ centerX: Number(e.target.value) })}
                className="w-20 accent-zinc-400"
              />
              <span className="text-xs text-zinc-300 font-mono w-8 text-right">{centerX}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Y</span>
              <input
                type="range" min={0} max={100} value={centerY}
                onChange={(e) => updateGradient({ centerY: Number(e.target.value) })}
                className="w-20 accent-zinc-400"
              />
              <span className="text-xs text-zinc-300 font-mono w-8 text-right">{centerY}%</span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <span className="text-xs text-zinc-500">预设</span>
        <div className="flex gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className="flex-1 h-8 rounded-md border border-zinc-700 hover:border-zinc-500 transition-colors"
              style={{ background: toGradientCSS('linear', 135, 50, 50, p.stops.map((s) => ({ ...s, id: '' }))) }}
              title={p.name}
            />
          ))}
        </div>
      </div>

      <div className="bg-zinc-900 rounded-lg p-3 flex items-center gap-2">
        <code className="text-xs text-zinc-300 font-mono flex-1 break-all">{css}</code>
        <button onClick={copyCSS} className="text-zinc-500 hover:text-zinc-300 shrink-0">
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}
