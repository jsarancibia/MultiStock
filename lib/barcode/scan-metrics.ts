type ScanResult = "success" | "invalid" | "notfound" | "fallback";

interface ScanEntry {
  timestamp: number;
  result: ScanResult;
  durationMs: number;
  continuous: boolean;
}

const STORAGE_KEY = "multistock_scan_metrics";
const MAX_ENTRIES = 200;

function loadEntries(): ScanEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: ScanEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = entries.slice(-MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    /* storage full or unavailable */
  }
}

export function recordScan(
  result: ScanResult,
  durationMs: number,
  continuous: boolean,
): void {
  const entries = loadEntries();
  entries.push({ timestamp: Date.now(), result, durationMs, continuous });
  saveEntries(entries);
}

export function getMetrics(): {
  total: number;
  successRate: number;
  avgDurationMs: number;
  notFoundRate: number;
  fallbackRate: number;
  last24h: { total: number; successRate: number; avgDurationMs: number };
} {
  const entries = loadEntries();
  const now = Date.now();
  const last24h = entries.filter((e) => now - e.timestamp < 86400000);

  const calc = (list: ScanEntry[]) => {
    const total = list.length || 1;
    const success = list.filter((e) => e.result === "success").length;
    const notFound = list.filter((e) => e.result === "notfound").length;
    const fallback = list.filter((e) => e.result === "fallback").length;
    const durations = list.filter((e) => e.result !== "fallback").map((e) => e.durationMs);
    const avgDurationMs =
      durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0;

    return {
      total,
      successRate: Math.round((success / total) * 100),
      avgDurationMs,
      notFoundRate: Math.round((notFound / total) * 100),
      fallbackRate: Math.round((fallback / total) * 100),
    };
  };

  const all = calc(entries);
  const day = calc(last24h);

  return {
    ...all,
    last24h: { total: day.total, successRate: day.successRate, avgDurationMs: day.avgDurationMs },
  };
}
