# Developing Siemens Element

## Prerequisites

- [Git](https://git-scm.com/) to clone the repository
- [Git LFS](https://git-lfs.github.com/) to fetch test assets
- [NodeJS](https://nodejs.org/) version as specified in the [package.json](https://github.com/siemens/element/blob/main/package.json)

To run the documentation, you will also need:

- [Python](https://www.python.org/) version as specified in the [pyproject.toml](https://github.com/siemens/element/blob/main/pyproject.toml)
- [UV](https://uv.readthedocs.io/en/latest/) to manage Python virtual environments

## Installation

Setting up the development environment:

```shell
git clone git@github.com:siemens/element.git
cd element
git lfs install
npm install
```

## Building

We use path mappings within the repository.
For development builds, they typically point to the sources,
so building submodules is not necessary.

**IMPORTANT**: Always build the translation layer. It is not consumed form the sources.

To build modules use the available npm scripts:

```shell
# Build all modules
npm run build:all

# Build a specific module. See package.json for available modules.
npm run <module-name>:build

# E.g. build the translation layer
npm run translate:build
```

## Running the example application

As for other builds, the translation layer must be built before running the application.
Then you can run the example application with the corresponding npm script:

```shell
# Run the example application
npm run start
```

## Linting and formatting

We use [ESLint](https://eslint.org/) and [Stylelint](https://stylelint.io/) for linting and [Prettier](https://prettier.io/) for formatting.
Use the following npm scripts to lint and format the code:

```shell
# Format all modules
npm run format

# Lint all modules
npm run lint:ng

# Lint styles
npm run lint:scss
```

## API Goldens

We guard our APIs against unintentional changes using API goldens based on [API Extractor](https://api-extractor.com/).
Whenever the public API is changed, the corresponding golden must be updated.

`protected` members are considered internal and are excluded from the public API report.

```shell
# Build and updates the API goldens. This is the main command needed for local development.
npm run api-goldens:build-accept

# Update the API goldens without building. !Important: APIs are generated based on the build output.
npm run api-goldens:accept

# Check the API goldens without updating them. !Important: this requires a build first.
npm run api-goldens:test
```

## Unit Tests

Run the unit tests using the corresponding npm script:

```shell
npm run <module-name>:test
```

## E2E Tests

Our E2E tests are built with [Playwright](https://playwright.dev/).
To ensure reliable screenshots, those tests must always be run in a docker container.

To run the E2E tests, use the following commands:

```shell
# On linux the host parameter can be omitted
npm run start -- --allowed-hosts true --host 0.0.0.0
# Build all dashboards artifacts and start the server
npm run dashboards-demo:build-and-run-all
# Build all ESM dashboards artifacts and start the server
npm run dashboards-demo:build-and-run-all:esm

# Run the E2E tests on another terminal
./e2e-local.sh

# Run tests for the webpack dashboards demo only
./e2e-local.sh run '--project=dashboards-demo/*'

# Run tests for the ESM dashboards demo only
./e2e-local.sh run '--project=dashboards-demo-esm/*'

# To update the test snapshots that requires updating append `update`
./e2e-local.sh update

# To update all test snapshots, append `update-all`
./e2e-local.sh update-all

# To only update a specific test, append the file name. Glob patterns are supported.
./e2e-local.sh update <test-file-name>

# To run a specific static test, use an environment variable and restrict the to static specs:
PLAYWRIGHT_staticTest=buttons/buttons:badges/badges ./e2e-local.sh run static
```

Available parameters for `e2e-local.sh`:

```shell
.e2e-local.sh [run|a11y|vrt|update|update-all] [test-file-name]

# Environment variables:
# - DOCKER: Override the docker command (default: docker)
# - PORT: Override the port for the example application (default: 4200)
# - LOCAL_ADDRESS: Override the local address for the example application (default: localhost)
# - PLAYWRIGHT_staticTest: Run only the specified static test
```

### Use Podman instead of Docker on Linux

Docker is causing issues when updating screenshots, as it changes the file owner to root.
Use [Podman](https://podman.io/) instead:

```shell
DOCKER=podman ./e2e-local.sh
```

### Using Rancher Desktop on Windows instead of Docker

Setup notes for Rancher Desktop on Windows:

1. Install [WSL 2](https://learn.microsoft.com/en-us/windows/wsl/install)
2. Download and install [Rancher Desktop](https://rancherdesktop.io/)
3. Start Rancher Desktop and tick the "Enable networking tunnel" checkbox under File > Preferences > Network

Unlike Podman, Rancher allows you to run `./e2e-local.sh` without any additional
parameters.
Note: In case of high CPU usage, there might be an issue with the Remote
Desktop service or Vmmem using lots of CPU in idle state. If you don't need GUI
apps then you can disable WSLg which should resolve the issue:

1. Create the file `%USERPROFILE%\.wslconfig` if it doesn't already exist and add the following:

   ```
   [wsl2]
   guiApplications=false
   ```

2. Restart WSL by running wsl --shutdown

## Documentation

We use [MkDocs](https://www.mkdocs.org/) to build the documentation.
To have visible example code, run the example application first.

```shell
# Serve the documentation locally run
npm run docs:serve
```

### General writing style guide

To ensure clarity and consistency, follow these writing style guidelines:

- Use concise, straightforward language.
- Avoid jargon unless necessary. If using technical terms, provide a brief explanation.
- Tailor the tone to be professional yet approachable, with a focus on helping users find the information they're looking for.

#### Capitalization and formatting

Element uses sentence case for all text. This means:

- Capitalize only the first word of a sentence or phrase.
- Names (e.g., Siemens, Switzerland, Element) and acronyms (e.g., FAQ, API) must always be capitalized.
- Avoid unnecessary capitalization for emphasis or decoration.
- Component names are also written in sentence case and should not be capitalized.

Use bullet points for lists, but avoid excessive nesting.

#### Chapter structure

Each chapter must include:

- Introduction: A brief overview of the component purpose.
- Usage section:
  - **What it does:** Explain the component's functionality, role, and variations.
  - **When to use:** Outline ideal scenarios and when it’s not suitable.
  - **Best practices:** Provide actionable tips for effective and accessible usage.
- Design section: Highlight key design elements, visuals, and behavior across states.
- Code section: Include implementation examples, API references, and integration tips.

### Code section

To improve the user experience, mention all relevant components, directives, services, pipes and types
inline using the tags instead of linking them.
Components (and their types) can be documented by re-exporting them in `docs.ts`.

To enhance the docs with live examples and API specs, use these tags in the Markdown files:

- `<si-docs-component example="si-example-1/si-example-1"></si-docs-component>`  
  The path in the example is relative from the example base url and only
  requires the subfolder and example name.
- `<si-docs-api component="SiExampleComponent"></si-docs-api>`
  To show the input parameters, output parameters and public attributes of your component, enter the class
  name in the `component` attribute.
- `<si-docs-api directive="SiExampleDirective"></si-docs-api>`  
  To show the input parameters, output parameters and public attributes of your directive, enter the class
  name in the `directive` attribute.
- `<si-docs-api injectable="SiExampleService"></si-docs-api>`  
  To show the public attributes of your service, enter the class
  name in the `injectable` attribute.
- `<si-docs-type name="SiExampleInterface"></si-docs-type>`  
  To show the attributes of your interface or class, enter the type
  name in the `name` attribute.
- `<si-docs-types></si-docs-types>`  
  To show the types of the input and output parameters of your component,
  only works in combination with the `si-docs-api` tag.
  Includes the types for all components and directives documented in the same
  file. Can therefore only be used once per file.
  It should always be used to get better types documentation resolution.

### Ignoring

To not parse the extension syntax, just add `DOCS-COMPOSER-IGNORE` somewhere in the file (as a markdown comment so it doesn't get rendered):

```md
[//]: # 'DOCS-COMPOSER-IGNORE'
```
