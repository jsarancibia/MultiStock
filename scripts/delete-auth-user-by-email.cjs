/**
 * Elimina usuario de auth + datos ligados (dueño de negocios, miembro, invitaciones).
 * Uso: node scripts/delete-auth-user-by-email.cjs <email>
 */
const { createClient } = require("@supabase/supabase-js");
const { readFileSync, existsSync } = require("fs");
const { resolve } = require("path");

const emailArg = process.argv[2]?.trim().toLowerCase();
if (!emailArg) {
  console.error("Uso: node scripts/delete-auth-user-by-email.cjs <email>");
  process.exit(1);
}

const envPath = resolve(__dirname, "..", ".env.local");
if (!existsSync(envPath)) {
  console.error("No existe .env.local");
  process.exit(1);
}

const env = {};
readFileSync(envPath, "utf8")
  .split("\n")
  .filter((l) => l && !l.startsWith("#"))
  .forEach((l) => {
    const i = l.indexOf("=");
    if (i > 0) env[l.slice(0, i).trim()] = l.slice(i + 1).trim();
  });

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserIdByEmail() {
  let page = 1;
  const perPage = 200;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error("listUsers: " + error.message);
    for (const u of data.users) {
      if ((u.email || "").toLowerCase() === emailArg) return u.id;
    }
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

async function main() {
  const userId = await findUserIdByEmail();
  if (!userId) {
    console.log("No se encontró usuario con ese email.");
    return;
  }

  const { error: p0 } = await supabase.from("pending_invitations").delete().eq("email", emailArg);
  if (p0) console.warn("pending_invitations:", p0.message);

  const { error: p1 } = await supabase.from("business_users").delete().eq("user_id", userId);
  if (p1) console.warn("business_users:", p1.message);

  const { data: owned, error: eOwned } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", userId);
  if (eOwned) console.warn("businesses select:", eOwned.message);

  for (const row of owned || []) {
    const { error: delB } = await supabase.from("businesses").delete().eq("id", row.id);
    if (delB) console.warn("delete business", row.id, delB.message);
  }

  const { error: delAuth } = await supabase.auth.admin.deleteUser(userId);
  if (delAuth) {
    console.error("deleteUser:", delAuth.message);
    process.exit(1);
  }

  console.log("OK: eliminado", emailArg);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
