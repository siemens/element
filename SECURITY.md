# Security Policy

Siemens takes the security of its code seriously. If you think you have found a security vulnerability,
please read the next sections and follow the instructions to report your finding.

## Reporting a Vulnerability

Please DO NOT report any potential security vulnerability via a public channel (mailing list, GitHub issue, etc.).
Instead, [report the vulnerability privately via GitHub](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability)
(if enabled for the repository) or [contact us via email](mailto:opensource@siemens.com).

Please provide a detailed description of the issue, the steps to reproduce it, the affected version(s) and, if already available,
a proposal for a fix. Include a proof of concept that demonstrates the issue through the public API of a published package.
You should receive a response within 5 working days. If for some reason you do not, please follow up via
email to ensure we received your original message.

If we confirm the issue as a vulnerability, we will publish an advisory (e.g. on GitHub) and give credits for your report if desired.
We follow the [coordinated vulnerability disclosure](https://vuls.cert.org/confluence/display/CVD) model and will define an appropriate disclosure timeline together with you.

## Supported versions

Each major version of Element is built for one major version of Angular, as defined by the `@angular/core` peer
dependency of the packages. We provide security fixes for an Element major version as long as the corresponding Angular
major version is supported according to the [Angular support policy](https://angular.dev/reference/releases#support-policy-and-schedule).
Angular currently supports each major version for 24 months (12 months active, 12 months long-term support).
Please check the [actively supported Angular versions](https://angular.dev/reference/releases#actively-supported-versions)
to find out which Element versions are supported.
Element version 50 was skipped and has never been released.

| Element | Angular |
| ------- | ------- |
| 51.x    | 22.x    |
| 49.x    | 21.x    |
| 48.x    | 20.x    |

## Scope and repository layout

This is the security policy for the `siemens/element` repository on GitHub.com.
This repository contains the published Element libraries plus the infrastructure needed to document, demo and release them.
Security reviews, including automated and AI-assisted scans, should focus on the **library code**, as this is the code
that ends up in applications built with Element.

### Library code (in scope)

The following packages are published to npm and consumed by applications:

- `projects/charts-ng` (`@siemens/charts-ng`)
- `projects/dashboards-ng` (`@siemens/dashboards-ng`)
- `projects/element-ng` (`@siemens/element-ng`)
- `projects/element-theme` (`@siemens/element-theme`)
- `projects/element-translate-cli` (`@siemens/element-translate-cli`)
- `projects/element-translate-ng` (`@siemens/element-translate-ng`)
- `projects/live-preview` (`@siemens/live-preview`, used to render documentation examples)
- `projects/map-styles` (`@siemens/map-styles`)
- `projects/maps-ng` (`@siemens/maps-ng`)
- `projects/native-charts-ng` (`@siemens/native-charts-ng`)

Test files (`*.spec.ts`) inside these folders are not shipped and are out of scope.

### Documentation and demo code (out of scope)

Everything else is mainly documentation, demo and build setup and is not part of the shipped libraries, for example:

- `docs/`, `mkdocs.yml` and `projects/element-docs-builder` (documentation site)
- `src/` (example app and the examples shown in the documentation)
- `projects/dashboards-demo` and `projects/icon-viewer` (demo applications)
- `playwright/`, `tools/`, `api-goldens/`, `skills/` and `.github/` (tests, release tooling and CI)

The documentation infrastructure and demo apps intentionally use patterns such as `innerHTML` with content that is fully
controlled by this repository (e.g. generated during the build or deployed by our release pipeline). This content is
controlled through pull request reviews. Findings that require an attacker to change this content in the repository or on
our hosting infrastructure are not considered vulnerabilities. If you fork this repository and deploy the documentation
or demos yourself, you are responsible for controlling this content.

## Known considerations

The following points are known and documented. They are not considered vulnerabilities and should not be reported again.

### Accepted risks in documentation and demo infrastructure

- **Documentation version selector (`versions.json`)**: The documentation site loads `versions.json` from the root of the
  hosting domain and renders the version selector via `innerHTML` (`docs/_src/version-selector.js`). The file is generated
  and uploaded by our release pipeline and is trusted. Anyone hosting the documentation must make sure this file cannot be
  modified by untrusted parties.

### Responsibilities of application developers

Some library APIs intentionally hand control to the application. Applications using Element are responsible for handling
them securely. Details are documented next to the respective API:

- **Markdown custom extensions**: Built-in Markdown rendering sanitizes inline HTML. Custom extensions and directive
  components provided by the application control their own rendering. If they bypass Angular sanitization
  (e.g. `bypassSecurityTrustHtml`), the application must ensure the content is safe.
  See [Markdown](docs/components/chat-messages/markdown.md).
- **Markdown Mermaid extension**: The SVG generated by Mermaid is rendered as trusted HTML. Sanitization relies on
  Mermaid's `securityLevel` (default `strict`). Applications that pass a less strict `securityLevel` via
  `siMarkdownMermaid()` must only render trusted content. See [Markdown](docs/components/chat-messages/markdown.md).
- **HTML string inputs**: Some inputs accept HTML strings and render them via `[innerHTML]`, e.g. `popover` of the legacy
  `si-popover`, `passwordPolicyContent` of `si-change-password`, `implicitLegalAcknowledge` of `si-landing-page` and
  `MapPoint.description` in `@siemens/maps-ng`. Angular sanitizes these values. Applications must not pass untrusted
  content that was marked as trusted (e.g. via `bypassSecurityTrustHtml`).
  See [Landing page](docs/components/pages/landing-page.md), [Element maps](docs/components/maps/element-maps.md)
  and the API documentation of the deprecated `si-popover`.
- **Trusted URLs**: `licenseInfo.iframe` of `si-about` and `sourcePhotoUrl` of `si-photo-upload` are marked as trusted
  resource URLs and are not sanitized by Angular. Applications must only pass URLs from trusted sources.
  See [About](docs/components/pages/about.md) and [Photo upload](docs/components/forms-inputs/photo-upload.md).
- **Chart tooltip formatters**: Built-in tooltip formatters in `@siemens/charts-ng` escape names and values. Custom
  ECharts formatters provided by the application must escape untrusted values (e.g. with `echarts.format.encodeHTML`).
  See [Generic chart](docs/components/charts/generic-chart.md).
- **Dashboard remote widgets**: Widgets in `@siemens/dashboards-ng` can be loaded via Module Federation, Native
  Federation or as web components from a URL. This executes the loaded code in the application. Applications must only
  register widget factories that point to trusted sources. See [Flexible dashboards](docs/components/dashboards/flexible-dashboards.md).
- **Content Security Policy for SVG icons**: Element embeds icons as `data:image/svg+xml` URLs, so applications must
  allow the `data:` scheme for `img-src` only. See [Icons](docs/fundamentals/icons.md).

## Not considered vulnerabilities

In addition to the known considerations above, the following reports are not considered vulnerabilities:

- Misuse of APIs listed under [Responsibilities of application developers](#responsibilities-of-application-developers).
- Vulnerabilities in peer dependencies (e.g. Angular, ECharts, Mermaid). The application installs and updates these
  packages, so please report them to the respective upstream project. Reports are in scope if a published package uses a
  peer dependency in an insecure way. Vulnerabilities in direct dependencies of a published package are in scope.
- Vulnerabilities in dependencies that are only used for building, testing or the documentation, as they are not part
  of the published packages.
- Missing security headers or Content Security Policy on the documentation site or demo applications.
- Theoretical findings from automated or AI-assisted scans without a proof of concept that demonstrates the issue through
  the public API of a published package.

## Documenting security considerations

When adding or changing an API that hands security responsibility to the application, document it as follows:

| Content                                                     | Location                                                             |
| ----------------------------------------------------------- | -------------------------------------------------------------------- |
| Scope, reporting process and accepted risks                 | This file                                                            |
| Secure usage of an API (sanitization, trusted content, CSP) | Component documentation in `docs/` and the API docs, next to the API |
| Index of points application developers are responsible for  | This file, as a short entry linking to the component documentation   |

Keep entries in this file short and link to the detailed documentation instead of duplicating it.
