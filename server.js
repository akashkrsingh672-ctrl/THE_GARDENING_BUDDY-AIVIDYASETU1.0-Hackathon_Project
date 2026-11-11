"use strict";

/* Small same-origin web server and OpenAI plant-identification proxy. Requires Node.js 18+. */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || "127.0.0.1";
const MAX_BODY_BYTES = 3 * 1024 * 1024;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT = 10;
const requestsByIp = new Map();

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  response.end(JSON.stringify(body));
}

function readJson(request, response) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let tooLarge = false;
    const chunks = [];
    request.on("data", (chunk) => {
      if (tooLarge) return;
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        tooLarge = true;
        sendJson(response, 413, { error: "That photo is too large. Choose a smaller image and try again." });
        request.resume();
        reject(new Error("request_too_large"));
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => {
      if (response.writableEnded) return;
      try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8"))); }
      catch (error) { reject(error); }
    });
    request.on("error", reject);
  });
}

function allowIdentification(ip) {
  const now = Date.now();
  const recent = (requestsByIp.get(ip) || []).filter((timestamp) => now - timestamp < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    requestsByIp.set(ip, recent);
    return false;
  }
  recent.push(now);
  requestsByIp.set(ip, recent);
  return true;
}

async function identifyPlant(request, response) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    sendJson(response, 503, { error: "Plant identification is not configured yet. Add the OpenAI API key to the server environment." });
    return;
  }

  if (!allowIdentification(request.socket.remoteAddress || "unknown")) {
    sendJson(response, 429, { error: "Too many photo checks from this connection. Please try again later." });
    return;
  }

  let payload;
  try { payload = await readJson(request, response); }
  catch (error) {
    if (!response.writableEnded && error.message !== "request_too_large") sendJson(response, 400, { error: "The photo request could not be read." });
    return;
  }

  if (!payload || typeof payload.image !== "string" || !/^[A-Za-z0-9+/]+={0,2}$/.test(payload.image)) {
    sendJson(response, 400, { error: "Choose a valid JPEG photo and try again." });
    return;
  }

  const imageBytes = Buffer.from(payload.image, "base64");
  const isJpeg = imageBytes[0] === 0xff && imageBytes[1] === 0xd8;
  if (!isJpeg) {
    sendJson(response, 400, { error: "The prepared photo is not a valid JPEG image." });
    return;
  }
  if (imageBytes.length > MAX_IMAGE_BYTES) {
    sendJson(response, 413, { error: "The prepared photo is too large. Choose a smaller image and try again." });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-6-luna",
        store: false,
        max_output_tokens: 450,
        input: [{
          role: "user",
          content: [
            { type: "input_text", text: "Identify the plant visible in this photo. This may be any plant, not just a crop. Return up to three plausible matches in rank order. Prefer a scientific name when you can identify it, provide a common name when known, and give one short visual reason for each match. Use low confidence or no matches when the image is unclear or the plant cannot be identified. Confidence is a qualitative estimate, not a measured probability. If the image does not show a plant, set isPlant to false and return no matches. Do not give advice about eating, toxicity, or medical use." },
            { type: "input_image", image_url: "data:image/jpeg;base64," + imageBytes.toString("base64"), detail: "high" }
          ]
        }],
        text: {
          format: {
            type: "json_schema",
            name: "plant_identification",
            strict: true,
            schema: {
              type: "object",
              properties: {
                isPlant: { type: "boolean" },
                matches: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      scientificName: { type: "string" },
                      commonName: { type: "string" },
                      confidence: { type: "string", enum: ["high", "medium", "low"] },
                      reason: { type: "string" }
                    },
                    required: ["scientificName", "commonName", "confidence", "reason"],
                    additionalProperties: false
                  }
                }
              },
              required: ["isPlant", "matches"],
              additionalProperties: false
            }
          }
        }
      }),
      signal: controller.signal
    });
    const result = await upstream.json().catch(() => null);
    if (!upstream.ok || !result) {
      const status = upstream.status === 429 ? 429 : 502;
      sendJson(response, status, { error: upstream.status === 429 ? "OpenAI is busy with image requests. Try again shortly." : "OpenAI could not process this photo. Check the API key and account access, then try again." });
      return;
    }

    const outputText = (result.output || []).reduce((texts, item) => {
      if (item.type === "message" && Array.isArray(item.content)) {
        item.content.forEach((part) => { if (part.type === "output_text" && part.text) texts.push(part.text); });
      }
      return texts;
    }, []).join("");
    let identification;
    try { identification = JSON.parse(outputText); }
    catch (error) {
      sendJson(response, 502, { error: "OpenAI returned an unreadable plant identification. Please try another photo." });
      return;
    }
    const matches = Array.isArray(identification.matches) ? identification.matches.slice(0, 3).map((match) => ({
      scientificName: String(match.scientificName || ""),
      commonName: String(match.commonName || ""),
      confidence: ["high", "medium", "low"].includes(match.confidence) ? match.confidence : "low",
      reason: String(match.reason || "")
    })) : [];
    sendJson(response, 200, {
      isPlant: Boolean(identification.isPlant),
      matches
    });
  } catch (error) {
    const message = error.name === "AbortError" ? "The identification service took too long. Please try again." : "Could not reach the plant identification service. Check the server connection and try again.";
    sendJson(response, 502, { error: message });
  } finally {
    clearTimeout(timeout);
  }
}

async function serveStatic(request, response, pathname) {
  let decoded;
  try { decoded = decodeURIComponent(pathname); }
  catch (error) { sendJson(response, 400, { error: "Invalid page path." }); return; }

  const relative = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
  const segments = relative.split(/[\\/]/);
  if (segments.some((segment) => segment.startsWith(".") || segment === "server.js" || segment === "node_modules")) {
    sendJson(response, 404, { error: "Not found." });
    return;
  }

  const filePath = path.resolve(ROOT, relative);
  if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
    sendJson(response, 403, { error: "Forbidden." });
    return;
  }

  try {
    const stat = await fs.promises.stat(filePath);
    if (!stat.isFile()) { sendJson(response, 404, { error: "Not found." }); return; }
    response.writeHead(200, {
      "Content-Type": CONTENT_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Content-Length": stat.size,
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    });
    if (request.method === "HEAD") response.end();
    else fs.createReadStream(filePath).pipe(response);
  } catch (error) {
    sendJson(response, 404, { error: "Not found." });
  }
}

const server = http.createServer((request, response) => {
  let url;
  try { url = new URL(request.url, "http://localhost"); }
  catch (error) { sendJson(response, 400, { error: "Invalid request." }); return; }

  if (url.pathname === "/api/identify-plant") {
    if (request.method !== "POST") { sendJson(response, 405, { error: "Use POST to identify a photo." }); return; }
    identifyPlant(request, response);
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    sendJson(response, 405, { error: "Method not allowed." });
    return;
  }
  serveStatic(request, response, url.pathname);
});

server.listen(PORT, HOST, () => {
  console.log("Gardening Buddy running at http://" + HOST + ":" + PORT);
  if (!process.env.OPENAI_API_KEY) console.log("Set OPENAI_API_KEY to enable photo identification.");
});
