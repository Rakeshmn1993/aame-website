const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_FILE = path.join(ROOT, "data", "votes.json");
const VISITS_FILE = path.join(ROOT, "data", "visits.json");
const MAX_LOOK = 15;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
};
const RESUME_DIR = path.join(ROOT, "resume");

function readVotes() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return {};
  }
}

function writeVotes(votes) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  const tmp = DATA_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(votes, null, 2));
  fs.renameSync(tmp, DATA_FILE);
}

function readVisits() {
  try {
    return Number(JSON.parse(fs.readFileSync(VISITS_FILE, "utf8")).count) || 0;
  } catch {
    return 0;
  }
}

function writeVisits(count) {
  fs.mkdirSync(path.dirname(VISITS_FILE), { recursive: true });
  const tmp = VISITS_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify({ count }));
  fs.renameSync(tmp, VISITS_FILE);
}

function send(res, status, body, type = "application/json; charset=utf-8") {
  const isText = typeof body === "string" || Buffer.isBuffer(body);
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(isText ? body : JSON.stringify(body));
}

function readBody(req, limit = 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error("Body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString()));
    req.on("error", reject);
  });
}

function votesCsv(votes) {
  const lines = ["look,votes"];
  for (let i = 1; i <= MAX_LOOK; i++) {
    lines.push(`Look ${i},${votes[`Look ${i}`] || 0}`);
  }
  return lines.join("\n") + "\n";
}

async function handleApi(req, res, url) {
  if (url.pathname === "/api/votes" && req.method === "GET") {
    return send(res, 200, readVotes());
  }

  if (url.pathname === "/api/votes.csv" && req.method === "GET") {
    return send(res, 200, votesCsv(readVotes()), "text/csv; charset=utf-8");
  }

  if (url.pathname === "/api/votes" && req.method === "POST") {
    let data;
    try {
      data = JSON.parse(await readBody(req));
    } catch {
      return send(res, 400, { error: "Invalid request" });
    }
    const look = Number(data && data.look);
    if (!Number.isInteger(look) || look < 1 || look > MAX_LOOK) {
      return send(res, 400, { error: `Look must be between 1 and ${MAX_LOOK}` });
    }
    const votes = readVotes();
    const key = `Look ${look}`;
    votes[key] = (votes[key] || 0) + 1;
    writeVotes(votes);
    return send(res, 200, votes);
  }

  if (url.pathname === "/api/visits" && req.method === "GET") {
    return send(res, 200, { count: readVisits() });
  }

  if (url.pathname === "/api/visits" && req.method === "POST") {
    const count = readVisits() + 1;
    writeVisits(count);
    return send(res, 200, { count });
  }

  send(res, 404, { error: "Not found" });
}

function serveResumeIndex(res) {
  fs.readdir(RESUME_DIR, (err, names) => {
    if (err) return send(res, 404, "Not found", "text/plain; charset=utf-8");
    const items = names
      .filter((name) => !name.startsWith("."))
      .sort()
      .map((name) => `<li><a href="/resume/${encodeURIComponent(name)}">${name}</a></li>`)
      .join("");
    send(res, 200, `<!doctype html><meta charset="utf-8"><title>Resume</title><ul>${items}</ul>`, "text/html; charset=utf-8");
  });
}

function serveStatic(res, pathname) {
  if (pathname === "/resume" || pathname === "/resume/") return serveResumeIndex(res);
  let rel = decodeURIComponent(pathname);
  if (rel.endsWith("/")) rel += "index.html";
  const file = path.normalize(path.join(ROOT, rel));
  const relative = path.relative(ROOT, file);
  const firstSegment = relative.split(path.sep)[0];
  const blocked =
    relative.startsWith("..") ||
    path.isAbsolute(relative) ||
    ["data", ".git"].includes(firstSegment) ||
    file === __filename;
  if (blocked) return send(res, 404, "Not found", "text/plain; charset=utf-8");

  fs.readFile(file, (err, buffer) => {
    if (err) return send(res, 404, "Not found", "text/plain; charset=utf-8");
    send(res, 200, buffer, TYPES[path.extname(file).toLowerCase()] || "application/octet-stream");
  });
}

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    try {
      if (url.pathname.startsWith("/api/")) {
        await handleApi(req, res, url);
      } else if (req.method === "GET" || req.method === "HEAD") {
        serveStatic(res, url.pathname);
      } else {
        send(res, 405, { error: "Method not allowed" });
      }
    } catch (err) {
      console.error(err);
      send(res, 500, { error: "Server error" });
    }
  })
  .listen(PORT, () => console.log(`Serving on http://localhost:${PORT}`));
