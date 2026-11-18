/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import type { ResolvedApiDocsConfig } from '../configuration.ts';
import { extractApiDocumentation } from '../extraction/extract.ts';
import { prepareApiPresentation } from '../normalization/index.ts';
import { prepareReferencePlan } from '../normalization/reference-plan.ts';
import { writePreparedArtifacts } from './artifacts.ts';

/** Extract once and publish portable JSON only. Rendering and staging are separate. */
export async function prepare(config: ResolvedApiDocsConfig) {
  const documentation = await extractApiDocumentation(config);
  const references = prepareReferencePlan(documentation, config);
  const presentation = prepareApiPresentation(documentation, references.referencePaths, config);
  return writePreparedArtifacts(presentation, references, config);
}
