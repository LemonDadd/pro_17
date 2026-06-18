import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, AlertTriangle } from 'lucide-react';
import ExportPanel from '@/components/ExportPanel';
import { decodeProjectFromURL } from '@/utils/share';
import { useStore } from '@/store/useStore';
import type { Project } from '@/types';

export default function Export() {
  const [searchParams] = useSearchParams();
  const { projects, importProject } = useStore();
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importedProject, setImportedProject] = useState<Project | null>(null);

  useEffect(() => {
    const encoded = searchParams.get('project');
    if (!encoded) return;
    const decoded = decodeProjectFromURL(encoded);
    if (!decoded) {
      setImportStatus('error');
      return;
    }
    const exists = projects.some((p) => p.id === decoded.id);
    importProject(decoded);
    setImportedProject(decoded);
    setImportStatus('success');
    if (exists) {
      setTimeout(() => setImportStatus('idle'), 3000);
    }
  }, [searchParams, projects, importProject]);

  return (
    <div className="space-y-4">
      {importStatus === 'success' && importedProject && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-800 bg-emerald-950/50 px-4 py-3 text-sm text-emerald-400">
          <Check className="h-4 w-4 shrink-0" />
          <span>已成功导入项目「{importedProject.name}」，包含完整的渐变、阴影和玻璃态配置</span>
        </div>
      )}
      {importStatus === 'error' && (
        <div className="flex items-center gap-2 rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>分享链接无效或已损坏，无法导入项目</span>
        </div>
      )}
      <ExportPanel />
    </div>
  );
}
