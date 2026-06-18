import ShadowEditor from '@/components/ShadowEditor';
import GlassmorphismEditor from '@/components/GlassmorphismEditor';

export default function Shadow() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ShadowEditor />
      <GlassmorphismEditor />
    </div>
  );
}
