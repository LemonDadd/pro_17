export function extractColorsFromImage(file: File): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      resolve([]);
      return;
    }

    img.onload = () => {
      const size = 100;
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);

      const imageData = ctx.getImageData(0, 0, size, size);
      const pixels: number[][] = [];

      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const a = imageData.data[i + 3];
        if (a > 128) {
          pixels.push([r, g, b]);
        }
      }

      const quantized = medianCut(pixels, 5);
      const hexColors = quantized.map(([r, g, b]) =>
        `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
      );
      resolve(hexColors);
      URL.revokeObjectURL(img.src);
    };

    img.onerror = () => {
      resolve([]);
      URL.revokeObjectURL(img.src);
    };

    img.src = URL.createObjectURL(file);
  });
}

function medianCut(pixels: number[][], depth: number): number[][] {
  if (depth === 0 || pixels.length === 0) {
    if (pixels.length === 0) return [[128, 128, 128]];
    const avg = pixels.reduce(
      (acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]],
      [0, 0, 0]
    );
    return [[
      Math.round(avg[0] / pixels.length),
      Math.round(avg[1] / pixels.length),
      Math.round(avg[2] / pixels.length),
    ]];
  }

  const ranges = [0, 1, 2].map((ch) => {
    const vals = pixels.map((p) => p[ch]);
    return Math.max(...vals) - Math.min(...vals);
  });

  const sortChannel = ranges.indexOf(Math.max(...ranges));
  pixels.sort((a, b) => a[sortChannel] - b[sortChannel]);

  const mid = Math.floor(pixels.length / 2);
  return [
    ...medianCut(pixels.slice(0, mid), depth - 1),
    ...medianCut(pixels.slice(mid), depth - 1),
  ];
}
