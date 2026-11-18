// Shared helpers for all /api functions (Vercel serverless, Node 18+). Data lives in Supabase - nothing is stored on the server disk.
const crypto = require("crypto");
const E = process.env;
const clean = v => String(v || "").trim().replace(/^["']|["']$/g, "");
const SBU = clean(E.SUPABASE_URL).replace(/\/rest\/v1\/?$/, "").replace(/\/$/, ""), SBK = clean(E.SUPABASE_SERVICE_KEY || E.SUPABASE_SERVICE_ROLE_KEY || E.SUPABASE_KEY);
const USER = E.CRM_USER || "admin", PASS = E.CRM_PASS || "a1infratech";
const SECRET = E.SESSION_SECRET || crypto.createHash("sha256").update(PASS + SBK + "a1").digest("hex");
const STATUSES = ["New", "Contacted", "Site Visit", "Negotiation", "Won", "Lost"];
const HITS = new Map();

const out = (res, code, body, type = "application/json", extra = {}) => {
  res.statusCode = code; res.setHeader("Content-Type", type); res.setHeader("Cache-Control", "no-store");
  for (const k in extra) res.setHeader(k, extra[k]);
  res.end(typeof body === "string" ? body : JSON.stringify(body));
};
const body = req => { const b = req.body; if (b && typeof b === "object") return b; try { return JSON.parse(b || "{}"); } catch { return {}; } };

const classify = (status, text) =>
  /PGRST204|42703|column .* does not exist|Could not find the '.*' column/i.test(text) ? "column"
  : /PGRST205|42P01|Could not find the table|relation .* does not exist/i.test(text) ? "table"
  : status === 401 || status === 403 || /JWT|apikey|permission denied|row-level security|42501/i.test(text) ? "key"
  : status === 404 ? "url" : "db";
const HINTS = {
  config: "Add SUPABASE_URL and SUPABASE_SERVICE_KEY in Vercel > Settings > Environment Variables (Production), then redeploy.",
  url: "SUPABASE_URL looks wrong. It must look like https://xxxxxxxx.supabase.co (Supabase > Project Settings > API > Project URL).",
  key: "Supabase rejected the key. Use the SECRET key (sb_secret_...) or the legacy service_role key as SUPABASE_SERVICE_KEY - not the publishable / anon key.",
  table: "The table 'leads' does not exist. Copy the SQL below, paste it in Supabase > SQL Editor and press Run.",
  column: "The table 'leads' is missing some columns. Copy the SQL below, paste it in Supabase > SQL Editor and press Run (it repairs the table).",
  db: "Supabase returned an unexpected error. Check Vercel > Logs for the exact message."
};
const SQL_FIX = require("fs").existsSync(require("path").join(__dirname, "..", "supabase.sql")) ? require("fs").readFileSync(require("path").join(__dirname, "..", "supabase.sql"), "utf8") : "";
async function sb(qs, o = {}) {
  if (!SBU || !SBK) { const e = new Error("SUPABASE_URL / SUPABASE_SERVICE_KEY are not set"); e.code = "config"; throw e; }
  const hd = { apikey: SBK, ...(SBK.startsWith("sb_") ? {} : { Authorization: "Bearer " + SBK }), "Content-Type": "application/json", Prefer: "return=representation" };
  let r; for (let i = 0; i < 2; i++) { try { r = await fetch(`${SBU}/rest/v1/leads${qs}`, { ...o, headers: hd }); if (r.status < 500) break; } catch (e) { if (i) { e.code = "url"; throw e; } } await new Promise(x => setTimeout(x, 400)); }
  if (!r.ok) { const t = await r.text(), e = new Error(`Supabase ${r.status}: ${t}`); e.status = r.status; e.code = classify(r.status, t); throw e; }
  return r.status === 204 ? [] : r.json();
}
const list = async () => { let all = [], o = 0, b; do { b = await sb(`?select=*&order=id.desc&limit=1000&offset=${o}`); all = all.concat(b); o += 1000; } while (b.length === 1000); return all; };

// stateless login: signed cookie (works across serverless instances)
const sign = s => crypto.createHmac("sha256", SECRET).update(s).digest("base64url");
const token = () => { const p = Buffer.from(JSON.stringify({ exp: Date.now() + 7 * 864e5 })).toString("base64url"); return p + "." + sign(p); };
const authed = req => {
  const m = /(?:^|;\s*)sid=([\w.-]+)/.exec(req.headers.cookie || ""); if (!m) return false;
  const [p, sig] = m[1].split("."); if (!p || !sig) return false;
  const a = Buffer.from(sign(p)), b = Buffer.from(sig); if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try { return JSON.parse(Buffer.from(p, "base64url")).exp > Date.now(); } catch { return false; }
};
const hash = s => crypto.createHash("sha256").update(String(s)).digest();
const same = (a, b) => crypto.timingSafeEqual(hash(a), hash(b));
const now = () => new Date().toISOString().slice(0, 19);   // no timezone suffix: the CRM page appends "Z"

async function create(req, d, manual) {
  if (!manual) {
    if (d.website) return [200, { ok: true }];                                   // honeypot (bots)
    const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "x", t = Date.now();
    const h = (HITS.get(ip) || []).filter(x => t - x < 36e5);
    if (h.length >= 15) return [429, { error: "Too many requests, please try again later." }];
    h.push(t); HITS.set(ip, h);
  }
  const g = (k, n = 300) => String(d[k] ?? "").trim().slice(0, n), name = g("name", 100), phone = g("phone", 20);
  if (!name || phone.replace(/\D/g, "").length < 10) return [400, { error: "Please enter your name and a valid 10-digit phone number." }];
  const ts = now(), row = { type: d.type === "partner" ? "partner" : "customer", name, phone, email: g("email", 120), property: g("property", 120),
    message: g("message", 1000), experience: g("experience", 60), profession: g("profession", 100), source: manual ? "manual" : "website",
    status: "New", assigned: "", notes: "", created_at: ts, updated_at: ts };
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString().slice(0, 19);      // ignore double-submits / retries
  let dup = null; try { dup = (await sb(`?phone=eq.${encodeURIComponent(phone)}&type=eq.${row.type}&created_at=gte.${since}&select=id&limit=1`))[0]; } catch {}
  if (dup) return [200, { ok: true, id: dup.id }];
  let saved;
  try { saved = (await sb("", { method: "POST", body: JSON.stringify(row) }))[0]; }
  catch (e) {
    console.error("LEAD_NOT_SAVED [" + (e.code || "?") + "] " + e.message + " | " + JSON.stringify(row));      // recoverable from Vercel > Logs
    if (E.LEAD_WEBHOOK_URL) { try { const w = await Promise.race([fetch(E.LEAD_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...row, saved: false }) }), new Promise((_, j) => setTimeout(() => j(new Error("timeout")), 4000))]); if (w.ok) return [200, { ok: true, queued: true }]; } catch {} }
    throw e;
  }
  if (E.LEAD_WEBHOOK_URL) { try { await Promise.race([fetch(E.LEAD_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(saved) }), new Promise(r => setTimeout(r, 4000))]); } catch {} }
  return [200, { ok: true, id: saved.id }];
}
const guard = fn => async (req, res) => { try { await fn(req, res); } catch (e) { console.error(e); out(res, 500, { error: "Server error. Please try again." }); } };
module.exports = { HINTS, SQL_FIX, SBU, SBK, out, body, sb, list, token, authed, same, now, create, guard, STATUSES, USER, PASS };
