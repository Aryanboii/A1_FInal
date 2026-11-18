// Open https://YOUR-DOMAIN/api/health : it says exactly what is wrong (never shows secrets).
// When you are logged in to /crm it also saves and deletes one test row, to prove the website forms can write.
const L = require("./_lib");
module.exports = async (req, res) => {
  const env = { SUPABASE_URL: !!L.SBU, SUPABASE_SERVICE_KEY: !!L.SBK, CRM_USER: !!process.env.CRM_USER, CRM_PASS: !!process.env.CRM_PASS };
  let code = "", detail = "", wrote = false;
  try {
    await L.sb("?select=id&limit=1");
    if (L.authed(req)) {
      const t = L.now(), r = (await L.sb("", { method: "POST", body: JSON.stringify({ type: "customer", name: "__health_check__", phone: "0000000000", email: "", property: "", message: "", experience: "", profession: "", source: "health", status: "New", assigned: "", notes: "", created_at: t, updated_at: t }) }))[0];
      wrote = true; if (r && r.id) await L.sb(`?id=eq.${r.id}`, { method: "DELETE" });
    }
  } catch (e) { code = e.code || "db"; detail = String(e.message).slice(0, 200); }
  const ok = !code, show = code === "table" || code === "column";
  L.out(res, ok ? 200 : 500, { ok, env, wrote, code, hint: ok ? "" : L.HINTS[code] || L.HINTS.db, detail: ok ? "" : detail, sql: show ? L.SQL_FIX : "" });
};
