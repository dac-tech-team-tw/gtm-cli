/**
 * Detect how GTM CLI was installed, to pick the right upgrade path
 */

export const NPM_UPGRADE_COMMAND = "npm i -g @dac-tech-team-tw/gtm-cli@latest";
export const NPM_LOCAL_UPGRADE_HINT =
  "(for a project-local install, run `npm i @dac-tech-team-tw/gtm-cli@latest` in that project)";

// 1.7.2+: binary in a platform package, e.g.
//   node_modules/@dac-tech-team-tw/gtm-cli-win32-x64/bin/gtm.exe
const PLATFORM_PACKAGE_BINARY =
  /[\\/]node_modules[\\/]@dac-tech-team-tw[\\/]gtm-cli-[^\\/]+[\\/]bin[\\/]gtm(\.exe)?$/i;
// <=1.7.1: postinstall downloaded the binary into the main package. A later
// self-update keeps that path, so newer binaries can still run from it.
const LEGACY_PACKAGE_BINARY =
  /[\\/]node_modules[\\/]@dac-tech-team-tw[\\/]gtm-cli[\\/]bin[\\/]gtm-binary(\.exe)?$/i;

/**
 * Whether this binary lives inside an npm package. npm owns those files, so
 * self-update must not replace them.
 */
export function isNpmInstall(execPath: string = Deno.execPath()): boolean {
  return PLATFORM_PACKAGE_BINARY.test(execPath) || LEGACY_PACKAGE_BINARY.test(execPath);
}

/**
 * The command a user should run to upgrade this installation
 */
export function getUpgradeCommand(execPath?: string): string {
  return isNpmInstall(execPath) ? NPM_UPGRADE_COMMAND : "gtm upgrade";
}
