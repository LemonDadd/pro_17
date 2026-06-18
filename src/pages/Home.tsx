import ProjectManager from '@/components/ProjectManager';
import BrandInput from '@/components/BrandInput';
import PaletteScale from '@/components/PaletteScale';
import ColorSchemes from '@/components/ColorSchemes';
import PreviewPanel from '@/components/PreviewPanel';

export default function Home() {
  return (
    <div className="space-y-6">
      <ProjectManager />
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full space-y-6 lg:w-[60%]">
          <BrandInput />
          <PaletteScale />
          <ColorSchemes />
        </div>
        <div className="w-full lg:w-[40%]">
          <PreviewPanel />
        </div>
      </div>
    </div>
  );
}
