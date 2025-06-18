/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { SiFormlyModule } from './si-formly.module';

describe('element form module init', () => {
  it('should init module', () => {
    const m = SiFormlyModule.forRoot({});
    expect(m).toBeDefined();
  });
});
