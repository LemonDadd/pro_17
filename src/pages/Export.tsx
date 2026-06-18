import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ExportPanel from '@/components/ExportPanel';
import { decodeProjectFromURL } from '@/utils/share';
import { useStore } from '@/store/useStore';

export default function Export() {
  const [searchParams] = useSearchParams();
  const { projects, addProject, setActiveProject } = useStore();

  useEffect(() => {
    const encoded = searchParams.get('project');
    if (!encoded) return;
    const decoded = decodeProjectFromURL(encoded);
    if (!decoded) return;
    const exists = projects.some((p) => p.id === decoded.id);
    if (!exists) {
      addProject(decoded.name, decoded.brandColor);
    }
    setActiveProject(decoded.id);
  }, [searchParams, projects, addProject, setActiveProject]);

  return (
    <div>
      <ExportPanel />
    </div>
  );
}
