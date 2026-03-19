const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const srcRoot = path.join(projectRoot, "src");
const outputPath = path.join(projectRoot, "codes.txt");

const SKIP_DIR_NAMES = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  ".next",
  ".turbo",
  ".cache",
]);

const SKIP_FILE_EXTS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".pdf",
  ".zip",
  ".gz",
  ".7z",
  ".rar",
  ".mp4",
  ".mp3",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".map",
]);

function isProbablyBinary(buffer) {
  const len = Math.min(buffer.length, 8000);
  for (let i = 0; i < len; i++) {
    if (buffer[i] === 0) return true;
  }
  return false;
}

function walkFiles(dirAbs, outAbsFiles) {
  const entries = fs.readdirSync(dirAbs, { withFileTypes: true });
  for (const e of entries) {
    const abs = path.join(dirAbs, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIR_NAMES.has(e.name)) continue;
      walkFiles(abs, outAbsFiles);
    } else if (e.isFile()) {
      const ext = path.extname(e.name).toLowerCase();
      if (SKIP_FILE_EXTS.has(ext)) continue;
      outAbsFiles.push(abs);
    }
  }
}

function main() {
  if (!fs.existsSync(srcRoot) || !fs.statSync(srcRoot).isDirectory()) {
    console.error(`src folder not found at: ${srcRoot}`);
    process.exit(1);
  }

  /** @type {string[]} */
  const filesAbs = [];
  walkFiles(srcRoot, filesAbs);
  filesAbs.sort((a, b) => a.localeCompare(b));

  const chunks = [];
  chunks.push(`# Source code dump`);
  chunks.push(`Generated: ${new Date().toISOString()}`);
  chunks.push(`Root: ${projectRoot}`);
  chunks.push(`Includes: ${filesAbs.length} file(s) under src/`);
  chunks.push("");

  for (const abs of filesAbs) {
    const rel = path.relative(projectRoot, abs).replaceAll("\\", "/");
    let buf;
    try {
      buf = fs.readFileSync(abs);
    } catch (err) {
      chunks.push(`===== FILE: ${rel} =====`);
      chunks.push(`[READ ERROR] ${String(err)}`);
      chunks.push("");
      continue;
    }

    const ext = path.extname(abs).toLowerCase();
    if (SKIP_FILE_EXTS.has(ext) || isProbablyBinary(buf)) {
      chunks.push(`===== FILE: ${rel} =====`);
      chunks.push(`[SKIPPED: binary or excluded extension ${ext || "(none)"}]`);
      chunks.push("");
      continue;
    }

    const text = buf.toString("utf8");
    chunks.push(`===== FILE: ${rel} =====`);
    chunks.push(text.replace(/\r\n/g, "\n").replace(/\r/g, "\n"));
    if (!text.endsWith("\n")) chunks.push("");
    chunks.push("");
  }

  fs.writeFileSync(outputPath, chunks.join("\n"), "utf8");
  console.log(`Wrote ${filesAbs.length} file(s) into: ${outputPath}`);
}

main();
