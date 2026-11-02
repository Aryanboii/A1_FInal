// Open https://YOUR-DOMAIN/api/health after deploying: it tells you exactly what is wrong (never shows secrets).
const L = require("./_lib");
module.exports = async (req, res) => {
  const env = { SUPABASE_URL: !!L.SBU, SUPABASE_SERVICE_KEY: !!L.SBK, CRM_USER: !!process.env.CRM_USER, CRM_PASS: !!process.env.CRM_PASS };
  let db = "ok", hint = "";
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) { db = "not configured"; hint = "Add SUPABASE_URL and SUPABASE_SERVICE_KEY in Vercel > Settings > Environment Variables, then redeploy."; }
  else try { await L.sb("?select=id&limit=1"); } catch (e) {
    const m = String(e.message); db = "error";
    hint = /PGRST205|42P01|\b404\b/.test(m) ? "Table 'leads' not found: run supabase.sql in the Supabase SQL Editor."
      : /401|403|JWT|42501|row-level|permission|apikey/i.test(m) ? "Supabase rejected the key: use the SECRET key (sb_secret_...) or the service_role key, not the publishable / anon key."
      : /fetch failed|ENOTFOUND|Invalid URL/i.test(m) ? "SUPABASE_URL looks wrong: it must look like https://xxxx.supabase.co" : m.slice(0, 160);
  }
  L.out(res, db === "ok" ? 200 : 500, { ok: db === "ok", env, db, hint });
};
