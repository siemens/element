# `@siemens/angular-api-docs-extractor`

Extracts Angular library APIs and writes versioned JSON for the Zensical integration, `siemens-angular-api-docs-zensical`.
The producer runs separately from the documentation site build.

This package is workspace-only for now and runs directly from its TypeScript sources through Node.js type stripping, so no build step is needed.
The producer uses Angular 22's compiler CLI and TypeScript 6.0. Keep `@angular/compiler` and `@angular/compiler-cli` on the same version.

## Configure and extract

```ts
// api-docs.config.ts
import { defineConfig } from '@siemens/angular-api-docs-extractor';

export default defineConfig({
  packages: ['projects/my-library'],
  output: { dir: 'dist/api-docs' },
  reference: { dir: 'api' }
});
```

Each package directory must contain `ng-package.json` and a library tsconfig (`tsconfig.lib.json` by default).
The config defaults to the current directory and is loaded in `.ts`, `.mjs`, then `.js` order.
Use `--config <file>` for a different location. TypeScript configs use Node's native type stripping; use erasable TypeScript syntax and Node-compatible imports.
The optional `root` is relative to the config file, and package paths and `output.dir` are relative to that root.
The renderer's artifact directory and reference pages directory must match `output.dir` and `reference.dir`.

```sh
pnpm exec angular-api-docs extract
```

This writes `api-documentation.json` and `api-reference-pages.json`. Their JSON Schemas are in `schemas/`.
To call the producer from code, pass the result of `loadConfig()` or `resolveConfig()` to `prepare()`, or use the individual stages: `extractApi`, `planReferences`, `preparePresentation`, and `writeArtifacts`.
