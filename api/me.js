const L = require("./_lib");
module.exports = (req, res) => L.out(res, 200, { ok: L.authed(req) });
