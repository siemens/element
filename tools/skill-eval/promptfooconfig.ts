/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import path from 'node:path';
import { type Assertion, type UnifiedConfig } from 'promptfoo';

import { cases, taskInstructions } from './cases';
import { environmentValue, outputDirectory } from './src/config';

const output = outputDirectory();

const gradeAssertion = (metric: string, fallback: string): Assertion => ({
  type: 'javascript',
  metric,
  value: `context.providerResponse?.metadata?.grades?.${metric} ?? ${fallback}`
});

const config: UnifiedConfig = {
  description: 'Element skill evaluation',
  prompts: ['{{request}}'],
  providers: [{ id: 'file://src/provider.ts', label: 'element-skill' }],
  tests: cases.map(test => ({
    description: test.id,
    vars: { caseId: test.id, request: `${test.prompt}${taskInstructions}` },
    assert: [
      gradeAssertion(
        'routing',
        "{ pass: false, score: 0, reason: 'No routing grade was recorded' }"
      ),
      gradeAssertion('task', "{ pass: false, score: 0, reason: 'No task grade was recorded' }")
    ]
  })),
  outputPath: [path.join(output, 'promptfoo.json'), path.join(output, 'promptfoo.html')],
  evaluateOptions: { cache: false, maxConcurrency: 1 },
  metadata: {
    provider: environmentValue('SKILL_EVAL_PROVIDER'),
    model: environmentValue('SKILL_EVAL_MODEL')
  },
  sharing: false,
  writeLatestResults: true
};

export default config;
