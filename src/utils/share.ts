import LZString from 'lz-string';
import type { Project } from '@/types';

export function encodeProjectToURL(project: Project): string {
  const json = JSON.stringify(project);
  return LZString.compressToEncodedURIComponent(json);
}

export function decodeProjectFromURL(encoded: string): Project | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    return JSON.parse(json) as Project;
  } catch {
    return null;
  }
}
