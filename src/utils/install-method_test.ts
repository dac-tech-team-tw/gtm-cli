import assert from "node:assert/strict";
import { getUpgradeCommand, isNpmInstall, NPM_UPGRADE_COMMAND } from "./install-method.ts";

Deno.test("detects binaries installed from npm platform packages", () => {
  for (
    const path of [
      // npm global, Windows
      "C:\\Users\\me\\AppData\\Roaming\\npm\\node_modules\\@dac-tech-team-tw\\gtm-cli\\node_modules\\@dac-tech-team-tw\\gtm-cli-win32-x64\\bin\\gtm.exe",
      // npm global, Linux / macOS
      "/usr/local/lib/node_modules/@dac-tech-team-tw/gtm-cli/node_modules/@dac-tech-team-tw/gtm-cli-linux-x64/bin/gtm",
      // project-local install (hoisted)
      "/work/app/node_modules/@dac-tech-team-tw/gtm-cli-darwin-arm64/bin/gtm",
      // pnpm store layout
      "/home/me/.local/share/pnpm/global/5/node_modules/.pnpm/@dac-tech-team-tw+gtm-cli-linux-x64@1.7.2/node_modules/@dac-tech-team-tw/gtm-cli-linux-x64/bin/gtm",
      // <=1.7.1 postinstall location, possibly self-updated in place since
      "C:\\Users\\me\\AppData\\Roaming\\npm\\node_modules\\@dac-tech-team-tw\\gtm-cli\\bin\\gtm-binary.exe",
      "/usr/local/lib/node_modules/@dac-tech-team-tw/gtm-cli/bin/gtm-binary",
    ]
  ) {
    assert.equal(isNpmInstall(path), true, path);
    assert.equal(getUpgradeCommand(path), NPM_UPGRADE_COMMAND, path);
  }
});

Deno.test("keeps self-update for script and manual installs", () => {
  for (
    const path of [
      "/home/me/.local/bin/gtm", // install.sh
      "C:\\Users\\me\\AppData\\Local\\Programs\\gtm\\gtm.exe", // install.ps1
      "/home/me/Downloads/gtm-linux-x64",
      "/home/me/.deno/bin/deno", // deno run during development
      // the npm wrapper script itself is never the running executable
      "/usr/local/lib/node_modules/@dac-tech-team-tw/gtm-cli/bin/gtm",
    ]
  ) {
    assert.equal(isNpmInstall(path), false, path);
    assert.equal(getUpgradeCommand(path), "gtm upgrade", path);
  }
});
