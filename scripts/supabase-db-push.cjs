/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Aplica migraciones pendientes contra la BD remota usando la URI de Postgres.
 * Uso: definí SUPABASE_DB_URL en .env.local (Supabase → Settings → Database → Connection string → URI)
 * Luego: npm run db:push
 */

const { readFileSync, existsSync } = require("node:fs");
const { join } = require("node:path");
const { spawnSync } = require("node:child_process");

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const raw = readFileSync(filePath, "utf8");
  const out = {};
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const root = join(__dirname, "..");
const envLocal = parseEnvFile(join(root, ".env.local"));
const envExampleMerge = { ...process.env, ...envLocal };

const rawDbUrl = envLocal.SUPABASE_DB_URL || envLocal.DATABASE_URL;

if (!rawDbUrl) {
  console.error(`
No encontré SUPABASE_DB_URL ni DATABASE_URL en .env.local.

1) En Supabase Dashboard → tu proyecto → Settings → Database:
   - Copiá "Connection string" → modo URI (Postgres).
   - Pegala en .env.local así (una sola línea):

   SUPABASE_DB_URL=postgresql://postgres.[PROJECT_REF]:TU_PASSWORD@aws-0-xxx.pooler.supabase.com:6543/postgres

   (Si la contraseña tiene caracteres especiales, usá "URL encode" o la variante Session del pooler.)

2) Volvé a ejecutar: npm run db:push

Alternativa (CLI enlazado al proyecto):
   npx supabase login
   npx supabase link --project-ref TU_REF
   npm run db:push:link
`);
  process.exit(1);
}

let dbUrl = rawDbUrl;
try {
  const parsed = new URL(rawDbUrl);
  // Con pooler en 6543 suele ser modo transaction; para migraciones forzamos session (5432).
  if (parsed.hostname.includes("pooler.supabase.com") && parsed.port === "6543") {
    parsed.port = "5432";
    if (!parsed.searchParams.has("sslmode")) parsed.searchParams.set("sslmode", "require");
    dbUrl = parsed.toString();
    console.log("Usando pooler en modo session (puerto 5432) para migraciones.");
  }
} catch {
  // Si la URI no es parseable, dejamos el valor tal cual para que el CLI reporte el error.
}

const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(
  npx,
  ["supabase", "db", "push", "--yes", "--db-url", dbUrl],
  {
    cwd: root,
    stdio: "inherit",
    env: envExampleMerge,
    shell: false,
  }
);

process.exit(result.status === 0 ? 0 : result.status ?? 1);
