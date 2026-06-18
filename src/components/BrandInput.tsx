import { useState, useRef, useCallback } from 'react';
import { Pipette, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { isValidHex } from '@/utils/color';
import { extractColorsFromImage } from '@/utils/imageExtract';

export default function BrandInput() {
  const projects = useStore((s) => s.projects);
  const activeProjectId = useStore((s) => s.activeProjectId);
  const updateBrandColor = useStore((s) => s.updateBrandColor);
  const activeProject = projects.find((p) => p.id === activeProjectId);
  const brandColor = activeProject?.brandColor ?? '#6366f1';

  const [inputValue, setInputValue] = useState(brandColor);
  const [error, setError] = useState(false);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const applyColor = useCallback(
    (hex: string) => {
      if (isValidHex(hex)) {
        updateBrandColor(hex);
        setInputValue(hex);
        setError(false);
      } else {
        setError(true);
      }
    },
    [updateBrandColor]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (isValidHex(val)) {
      updateBrandColor(val);
      setError(false);
    } else {
      setError(true);
    }
  };

  const handleColorPicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    applyColor(e.target.value);
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const colors = await extractColorsFromImage(file);
    setExtractedColors(colors);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-zinc-300 tracking-wide uppercase">品牌色</h3>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <div className="flex items-center rounded-lg border border-zinc-700 bg-zinc-900 overflow-hidden focus-within:border-zinc-500 transition-colors">
            <span className="pl-3 text-zinc-500 font-mono text-sm">#</span>
            <input
              value={inputValue.startsWith('#') ? inputValue.slice(1) : inputValue}
              onChange={(e) => {
                const val = '#' + e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
                handleInputChange({ ...e, target: { ...e.target, value: val } } as React.ChangeEvent<HTMLInputElement>);
              }}
              maxLength={6}
              className="flex-1 bg-transparent px-2 py-2.5 text-sm font-mono text-zinc-100 outline-none placeholder:text-zinc-600"
              placeholder="6366f1"
            />
            <button
              onClick={() => colorInputRef.current?.click()}
              className="px-3 py-2 hover:bg-zinc-800 transition-colors"
              title="拾色器"
            >
              <Pipette className="w-4 h-4 text-zinc-400" />
            </button>
            <input
              ref={colorInputRef}
              type="color"
              value={isValidHex(brandColor) ? brandColor : '#6366f1'}
              onChange={handleColorPicker}
              className="sr-only"
            />
          </div>
          {error && (
            <p className="mt-1 text-xs text-red-400">请输入有效的HEX色值（# + 6位十六进制）</p>
          )}
        </div>

        <div
          className="w-10 h-10 rounded-lg border-2 border-zinc-600 cursor-pointer shrink-0 shadow-sm"
          style={{ backgroundColor: isValidHex(brandColor) ? brandColor : '#6366f1' }}
          onClick={() => colorInputRef.current?.click()}
          title="打开拾色器"
        />
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'rounded-lg border-2 border-dashed p-4 text-center cursor-pointer transition-all',
          isDragging
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-500 hover:bg-zinc-900'
        )}
      >
        <Upload className="w-5 h-5 mx-auto mb-2 text-zinc-500" />
        <p className="text-xs text-zinc-400">拖放图片或点击上传</p>
        <p className="text-xs text-zinc-600 mt-1">自动提取主色调</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="sr-only"
        />
      </div>

      {extractedColors.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">提取的颜色</span>
            <button onClick={() => setExtractedColors([])} className="text-zinc-600 hover:text-zinc-400 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {extractedColors.map((color, i) => (
              <button
                key={i}
                onClick={() => applyColor(color)}
                className={cn(
                  'w-8 h-8 rounded-md border-2 transition-all hover:scale-110',
                  color.toLowerCase() === brandColor.toLowerCase()
                    ? 'border-white shadow-lg'
                    : 'border-zinc-700 hover:border-zinc-500'
                )}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      <div
        className="rounded-xl p-6 text-center shadow-inner"
        style={{ backgroundColor: isValidHex(brandColor) ? brandColor : '#6366f1' }}
      >
        <p className="text-lg font-bold font-mono drop-shadow-md" style={{ color: isValidHex(brandColor) ? (contrastTextColor(brandColor)) : '#fff' }}>
          {brandColor.toUpperCase()}
        </p>
      </div>
    </div>
  );
}

function contrastTextColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 140 ? '#000000' : '#ffffff';
}
