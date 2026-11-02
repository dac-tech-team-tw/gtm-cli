# GTM CLI privacy notice

GTM CLI is maintained in the [dac-tech-team-tw/gtm-cli](https://github.com/dac-tech-team-tw/gtm-cli) repository. Questions about this fork can be raised through its GitHub issues.

## Data and network access

When you authenticate, the CLI uses Google OAuth credentials or a service account to access Google Tag Manager on your behalf. Commands send requests to Google's APIs and may read or modify Tag Manager resources according to the permissions granted to those credentials. OAuth login can also retrieve basic Google account profile information.

The CLI stores authentication credentials and configuration locally in its application configuration directory. Treat these files and any service-account keys as secrets. Use `gtm auth logout` to remove stored authentication credentials; configuration can be managed with `gtm config`.

The CLI also contacts GitHub to check for updates and download releases. Installation through npm downloads a release binary from GitHub. These services receive the network information normally associated with your requests, such as your IP address. Their respective privacy policies apply.

Google Tag Manager is a trademark of Google LLC. This project is not affiliated with or endorsed by Google.
