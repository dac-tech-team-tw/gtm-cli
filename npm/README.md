# @dac-tech-team-tw/gtm-cli

Command-line interface for Google Tag Manager. See the [project documentation](https://github.com/dac-tech-team-tw/gtm-cli) for configuration and commands.

## Installation

Node.js 16 or newer and npm are required. Supported platforms are Windows x64, macOS x64 and arm64, and Linux x64. Installing downloads the matching binary for the package version from the project's GitHub Releases, so network access to GitHub and its release asset host is required. npm lifecycle scripts must be enabled for the automatic download; if scripts were disabled, the wrapper attempts the download on first use.

```bash
npm install -g @dac-tech-team-tw/gtm-cli
gtm --help
```

Alternatively, run without a global installation:

```bash
npx @dac-tech-team-tw/gtm-cli --help
```

For reproducible CI, pin a released version, for example:

```bash
npm install -g @dac-tech-team-tw/gtm-cli@1.6.2
```

## Usage

```bash
gtm auth login
gtm accounts list
gtm containers list --account-id <account-id>
```

Google Tag Manager access and appropriate credentials are required. Use `gtm auth login --help` for authentication options.

## Publishing setup

The release script synchronizes `npm/package.json` with the version in `deno.json` and creates a version tag. The `release.yml` GitHub Actions workflow builds all four binaries, uploads them to the GitHub release, then publishes the npm package. Do not publish a package version before its matching `v<version>` release assets exist.

Configure npm trusted publishing for `@dac-tech-team-tw/gtm-cli` with GitHub organization/user `dac-tech-team-tw`, repository `gtm-cli`, and workflow filename `release.yml`. Allow direct `npm publish` and complete the first trusted publish within two days, or the configuration expires. Workflow publishes use GitHub Actions OIDC and do not require an npm token. The workflow also requires the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` repository secrets for release builds.

## License

MIT; see [LICENSE](LICENSE) for the original copyright notice.
