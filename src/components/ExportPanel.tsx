import { useState, useMemo } from 'react';
import { Copy, Check, Link } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { exportCSSVariables, exportTailwindConfig, exportTokensJSON } from '@/utils/export';
import { encodeProjectToURL } from '@/utils/share';

type TabKey = 'css' | 'tailwind' | 'json';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'css', label: 'CSS Variables' },
  { key: 'tailwind', label: 'Tailwind Config' },
  { key: 'json', label: 'tokens.json' },
];

function syntaxHighlight(code: string, tab: TabKey): string {
  if (tab === 'css') {
    return code
      .replace(/(--[\w-]+)/g, '<span class="text-sky-400">$1</span>')
      .replace(/(#[0-9a-fA-F]{6,8})/g, '<span class="text-emerald-400">$1</span>')
      .replace(/(:root|{|})/g, '<span class="text-zinc-500">$1</span>')
      .replace(/(:\s)/g, '<span class="text-zinc-400">$1</span>')
      .replace(/(;)/g, '<span class="text-zinc-500">$1</span>');
  }
  if (tab === 'tailwind') {
    return code
      .replace(/(\/\/.*)/g, '<span class="text-zinc-500">$1</span>')
      .replace(/(module\.exports)/g, '<span class="text-violet-400">$1</span>')
      .replace(/(theme|extend|colors|primary)/g, '<span class="text-sky-400">$1</span>')
      .replace(/(#[0-9a-fA-F]{6,8})/g, '<span class="text-emerald-400">$1</span>')
      .replace(/("[\d]+")/g, '<span class="text-amber-400">$1</span>')
      .replace(/({|}|:|\[|\]|,)/g, '<span class="text-zinc-500">$1</span>');
  }
  return code
    .replace(/("[\w.]+")\s*:/g, '<span class="text-sky-400">$1</span>:')
    .replace(/(:\s*")/g, '<span class="text-zinc-400">$1</span>')
    .replace(/(#[0-9a-fA-F]{6,8})/g, '<span class="text-emerald-400">$1</span>')
    .replace(/(\d+px)/g, '<span class="text-amber-400">$1</span>')
    .replace(/(rgba\([^)]+\))/g, '<span class="text-emerald-400">$1</span>');
}

export default function ExportPanel() {
  const [activeTab, setActiveTab] = useState<TabKey>('css');
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const { projects, activeProjectId } = useStore();

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
    }
  }, [activeProject, activeTab]);

  const highlighted = useMemo(() => syntaxHighlight(output, activeTab), [output, activeTab]);

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
          className="absolute right-3 top-3 flex items-center gap-1.5 rounded-md bg-zinc-700/80 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-600"
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

        <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm leading-relaxed">
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

      <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-900/50">
        <span className="text-sm text-zinc-600">Typography Scale — 即将推出</span>
      </div>
    </div>
  );
}
