import { useState, useCallback } from 'react';
import { Check, X as XIcon, Copy, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { generatePalette, contrastPass } from '@/utils/color';
import { PALETTE_STEPS } from '@/types';
import type { PaletteStep } from '@/types';

export default function PaletteScale() {
  const projects = useStore((s) => s.projects);
  const activeProjectId = useStore((s) => s.activeProjectId);
  const activeProject = projects.find((p) => p.id === activeProjectId);
  const brandColor = activeProject?.brandColor ?? '#6366f1';

  const palette = generatePalette(brandColor);
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  const copyToClipboard = useCallback((hex: string, step: string) => {
    navigator.clipboard.writeText(hex).then(() => {
      setCopiedStep(step);
      setTimeout(() => setCopiedStep(null), 1500);
    });
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-zinc-300 tracking-wide uppercase">色阶</h3>

      <div className="flex gap-0.5 rounded-xl overflow-hidden">
        {PALETTE_STEPS.map((step) => {
          const hex = palette[step.toString()];
          const contrast = contrastPass(hex);
          const isCopied = copiedStep === step.toString();

          return (
            <PaletteBlock
              key={step}
              step={step}
              hex={hex}
              contrast={contrast}
              isCopied={isCopied}
              onCopy={() => copyToClipboard(hex, step.toString())}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-11 gap-0.5 rounded-xl overflow-hidden">
        {PALETTE_STEPS.map((step) => {
          const hex = palette[step.toString()];
          const contrast = contrastPass(hex);
          const isCopied = copiedStep === step.toString();

          return (
            <div
              key={step}
              className="flex flex-col items-center py-2 px-1 bg-zinc-900/50 rounded"
            >
              <span className="text-[10px] font-mono text-zinc-500 mb-1">{step}</span>
              <div
                className="w-full aspect-square rounded-md mb-1.5 border border-zinc-800"
                style={{ backgroundColor: hex }}
              />
              <button
                onClick={() => copyToClipboard(hex, step.toString())}
                className="text-[10px] font-mono text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-0.5"
              >
                {isCopied ? <CheckCheck className="w-2.5 h-2.5 text-green-400" /> : <Copy className="w-2.5 h-2.5" />}
                {isCopied ? '已复制' : hex.toUpperCase()}
              </button>
              <div className="flex gap-0.5 mt-1">
                <ContrastBadge pass={contrast.white} label="白" />
                <ContrastBadge pass={contrast.black} label="黑" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PaletteBlock({
  step,
  hex,
  contrast,
  isCopied,
  onCopy,
}: {
  step: PaletteStep;
  hex: string;
  contrast: ReturnType<typeof contrastPass>;
  isCopied: boolean;
  onCopy: () => void;
}) {
  const textColor = contrast.white ? '#ffffff' : '#000000';

  return (
    <button
      onClick={onCopy}
      className="flex-1 min-w-0 py-3 px-1 flex flex-col items-center justify-end transition-all hover:scale-105 hover:z-10 hover:shadow-lg group relative"
      style={{ backgroundColor: hex }}
    >
      <span className="text-[9px] font-mono opacity-60" style={{ color: textColor }}>{step}</span>
      <span className="text-[8px] font-mono opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: textColor }}>
        {isCopied ? '✓' : hex.toUpperCase()}
      </span>
    </button>
  );
}

function ContrastBadge({ pass, label }: { pass: boolean; label: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-[8px] font-mono px-1 py-0.5 rounded',
        pass ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'
      )}
    >
      {pass ? <Check className="w-2 h-2" /> : <XIcon className="w-2 h-2" />}
      {label}
    </span>
  );
}
