const L = require("./_lib");
module.exports = L.guard(async (req, res) => {
  const d = L.body(req);
  if (req.method !== "POST") return L.out(res, 405, { error: "method" });
  if (!(L.same(d.user, L.USER) && L.same(d.pass, L.PASS))) { await new Promise(r => setTimeout(r, 800)); return L.out(res, 401, { error: "Wrong username or password" }); }
  L.out(res, 200, { ok: true }, undefined, { "Set-Cookie": `sid=${L.token()}; Path=/; HttpOnly${process.env.VERCEL ? "; Secure" : ""}; SameSite=Lax; Max-Age=604800` });
});
