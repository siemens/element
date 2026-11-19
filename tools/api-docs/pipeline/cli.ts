/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import type { ResolvedApiDocsConfig } from '../configuration.js';
import { extractApiDocumentation } from '../extraction/extract.js';
import { prepareApiPresentation } from '../normalization/index.js';
import { prepareReferencePlan } from '../normalization/reference-plan.js';
import { writePreparedArtifacts } from './artifacts.js';

/** Extract once and publish portable JSON only. Rendering and staging are separate. */
export async function main(
  config: ResolvedApiDocsConfig,
  args = process.argv.slice(2)
): Promise<number> {
  if (args.length) {
    throw new Error(
      `Unsupported API documentation arguments: ${args.join(' ')}\nUsage: tsx tools/api-docs/index.ts\nPrepares JSON once; no arguments are supported.`
    );
  }
  const documentation = await extractApiDocumentation(config);
  const references = prepareReferencePlan(documentation, config);
  const presentation = prepareApiPresentation(documentation, references.referencePaths, config);
  const artifacts = await writePreparedArtifacts(presentation, references, config);
  console.log(
    `Prepared API JSON: ${artifacts.artifactPath}\nReference catalog: ${artifacts.catalogPath}`
  );
  return 0;
}
