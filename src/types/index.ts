export type PaletteStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

export const PALETTE_STEPS: PaletteStep[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

export type ColorSchemeType = 'analogous' | 'complementary' | 'triadic' | 'tetradic';

export type ColorBlindType = 'none' | 'protan' | 'deutan';

export interface GradientStop {
  id: string;
  color: string;
  position: number;
}

export interface ShadowLayer {
  id: string;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  inset: boolean;
}

export interface Project {
  id: string;
  name: string;
  brandColor: string;
  colorSchemeType: ColorSchemeType;
  gradient: {
    type: 'linear' | 'radial';
    angle: number;
    stops: GradientStop[];
  };
  shadows: ShadowLayer[];
  glassmorphism: {
    blur: number;
    backgroundColor: string;
    opacity: number;
    borderColor: string;
  };
}

export interface AppState {
  projects: Project[];
  activeProjectId: string;
  previewMode: 'light' | 'dark';
  colorBlindMode: ColorBlindType;

  setActiveProject: (id: string) => void;
  addProject: (name: string, brandColor: string) => void;
  deleteProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
  updateBrandColor: (color: string) => void;
  updateColorSchemeType: (type: ColorSchemeType) => void;
  updateGradient: (gradient: Partial<Project['gradient']>) => void;
  updateGradientStops: (stops: GradientStop[]) => void;
  updateShadows: (shadows: ShadowLayer[]) => void;
  updateGlassmorphism: (glass: Partial<Project['glassmorphism']>) => void;
  setPreviewMode: (mode: 'light' | 'dark') => void;
  setColorBlindMode: (mode: ColorBlindType) => void;
}
