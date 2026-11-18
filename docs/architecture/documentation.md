# Documentation build

!!! warning "For Element contributors only"

    This guide describes how the Element documentation site is built.
    It is not relevant for applications using Element.
    For the commands, see the [developer guide](../DEVELOPER.md#documentation).

The documentation is a [Zensical](https://zensical.org/) site built from the authored Markdown in `docs/`.
API documentation is extracted from the library sources with the Angular compiler, prepared as JSON, and rendered into the site by Python-Markdown extensions.
The same build publishes a Markdown export of every page and an `llms.txt` index for tools and language models.

## Overview

The build has two explicit, independent steps:

```text
docs:generate-api (one-shot)
  library sources ──► Angular compiler extraction ──► normalization ──► dist/element-docs/*.json
                                                                              │
                                                     reference page templates ▼
                                                                         docs/api/**/*.md

docs:build:api (zensical build --clean)
  docs/ ──► Markdown (snippets, tabs, examples) ──► API rendering ──► browser HTML
                                                                    └► export preprocessing ──► Markdown + llms.txt
```

The responsibilities are split along a strict boundary:

| Part                             | Language   | Responsibility                                                                                              |
| -------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------- |
| `tools/api-docs/`                | TypeScript | Extracts, normalizes, links, and validates the API. Decides _what_ is documented and _where_.               |
| `projects/angular-api-docs-zensical/` | Python     | Renders the prepared data with Jinja inside Zensical. Owns tag parsing, page-local anchors, and the export. |
| `mkdocs.yml`                     | YAML       | Wires extensions and plugins, and switches between the default and the API mode.                            |

TypeScript does all semantic work. Python never inspects compiler data and makes no decisions about which members, types, or pages exist.
No HTML crosses the boundary; only portable, versioned JSON.

## API generation (`docs:generate-api`)

`docs:generate-api` runs `tools/api-docs/index.ts` followed by `uv run angular-api-docs-zensical generate-pages`.
It runs once and exits. It does not watch files or start a build.

### Extraction

`tools/api-docs/extraction/` uses the Angular compiler to read the public API of every package listed in `tools/api-docs/config.ts`.

- Public entry points are discovered from each package's `ng-package.json`. There is no documentation barrel (`docs.ts`) or separate documentation tsconfig.
  `internal` and `testing` entry points are skipped.
- Angular metadata such as inputs, outputs, signal-based members, selectors, constructors, and deprecations come from the compiler's API documentation, not from parsing decorators by hand.
- External APIs (for example from the Angular CDK) are extracted only when listed in `externalApis` in `tools/api-docs/config.ts`, by public import path and export name.
  Extraction fails if a listed API is not a public export of a module loaded by a documented package.
- Compiler records are treated as read-only and are never serialized.

### Normalization

`tools/api-docs/normalization/` converts the compiler output into the presentation model consumed by Python (`normalization/model.ts`).

| Module              | Responsibility                                                                                  |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| `comments.ts`       | Parses doc comments with TSDoc and turns `{@link}` tags into Markdown links.                    |
| `fragments.ts`      | Turns prose and type signatures into text and link fragments.                                   |
| `resolver.ts`       | Resolves type references and links to symbols, members, or external URLs.                       |
| `routing.ts`        | Builds canonical targets and anchors, and external URLs for standard library and npm packages.  |
| `views.ts`          | Groups members (inputs, outputs, properties, methods) and selects what each view shows.         |
| `reference-plan.ts` | Plans the reference pages and navigation by package and category, and resolves name collisions. |

Default values come from a `@defaultValue` tag or, if there is none, from the source initializer.
Types listed in `defaultValues.unwrapWrapperFunctionTypes` in `tools/api-docs/config.ts` (`TranslatableString` for Element) show ``t(() => $localize`…`)`` defaults as `` $localize`…` ``.

### Publication

`tools/api-docs/pipeline/artifacts.ts` validates the result and writes two files to `dist/element-docs/`:

- `api-documentation.json` contains the symbols, members, indexes, and link targets used to render API content.
- `api-reference-pages.json` contains the reference page catalog and its navigation tree.

Validation rejects the whole publication on any inconsistency, such as unknown link targets, unsafe URLs or paths, duplicate IDs, or inconsistent navigation.
Files are written atomically, so a failed run keeps the previous artifacts.
Both Python consumers check the `schemaVersion` and refuse mismatching data.

The prepared JSON is an internal schema. It is not compatible with TypeDoc JSON and is not published with the packages.

### Reference pages

`siemens_angular_api_docs_zensical/reference_pages.py` renders `api-reference-pages.json` into standalone Markdown pages under `docs/api/` using the Jinja templates in `siemens_angular_api_docs_zensical/templates/`.
The generated pages only contain API tags; their content is rendered during the build like any authored page.
The directory is replaced atomically on every run to remove obsolete pages. It is gitignored and must not be edited.

## Site build

Zensical reads the real `docs/` directory. There is no copied documentation tree and no pre-rendering of API content.

### Default and API mode

The API integration is switched on by environment variables in `mkdocs.yml`:

| Setting                                         | Default mode (`docs:build`, `docs:serve`) | API mode (`docs:build:api`, `docs:serve:api`) |
| ----------------------------------------------- | ----------------------------------------- | --------------------------------------------- |
| `ELEMENT_DOCS_API`                              | unset                                     | `true`                                        |
| `ELEMENT_DOCS_EXCLUDE` (`exclude_docs`)         | `/api/` (reference pages excluded)        | empty (reference pages included)              |
| `md_extension_element_api` extension            | disabled                                  | enabled                                       |
| `llmstxt` plugin (Markdown export and llms.txt) | disabled                                  | enabled                                       |
| **Components → API** navigation                 | not added                                 | added from the reference catalog              |

The default mode is a fast preview for authored content and requires no preparation.
The API mode requires `docs:generate-api` to have run first; it never extracts or generates pages on its own.

### Markdown extensions

`md_extension_element_docs` (registered as `element-docs`) handles authored syntax that is unrelated to the API:

- It keeps `si-docs-component` blocks as raw HTML, which the live preview renders in the browser.
- It converts `## Title ---` headings into native tab blocks while keeping a heading for deep links and the table of contents.

`md_extension_element_api` renders the API tags (`si-docs-api`, `si-docs-type`, and `si-docs-types`).
It runs as a late postprocessor, after includes and snippets are expanded and raw HTML is restored, so API tags from any source are handled the same way.
For each page it:

1. Parses the API tags in the final HTML. Tags inside `pre`, `code`, `textarea`, `si-docs-component`, and HTML comments are treated as literal text.
2. Resolves the requested symbols and members against `api-documentation.json`.
3. Allocates page-local anchors, resolves links either to the same page or to the canonical reference page, and renders the symbols with the templates in `md_extension_element_api/templates/`.
4. Adds the rendered headings to the table of contents.

The artifact is cached and reloaded when the file changes.
Unknown, ambiguous, or malformed API requests fail the build with the page path in the message.

### Navigation

Zensical has no public navigation hook.
The YAML tag `extra.element_docs_install: !!python/name:siemens_angular_api_docs_zensical.zensical_navigation.install` installs the hook before Zensical normalizes the navigation.
The same hook registers the builder's bundled stylesheet in both modes. Zensical publishes it at `_src/docs-builder.css` without a copy in `docs/`.
When `extra.element_docs.api.enabled` is true, the hook inserts the prepared package, category, and symbol tree under the configured `nav_parent` and `nav_title` (**Components → API** for Element).
It also adds the API artifact to the watched files.
This is the only place that depends on Zensical internals and is covered by a test.

## Markdown export and llms.txt

In API mode the native `llmstxt` plugin publishes a Markdown file next to every HTML page, for example `components/buttons-menus/buttons/index.md`, and an index at `dist/design/llms.txt`.
Sections and their file patterns are declared in `mkdocs.yml`.
Index paths are relative to `llms.txt`, so the export works independently of the deployment hostname.

Before conversion, the plugin passes each page's HTML through `siemens_angular_api_docs_zensical/llms_preprocess.py`:

| Step                  | Module                   | Result                                                                                         |
| --------------------- | ------------------------ | ---------------------------------------------------------------------------------------------- |
| `preprocess_examples` | `structured_examples.py` | Replaces live examples with their TypeScript and optional HTML source from `src/app/examples`. |
| `preprocess_content`  | `structured_content.py`  | Turns color swatches into readable values and makes content links absolute HTML URLs.          |
| `preprocess_api`      | `structured.py`          | Re-renders API sections from the prepared JSON as plain headings, tables, and code blocks.     |

The export renders API content from the same JSON as the browser and only reuses the identity and anchors of the browser sections.
It includes type definitions even where the browser cards omit them.
Content links point to canonical HTML URLs, while generated API links stay relative to the export, so they remain within the version being read.
Browser output and live previews are unaffected by this step.

## Quality checks

| Check                      | Command        | Scope                                                                                                            |
| -------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------- |
| Extraction and preparation | `docs:test`    | Vitest with a fixture library, one text snapshot per symbol, scenario snapshots, and validation mutation tables. |
| Rendering and export       | `docs:test:py` | Pytest with HTML snapshots of browser and export output, error cases, and publication behavior.                  |

CI runs these checks together with `docs:generate-api` and `docs:build:api` in `.github/workflows/build-documentation.yaml`.

## Design decisions

- **Explicit preparation.** Extraction and page generation are separate commands. Loading the site configuration never generates content, and the build never runs Node.js.
- **One source of truth.** Browser HTML and the Markdown export are rendered from the same prepared JSON.
- **Deterministic output.** Sorting uses a fixed collation and is independent of extraction order and the local package store layout, so artifacts are identical across runs and machines.
- **Fail instead of approximating.** Missing public APIs, unresolved requests, and unsafe URLs stop the build. Authored prose links are filtered so they cannot break it.
- **No documentation barrels.** APIs are documented by exporting them from a public entry point.
