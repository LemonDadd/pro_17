import type { Project } from '@/types';
import { PALETTE_STEPS } from '@/types';
import { generatePalette } from './color';

export function exportCSSVariables(project: Project): string {
  const palette = generatePalette(project.brandColor);
  const lines = [':root {'];
  for (const step of PALETTE_STEPS) {
    lines.push(`  --color-primary-${step}: ${palette[step]};`);
  }
  lines.push('}');
  return lines.join('\n');
}

export function exportTailwindConfig(project: Project): string {
  const palette = generatePalette(project.brandColor);
  const colors: Record<string, string> = {};
  for (const step of PALETTE_STEPS) {
    colors[step.toString()] = palette[step];
  }

  return `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: ${JSON.stringify(colors, null, 8).replace(/^/gm, '        ').trim()},
      },
    },
  },
};`;
}

export function exportTokensJSON(project: Project): string {
  const palette = generatePalette(project.brandColor);
  const tokens: Record<string, string> = {};
  for (const step of PALETTE_STEPS) {
    tokens[`color.primary.${step}`] = palette[step];
  }
  tokens['gradient.css'] = project.gradient.stops
    .sort((a, b) => a.position - b.position)
    .map((s) => `${s.color} ${s.position}%`)
    .join(', ');

  const shadowLayers = project.shadows
    .map(
      (s) =>
        `${s.inset ? 'inset ' : ''}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`
    )
    .join(',\n    ');
  tokens['shadow.css'] = shadowLayers;

  tokens['glassmorphism.blur'] = `${project.glassmorphism.blur}px`;
  tokens['glassmorphism.background'] = project.glassmorphism.backgroundColor;
  tokens['glassmorphism.border'] = project.glassmorphism.borderColor;

  return JSON.stringify(tokens, null, 2);
}
