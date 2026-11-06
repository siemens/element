/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { beforeEach } from 'vitest';

// Tests run in an iframe: programmatic focus()/blur() only dispatch events while it has focus,
// which otherwise depends on whether an earlier test used a real user interaction.
const focusTestFrame = (): void => {
  if (!document.hasFocus()) {
    window.focus();
  }
};

focusTestFrame();
beforeEach(focusTestFrame);
