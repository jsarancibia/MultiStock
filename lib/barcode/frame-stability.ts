const MOTION_THRESHOLD = 0.04;
const STABLE_FRAMES = 5;

export class FrameStabilityDetector {
  private prevLuma = new Float32Array(0);
  private stableCount = 0;
  private bestSharpness = 0;
  private bestFrame: ImageData | null = null;

  reset(): void {
    this.stableCount = 0;
    this.bestSharpness = 0;
    this.bestFrame = null;
  }

  feed(imageData: ImageData): "unstable" | "stabilizing" | "stable" {
    const { data, width, height } = imageData;
    const len = width * height;

    if (this.prevLuma.length !== len) {
      this.prevLuma = new Float32Array(len);
    }

    let moved = 0;
    const stride = 2;
    for (let i = 0; i < len; i += stride) {
      const gray = data[i * 4];
      if (Math.abs(gray - this.prevLuma[i]) > 15) moved++;
      this.prevLuma[i] = gray;
    }
    const ratio = moved / (len / stride);

    if (ratio < MOTION_THRESHOLD) {
      this.stableCount++;
      this.collectBestFrame(imageData);
      return this.stableCount >= STABLE_FRAMES ? "stable" : "stabilizing";
    }

    this.stableCount = 0;
    return "unstable";
  }

  private collectBestFrame(imageData: ImageData): void {
    const sharpness = estimateSharpness(imageData);
    if (sharpness > this.bestSharpness) {
      this.bestSharpness = sharpness;
      this.bestFrame = new ImageData(
        new Uint8ClampedArray(imageData.data),
        imageData.width,
        imageData.height,
      );
    }
  }

  getBestFrame(): ImageData | null {
    return this.bestFrame;
  }

  getStableCount(): number {
    return this.stableCount;
  }
}

function estimateSharpness(imageData: ImageData): number {
  const { data, width, height } = imageData;
  let sum = 0;
  let count = 0;

  for (let y = 1; y < height - 1; y += 2) {
    const rowP = (y - 1) * width;
    const rowC = y * width;
    const rowN = (y + 1) * width;

    for (let x = 1; x < width - 1; x += 2) {
      const c = data[(rowC + x) * 4];
      const n = data[(rowP + x) * 4];
      const s = data[(rowN + x) * 4];
      const e = data[(rowC + (x + 1)) * 4];
      const w = data[(rowC + (x - 1)) * 4];
      sum += Math.abs(4 * c - n - s - e - w);
      count++;
    }
  }

  return count > 0 ? sum / count : 0;
}
