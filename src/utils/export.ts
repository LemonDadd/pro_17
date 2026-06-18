import type { Project, TypographyStep, TypographyScaleKey } from '@/types';
import { PALETTE_STEPS, TYPOGRAPHY_SCALE_KEYS, TYPOGRAPHY_SCALE_BASE_INDEX } from '@/types';
import { generatePalette } from './color';

export function generateTypographySteps(project: Project): TypographyStep[] {
  const { baseFontSize, ratio } = project.typography;
  return TYPOGRAPHY_SCALE_KEYS.map((key: TypographyScaleKey, i) => {
    const exponent = i - TYPOGRAPHY_SCALE_BASE_INDEX;
    const fontSizePx = Number((baseFontSize * Math.pow(ratio, exponent)).toFixed(2));
    const fontSizeRem = Number((fontSizePx / 16).toFixed(3));
    const lineHeight = Number((fontSizePx >= 24 ? 1.2 : 1.5).toFixed(2));
    return { key, fontSizePx, fontSizeRem, lineHeight };
  });
}

export function exportCSSVariables(project: Project): string {
  const palette = generatePalette(project.brandColor);
  const steps = generateTypographySteps(project);
  const lines = [':root {'];
  for (const step of PALETTE_STEPS) {
    lines.push(`  --color-primary-${step}: ${palette[step]};`);
  }
  lines.push('');
  for (const s of steps) {
    lines.push(`  --fs-${s.key}: ${s.fontSizeRem}rem;`);
    lines.push(`  --lh-${s.key}: ${s.lineHeight};`);
  }
  lines.push('}');
  return lines.join('\n');
}

export function exportTailwindConfig(project: Project): string {
  const palette = generatePalette(project.brandColor);
  const steps = generateTypographySteps(project);
  const colors: Record<string, string> = {};
  for (const step of PALETTE_STEPS) {
    colors[step.toString()] = palette[step];
  }

  const fontSize: Record<string, [string, { lineHeight: string }]> = {};
  for (const s of steps) {
    fontSize[s.key] = [`${s.fontSizeRem}rem`, { lineHeight: s.lineHeight.toString() }];
  }

  return `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: ${JSON.stringify(colors, null, 8).replace(/^/gm, '        ').trim()},
      },
      fontSize: ${JSON.stringify(fontSize, null, 8).replace(/^/gm, '      ').trim()},
    },
  },
};`;
}

export function exportTokensJSON(project: Project): string {
  const palette = generatePalette(project.brandColor);
  const steps = generateTypographySteps(project);
  const tokens: Record<string, unknown> = {};
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

  const typography: Record<string, { value: { fontSize: string; lineHeight: string } }> = {};
  for (const s of steps) {
    typography[s.key] = {
      value: {
        fontSize: `${s.fontSizeRem}rem`,
        lineHeight: s.lineHeight.toString(),
      },
    };
  }
  tokens['typography'] = typography;

  return JSON.stringify(tokens, null, 2);
}

export interface FigmaToken {
  $type: string;
  $value: unknown;
}

export interface FigmaTokenGroup {
  [key: string]: FigmaToken | FigmaTokenGroup;
}

export function exportFigmaJSON(project: Project): string {
  const palette = generatePalette(project.brandColor);
  const steps = generateTypographySteps(project);

  const colors: FigmaTokenGroup = {};
  for (const step of PALETTE_STEPS) {
    colors[step.toString()] = {
      $type: 'color',
      $value: palette[step],
    };
  }

  const gradientStops = [...project.gradient.stops]
    .sort((a, b) => a.position - b.position)
    .map((s) => ({ color: s.color, position: s.position / 100 }));

  const shadow: FigmaTokenGroup = {};
  project.shadows.forEach((s, i) => {
    shadow[`layer-${i + 1}`] = {
      $type: 'shadow',
      $value: {
        x: `${s.x}`,
        y: `${s.y}`,
        blur: `${s.blur}`,
        spread: `${s.spread}`,
        color: s.color,
        type: s.inset ? 'innerShadow' : 'dropShadow',
      },
    };
  });

  const typography: FigmaTokenGroup = {};
  for (const s of steps) {
    typography[s.key] = {
      $type: 'typography',
      $value: {
        fontSize: `${s.fontSizePx}`,
        lineHeight: `${Math.round(s.fontSizePx * s.lineHeight)}`,
        fontFamily: 'Sora',
        fontWeight: '400',
      },
    };
  }

  const output: FigmaTokenGroup = {
    color: {
      primary: colors,
    },
    gradient: {
      default: {
        $type: 'gradient',
        $value: {
          type: project.gradient.type === 'linear' ? 'gradientLinear' : 'gradientRadial',
          stops: gradientStops,
          rotation: project.gradient.angle,
        },
      },
    },
    shadow,
    glassmorphism: {
      blur: { $type: 'number', $value: project.glassmorphism.blur },
      background: { $type: 'color', $value: project.glassmorphism.backgroundColor },
      border: { $type: 'color', $value: project.glassmorphism.borderColor },
    },
    typography,
  };

  const header = [
    '// Figma Design Tokens (Tokens Studio / Figma Variables compatible)',
    '// Paste into Tokens Studio > Import > JSON or Figma Variables plugin',
    '',
  ].join('\n');

  return header + JSON.stringify(output, null, 2);
}
