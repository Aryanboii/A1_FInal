const L = require("../_lib");
module.exports = L.guard(async (req, res) => {
  if (!L.authed(req)) return L.out(res, 401, { error: "auth" });
  const id = parseInt(req.query.id, 10); if (!Number.isInteger(id)) return L.out(res, 400, { error: "bad id" });
  if (req.method === "DELETE") { await L.sb(`?id=eq.${id}`, { method: "DELETE" }); return L.out(res, 200, { ok: true }); }
  if (req.method !== "PATCH") return L.out(res, 405, { error: "method" });
  const d = L.body(req), ch = {}, r = (await L.sb(`?id=eq.${id}&select=notes`))[0];
  if (!r) return L.out(res, 404, { error: "not found" });
  for (const [k, n] of [["status", 20], ["assigned", 60], ["name", 100], ["phone", 20], ["email", 120], ["property", 120]]) {
    if (!(k in d)) continue; const v = String(d[k]).trim().slice(0, n);
    if (k === "status" && !L.STATUSES.includes(v)) continue; ch[k] = v;
  }
  const note = String(d.note || "").trim().slice(0, 1000);
  if (note) ch.notes = (r.notes || "") + `[${new Date().toLocaleString("en-GB", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}] ${note}\n`;
  if (!Object.keys(ch).length) return L.out(res, 400, { error: "nothing to update" });
  ch.updated_at = L.now(); await L.sb(`?id=eq.${id}`, { method: "PATCH", body: JSON.stringify(ch) });
  L.out(res, 200, { ok: true });
});
