const L = require("../_lib");
module.exports = L.guard(async (req, res) => {          // bulk delete (CRM only)
  if (req.method !== "POST") return L.out(res, 405, { error: "method" });
  if (!L.authed(req)) return L.out(res, 401, { error: "auth" });
  const ids = (Array.isArray(L.body(req).ids) ? L.body(req).ids : []).map(Number).filter(Number.isInteger);
  if (ids.length) await L.sb(`?id=in.(${ids.join(",")})`, { method: "DELETE" });
  L.out(res, 200, { ok: true, deleted: ids.length });
});
