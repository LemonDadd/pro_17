import { useState } from 'react';
import { Copy, Check, Plus, Trash2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { ShadowLayer } from '@/types';

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function toShadowCSS(layers: ShadowLayer[]) {
  return layers.map((l) => {
    const inset = l.inset ? 'inset ' : '';
    return `${inset}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${l.color}`;
  }).join(', ');
}

const PRESETS: { name: string; layers: Omit<ShadowLayer, 'id'>[] }[] = [
  { name: 'sm', layers: [{ x: 0, y: 1, blur: 2, spread: 0, color: 'rgba(0,0,0,0.05)', inset: false }] },
  { name: 'md', layers: [{ x: 0, y: 4, blur: 6, spread: -1, color: 'rgba(0,0,0,0.1)', inset: false }] },
  { name: 'lg', layers: [{ x: 0, y: 10, blur: 15, spread: -3, color: 'rgba(0,0,0,0.1)', inset: false }] },
  {
    name: 'elevated',
    layers: [
      { x: 0, y: 1, blur: 2, spread: 0, color: 'rgba(0,0,0,0.05)', inset: false },
      { x: 0, y: 4, blur: 6, spread: -1, color: 'rgba(0,0,0,0.1)', inset: false },
      { x: 0, y: 10, blur: 15, spread: -3, color: 'rgba(0,0,0,0.1)', inset: false },
    ],
  },
];

function LayerRow({ layer, onChange, onRemove }: {
  layer: ShadowLayer;
  onChange: (patch: Partial<ShadowLayer>) => void;
  onRemove: () => void;
}) {
  const fields: { key: keyof ShadowLayer; label: string; min: number; max: number }[] = [
    { key: 'x', label: 'X', min: -50, max: 50 },
    { key: 'y', label: 'Y', min: -50, max: 50 },
    { key: 'blur', label: '模糊', min: 0, max: 100 },
    { key: 'spread', label: '扩展', min: -50, max: 50 },
  ];

  return (
    <div className="bg-zinc-900 rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={layer.color.startsWith('rgba') ? '#000000' : layer.color}
          onChange={(e) => onChange({ color: e.target.value })}
          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
        />
        <span className="text-xs text-zinc-500 font-mono flex-1">{layer.color}</span>
        <label className="flex items-center gap-1 text-xs text-zinc-400 cursor-pointer">
          <input
            type="checkbox" checked={layer.inset}
            onChange={(e) => onChange({ inset: e.target.checked })}
            className="accent-zinc-400"
          />
          内阴影
        </label>
        <button onClick={onRemove} className="text-zinc-600 hover:text-red-400"><Trash2 size={14} /></button>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {fields.map((f) => (
          <div key={f.key} className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 w-6">{f.label}</span>
            <input
              type="range" min={f.min} max={f.max}
              value={layer[f.key] as number}
              onChange={(e) => onChange({ [f.key]: Number(e.target.value) })}
              className="flex-1 accent-zinc-400"
            />
            <span className="text-xs text-zinc-400 font-mono w-6 text-right">{layer[f.key] as number}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ShadowEditor() {
  const project = useStore((s) => s.projects.find((p) => p.id === s.activeProjectId));
  const updateShadows = useStore((s) => s.updateShadows);
  const [copied, setCopied] = useState(false);

  if (!project) return null;

  const shadows = project.shadows;
  const css = toShadowCSS(shadows);

  const addLayer = () => {
    const newLayer: ShadowLayer = { id: genId(), x: 0, y: 4, blur: 6, spread: 0, color: 'rgba(0,0,0,0.1)', inset: false };
    updateShadows([...shadows, newLayer]);
  };

  const removeLayer = (id: string) => updateShadows(shadows.filter((l) => l.id !== id));

  const updateLayer = (id: string, patch: Partial<ShadowLayer>) => {
    updateShadows(shadows.map((l) => l.id === id ? { ...l, ...patch } : l));
  };

  const applyPreset = (preset: typeof PRESETS[number]) => {
    updateShadows(preset.layers.map((l) => ({ ...l, id: genId() })));
  };

  const copyCSS = () => {
    navigator.clipboard.writeText(`box-shadow: ${css};`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center p-8 bg-zinc-900 rounded-xl">
        <div
          className="w-40 h-24 rounded-lg bg-zinc-100"
          style={{ boxShadow: css }}
        />
      </div>

      <div className="space-y-1">
        <span className="text-xs text-zinc-500">预设</span>
        <div className="flex gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className="flex-1 px-3 py-1.5 text-xs rounded-md bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors border border-zinc-700"
            >{p.name}</button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {shadows.map((layer) => (
          <LayerRow
            key={layer.id}
            layer={layer}
            onChange={(patch) => updateLayer(layer.id, patch)}
            onRemove={() => removeLayer(layer.id)}
          />
        ))}
      </div>

      <button
        onClick={addLayer}
        className="w-full flex items-center justify-center gap-1 py-2 text-xs text-zinc-400 bg-zinc-900 rounded-lg border border-dashed border-zinc-700 hover:border-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <Plus size={14} /> 添加阴影层
      </button>

      <div className="bg-zinc-900 rounded-lg p-3 flex items-center gap-2">
        <code className="text-xs text-zinc-300 font-mono flex-1 break-all">box-shadow: {css};</code>
        <button onClick={copyCSS} className="text-zinc-500 hover:text-zinc-300 shrink-0">
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}
