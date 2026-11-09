// Local test server that mimics Vercel: node dev.js  (needs the same env vars as production)
const http = require("http"), fs = require("fs"), path = require("path");
const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json", ".txt": "text/plain; charset=utf-8", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".mp4": "video/mp4" };
const route = p => { const s = p.replace(/^\/api\//, "").replace(/\.csv$/, ""); const f = ["", "/index"].map(x => `./api/${s}${x}.js`).find(x => fs.existsSync(x));
  if (f) return [require(f), {}]; const [a, id] = s.split("/"); return fs.existsSync(`./api/${a}/[id].js`) ? [require(`./api/${a}/[id].js`), { id }] : [null, {}]; };
http.createServer((req, res) => {
  const u = new URL(req.url, "http://x"); let p = u.pathname; let b = "";
  req.on("data", c => b += c); req.on("end", () => {
    if (p.startsWith("/api/")) { const [h, q] = route(p); if (!h) { res.statusCode = 404; return res.end("{}"); }
      try { req.body = JSON.parse(b || "{}"); } catch { req.body = {}; } req.query = q; return h(req, res); }
    if (p === "/") p = "/index.html"; if (p === "/crm") p = "/crm.html";
    const f = path.join(__dirname, "public", p); if (!f.startsWith(path.join(__dirname, "public")) || !fs.existsSync(f)) { res.statusCode = 404; return res.end("not found"); }
    res.setHeader("Content-Type", MIME[path.extname(f)] || "application/octet-stream"); res.end(fs.readFileSync(f)); });
}).listen(process.env.PORT || 3000, () => console.log("http://localhost:" + (process.env.PORT || 3000)));
