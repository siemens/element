/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { siMapStyle } from './map-style';

describe('siMapStyle', () => {
  it('includes the API key in the style URLs', () => {
    const json = JSON.stringify(siMapStyle('my-api-key'));
    expect(json).toContain('my-api-key');
  });
});
