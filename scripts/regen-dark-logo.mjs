// One-off: invoke gemini-asset-generator generate.py with a long prompt (avoid PowerShell quoting issues)
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const prompt = `Task: output the same isometric 3D logo as the reference image with ONE change only. Remove the bottom wordmark text (the MULTI and STOCK lettering). The central blue structure must remain a lowercase 'i' shape (vertically stacked: small cube dot, stem, base), exactly as in the reference — not a T or cross. Do not move, replace, or redesign any block. Keep all other cubes, gradient colors, small blue cubes, connector prisms, lines, and dots exactly the same. Fill where the text was with the same solid background (#151924 dark navy), no new large shadows.`;

const style = `Pixel-faithful to reference: same composition, same central i geometry, only bottom text removed. No hallucinated T-shaped crossbar or extra blocks.`;

const genPy = join(
  process.env.USERPROFILE || "",
  ".cursor",
  "skills",
  "gemini-asset-generator",
  "scripts",
  "generate.py"
);

const args = [
  genPy,
  "--prompt",
  prompt,
  "--reference",
  join(root, "assets/logo-oficial/multistock-logo-dark.jpg"),
  "--output",
  join(root, "assets/logo-oficial/multistock-logo-dark-sin-texto.jpg"),
  "--ratio",
  "3:2",
  "--resolution",
  "4K",
  "--model",
  "gemini-2.5-flash-image",
  "--style-prompt",
  style,
];

console.log("Running:", "python", args[0], "...");
execFileSync("python", args, { stdio: "inherit" });
