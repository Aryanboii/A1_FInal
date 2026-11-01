const L = require("./_lib");
module.exports = (req, res) => L.out(res, 200, { ok: true }, undefined, { "Set-Cookie": `sid=; Path=/; HttpOnly${process.env.VERCEL ? "; Secure" : ""}; SameSite=Lax; Max-Age=0` });
