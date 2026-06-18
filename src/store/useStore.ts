import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, Project, GradientStop, ShadowLayer, ColorSchemeType } from '@/types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function createDefaultGradient(): Project['gradient'] {
  return {
    type: 'linear',
    angle: 135,
    centerX: 50,
    centerY: 50,
    stops: [
      { id: generateId(), color: '#6366f1', position: 0 },
      { id: generateId(), color: '#ec4899', position: 50 },
      { id: generateId(), color: '#f59e0b', position: 100 },
    ],
  };
}

function createDefaultShadows(): ShadowLayer[] {
  return [
    { id: generateId(), x: 0, y: 1, blur: 2, spread: 0, color: 'rgba(0,0,0,0.05)', inset: false },
    { id: generateId(), x: 0, y: 1, blur: 3, spread: 0, color: 'rgba(0,0,0,0.1)', inset: false },
  ];
}

function createDefaultTypography(): Project['typography'] {
  return {
    baseFontSize: 16,
    ratio: 1.25,
  };
}

function createDefaultProject(name: string, brandColor: string): Project {
  return {
    id: generateId(),
    name,
    brandColor,
    colorSchemeType: 'complementary',
    gradient: createDefaultGradient(),
    shadows: createDefaultShadows(),
    glassmorphism: {
      blur: 16,
      backgroundColor: 'rgba(255,255,255,0.1)',
      opacity: 0.1,
      borderColor: 'rgba(255,255,255,0.2)',
    },
    typography: createDefaultTypography(),
  };
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      projects: [createDefaultProject('Default', '#6366f1')],
      activeProjectId: '',
      previewMode: 'dark',
      colorBlindMode: 'none' as const,

      setActiveProject: (id: string) => set({ activeProjectId: id }),

      addProject: (name: string, brandColor: string) => {
        const project = createDefaultProject(name, brandColor);
        set((state) => ({
          projects: [...state.projects, project],
          activeProjectId: project.id,
        }));
      },

      importProject: (project: Project) =>
        set((state) => {
          const exists = state.projects.some((p) => p.id === project.id);
          if (exists) {
            return {
              projects: state.projects.map((p) =>
                p.id === project.id ? project : p
              ),
              activeProjectId: project.id,
            };
          }
          return {
            projects: [...state.projects, project],
            activeProjectId: project.id,
          };
        }),

      deleteProject: (id: string) =>
        set((state) => {
          const projects = state.projects.filter((p) => p.id !== id);
          const activeProjectId =
            state.activeProjectId === id
              ? projects[0]?.id ?? ''
              : state.activeProjectId;
          return { projects, activeProjectId };
        }),

      renameProject: (id: string, name: string) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, name } : p
          ),
        })),

      updateBrandColor: (color: string) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === state.activeProjectId ? { ...p, brandColor: color } : p
          ),
        })),

      updateColorSchemeType: (type: ColorSchemeType) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === state.activeProjectId
              ? { ...p, colorSchemeType: type }
              : p
          ),
        })),

      updateGradient: (gradient: Partial<Project['gradient']>) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === state.activeProjectId
              ? { ...p, gradient: { ...p.gradient, ...gradient } }
              : p
          ),
        })),

      updateGradientStops: (stops: GradientStop[]) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === state.activeProjectId
              ? { ...p, gradient: { ...p.gradient, stops } }
              : p
          ),
        })),

      updateShadows: (shadows: ShadowLayer[]) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === state.activeProjectId ? { ...p, shadows } : p
          ),
        })),

      updateGlassmorphism: (glass: Partial<Project['glassmorphism']>) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === state.activeProjectId
              ? { ...p, glassmorphism: { ...p.glassmorphism, ...glass } }
              : p
          ),
        })),

      updateTypography: (typography: Partial<Project['typography']>) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === state.activeProjectId
              ? { ...p, typography: { ...p.typography, ...typography } }
              : p
          ),
        })),

      setPreviewMode: (mode: 'light' | 'dark') => set({ previewMode: mode }),

      setColorBlindMode: (mode) => set({ colorBlindMode: mode }),
    }),
    {
      name: 'design-token-projects',
      partialize: (state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
        previewMode: state.previewMode,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (state.projects.length > 0) {
          state.projects = state.projects.map((p) => ({
            ...p,
            typography: p.typography ?? { baseFontSize: 16, ratio: 1.25 },
            gradient: {
              ...p.gradient,
              centerX: (p.gradient as Project['gradient'] & { centerX?: number }).centerX ?? 50,
              centerY: (p.gradient as Project['gradient'] & { centerY?: number }).centerY ?? 50,
            },
          }));
          if (!state.activeProjectId) {
            state.activeProjectId = state.projects[0].id;
          }
        }
      },
    }
  )
);
