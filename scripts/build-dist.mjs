import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");

const srcDir = path.join(rootDir, "src");
const resourceDir = path.join(rootDir, "resource");
const iconSourceDir = path.join(resourceDir, "app", "icons");

function walkFiles(directory, matcher, out = []) {
  if (!fs.existsSync(directory)) {
    return out;
  }

  const entries = fs.readdirSync(directory, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, matcher, out);
      continue;
    }
    if (matcher(fullPath)) {
      out.push(fullPath);
    }
  }
  return out;
}

function collectUsedInlineSvgIcons(directory) {
  const files = walkFiles(directory, (file) => file.endsWith(".ts"));
  const iconNames = new Set();

  const patterns = [
    /new\s+InlineSvgIcon\s*\(\s*["'`]([^"'`]+)["'`]/g,
    /\.setIcon\s*\(\s*["'`]([^"'`]+)["'`]/g,
    /\biconName\s*:\s*["'`]([^"'`]+)["'`]/g,
  ];

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, "utf8");

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const iconName = match[1]?.trim();
        if (iconName) {
          iconNames.add(iconName);
        }
      }
      pattern.lastIndex = 0;
    }
  }

  return iconNames;
}

function ensureParentDirectory(targetFilePath) {
  fs.mkdirSync(path.dirname(targetFilePath), { recursive: true });
}

function copyFileIfPresent(sourcePath, targetPath) {
  if (!fs.existsSync(sourcePath)) {
    return;
  }
  ensureParentDirectory(targetPath);
  fs.copyFileSync(sourcePath, targetPath);
}

function emptyDirectory(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    return;
  }

  const entries = fs.readdirSync(directory);
  for (const entry of entries) {
    fs.rmSync(path.join(directory, entry), { recursive: true, force: true });
  }
}

function copyRequiredProjectFiles() {
  copyFileIfPresent(
    path.join(rootDir, "index.html"),
    path.join(distDir, "index.html"),
  );
  copyFileIfPresent(
    path.join(rootDir, "manifest.webmanifest"),
    path.join(distDir, "manifest.webmanifest"),
  );
  copyFileIfPresent(path.join(rootDir, "sw.js"), path.join(distDir, "sw.js"));
  copyFileIfPresent(
    path.join(rootDir, "lib", "application.js"),
    path.join(distDir, "lib", "application.js"),
  );
}

function copyResourceWithFilteredIcons(usedIcons) {
  const iconDirPrefix = `${iconSourceDir}${path.sep}`;
  const distResourceDir = path.join(distDir, "resource");
  const distIconDir = path.join(distResourceDir, "app", "icons");

  fs.cpSync(resourceDir, distResourceDir, {
    recursive: true,
    filter: (sourcePath) => {
      const normalized = sourcePath.endsWith(path.sep)
        ? sourcePath
        : `${sourcePath}${path.sep}`;

      if (normalized === iconDirPrefix) {
        return false;
      }

      return !sourcePath.startsWith(iconDirPrefix);
    },
  });

  fs.mkdirSync(distIconDir, { recursive: true });

  const missingIcons = [];
  for (const iconName of usedIcons) {
    const sourceIconPath = path.join(iconSourceDir, `${iconName}.svg`);
    const distIconPath = path.join(distIconDir, `${iconName}.svg`);

    if (!fs.existsSync(sourceIconPath)) {
      missingIcons.push(iconName);
      continue;
    }

    fs.copyFileSync(sourceIconPath, distIconPath);
  }

  if (missingIcons.length > 0) {
    console.warn(
      `[build-dist] Missing SVG files for: ${missingIcons.sort().join(", ")}`,
    );
  }
}

function buildDist() {
  emptyDirectory(distDir);

  const usedIcons = collectUsedInlineSvgIcons(srcDir);

  copyRequiredProjectFiles();
  copyResourceWithFilteredIcons(usedIcons);

  console.log(
    `[build-dist] Created dist with ${usedIcons.size} inline SVG icon(s): ${Array.from(
      usedIcons,
    )
      .sort()
      .join(", ")}`,
  );
}

buildDist();
