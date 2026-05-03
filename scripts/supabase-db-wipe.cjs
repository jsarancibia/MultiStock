/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Ejecuta un script SQL de limpieza contra la BD (remota o local enlazada vía URI).
 *
 * Variables: SUPABASE_DB_URL o DATABASE_URL en .env.local (igual que db:push).
 *
 * Uso:
 *   npm run db:wipe:business   → vacía datos de negocio (mantiene usuarios Auth).
 *   npm run db:wipe:full       → vacía todo + borra auth.users (solo dev / cuando quieras reset total).
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

function parseMode(argv) {
  const arg = argv.find((a) => a.startsWith("--mode="));
  if (arg === "--mode=business") return "business";
  if (arg === "--mode=full") return "full";
  console.error(`
Modo inválido. Usá:
  node scripts/supabase-db-wipe.cjs --mode=business
  node scripts/supabase-db-wipe.cjs --mode=full
`);
  process.exit(1);
}

const root = join(__dirname, "..");
const envLocal = parseEnvFile(join(root, ".env.local"));
const envExampleMerge = { ...process.env, ...envLocal };
const rawDbUrl = envLocal.SUPABASE_DB_URL || envLocal.DATABASE_URL;

if (!rawDbUrl) {
  console.error(`
No encontré SUPABASE_DB_URL ni DATABASE_URL en .env.local.

Definí la URI de Postgres (Dashboard → Database → Connection string → URI),
igual que para npm run db:push.

Luego ejecutá de nuevo npm run db:wipe:business o npm run db:wipe:full.
`);
  process.exit(1);
}

let dbUrl = rawDbUrl;
try {
  const parsed = new URL(rawDbUrl);
  if (parsed.hostname.includes("pooler.supabase.com") && parsed.port === "6543") {
    parsed.port = "5432";
    if (!parsed.searchParams.has("sslmode")) parsed.searchParams.set("sslmode", "require");
    dbUrl = parsed.toString();
    console.log("Usando pooler en modo session (puerto 5432) para ejecutar SQL.");
  }
} catch {
  // Mantener valor original.
}

const mode = parseMode(process.argv.slice(2));
const sqlFile =
  mode === "full"
    ? join(root, "supabase/scripts/wipe-full.sql")
    : join(root, "supabase/scripts/wipe-business-data.sql");

if (!existsSync(sqlFile)) {
  console.error(`No existe el archivo: ${sqlFile}`);
  process.exit(1);
}

console.log(`Ejecutando limpieza (--mode=${mode}) contra la base vía psql…`);

const psqlBin = process.platform === "win32" ? "psql.exe" : "psql";

const result = spawnSync(
  psqlBin,
  [dbUrl, "-v", "ON_ERROR_STOP=1", "-f", sqlFile],
  {
    cwd: root,
    stdio: "inherit",
    env: envExampleMerge,
    shell: process.platform === "win32",
  }
);

if (result.error?.code === "ENOENT" || result.status === 127) {
  console.error(`
No se encontró "psql" en el PATH (${psqlBin}).

Opciones:
  1) Instalá las herramientas de cliente PostgreSQL (PATH con psql).
  2) O abrí los archivos en SQL Editor del dashboard y ejecutá:
     - supabase/scripts/wipe-business-data.sql
     - supabase/scripts/wipe-full.sql
`);
  process.exit(1);
}

process.exit(result.status === 0 ? 0 : result.status ?? 1);
