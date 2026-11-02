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

async function sb(qs, o = {}) {
  if (!SBU || !SBK) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_KEY are not set");
  const hd = { apikey: SBK, ...(SBK.startsWith("sb_") ? {} : { Authorization: "Bearer " + SBK }), "Content-Type": "application/json", Prefer: "return=representation" };
  let r; for (let i = 0; i < 2; i++) { try { r = await fetch(`${SBU}/rest/v1/leads${qs}`, { ...o, headers: hd }); if (r.status < 500) break; } catch (e) { if (i) throw e; } await new Promise(x => setTimeout(x, 400)); }
  if (!r.ok) { const e = new Error(`Supabase ${r.status}: ${await r.text()}`); e.status = r.status; throw e; }
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
  const dup = (await sb(`?phone=eq.${encodeURIComponent(phone)}&type=eq.${row.type}&created_at=gte.${since}&select=id&limit=1`))[0];
  if (dup) return [200, { ok: true, id: dup.id }];
  const saved = (await sb("", { method: "POST", body: JSON.stringify(row) }))[0];
  if (E.LEAD_WEBHOOK_URL) { try { await Promise.race([fetch(E.LEAD_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(saved) }), new Promise(r => setTimeout(r, 4000))]); } catch {} }
  return [200, { ok: true, id: saved.id }];
}
const guard = fn => async (req, res) => { try { await fn(req, res); } catch (e) { console.error(e); out(res, 500, { error: "Server error. Please try again." }); } };
module.exports = { SBU, SBK, out, body, sb, list, token, authed, same, now, create, guard, STATUSES, USER, PASS };
