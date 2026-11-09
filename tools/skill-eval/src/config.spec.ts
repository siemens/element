/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { environmentValue, outputDirectory, packageDirectory, requireTarget } from './config';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('evaluation settings', () => {
  it('pins the OpenCode CLI and client to the same version', () => {
    const { dependencies } = JSON.parse(
      readFileSync(path.join(packageDirectory, 'package.json'), 'utf8')
    ) as { dependencies: Record<string, string> };

    expect(dependencies['@opencode/client']).toBe(dependencies['@opencode/cli']);
  });

  it('treats blank environment values as unset', () => {
    vi.stubEnv('SKILL_EVAL_MODEL', '   ');

    expect(environmentValue('SKILL_EVAL_MODEL')).toBeUndefined();
  });

  it('records the resolved output directory for later steps', () => {
    vi.stubEnv('SKILL_EVAL_OUTPUT', ' results/run ');

    const output = outputDirectory();

    expect(output).toBe(path.resolve('results/run'));
    expect(process.env.SKILL_EVAL_OUTPUT).toBe(output);
  });

  it('requires a provider, model, and API key', () => {
    vi.stubEnv('SKILL_EVAL_PROVIDER', 'openai');
    vi.stubEnv('SKILL_EVAL_MODEL', 'model');
    vi.stubEnv('SKILL_EVAL_API_KEY', '');

    expect(() => requireTarget()).toThrow('SKILL_EVAL_API_KEY');
  });
});
