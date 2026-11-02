#!/usr/bin/env node

// Download the binary corresponding to this package's exact version.
const https = require("https");
const fs = require("fs");
const path = require("path");
const { pipeline } = require("stream");
const { promisify } = require("util");

const REPO = "dac-tech-team-tw/gtm-cli";
const BIN_DIR = path.join(__dirname, "bin");
const BIN_PATH = path.join(BIN_DIR, process.platform === "win32" ? "gtm-binary.exe" : "gtm-binary");
const streamPipeline = promisify(pipeline);

function getBinaryName() {
  const target = `${process.platform}-${process.arch}`;
  const binaries = {
    "darwin-x64": "gtm-darwin-x64",
    "darwin-arm64": "gtm-darwin-arm64",
    "linux-x64": "gtm-linux-x64",
    "win32-x64": "gtm-windows-x64.exe",
  };
  if (!binaries[target]) {
    throw new Error(`Unsupported platform: ${target}. Supported: ${Object.keys(binaries).join(", ")}.`);
  }
  return binaries[target];
}

function download(url, dest, redirects = 0) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
        const location = response.headers.location;
        response.resume();
        if (!location || redirects >= 10) {
          reject(new Error("Invalid or excessive download redirects"));
          return;
        }
        const next = new URL(location, url);
        if (next.protocol !== "https:") {
          reject(new Error("Refusing non-HTTPS download redirect"));
          return;
        }
        resolve(download(next, dest, redirects + 1));
        return;
      }
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
        return;
      }
      resolve(streamPipeline(response, fs.createWriteStream(dest)));
    }).on("error", reject);
  });
}

async function main() {
  const version = require("./package.json").version;
  const binaryName = getBinaryName();
  const url = `https://github.com/${REPO}/releases/download/v${version}/${binaryName}`;
  const temporaryPath = `${BIN_PATH}.${process.pid}.tmp`;
  console.log(`Downloading GTM CLI v${version} for ${process.platform}-${process.arch}...`);
  fs.mkdirSync(BIN_DIR, { recursive: true });
  try {
    await download(url, temporaryPath);
    if (process.platform !== "win32") fs.chmodSync(temporaryPath, 0o755);
    fs.renameSync(temporaryPath, BIN_PATH);
    console.log("GTM CLI installed successfully!");
  } finally {
    if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath);
  }
}

main().catch((error) => {
  console.error(`Failed to install GTM CLI: ${error.message}`);
  process.exitCode = 1;
});
