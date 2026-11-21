/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
export { defineConfig, loadConfig, resolveConfig } from './configuration.ts';
export type {
  ApiDocsConfig,
  ExternalApi,
  ExternalUrlResolver,
  ResolvedApiDocsConfig
} from './configuration.ts';
export { extractApiDocumentation as extractApi } from './extraction/extract.ts';
export type { ApiDocumentation } from './extraction/model.ts';
export { prepareApiPresentation as preparePresentation } from './normalization/index.ts';
export type { ApiPresentation } from './normalization/model.ts';
export { prepareReferencePlan as planReferences } from './normalization/reference-plan.ts';
export type { ReferencePlan } from './normalization/reference-plan.ts';
export { writePreparedArtifacts as writeArtifacts } from './pipeline/artifacts.ts';
export { prepare } from './pipeline/prepare.ts';
export { SCHEMA_VERSION } from './schema.ts';
