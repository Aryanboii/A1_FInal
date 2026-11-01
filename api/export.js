const L = require("./_lib");
const cols = ["id", "type", "name", "phone", "email", "property", "message", "experience", "profession", "source", "status", "assigned", "notes", "created_at"];
const cell = v => { let s = String(v ?? ""); if (/^[=+\-@]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
module.exports = L.guard(async (req, res) => {
  if (!L.authed(req)) return L.out(res, 401, { error: "auth" });
  const rows = await L.list();
  L.out(res, 200, [cols.join(","), ...rows.map(r => cols.map(c => cell(r[c])).join(","))].join("\n"), "text/csv", { "Content-Disposition": "attachment; filename=leads.csv" });
});
