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

## Unit Tests

Runt the unit tests using the corresponding npm script:

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

# Run the E2E tests on another terminal
./e2e-local.sh

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

Unlike Podman, Rancher allows you to run `./vrt-local.sh` without any additional
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
