/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest';

import { transcriptFixture } from '../testing/transcript';
import { normalizeTranscript } from './transcript';

describe('OpenCode transcript normalization', () => {
  it('finds skill calls in intermediate turns and returns the final answer', () => {
    const response = normalizeTranscript(transcriptFixture());

    expect(response).toMatchObject({ output: 'Implemented', metadata: { toolCalls: 2 } });
    expect(response.metadata.skillCalls).toMatchObject([{ name: 'element', is_error: false }]);
  });

  it('uses whole-session usage instead of final-message usage', () => {
    expect(normalizeTranscript(transcriptFixture())).toMatchObject({
      cost: 0.12,
      tokenUsage: { total: 160, prompt: 140, completion: 20, cached: 30 }
    });
  });
});
