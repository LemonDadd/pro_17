import { useState, useMemo } from 'react';
import { Copy, Check, Link } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { encodeProjectToURL } from '@/utils/share';

export default function ShareLinkSection() {
  const { projects, activeProjectId } = useStore();
  const activeProject = projects.find((p) => p.id === activeProjectId);
  const [shareCopied, setShareCopied] = useState(false);

  const shareURL = useMemo(() => {
    if (!activeProject) return '';
    const encoded = encodeProjectToURL(activeProject);
    return `${window.location.origin}${window.location.pathname}?project=${encoded}`;
  }, [activeProject]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareURL);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  if (!activeProject) return null;

  return (
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
          onClick={handleCopy}
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
  );
}
