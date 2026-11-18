const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.PORT || 3000);
const API_KEY = process.env.GEMINI_API_KEY || "";
const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const PUBLIC_DIR = path.join(__dirname, "public");
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json" };
const requests = new Map();

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin" });
  res.end(type.startsWith("application/json") ? JSON.stringify(body) : body);
}
function rateLimited(ip) {
  const now = Date.now();
  const entry = requests.get(ip) || { start: now, count: 0 };
  if (now - entry.start > 10 * 60 * 1000) { entry.start = now; entry.count = 0; }
  entry.count += 1;
  requests.set(ip, entry);
  return entry.count > 25;
}
async function readJson(req) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 1_000_000) throw new Error("Codsiga aad buu u weyn yahay.");
  }
  return JSON.parse(raw || "{}");
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  if (req.method === "GET" && url.pathname === "/api/status") {
    return send(res, 200, { configured: Boolean(API_KEY), model: MODEL });
  }
  if (req.method === "POST" && url.pathname === "/api/chat") {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
    if (rateLimited(ip)) return send(res, 429, { error: "Codsiyo badan ayaa yimid. Sug dhowr daqiiqo." });
    if (!API_KEY) return send(res, 503, { error: "Gemini API server-ka laguma darin weli." });
    try {
      const body = await readJson(req);
      const history = Array.isArray(body.history) ? body.history.slice(-10) : [];
      const contents = history.filter((m) => (m.role === "user" || m.role === "model") && typeof m.text === "string")
        .map((m) => ({ role: m.role, parts: [{ text: m.text.slice(0, 8000) }] }));
      if (!contents.length || contents[contents.length - 1].role !== "user") return send(res, 400, { error: "Fariin sax ah lama helin." });
      const lang = body.lang === "en" ? "English" : "Somali (Af-Soomaali)";
      const voice = body.voice === "male" ? "Axmed" : "Xaliimo";
      const prompt = `You are IBRA AI, a helpful, respectful Somali-English assistant. Reply in the user's language, especially fluent natural Somali when the user writes Somali. Keep answers clear and mobile-friendly. Preferred language: ${lang}. Voice label: ${voice}. Do not claim to be a human.`;
      const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": API_KEY },
        body: JSON.stringify({ systemInstruction: { parts: [{ text: prompt }] }, contents, generationConfig: { maxOutputTokens: 800, temperature: 0.7 } }),
        signal: AbortSignal.timeout(45000)
      });
      const data = await upstream.json().catch(() => ({}));
      if (!upstream.ok) {
        const msg = data?.error?.message || `Gemini API HTTP ${upstream.status}`;
        return send(res, upstream.status >= 500 ? 502 : upstream.status, { error: msg.slice(0, 300) });
      }
      const reply = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("").trim();
      if (!reply) return send(res, 502, { error: "Gemini jawaab ma soo celin." });
      return send(res, 200, { reply });
    } catch (error) {
      return send(res, 400, { error: error.message === "Codsiga aad buu u weyn yahay." ? error.message : "Server-ku ma dhammaystiri karin codsiga. Isku day mar kale." });
    }
  }
  if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, { error: "Method not allowed" });
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") pathname = "/index.html";
  const file = path.resolve(PUBLIC_DIR, `.${pathname}`);
  if (!file.startsWith(PUBLIC_DIR + path.sep)) return send(res, 403, { error: "Forbidden" });
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, { error: "Not found" });
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin" });
    if (req.method === "HEAD") return res.end();
    res.end(data);
  });
});
server.listen(PORT, "0.0.0.0", () => console.log(`IBRA AI running on port ${PORT}`));
