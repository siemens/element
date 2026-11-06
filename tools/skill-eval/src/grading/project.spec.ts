/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it, vi } from 'vitest';

import { runCommand } from '../utils';
import { verifyProject } from './project';

vi.mock('../utils', () => ({ runCommand: vi.fn() }));

describe('project verification', () => {
  it('adds the end of the log to failed scripts and tracks whether the build passed', async () => {
    vi.mocked(runCommand).mockImplementation(async (_command, args) => {
      const pass = !['lint', 'build'].includes(args[1]);
      return {
        check: { name: `npm ${args.join(' ')}`, pass, reason: pass ? 'Passed' : 'Failed' },
        output: '/app/src/contact.ts\n  13:3  error  Keys must be ordered\nnpm error command failed'
      };
    });

    const result = await verifyProject('/app', '/logs');

    expect(result.built).toBe(false);
    expect(result.checks[0]).toEqual({
      name: 'npm run lint',
      pass: false,
      reason: 'Failed. src/contact.ts 13:3  error  Keys must be ordered',
      artifact: 'lint.log'
    });
  });
});
