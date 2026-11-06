/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import path from 'node:path';
import { type Assertion, type UnifiedConfig } from 'promptfoo';

import { cases, taskInstructions } from './cases';
import { environmentValue, outputDirectory } from './src/config';
import { variantId, variantSpecs } from './src/variants';

const output = outputDirectory();
const variants = variantSpecs();

const gradeAssertion = (metric: string, fallback: string): Assertion => ({
  type: 'javascript',
  metric,
  value: `context.providerResponse?.metadata?.grades?.${metric} ?? ${fallback}`
});

const config: UnifiedConfig = {
  description: 'Element skill evaluation',
  prompts: ['{{request}}'],
  providers: variants.map(spec => ({
    id: 'file://src/provider.ts',
    label: variantId(spec),
    config: { variant: variantId(spec) }
  })),
  tests: cases.map(test => ({
    description: test.id,
    vars: { caseId: test.id, request: `${test.prompt}${taskInstructions}` },
    assert: [
      gradeAssertion(
        'routing',
        "{ pass: true, score: 1, reason: 'Not applicable without the skill' }"
      ),
      gradeAssertion('task', "{ pass: false, score: 0, reason: 'No task grade was recorded' }")
    ]
  })),
  outputPath: [path.join(output, 'promptfoo.json'), path.join(output, 'promptfoo.html')],
  evaluateOptions: { cache: false, maxConcurrency: 1 },
  metadata: {
    variants,
    provider: environmentValue('SKILL_EVAL_PROVIDER'),
    model: environmentValue('SKILL_EVAL_MODEL')
  },
  sharing: false,
  writeLatestResults: true
};

export default config;
