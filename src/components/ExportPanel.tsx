import { useState, useMemo } from 'react';
import { Copy, Check, Link, Type } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import {
  exportCSSVariables,
  exportTailwindConfig,
  exportTokensJSON,
  exportFigmaJSON,
  generateTypographySteps,
} from '@/utils/export';
import { encodeProjectToURL } from '@/utils/share';
import { TYPOGRAPHY_RATIO_PRESETS } from '@/types';

type TabKey = 'css' | 'tailwind' | 'json' | 'figma';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'css', label: 'CSS Variables' },
  { key: 'tailwind', label: 'Tailwind Config' },
  { key: 'json', label: 'tokens.json' },
  { key: 'figma', label: 'Figma JSON' },
];

function syntaxHighlight(code: string, tab: TabKey): string {
  if (tab === 'css') {
    return code
      .replace(/(--[\w-]+)/g, '<span class="text-sky-400">$1</span>')
      .replace(/(#[0-9a-fA-F]{6,8})/g, '<span class="text-emerald-400">$1</span>')
      .replace(/(:root|{|})/g, '<span class="text-zinc-500">$1</span>')
      .replace(/(:\s)/g, '<span class="text-zinc-400">$1</span>')
      .replace(/(;)/g, '<span class="text-zinc-500">$1</span>')
      .replace(/(\d+\.?\d*rem)/g, '<span class="text-amber-400">$1</span>');
  }
  if (tab === 'tailwind') {
    return code
      .replace(/(\/\/.*)/g, '<span class="text-zinc-500">$1</span>')
      .replace(/(module\.exports)/g, '<span class="text-violet-400">$1</span>')
      .replace(/(theme|extend|colors|primary|fontSize)/g, '<span class="text-sky-400">$1</span>')
      .replace(/(#[0-9a-fA-F]{6,8})/g, '<span class="text-emerald-400">$1</span>')
      .replace(/("[\d]+")/g, '<span class="text-amber-400">$1</span>')
      .replace(/(\d+\.?\d*rem)/g, '<span class="text-amber-400">$1</span>')
      .replace(/({|}|:|\[|\]|,)/g, '<span class="text-zinc-500">$1</span>');
  }
  if (tab === 'figma') {
    return code
      .replace(/(\/\/.*)/g, '<span class="text-zinc-500">$1</span>')
      .replace(/("\$type")/g, '<span class="text-fuchsia-400">$1</span>')
      .replace(/("\$value")/g, '<span class="text-fuchsia-400">$1</span>')
      .replace(/("color|gradient|shadow|typography|glassmorphism")/g, '<span class="text-sky-400">$1</span>')
      .replace(/("[\w.]+")\s*:/g, '<span class="text-sky-400">$1</span>:')
      .replace(/(:\s*")/g, '<span class="text-zinc-400">$1</span>')
      .replace(/(#[0-9a-fA-F]{6,8})/g, '<span class="text-emerald-400">$1</span>')
      .replace(/(\d+px)/g, '<span class="text-amber-400">$1</span>')
      .replace(/(rgba\([^)]+\))/g, '<span class="text-emerald-400">$1</span>');
  }
  return code
    .replace(/("[\w.]+")\s*:/g, '<span class="text-sky-400">$1</span>:')
    .replace(/(:\s*")/g, '<span class="text-zinc-400">$1</span>')
    .replace(/(#[0-9a-fA-F]{6,8})/g, '<span class="text-emerald-400">$1</span>')
    .replace(/(\d+px)/g, '<span class="text-amber-400">$1</span>')
    .replace(/(\d+\.?\d*rem)/g, '<span class="text-amber-400">$1</span>')
    .replace(/(rgba\([^)]+\))/g, '<span class="text-emerald-400">$1</span>')
    .replace(/("typography")/g, '<span class="text-sky-400">$1</span>');
}

export default function ExportPanel() {
  const [activeTab, setActiveTab] = useState<TabKey>('css');
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const { projects, activeProjectId, updateTypography } = useStore();

  const activeProject = projects.find((p) => p.id === activeProjectId);

  const output = useMemo(() => {
    if (!activeProject) return '';
    switch (activeTab) {
      case 'css':
        return exportCSSVariables(activeProject);
      case 'tailwind':
        return exportTailwindConfig(activeProject);
      case 'json':
        return exportTokensJSON(activeProject);
      case 'figma':
        return exportFigmaJSON(activeProject);
    }
  }, [activeProject, activeTab]);

  const highlighted = useMemo(() => syntaxHighlight(output, activeTab), [output, activeTab]);

  const typographySteps = useMemo(() => {
    if (!activeProject) return [];
    return generateTypographySteps(activeProject);
  }, [activeProject]);

  const shareURL = useMemo(() => {
    if (!activeProject) return '';
    const encoded = encodeProjectToURL(activeProject);
    return `${window.location.origin}${window.location.pathname}?project=${encoded}`;
  }, [activeProject]);

  const handleCopy = async (text: string, setFn: (v: boolean) => void) => {
    await navigator.clipboard.writeText(text);
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  };

  if (!activeProject) {
    return (
      <div className="flex h-64 items-center justify-center text-zinc-500">
        请先选择一个项目
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-lg bg-zinc-900 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'bg-zinc-700 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <button
          onClick={() => handleCopy(output, setCopied)}
          className="absolute right-3 top-3 flex items-center gap-1.5 rounded-md bg-zinc-700/80 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-600 z-10"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">已复制!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>复制</span>
            </>
          )}
        </button>

        <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm leading-relaxed max-h-[420px] overflow-y-auto">
          <code
            className="font-mono"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </pre>
      </div>

      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          <Link className="h-4 w-4" />
          分享链接
        </h3>
        <div className="flex gap-2">
          <input
            readOnly
            value={shareURL}
            className="flex-1 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-400 focus:outline-none"
          />
          <button
            onClick={() => handleCopy(shareURL, setShareCopied)}
            className="flex items-center gap-1.5 rounded-md bg-zinc-700 px-3 py-2 text-xs text-zinc-300 transition-colors hover:bg-zinc-600"
          >
            {shareCopied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">已复制!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>复制</span>
              </>
            )}
          </button>
        </div>
      </div>

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
    </div>
  );
}
