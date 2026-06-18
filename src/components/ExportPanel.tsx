import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import {
  exportCSSVariables,
  exportTailwindConfig,
  exportTokensJSON,
  exportFigmaJSON,
} from '@/utils/export';
import CodeBlock from '@/components/CodeBlock';
import ShareLinkSection from '@/components/ShareLinkSection';
import TypographyScaleEditor from '@/components/TypographyScaleEditor';

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
      case 'figma':
        return exportFigmaJSON(activeProject);
    }
  }, [activeProject, activeTab]);

  const highlighted = useMemo(() => syntaxHighlight(output, activeTab), [output, activeTab]);

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

      <CodeBlock code={output} highlighted={highlighted} />

      <ShareLinkSection />

      <TypographyScaleEditor />
    </div>
  );
}
