export type PaletteStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

export const PALETTE_STEPS: PaletteStep[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

export type TypographyScaleKey = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

export const TYPOGRAPHY_SCALE_KEYS: TypographyScaleKey[] = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'];

export const TYPOGRAPHY_SCALE_BASE_INDEX = 2;

export interface TypographyScale {
  baseFontSize: number;
  ratio: number;
}

export interface TypographyStep {
  key: TypographyScaleKey;
  fontSizePx: number;
  fontSizeRem: number;
  lineHeight: number;
}

export const TYPOGRAPHY_RATIO_PRESETS: { value: number; label: string; name: string }[] = [
  { value: 1.067, label: '1.067', name: 'Minor Second' },
  { value: 1.125, label: '1.125', name: 'Major Second' },
  { value: 1.2, label: '1.2', name: 'Minor Third' },
  { value: 1.25, label: '1.25', name: 'Major Third' },
  { value: 1.333, label: '1.333', name: 'Perfect Fourth' },
  { value: 1.5, label: '1.5', name: 'Perfect Fifth' },
];

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
  typography: TypographyScale;
}

export interface AppState {
  projects: Project[];
  activeProjectId: string;
  previewMode: 'light' | 'dark';
  colorBlindMode: ColorBlindType;

  setActiveProject: (id: string) => void;
  addProject: (name: string, brandColor: string) => void;
  importProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
  updateBrandColor: (color: string) => void;
  updateColorSchemeType: (type: ColorSchemeType) => void;
  updateGradient: (gradient: Partial<Project['gradient']>) => void;
  updateGradientStops: (stops: GradientStop[]) => void;
  updateShadows: (shadows: ShadowLayer[]) => void;
  updateGlassmorphism: (glass: Partial<Project['glassmorphism']>) => void;
  updateTypography: (typography: Partial<Project['typography']>) => void;
  setPreviewMode: (mode: 'light' | 'dark') => void;
  setColorBlindMode: (mode: ColorBlindType) => void;
}
