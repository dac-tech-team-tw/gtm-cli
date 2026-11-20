#!/usr/bin/env node

// Build one npm package per platform from the release binaries.
//
// Usage: node scripts/npm-platform-packages.mjs <binaries-dir> <out-dir>
//
// Each package listed in npm/package.json optionalDependencies is written to
// <out-dir>/<platform>/ with its binary in bin/. npm installs only the package
// whose os/cpu match the host, so no install script is needed.

import fs from "node:fs";
import path from "node:path";

const [binariesDir, outDir] = process.argv.slice(2);
if (!binariesDir || !outDir) {
  console.error("Usage: node scripts/npm-platform-packages.mjs <binaries-dir> <out-dir>");
  process.exit(1);
}

const root = path.join(import.meta.dirname, "..");
const main = JSON.parse(fs.readFileSync(path.join(root, "npm/package.json"), "utf8"));

// Package suffix -> release asset name.
const ASSETS = {
  "darwin-arm64": "gtm-darwin-arm64",
  "darwin-x64": "gtm-darwin-x64",
  "linux-x64": "gtm-linux-x64",
  "win32-x64": "gtm-windows-x64.exe",
};

const platformPackages = Object.keys(main.optionalDependencies ?? {});
const expected = Object.keys(ASSETS).map((platform) => `${main.name}-${platform}`);
if (platformPackages.sort().join() !== expected.sort().join()) {
  throw new Error(`npm/package.json optionalDependencies must be exactly: ${expected.join(", ")}`);
}

for (const [platform, asset] of Object.entries(ASSETS)) {
  const name = `${main.name}-${platform}`;
  if (main.optionalDependencies[name] !== main.version) {
    throw new Error(`${name} is pinned to ${main.optionalDependencies[name]}, expected ${main.version}`);
  }

  const [os, cpu] = platform.split("-");
  const binary = os === "win32" ? "gtm.exe" : "gtm";
  const dir = path.join(outDir, platform);
  fs.mkdirSync(path.join(dir, "bin"), { recursive: true });
  fs.copyFileSync(path.join(binariesDir, asset), path.join(dir, "bin", binary));
  fs.chmodSync(path.join(dir, "bin", binary), 0o755);
  fs.copyFileSync(path.join(root, "npm/LICENSE"), path.join(dir, "LICENSE"));

  const pkg = {
    name,
    version: main.version,
    description: `The ${platform} binary for ${main.name}`,
    homepage: main.homepage,
    repository: main.repository,
    license: main.license,
    author: main.author,
    os: [os],
    cpu: [cpu],
    files: ["bin"],
    preferUnplugged: true,
  };
  fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify(pkg, null, 2) + "\n");
  fs.writeFileSync(
    path.join(dir, "README.md"),
    `# ${name}\n\nThe ${platform} binary for [\`${main.name}\`](https://www.npmjs.com/package/${main.name}). Install that package instead of this one.\n`,
  );
  console.log(`${name}@${main.version} <- ${asset}`);
}
