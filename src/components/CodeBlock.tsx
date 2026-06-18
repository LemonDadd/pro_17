import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  highlighted?: string;
}

export default function CodeBlock({ code, highlighted }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
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
          dangerouslySetInnerHTML={{ __html: highlighted ?? code }}
        />
      </pre>
    </div>
  );
}
