export function grayscale(data: Uint8ClampedArray): void {
  for (let i = 0; i < data.length; i += 4) {
    const gray = (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8;
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }
}

export function stretchContrast(data: Uint8ClampedArray, low = 5, high = 95): void {
  const n = data.length / 4;
  const histogram = new Int32Array(256);
  for (let i = 0; i < n; i++) histogram[data[i * 4]]++;

  let sum = 0;
  let pLow = 0;
  let pHigh = 255;
  for (let i = 0; i < 256; i++) {
    sum += histogram[i];
    if (sum <= n * low / 100) pLow = i;
    if (sum <= n * high / 100) pHigh = i;
  }

  const range = pHigh - pLow || 1;
  for (let i = 0; i < data.length; i += 4) {
    const v = Math.min(255, Math.max(0, ((data[i] - pLow) / range) * 255)) | 0;
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
  }
}

export function sharpen(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): void {
  const kernel = [-1, -1, -1, -1, 9, -1, -1, -1, -1];
  const copy = new Uint8ClampedArray(data);

  for (let y = 1; y < height - 1; y++) {
    const rowCur = y * width;

    for (let x = 1; x < width - 1; x++) {
      const idxCur = (rowCur + x) * 4;

      let sum = 0;
      for (let ky = -1, ki = 0; ky <= 1; ky++) {
        const rowOff = (y + ky) * width;
        for (let kx = -1; kx <= 1; kx++, ki++) {
          sum += copy[(rowOff + (x + kx)) * 4] * kernel[ki];
        }
      }

      const v = Math.min(255, Math.max(0, sum));
      data[idxCur] = v;
      data[idxCur + 1] = v;
      data[idxCur + 2] = v;
    }
  }
}

export function downscale(
  data: Uint8ClampedArray,
  srcW: number,
  srcH: number,
  dstW: number,
  dstH: number,
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(dstW * dstH * 4);
  const scaleX = srcW / dstW;
  const scaleY = srcH / dstH;

  for (let dy = 0; dy < dstH; dy++) {
    for (let dx = 0; dx < dstW; dx++) {
      const sx = Math.floor(dx * scaleX);
      const sy = Math.floor(dy * scaleY);
      const idx = (sy * srcW + sx) * 4;
      const didx = (dy * dstW + dx) * 4;
      out[didx] = data[idx];
      out[didx + 1] = data[idx + 1];
      out[didx + 2] = data[idx + 2];
      out[didx + 3] = 255;
    }
  }
  return out;
}

export function applyPipeline(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): void {
  grayscale(data);
  stretchContrast(data);
  sharpen(data, width, height);
}
