# Contributing to Siemens Element

We love all contributions! ❤️

The following information should help you understand the guidelines we would
like you to follow and help make your contributions as painless as possible.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [I Have a Question](#i-have-a-question)
- [I Want to Contribute](#i-want-to-contribute)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)
- [Your First Code Contribution](#your-first-code-contribution)
- [Styleguides](#styleguides)
- [Commit Message Format](#commit-message-format)
- [Create a New Release](#releasing)

## Code of Conduct

This project and everyone participating in it is governed by the
[Siemens Element Code of Conduct](CODE_OF_CONDUCT.md).
By participating, you are expected to uphold this code. Please report
unacceptable behavior to <opensource@siemens.com>.

## I Have a Question

> If you want to ask a question, we assume that you have read the available [Documentation](README.md).

Before you ask a question, it is best to search for existing
[Issues](https://github.com/siemens/element/issues) that might help you. In case
you have found a suitable issue and still need clarification, you can write your
question in this issue. It is also advisable to search the internet for answers first.

If you then still feel the need to ask a question and need clarification, we
recommend the following:

- Open an [Issue](https://github.com/siemens/element/issues/new).
- Provide as much context as you can about what you're running into.
- Provide project and platform versions (nodejs, npm, etc), depending on what
  seems relevant.

We will then take care of the issue as soon as possible.

## I Want to Contribute

> ### Legal Notice
>
> When contributing to this project, you must agree that you have authored 100%
> of the content, that you have the necessary rights to the content and that the
> content you contribute may be provided under the project license.
>
> Before submitting your contribution, you must accept and sign the
> [Siemens Contributor License Agreement](https://cla-assistant.io/siemens/element).
> The CLA assistant will automatically initiate this process when you create a
> new pull request.

### Reporting Bugs

#### Before Submitting a Bug Report

A good bug report shouldn't leave others needing to chase you up for more
information. Therefore, we ask you to investigate carefully, collect information
and describe the issue in detail in your report. Please complete the following
steps in advance to help us fix any potential bug as fast as possible.

- Make sure that you are using the latest version.
- Determine if your bug is really a bug and not an error on your side e.g. using
  incompatible environment components/versions (Make sure that you have read the
  [documentation](README.md). If you are looking for support, you might want to
  check [this section](#i-have-a-question)).
- To see if other users have experienced (and potentially already solved) the
  same issue you are having, check if there is not already a bug report existing
  for your bug or error in the [bug tracker](https://github.com/siemens/element/issues?q=label%3Abug).
- Also make sure to search the internet (including Stack Overflow) to see if
  users outside of the GitHub community have discussed the issue.
- Collect information about the bug:
  - Stack trace (Traceback)
  - OS, Platform and Version (Windows, Linux, macOS, x86, ARM)
  - Version of the interpreter, compiler, SDK, runtime environment, package
    manager, depending on what seems relevant.
  - Possibly your input and the output
  - Can you reliably reproduce the issue? And can you also reproduce it with
    older versions?

#### How Do I Submit a Good Bug Report?

> You must never report security related issues, vulnerabilities or bugs
> including sensitive information to the issue tracker, or elsewhere in public.
> Instead sensitive bugs must be sent by email to <opensource@siemens.com>.

We use GitHub issues to track bugs and errors. If you run into an issue with the
project:

- Open an [Issue](https://github.com/siemens/element/issues/new). (Since we can't
  be sure at this point whether it is a bug or not, we ask you not to talk about
  a bug yet and not to label the issue.)
- Explain the behavior you would expect and the actual behavior.
- Please provide as much context as possible and describe the _reproduction steps_
  that someone else can follow to recreate the issue on their own. This usually
  includes your code. For good bug reports you should isolate the problem and
  create a reduced test case.
- Provide the information you collected in the previous section.

Once it's filed:

- The project team will label the issue accordingly.
- A team member will try to reproduce the issue with your provided steps. If
  there are no reproduction steps or no obvious way to reproduce the issue, the
  team will ask you for those steps and mark the issue as `needs-repro`. Bugs
  with the `needs-repro` tag will not be addressed until they are reproduced.
- If the team is able to reproduce the issue, it will be marked `needs-fix`, as
  well as possibly other tags (such as `critical`), and the issue will be left
  to be [implemented by someone](#your-first-code-contribution).

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for Siemens Element,
**including completely new features and minor improvements to existing functionality**.
Following these guidelines will help maintainers and the community to understand
your suggestion and find related suggestions.

#### Before Submitting an Enhancement

- Make sure that you are using the latest version.
- Read the [documentation](README.md) carefully and find out if the functionality
  is already covered, maybe by an individual configuration.
- Perform a [search](https://github.com/siemens/element/issues) to see if the
  enhancement has already been suggested. If it has, add a comment to the
  existing issue instead of opening a new one.
- Find out whether your idea fits with the scope and aims of the project. It's
  up to you to make a strong case to convince the project's developers of the
  merits of this feature. Keep in mind that we want features that will be useful
  to the majority of our users and not just a small subset. If you're just
  targeting a minority of users, consider writing an add-on/plugin library.

#### How Do I Submit a Good Enhancement Suggestion?

Enhancement suggestions are tracked as [GitHub issues](https://github.com/siemens/element/issues).

- Use a **clear and descriptive title** for the issue to identify the suggestion.
- Provide a **step-by-step description of the suggested enhancement** in as many
  details as possible.
- **Describe the current behavior** and **explain which behavior you expected to see instead**
  and why. At this point you can also tell which alternatives do not work for you.
- You may want to **include screenshots or screen recordings** which help you
  demonstrate the steps or point out the part which the suggestion is related to.
  You can use [LICEcap](https://www.cockos.com/licecap/) to record GIFs on macOS
  and Windows, and the built-in [screen recorder in GNOME](https://help.gnome.org/users/gnome-help/stable/screen-shot-record.html.en)
  or [SimpleScreenRecorder](https://github.com/MaartenBaert/ssr) on Linux.
- **Explain why this enhancement would be useful** to most Siemens Element users.
  You may also want to point out the other projects that solved it better and
  which could serve as inspiration.

### Your First Code Contribution

#### Step 1 - Set up the development environment

You need to set up your development environment before you can do anything.

Install [Node.js® and npm](https://nodejs.org/en/about/) if they are not already
on your machine.

This project is based on command line tools and does not rely or enforce any
kind of development environment. However, we recommend
[Visual Studio Code](https://code.visualstudio.com) which is a great free open
source IDE.

#### Step 2 - Set up the project and install dependencies

To locally setup this projects, use following steps:

```sh
# Clone the repository
git clone git@github.com:siemens/element.git

# Change into project directory
cd element

# Install all dependencies
npm install
```

#### Step 3 - Make your changes, build, and test

Open the project in your editor of choice and make your changes.

To build the outputs and run all the required tests, run the following commands:

```sh
npm run build
npm run format:check
npm run lint:commit
npm run lint
npm run test
```

When all commands succeeded and didn't produce any errors, you can add your
changes to a new commit, push it to GitHub, and create a new pull request.

Make sure to read and follow all the other chapters of this contributing guide.

## Styleguides

Code styling is an important attribute to keep a project maintainable and ensure
portability of source code between different libraries. Enforcing this code
style should help prevent static issues and reduce efforts on a reviewer's side
by ensuring opinionated formatting.

We strive to re-use existing and established styleguides, keeping them easily
understandable and automate linting and fixing wherever possible.

### EditorConfig

This project is using EditorConfig to automatically apply certain styling
standards before files are saved locally. Most editors/IDEs will honor the
`.editorconfig` settings automatically by default.

This project uses a [ruleset based on Angular's recommendation](https://github.com/siemens/lint/blob/main/.editorconfig).

> **Note:** Many editors/IDEs have plugin support for linting and fixing
> EditorConfig, for instance here is the plugin for [VS Code](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig).

### TypeScript

This project is following the [Angular coding style guide](https://angular.dev/style-guide)
for all `.ts` files.

Conformance with this styleguide is enforced via [ESLint](https://github.com/angular-eslint/angular-eslint)
and our [Siemens Lint ruleset](https://github.com/siemens/lint/).

You can run ESLint with the following command:

```sh
npm run lint
```

To automatically fix most of the findings, run the following command:

```sh
npm run lint:fix
```

> **Note:** Many editors/IDEs have plugin support for linting and fixing
> TypeScript, for instance here is the plugin for [VS Code](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).

### Formatting

This project uses [Prettier](https://prettier.io/) to apply and enforce code
formatting for all `.html` and `.css` files.

The formatting is verified within the CI and uses a [custom ruleset](https://github.com/siemens/lint/blob/main/prettier-config/.prettierrc.json)
to adhere closer to Angular's style guide.

You can run Prettier with the following command:

```sh
npm run format:check
```

To automatically fix the findings, run the following command:

```sh
npm run format
```

> **Note:** Many editors/IDEs have plugin support for Prettier, check out the
> [official IDE integration guide](https://prettier.io/docs/en/editors.html)

## Commit Message Format

We follow the [_Conventional Commits_](https://www.conventionalcommits.org/)
specification to format Git commit messages. This allows us to efficiently
create releases based on semantic versioning and automatically generate the
changelog.

Our formatting rules are based on the
[Angular convention](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#-commit-message-format),
which has also evolved over time. We took the best parts and tailored them to
our needs.

Each commit message consists of a **header**, a **body**, and a **footer**:

```text
<header>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

### Header (mandatory)

The header has a special format:

```text
<type>(<scope>): <subject>
```

The `<type>` and `<subject>` fields are mandatory, the `(<scope>)` field is
optional.

Example:

```text
docs(CONTRIBUTING.md): add commit message guidelines
```

#### Type (mandatory)

Allowed types:

- **feat**: A new feature, **included in changelog**
- **fix**: A bug fix, **included in changelog**
- **fixup**: A fix up of an unreleased feature (message will **not** appear in
  the changelog)
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space,
  formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance, **included in changelog**
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

All commits that are included in the changelog have to be relevant to an end
user.

#### Scope (recommended)

The scope can be anything specifying the place of the change. However, in
our component libraries, there are additional rules that have to be followed:

- The scope has to be set to the "entry point name" (folder name) of the
  component/service, e.g. `button`, `tree-view`, `user-profile`, etc.
- If the scope concerns a component or topic within an entry point you can
  use the `/` as separator. E.g., for changes on the sankey chart, use `charts/sankey`.
- For changes that go beyond a single component, one of the common scopes
  should be used whenever possible:
  - `angular`
  - `api`
  - `a11y`
  - `ionic`
  - `i18n`
  - `theme`
  - `webcomponents`
- For changes affecting a dependency, the npm package name should be used

For all changes that are **included in the changelog**, the scope is
**mandatory** although not enforced by our tooling.

#### Subject (mandatory)

The subject contains a succinct description of the change:

- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No dot (`.`) at the end
- Written from the user's perspective for types `feat`, `fix`, `perf`

### Body (recommended)

Just as in the subject, use the imperative, present tense: "change" not
"changed" nor "changes".

The body allows for a more detailed description of the change. Also explain the
motivation for making the change. You can include a comparison of the previous
behavior with the new behavior in order to illustrate the impact of the change.

### Footer (optional)

The footer should contain any information about breaking changes and
deprecations and is also the place to reference GitHub/GitLab issues that this
commit addresses.

Some important points when adding notes in the footer:

- Always use a **scope** in the commit message header if you include a breaking
  change or deprecation note in the footer. The scope from the header is
  re-used for the breaking change and deprecation sections in the changelog,
  which becomes much more readable.
- Breaking change and deprecation notes will appear in the changelog even
  when placed in commits of types which are otherwise not added to the
  changelog, e.g. `docs`, `chore`, `refactor`, etc.
- The description needs to be written from a user's perspective as they have to
  be able to understand the impact of the changes.

#### Breaking Change Note

A breaking change section should start with the phrase `BREAKING CHANGE:`
followed by a summary of the breaking change, a blank line, and a detailed
description of the breaking change that also includes migration instructions.

```text
Fixes #<issue number>
<BLANK LINE>
BREAKING CHANGE: <breaking change summary>
<BLANK LINE>
<breaking change description + migration instructions>
```

Multiple breaking change sections are also possible:

```text
Fixes #<issue number>
<BLANK LINE>
BREAKING CHANGE: <breaking change 1 summary>
<BLANK LINE>
<breaking change 1 description + migration instructions>
<BLANK LINE>
<BLANK LINE>
BREAKING CHANGE: <breaking change 2 summary>
<BLANK LINE>
<breaking change 2 description + migration instructions>
```

Breaking change description should start with a verb to provide a simple and
recognizable pattern to readers e.g.:

- changed import path for `@siemens/old` to `@siemens/new`
- dropped support for `xyz`
- moved type `xyz` from `@siemens/old` to `@siemens/new`
- removed the `class/function` and use instead `new-class/new-function`
- removed support for `xyz`
- renamed `function` function to `new-function`

#### Deprecation Note

Similarly, a deprecation section should start with `DEPRECATED:` followed by a
short description of what is deprecated, a blank line, and a detailed
description of the deprecation that also mentions the recommended update path.

```text
Closes #<issue number>
<BLANK LINE>
DEPRECATED: <what is deprecated>
<BLANK LINE>
<deprecation description + recommended update path>
```

Also here, multiple deprecation sections are possible (look at the example above
for multiple breaking change sections).

#### Other Important Notes

In cases where a change is neither a breaking change nor a deprecation, but something that deserves
attention in the changelog, there's a third note type: `NOTE:`. It works exactly like the breaking
changes and the deprecations but will show in a section `NOTES` in the changelog.

Use this sparsely for important notes only.

#### Referencing GitHub/GitLab Issues

Issues can be automatically marked as closed/fixed or also just referenced by
adding a note in the footer. The following keywords are supported:

- `Closes #<issue number>`
- `Fixes #<issue number>`
- `See #<issue number>`
- `See <group/project>#<issue number>` _(for cross-project references)_

**Important:** An issue reference needs to be placed before any breaking change
or deprecation note. Otherwise, it will become part of the breaking change or
deprecation note and appear in the changelog.

## Releasing

We use [semantic-release](https://semantic-release.gitbook.io/semantic-release)
which automates all release tasks.

- to create a new release push changes to the `main` branch
- to create a pre-release push changes to the `next` branch
- to create a back-merge release push changes to a branch following this
  pattern: `release/N.N.x` / `release/N.x.x` / `release/N.x` branch where `N` is
  any existing version

## Attribution

This guide is based on the **contributing-gen**. [Make your own](https://github.com/bttger/contributing-gen)!
