import type { GradientStop, ShadowLayer } from '@/types';

export function toGradientCSS(
  type: 'linear' | 'radial',
  angle: number,
  centerX: number,
  centerY: number,
  stops: GradientStop[]
): string {
  const s = [...stops]
    .sort((a, b) => a.position - b.position)
    .map((st) => `${st.color} ${st.position}%`)
    .join(', ');
  return type === 'linear'
    ? `linear-gradient(${angle}deg, ${s})`
    : `radial-gradient(circle at ${centerX}% ${centerY}%, ${s})`;
}

export function toShadowCSS(layers: ShadowLayer[]): string {
  return layers
    .map((l) => {
      const inset = l.inset ? 'inset ' : '';
      return `${inset}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${l.color}`;
    })
    .join(', ');
}
