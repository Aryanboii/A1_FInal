const L = require("../_lib");
module.exports = L.guard(async (req, res) => {
  if (req.method === "GET") { if (!L.authed(req)) return L.out(res, 401, { error: "auth" }); return L.out(res, 200, await L.list()); }
  if (req.method !== "POST") return L.out(res, 405, { error: "method" });
  const d = L.body(req), [code, b] = await L.create(req, d, L.authed(req) && d.source === "manual");
  L.out(res, code, b);
});
