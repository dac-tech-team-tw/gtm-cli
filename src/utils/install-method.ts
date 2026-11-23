/**
 * Detect how GTM CLI was installed, to pick the right upgrade path
 */

export const NPM_UPGRADE_COMMAND = "npm i -g @dac-tech-team-tw/gtm-cli@latest";

/**
 * Whether this binary was installed by npm, i.e. it lives in a platform
 * package such as node_modules/@dac-tech-team-tw/gtm-cli-win32-x64/bin/gtm.exe.
 * npm owns those files, so self-update must not replace them.
 */
export function isNpmInstall(execPath: string = Deno.execPath()): boolean {
  return /[\\/]node_modules[\\/]@dac-tech-team-tw[\\/]gtm-cli-[^\\/]+[\\/]bin[\\/]gtm(\.exe)?$/i
    .test(execPath);
}

/**
 * The command a user should run to upgrade this installation
 */
export function getUpgradeCommand(execPath?: string): string {
  return isNpmInstall(execPath) ? NPM_UPGRADE_COMMAND : "gtm upgrade";
}
