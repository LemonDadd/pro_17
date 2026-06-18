import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Pencil, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { isValidHex } from '@/utils/color';

export default function ProjectManager() {
  const projects = useStore((s) => s.projects);
  const activeProjectId = useStore((s) => s.activeProjectId);
  const setActiveProject = useStore((s) => s.setActiveProject);
  const addProject = useStore((s) => s.addProject);
  const deleteProject = useStore((s) => s.deleteProject);
  const renameProject = useStore((s) => s.renameProject);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNewMode, setIsNewMode] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#6366f1');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const activeProject = projects.find((p) => p.id === activeProjectId);

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    const color = isValidHex(newColor) ? newColor : '#6366f1';
    addProject(name, color);
    setNewName('');
    setNewColor('#6366f1');
    setIsNewMode(false);
    setIsDropdownOpen(false);
  };

  const handleDelete = (id: string) => {
    if (projects.length <= 1) return;
    deleteProject(id);
    if (id === activeProjectId) {
      const remaining = projects.filter((p) => p.id !== id);
      if (remaining.length > 0) setActiveProject(remaining[0].id);
    }
  };

  const handleRename = (id: string) => {
    const name = editName.trim();
    if (name) renameProject(id, name);
    setEditingId(null);
  };

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-zinc-300 tracking-wide uppercase">项目管理</h3>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-zinc-700 bg-zinc-900 hover:border-zinc-500 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: activeProject?.brandColor ?? '#6366f1' }}
            />
            <span className="text-sm text-zinc-200 truncate">
              {activeProject?.name ?? '选择项目'}
            </span>
          </div>
          <ChevronDown className={cn('w-4 h-4 text-zinc-500 transition-transform', isDropdownOpen && 'rotate-180')} />
        </button>

        {isDropdownOpen && (
          <div className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden">
            {projects.map((project) => (
              <div
                key={project.id}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 hover:bg-zinc-800 transition-colors group',
                  project.id === activeProjectId && 'bg-zinc-800'
                )}
              >
                {editingId === project.id ? (
                  <div className="flex-1 flex items-center gap-1">
                    <input
                      ref={editInputRef}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(project.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="flex-1 bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-xs text-zinc-100 outline-none focus:border-zinc-400"
                    />
                    <button onClick={() => handleRename(project.id)} className="p-1 hover:bg-zinc-700 rounded">
                      <Check className="w-3 h-3 text-green-400" />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setActiveProject(project.id);
                        setIsDropdownOpen(false);
                      }}
                      className="flex-1 flex items-center gap-2 text-left"
                    >
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: project.brandColor }}
                      />
                      <span className="text-sm text-zinc-200 truncate">{project.name}</span>
                    </button>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(project.id, project.name)}
                        className="p-1 hover:bg-zinc-700 rounded"
                        title="重命名"
                      >
                        <Pencil className="w-3 h-3 text-zinc-400" />
                      </button>
                      {projects.length > 1 && (
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="p-1 hover:bg-zinc-700 rounded"
                          title="删除"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}

            {!isNewMode ? (
              <button
                onClick={() => setIsNewMode(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors border-t border-zinc-800"
              >
                <Plus className="w-3.5 h-3.5" />
                新建项目
              </button>
            ) : (
              <div className="px-3 py-2 border-t border-zinc-800 space-y-2">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
                  placeholder="项目名称"
                  className="w-full bg-zinc-800 border border-zinc-600 rounded px-2 py-1.5 text-xs text-zinc-100 outline-none focus:border-zinc-400 placeholder:text-zinc-600"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <input
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="flex-1 bg-zinc-800 border border-zinc-600 rounded px-2 py-1.5 text-xs font-mono text-zinc-100 outline-none focus:border-zinc-400"
                    placeholder="#6366f1"
                  />
                  <input
                    type="color"
                    value={isValidHex(newColor) ? newColor : '#6366f1'}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                  />
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={handleAdd}
                    className="flex-1 px-2 py-1.5 rounded text-xs font-medium bg-zinc-100 text-zinc-900 hover:bg-zinc-200 transition-colors"
                  >
                    创建
                  </button>
                  <button
                    onClick={() => { setIsNewMode(false); setNewName(''); setNewColor('#6366f1'); }}
                    className="px-2 py-1.5 rounded text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
